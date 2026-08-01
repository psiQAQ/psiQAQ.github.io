# Exa

Exa 是面向 AI 助手的搜索能力服务，可做网页搜索、代码搜索和公司研究；这篇文档先给官网入口，再分别记录 Claude Code 和 Codex 的接入方式。

## Exa 官网地址

<https://exa.ai/docs/reference/exa-mcp>

## 安装方式

### Claude Code

```bash
claude mcp add --scope user --transport http exa https://mcp.exa.ai/mcp
```

### Codex

```bash
notepad %USERPROFILE%\.codex\config.toml
```

在末尾添加以下内容：

```yaml
[mcp_servers.exa]
url = "https://mcp.exa.ai/mcp"
```
