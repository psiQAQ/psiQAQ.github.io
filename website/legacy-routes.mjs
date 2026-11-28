import fs from 'node:fs'
import path from 'node:path'

// b5ef15a published these guides under /guides/<source path without .md>.
const guides = [
  ['others/git', 'environment/git/git'],
  ['programme-env/nodejs', 'environment/runtimes/nodejs'],
  ['programme-env/uv', 'environment/runtimes/uv'],
  ['programme-env/miniforge', 'environment/runtimes/miniforge'],
  ...['wsl', 'linux', 'linux-setup', 'docker', 'Hyper-V', 'powershell', 'SSH-git', 'SSH-remote-login']
    .map(name => ['operating-system/' + name, 'environment/systems/' + name]),
  ['agents/claude-code/claude-code', 'agents/claude-code/claude-code'],
  ...['常用命令', '交互模式', '最佳实践']
    .map(name => ['agents/claude-code/tutorial/' + name, 'agents/claude-code/tutorial/' + name]),
  ['agents/codex/codex', 'agents/codex'],
  ['agents/prompt/Global-Agent-Instructions-revolution', 'agents/prompt/Global-Agent-Instructions-revolution'],
  ...['skills', 'agent-document-lifecycle-planning', 'agent-development-workflows-and-decisions', 'pptx-related-skills']
    .map(name => ['agents/skills/' + name, 'extensions/skills/' + name]),
  ...['zotero', 'blender', 'context7', 'Exa', 'gh_grep']
    .map(name => ['agents/MCP/' + name, 'extensions/mcp/' + name]),
  ...['academic-research-skills', 'claude-tap', 'statusline', 'graphify', 'ponytail']
    .map(name => ['agents/tools/' + name, 'extensions/tools/' + name]),
]

// The Markdown and script resources kept their extensions in the old page URLs.
// The flowchart was a Vite asset, linked as this exact hashed filename.
const resources = [
  ['resources/agents/claude-code/CLAUDE.md', 'agents/claude-code/CLAUDE.md', 'note'],
  ['resources/agents/prompt/AGENTS.md', 'agents/prompt/AGENTS.md', 'note'],
  ['resources/models/models-dev.md', 'resources/models/models-dev.md', 'note'],
  ['resources/others/git-pr-contributor-tutorial.md', 'environment/git/git-pr-contributor-tutorial.md', 'note'],
  ...['cc.bat', 'update-claude-code.bat', 'ccmac.sh', 'cclinux.sh'].map(name =>
    ['resources/agents/claude-code/' + name, 'agents/claude-code/' + name, 'source']),
  ['assets/git-pr-flowchart-B8RzWMSs.html', 'environment/git/git-pr-flowchart.html', 'asset'],
]

// scripts/export-site-data.mjs in b5ef15a also emitted these older aliases.
const earlierAliases = [
  ['guides/others/zotero', 'extensions/mcp/zotero.md', 'note'],
  ['guides/others/blender', 'extensions/mcp/blender.md', 'note'],
  ['guides/models/models-dev', 'resources/models/models-dev.md', 'note'],
]

const legacyRoutes = [
  ...guides.map(([from, to]) => ['guides/' + from, to + '.md', 'note']),
  ...resources,
  ...earlierAliases,
]

const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const encodePath = value => value.split('/').map(encodeURIComponent).join('/')

export function writeLegacyRoutes({site, base, noteSlugs, assetFiles}) {
  const prefix = new URL(base).pathname.replace(/\/?$/, '/')
  const written = []
  for (const [oldRoute, source, type] of legacyRoutes) {
    const destination = (type === 'note' ? noteSlugs : assetFiles).get(source)
    if (!destination) continue

    const isNote = type === 'note'
    const target = isNote ? destination + '.html' : destination
    const targetPath = path.join(site, target)
    if (!fs.statSync(targetPath).isFile()) throw Error('Legacy route target is not a file: ' + target)
    const clean = isNote ? destination.replace(/(^|\/)index$/, '$1') : destination
    const href = prefix + encodePath(clean)
    const escapedHref = escape(href)
    const files = type === 'asset' ? [oldRoute] : [oldRoute + '.html', oldRoute + '/index.html']
    const name = path.posix.basename(source)
    const body = type === 'source'
      ? '<h1>' + escape(name) + '</h1><p><a download href="' + escapedHref + '">下载原文件</a></p><pre><code>' +
        escape(fs.readFileSync(targetPath, 'utf8')) + '</code></pre>'
      : '<h1>页面已迁移</h1><p><a href="' + escapedHref + '">打开当前页面</a></p>'
    const forward = type === 'source' ? '' :
      '<script>location.replace(' + JSON.stringify(href).replaceAll('<', '\\u003c') +
      '+location.search+location.hash)</script><noscript><meta http-equiv="refresh" content="0; url=' +
      escapedHref + '"></noscript>'
    const html = '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">' +
      '<meta name="robots" content="noindex"><title>' + (type === 'source' ? escape(name) : '页面已迁移') +
      '</title><link rel="canonical" href="' + escapedHref + '">' + forward + '</head><body>' + body + '</body></html>\n'

    for (const file of files) {
      const output = path.join(site, file)
      fs.mkdirSync(path.dirname(output), {recursive: true})
      fs.writeFileSync(output, html, {flag: 'wx'})
      written.push({file, target, kind: type, href})
    }
  }
  return written
}
