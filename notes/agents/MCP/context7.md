# Context7 MCP

Context7 是给 LLM 和 AI 编码工具使用的文档检索 MCP，适合按库和版本抓官方文档与示例代码；这篇文档先说明文档来源和未收录资料的处理，再给使用示例与 Claude Code / Codex 的安装接入。

## 文档来源

- 官方文档站点：获取框架或库的最新说明。
- 源码仓库：从 GitHub 等平台提取代码片段与文档内容。
- 项目依赖文件：识别依赖版本并匹配对应版本文档。
- 社区补充：通过 `Add Docs` 添加尚未收录的资料。

## 未收录文档的处理方式

当目标资料不在 Context7 收录范围内（例如垂直领域网页、非主流站点或 PDF 说明书）时，可按以下方式处理：

- 先将内容整理为 Markdown，再上传到可索引的平台。
- 使用 Context7 官方的 `Add Docs` 功能手动补充。
- 在本地提取关键内容，并在提示词中明确引用。
- 将高价值文档提交到社区仓库，便于后续复用。

## 使用示例

1. 在提示中指定 `context7`、库名和版本。
2. 提出具体问题。
3. 基于返回的文档与示例继续实现。

```plain
use context7 library example-library@2.3.4
如何使用 example-library 的某个特定功能来完成任务 X？
```

## context7 官网地址

- <https://github.com/upstash/context7>
- <https://context7.com/>

## 安装方式

### Claude Code

```bash
claude mcp add --scope user --transport http context7 https://mcp.context7.com/mcp
```

### Codex

```bash
notepad %USERPROFILE%\.codex\config.toml
```

在末尾添加以下内容：

```yaml
[mcp_servers.context7]
url = "https://mcp.context7.com/mcp"
```
