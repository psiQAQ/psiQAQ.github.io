# gh_grep

`gh_grep` 是基于 grep.app 的 MCP 搜索服务，适合在 GitHub 公共仓库里按代码模式查找真实示例；这篇文档先介绍它是什么，再给出官网入口和在 Claude Code / Codex 中的安装方式。

## gh_grep 官网地址

- <https://vercel.com/blog/grep-a-million-github-repositories-via-mcp>
- <https://grep.app/>

## 安装方式

### Claude Code

```bash
claude mcp add --scope user --transport http grep https://mcp.grep.app
```

### Codex

```bash
notepad %USERPROFILE%\.codex\config.toml
```

在末尾添加以下内容：

```yaml
[mcp_servers.gh_grep]
url = "https://mcp.grep.app"
```
