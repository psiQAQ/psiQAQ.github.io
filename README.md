# agent-lab-notes

面向科研工作的 Agent 工具链笔记，记录环境配置、工具选型、工作流设计和常见问题解决方案。内容尽量不绑定单一智能体，可按需用于 Claude Code、Codex 等工具。

- [浏览内容目录](Public/index.md)，按主题查找教程、学习资料和工具。
- [打开知识花园视图](Views/Garden.base)，在 Obsidian 中切换“种子和草稿”与“准备分享”。

## 维护笔记

教程和随文附件放在 `Guides/` 的对应主题内。用 [种子模板](Templates/种子.md) 记录待验证的想法，用 [经验条目模板](Templates/经验条目.md) 整理可复用的方法。草稿放在 `Drafts/`，需要进入读者目录的指南和资源在 [内容目录](Public/index.md) 中维护。

把拟分享的经验条目标为 `type: garden-note`、`maturity: evergreen`、`visibility: public` 和 `publish_ready: true`，再运行库内检验。脚本和可直接复制的指令模板保留源文件格式。

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
