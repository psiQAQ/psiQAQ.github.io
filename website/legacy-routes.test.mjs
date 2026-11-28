import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {test} from 'node:test'
import {fileURLToPath} from 'node:url'
import {writeLegacyRoutes} from './legacy-routes.mjs'

test('legacy guide and source routes keep URL forms and only use published files', () => {
  const cache = fileURLToPath(new URL('./.build/', import.meta.url))
  fs.mkdirSync(cache, {recursive: true})
  const site = fs.mkdtempSync(path.join(cache, 'legacy-test-'))
  const notePath = 'agents/claude-code/tutorial/交互模式'
  const scriptPath = 'agents/claude-code/cc.bat'
  const script = 'echo <script>&\r\n'
  try {
    for (const [file, data] of [[notePath + '.html', '<h1>交互模式</h1>'], [scriptPath, script]]) {
      const output = path.join(site, file)
      fs.mkdirSync(path.dirname(output), {recursive: true})
      fs.writeFileSync(output, data)
    }
    const outputs = writeLegacyRoutes({
      site,
      base: new URL('https://example.test/project/'),
      noteSlugs: new Map([[notePath + '.md', notePath]]),
      assetFiles: new Map([[scriptPath, scriptPath]]),
    })
    assert.deepEqual(outputs.map(({file}) => file), [
      'guides/' + notePath + '.html',
      'guides/' + notePath + '/index.html',
      'resources/' + scriptPath + '.html',
      'resources/' + scriptPath + '/index.html',
    ])
    const read = file => fs.readFileSync(path.join(site, file), 'utf8')
    for (const {file, kind, href} of outputs) {
      const html = read(file)
      assert.ok(html.includes('href="' + href + '"'))
      if (kind === 'source') {
        assert.match(html, /<a download href="\/project\/agents\/claude-code\/cc\.bat"/)
        assert.match(html, /echo &lt;script&gt;&amp;/)
        assert.doesNotMatch(html, /<script>/)
      } else {
        assert.ok(href.endsWith('/' + encodeURIComponent('交互模式')))
        assert.match(html, /location\.search\+location\.hash/)
      }
    }
    assert.equal(read(scriptPath), script)
    assert.ok(fs.statSync(path.join(site, 'resources', scriptPath)).isDirectory())
    assert.ok(!fs.existsSync(path.join(site, 'guides', 'others/git.html')))
  } finally {
    assert.equal(path.resolve(path.dirname(site)), path.resolve(cache))
    fs.rmSync(site, {recursive: true})
  }
})
