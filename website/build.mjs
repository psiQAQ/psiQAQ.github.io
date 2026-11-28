import fs from 'node:fs'
import {writeLegacyRoutes} from './legacy-routes.mjs'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {createRequire} from 'node:module'
import {fileURLToPath, pathToFileURL} from 'node:url'

const website = path.dirname(fileURLToPath(import.meta.url))
const repo = path.dirname(website)
const cache = path.join(website,'.build')
const engine = path.join(cache,'quartz')
const require = createRequire(path.join(engine,'package.json'))
const load = name => import(pathToFileURL(require.resolve(name)))
const {default:YAML} = await load('yaml')
const {unified} = await load('unified')
const {default:markdown} = await load('remark-parse')
const {slugifyFilePath} = await import(pathToFileURL(path.join(engine,'node_modules/@quartz-community/utils/dist/path.js')))
const cfg = JSON.parse(fs.readFileSync(path.join(website,'publish.config.json'),'utf8'))
if (cfg.content !== 'content') throw Error('The approved publication boundary is content/')
const source = path.join(repo,cfg.content)
const fixture = process.argv.includes('--fixture')
const site = path.join(cache,fixture?'fixture-site':'site')
const base = new URL(process.env.SITE_URL || cfg.site)
const git = (...args) => execFileSync('git',args,{cwd:repo,encoding:'utf8'})
const tracked = new Set(git('ls-files','-z','--',cfg.content).split('\0').filter(Boolean).map(p=>p.slice(cfg.content.length+1)))
const notes = new Map(), assets = new Set()
const parser = unified().use(markdown)
const posix = path.posix
function fromDisk(rel) {
  if (rel.split('/').some(s=>!s || s.startsWith('.')) || fs.realpathSync(path.join(source,rel))!==path.join(fs.realpathSync(source),rel)) throw Error('Unapproved source path: '+rel)
  return fs.readFileSync(path.join(source,rel))
}
function parseNote(rel,text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)
  const data = match ? YAML.parse(match[1]) : {}
  const raw = cfg.downloadNotes.includes(rel) && !match
  const allowed = data?.visibility==='public' && (data.type==='garden-note' ? data.publish_ready===true : cfg.noteTypes.includes(data.type) || (!data.type && posix.basename(rel)==='index.md'))
  if (raw || allowed) notes.set(rel,{text,body:text.slice(match?.[0].length||0),data})
}
for (const rel of tracked) if (rel.endsWith('.md') && !rel.split('/').some(s=>s.startsWith('.'))) parseNote(rel,fromDisk(rel).toString('utf8'))
if (!notes.has(cfg.home)) throw Error('Missing public homepage')
const fixtureFiles = new Map()
if (fixture) {
  const test = await import('./fixtures.mjs')
  for (const [name,value] of test.files) {
    fixtureFiles.set(name,value)
    tracked.add(name)
    if(name.endsWith('.md')) parseNote(name,value)
  }
}
function localLink(rel,href,wiki=false,embed=false) {
  if (/^(https?:\/\/|mailto:)/i.test(href)) {
    if(embed) throw Error(rel+' uses an external embed: '+href)
    return
  }
  const part=decodeURIComponent(href.split(/[?#]/,1)[0])
  if (!part) return
  if (/^(\/|[A-Za-z][\w+.-]*:)|\\/.test(part)) throw Error(rel+' uses a nonportable link: '+href)
  const name = posix.normalize(posix.join(posix.dirname(rel),part))
  const matches = [name,name+'.md',name+'/index.md']
  if(wiki) matches.push(part,part+'.md')
  const target = matches.find(x=>tracked.has(x))
  if(!target || target.split('/').some(s=>s.startsWith('.'))) throw Error(rel+' links outside approved files: '+href)
  if(notes.has(target)) return
  if(cfg.attachments.includes(posix.extname(target).toLowerCase()) || cfg.reviewedAttachments.includes(target)) {assets.add(target);return}
  throw Error(rel+' links to an unpublished file: '+target)
}
function inspect(rel,node) {
  if (node.type==='html' && /\b(?:src|href|srcset|style|action)\s*=|<(?:script|iframe|object|embed|base)\b/i.test(node.value)) throw Error(rel+' contains embedded HTML requiring review')
  if (node.type==='definition' && node.identifier.startsWith('^')) return // GFM footnote
  if (['link','image','definition'].includes(node.type)) localLink(rel,node.url,false,node.type==='image')
  if (node.type==='text') for(const m of node.value.matchAll(/(!?)\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) localLink(rel,m[2],true,!!m[1])
  if(node.type==='code' && ['dataview','dataviewjs'].includes(node.lang)) throw Error(rel+' uses unsupported interactive queries')
  for(const child of node.children||[]) inspect(rel,child)
}
const staging = fs.mkdtempSync(path.join(engine,'input-'))
try {
  for(const [rel,note] of notes) {
    inspect(rel,parser.parse(note.body))
    const file=path.join(staging,rel)
    fs.mkdirSync(path.dirname(file),{recursive:true})
    // Keep the actual heading (and its anchor) in the note; remove duplicate title in emitted HTML.
    fs.writeFileSync(file,note.text)
    if(!fixtureFiles.has(rel)){
      const timestamp=Number(git('log','-1','--format=%ct','--',cfg.content+'/'+rel).trim())
      if(timestamp>0) fs.utimesSync(file,timestamp,timestamp)
    }
  }
  for(const rel of assets) {
    const file=path.join(staging,rel)
    fs.mkdirSync(path.dirname(file),{recursive:true})
    fs.writeFileSync(file,fixtureFiles.get(rel)??fromDisk(rel))
  }
  const config=YAML.parse(fs.readFileSync(path.join(website,'quartz.config.yaml'),'utf8'))
  config.configuration.baseUrl=(base.host+base.pathname).replace(/\/$/,'')
  const configFile=path.join(cache,'config.yaml')
  fs.writeFileSync(configFile,YAML.stringify(config))
  execFileSync(process.execPath,['quartz/bootstrap-cli.mjs','build','-C',configFile,'-d',staging,'-o',site],{cwd:engine,stdio:'inherit'})
  const indexBytes = fs.readFileSync(path.join(site,'static/contentIndex.json'))
  const index = JSON.parse(indexBytes)
  const indexVersion = createHash('sha256').update(indexBytes).digest('hex').slice(0,16)
  const slugByFile=new Map(Object.entries(index).map(([slug,n])=>[n.filePath,slug]))
  const attachmentRoutes=new Map()
  const assetFiles = new Map()
  for(const rel of assets) {
    const slug=slugifyFilePath(rel)
    const isHtml=rel.endsWith('.html')
    const target=isHtml?slug+'.html':slug
    if(isHtml && slug!==target) fs.renameSync(path.join(site,slug),path.join(site,target))
    if(!fs.readFileSync(path.join(site,target)).equals(Buffer.from(fixtureFiles.get(rel)??fromDisk(rel)))) throw Error('Changed asset: '+rel)
    assetFiles.set(rel,target)
    attachmentRoutes.set('/'+slug,{target,isHtml,download:/\.(sh|bat)$/i.test(rel)})
  }
  const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  for(const [slug,n] of Object.entries(index)) {
    const file=path.join(site,slug+'.html')
    // A newly loaded page must use the matching Explorer, graph and search data.
    let html=fs.readFileSync(file,'utf8').replaceAll('static/contentIndex.json', 'static/contentIndex.json?v='+indexVersion)
    const route='/'+slug.replace(/(^|\/)index$/,'$1')
    html=html.replace(/<a\b[^>]*\bhref="([^"]+)"[^>]*>/g,(tag,href)=>{
      const url=new URL(href,'https://local.invalid'+route)
      const a=url.origin==='https://local.invalid'&&attachmentRoutes.get(decodeURIComponent(url.pathname))
      if(a?.isHtml) return tag.replace('href="'+href+'"','href="'+href+'.html"')
      if(a?.download) return tag.replace('<a ','<a download ')
      return tag
    })
    if(notes.has(n.filePath) && (n.filePath.endsWith('index.md') || notes.get(n.filePath).data.type==='garden-reference')) {
      const title=escape(n.title)
      if(html.includes('data-heading="'+title+'"')) html=html.replace(/<h1 class="article-title\b[^"]*"[^>]*>[^<]*<\/h1>/,'')
    }
    if(cfg.downloadNotes.includes(n.filePath)){
      const name=posix.basename(n.filePath)
      fs.mkdirSync(path.join(site,'downloads'),{recursive:true})
      fs.copyFileSync(path.join(source,n.filePath),path.join(site,'downloads',name))
      const href=posix.relative(posix.dirname(slug),'downloads/'+name)
      html=html.replace(/<article\b[^>]*>/,tag=>tag+'<p><a download href="'+href+'">下载 Markdown 原文（'+name+'）</a></p>')
    }
    fs.writeFileSync(file,html)
  }
  for(const rel of notes.keys()) if(!slugByFile.has(rel)) throw Error('Note missing from search: '+rel)
  execFileSync('python',[path.join(website,'topic_navigation.py'),site,base.href],{stdio:'inherit'})
  const legacyRoutes = writeLegacyRoutes({site, base, noteSlugs:new Map([...notes.keys()].map(rel=>[rel,slugByFile.get(rel)])), assetFiles})
  fs.writeFileSync(path.join(cache,fixture?'fixture-manifest.json':'manifest.json'),JSON.stringify({notes:[...notes.keys()],legacyRoutes,assets:[...attachmentRoutes.values()].map(a=>a.target),downloads:cfg.downloadNotes.map(p=>'downloads/'+posix.basename(p)),base:base.href},null,2))
  console.log('Published '+notes.size+' notes and '+assets.size+' referenced attachments.')
} finally {
  if(path.dirname(staging)===engine && path.basename(staging).startsWith('input-')) fs.rmSync(staging,{recursive:true,force:true})
}
