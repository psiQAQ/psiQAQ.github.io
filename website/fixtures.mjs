// Synthetic compatibility cases. Loaded only by the fixture build.
const front = '---\ntype: garden-reference\nvisibility: public\n---\n'
const samples = [
  '# 中文 空格', '',
  '[[目标 笔记#段落]] · [[目标 笔记#^block]]', '', '![[目标 笔记#段落]]', '',
  '> [!note] 提示', '> 示例内容', '', '数学 $E=mc^2$。[^one]', '',
  '```mermaid', 'graph TD', '  A --> B', '```', '',
  '```js', 'const answer = 42', '```', '', '![[sample.pdf]]', '',
  '[^one]: 脚注示例。'
]
const negative = {private:'[[私人]]',withdrawn:'[[撤回]]',escape:'[其他库](../../../other-vault/entry.md)'}
if (process.env.PUBLISH_NEGATIVE_CASE) samples.push(negative[process.env.PUBLISH_NEGATIVE_CASE])
export const files = new Map([
  ['fixture/中文 空格.md',front+samples.join('\n')],
  ['fixture/目标 笔记.md','---\ntitle: 目标笔记\nvisibility: public\ntype: garden-reference\naliases: [兼容别名]\ntags: [测试]\n---\n# 目标笔记\n\n## 段落\n\n可嵌入文本。 ^block\n'],
  ['fixture/私人.md','---\nvisibility: private\n---\nsynthetic-private-canary'],
  ['fixture/撤回.md','---\ntype: garden-note\nvisibility: public\npublish_ready: false\n---\nwithdrawn-canary'],
  ['fixture/sample.pdf',Buffer.from('%PDF-1.1\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 0 /Kids [] >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n')]
])
