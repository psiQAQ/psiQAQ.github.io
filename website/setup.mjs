import {execFileSync} from 'node:child_process'
import {existsSync, mkdirSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

const engine = fileURLToPath(new URL('./.build/quartz/', import.meta.url))
const revision = '5a740b3ae06569c5d67a911fcd58cb1353db8110' // Quartz v5.3.1
mkdirSync(engine, {recursive:true})
function git(...args) {
  return execFileSync('git', args, {cwd:engine,encoding:'utf8'}).trim()
}
if (!existsSync(engine+'/.git')) git('init','--quiet')
if (!existsSync(engine+'/.git/FETCH_HEAD') || git('rev-parse','HEAD')!==revision) {
  git('fetch','--depth=1','https://github.com/jackyzha0/quartz.git',revision)
  git('checkout','--detach',revision)
}
if (git('rev-parse','HEAD')!==revision || git('status','--porcelain','--untracked-files=no')) throw Error('Quartz checkout differs from pinned release')
execFileSync(process.platform==='win32'?'npm.cmd':'npm',['ci','--no-audit','--no-fund'],{cwd:engine,stdio:'inherit',shell:process.platform==='win32'})
