# agent-lab-notes

面向科研工作的 Agent 工具链笔记，记录环境配置、工具选型、工作流设计和常见问题解决方案。内容尽量不绑定单一智能体，可按需用于 Claude Code、Codex 等工具。

- [打开读者首页](./content/index.md)，按主题查找教程、学习资料和工具。
- [打开知识花园视图](Views/Garden.base)，在 Obsidian 中切换“种子和草稿”与“准备分享”。

## 维护笔记

公开笔记和随文附件放在 `content/` 的对应主题目录。新增文章时填写 `title`，并在同一主题的 `index.md` 添加相对链接。脚本、指令原文和流程图直接链接到文件。四个主题入口集中在[读者首页](./content/index.md)。

可以用[种子模板](./Templates/种子.md)记录待验证的想法，用[经验条目模板](./Templates/经验条目.md)整理已验证的方法。草稿留在 `Drafts/`；准备分享的经验条目使用 `type: garden-note`、`maturity: evergreen`、`visibility: public` 和 `publish_ready: true`，在知识花园视图中复核后移入相应主题。

Quartz 的内容输入目录为 `content/`。整理资料时仅移动拟公开的文件，保留同目录下的本机参考稿在库内原处。

[模板来源与许可](LICENSES.md) · [知识花园检查示例](Examples/Checks.md)

## 检验本库

在本库根目录使用 Node.js 20 或更新版本运行：

```sh
node ./checks/kb-check.cjs --library . --checks all
```

命令输出 JSON，报告保存在本库的 `.log/` 目录。使用 `--list` 查看通用和模板专项检验，使用 `--checks <id>` 指定检验。

逐项查看 `checks[].status`、`coverage` 和 `diagnostics`。在 Obsidian 外运行时，部分链接可能因缺少 Vault 上下文而无法判定。例如，`status: partial`、`coverage.checked: 17`、`coverage.unknown: 3` 表示已检查 17 项，还有 3 项待核对。需要 Vault 范围的解析时，可以提供 `--vault-root <path>`。

本模板在 `kb-template.json` 中声明了以下专项检验。脚本位于 `checks/`，运行需通过脚本信任检查。

- `workflow` · 拟分享条目的可见性和私有引用
