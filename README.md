# agent-lab-notes

面向科研工作的 Agent 工具链笔记，记录环境配置、工具选型、工作流设计和常见问题解决方案。内容尽量不绑定单一智能体，可按需用于 Claude Code、Codex 等工具。

网站：[https://psiqaq.github.io/](https://psiqaq.github.io/)

## 如何维护

根目录 `README.md` 同时是 GitHub 首页和网站公开清单。新增或更新内容时：

1. 将笔记和附件放在 `notes/` 对应分类中。
2. 在下方两个 `site-catalog` 标记之间，按现有格式新增一条链接。
3. 提交并 `push` 到 `main`；GitHub Pages 会自动重新构建网站。

清单中的每个链接必须以类型图标开头，格式为 `- 📄[标题](路径)`，链接后不添加描述。只有 `📄` 会成为网站指南；`📺`、`🚀`、`🧾`、`📊`、`⚔️`、`📰`、`📚`、`🌐` 都会成为网站资源。标记外的说明文字不会发布为网站内容。

<!-- site-catalog:start -->

## 基础环境

- 📄[Git 指南](notes/others/git.md)
- 📄[UV 指南](notes/programme-env/uv.md)
- 📄[Node.js 指南](notes/programme-env/nodejs.md)
- 📄[Miniforge 指南](notes/programme-env/miniforge.md)

## 系统与运行环境

- 📄[WSL 指南](notes/operating-system/wsl.md)
- 📄[Ubuntu 常用命令与配置](notes/operating-system/linux.md)
- 📄[Hyper-V 指南](notes/operating-system/Hyper-V.md)

## 智能体

### Claude Code

- 📄[Claude Code 指南](notes/agents/claude-code/claude-code.md)
- 📺[国内 Claude Code 安装保姆级教程](https://www.bilibili.com/video/BV1AjGD6mEV4)
- 🚀[Claude Code 一键快捷启动脚本](notes/agents/claude-code/cc.bat)
- 🚀[Claude Code macOS 快捷启动脚本](notes/agents/claude-code/ccmac.sh)
- 🚀[Claude Code Linux/WSL 快捷启动脚本](notes/agents/claude-code/cclinux.sh)
- 🧾[CLAUDE.md 全局指令示范](notes/agents/claude-code/CLAUDE.md)
- 📄[Claude Code 常用命令](notes/agents/claude-code/tutorial/常用命令.md)
- 📺[常用命令视频](https://www.bilibili.com/video/BV1caE86BEyQ/?p=1)
- 📄[Claude Code 交互模式](notes/agents/claude-code/tutorial/交互模式.md)
- 📺[交互模式视频](https://www.bilibili.com/video/BV1caE86BEyQ/?p=2)
- 📄[Claude Code 最佳实践](notes/agents/claude-code/tutorial/最佳实践.md)
- 📺[最佳实践视频](https://www.bilibili.com/video/BV1caE86BEyQ/?p=3)

### Codex

- 📄[Codex 指南](notes/agents/codex/codex.md)
- 🧾[AGENTS.md 全局指令示范](notes/agents/codex/AGENTS.md)
- 🧾[GPT 套餐周额度重置时间查询脚本](notes/agents/codex/codex-reset-remaining.py)

## 智能体扩展

### Skills

- 📄[Skills 指南](notes/agents/skills/skills.md)
- 📄[PPT 相关 Skills](notes/agents/skills/pptx-related-skills.md)

### MCP

- 📄[Context7 MCP](notes/agents/MCP/context7.md)
- 📄[Exa](notes/agents/MCP/Exa.md)
- 📄[gh_grep](notes/agents/MCP/gh_grep.md)

### 周边工具与扩展

- 📄[claude-tap](notes/agents/tools/claude-tap.md)
- 📄[Claude Code 状态栏工具](notes/agents/tools/statusline.md)
- 📄[Blender 指南](notes/others/blender.md)

### 代码读取与生成

- 📄[graphify](notes/agents/tools/graphify.md)
- 📄[ponytail](notes/agents/tools/ponytail.md)

## 科研助力

- 📄[Zotero 指南](notes/others/zotero.md)
- 📄[academic-research-skills](notes/agents/tools/academic-research-skills.md)

## 大模型选型与排行榜

- 📄[Models.dev](notes/models/models-dev.md)
- 📊[Artificial Analysis](https://artificialanalysis.ai/)
- ⚔️[Arena AI](https://arena.ai/)

## AI 新闻

- 📰[24 小时 AI 更新雷达](https://learnprompt.github.io/ai-news-radar/)
- 📰[AIHOT](https://aihot.virxact.com/)

## 补充资料

### 外部 Agent 学习指南

- 📚[AI 编程指南：Claude Code](https://coding.stormzhang.ai/)
- 📚[AI 编程指南：Codex](https://coding.stormzhang.ai/)

### bilibili：技术爬爬虾

- 📺[Codex APP 保姆级全攻略](https://www.bilibili.com/video/BV1Kk9kBAEJv)
- 📺[Git 与 GitHub 核心概念](https://www.bilibili.com/video/BV1ySLc6QEcB)

### bilibili：张司机在路上

- 📺[Claude Code 与 Anthropic 后端通信](https://www.bilibili.com/video/BV1G2o5BqELx)
- 📺[提升 Claude Code 缓存命中](https://www.bilibili.com/video/BV1ZQ5u6bEJ7)

### 其他

- 📺[Markdown 完全指南](https://www.bilibili.com/video/BV1tJXZBgEoC)
- 📺[Zotero 8/9 零基础教程](https://www.bilibili.com/video/BV1ecQBBZESv)
- 📺[Codex 提升科研效率](https://www.bilibili.com/video/BV1NwEb6gEy1)
- 📺[AI Agent 编年史](https://www.bilibili.com/video/BV1NL9tBsELS)
- 📺[姚顺宇四小时访谈](https://www.bilibili.com/video/BV1YR5E6EE9o)
- 📺[中美大模型差距讨论](https://www.bilibili.com/video/BV1HDVT6bE8x)
- 📺[程序员眼中的 AI 叙事](https://www.bilibili.com/video/BV1gyEd6xEyu)
- 🌐[Can I Run AI](https://www.canirun.ai)

<!-- site-catalog:end -->
