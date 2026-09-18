# Findings & Decisions

## Requirements

- 新增 notes/agents/prompt/AGENTS.md 作为跨平台可复用的当前全局指令。
- 新增 notes/agents/prompt/Global-Agent-Instructions-revolution.md 作为平台说明、依据和演进记录。
- 将 notes/agents/codex/AGENTS.md 迁移到共享路径并更新内容；根目录 AGENTS.md 保持不变。
- Codex/Claude Code 指南保留平台用法，仅引用共享模板和演进记录；Claude 专用 CLAUDE.md 保留。
- README 和站点测试同步新路径，并验证新演进文档路由。
- 不执行 commit、push 或外部发布。

## Research Findings

- lib/content.ts 已通过 notes/**/*.md 自动发现 Markdown 内容，不需要新增生产代码路由。
- README.md 的 📄 条目驱动指南页，🧾 条目驱动资源页；共享演进记录应进入前者，模板应进入后者。
- tests/site.test.mjs 仍包含 /resources/agents/codex/AGENTS.md 旧路径，需要改为 /resources/agents/prompt/AGENTS.md，并增加演进指南路由检查。
- 当前 notes/agents/codex/codex.md 含全局指令说明和 Windows A/B 实验附录；这些通用内容应移动到演进记录，平台指南只保留使用入口。
- 当前 notes/agents/claude-code/claude-code.md 的全局指令章节很短，适合改为三种组合方式说明。
- notes/agents/claude-code/CLAUDE.md 是 Claude 专用模板，本轮不迁移、不改写。
- 当前工作树在实施前干净，根目录 AGENTS.md 未纳入修改范围。

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| 共享模板沿用现有结构并增补少量独立原则 | 减少重复和行为漂移，保持可直接安装使用 |
| 使用相对链接连接同一 notes/agents 树中的文档 | 移动或在线发布后仍能保持站内导航 |
| 官方平台行为与个人演进记录分开写 | 平台事实可核查，个人选择可持续追加 |
| 以当前有效状态描述运行制品 | 遵守用户要求的最终状态完整性，历史集中到演进记录 |

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| 初始化脚本的 PowerShell 版本只支持根目录旧模式 | 使用同一技能提供的 Bash 版本创建独立 .planning 任务目录 |
| 无 | 继续实施 |

## Resources

- Codex AGENTS.md 官方说明: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Claude Code memory 官方说明: https://code.claude.com/docs/en/memory
- GPT-6 Astra 模型指南: https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra
- GPT-5.6 模型指南: https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.6
- 上游 AGENTS.md: https://github.com/Da1sypetals/AGENTS.md
- notes/agents/codex/codex.md
- notes/agents/claude-code/claude-code.md
- notes/agents/claude-code/CLAUDE.md

## Visual/Browser Findings

- 本任务不需要视觉检查；目标是 Markdown、README、路由和测试。
