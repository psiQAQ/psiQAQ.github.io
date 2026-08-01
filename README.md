# agent-lab-notes

面向科研工作的 Agent 工具链笔记，记录环境配置、工具选型、工作流设计和常见问题解决方案。内容尽量不绑定单一智能体，可按需用于 Claude Code、Codex 等工具。

网站：[https://psiqaq.github.io/](https://psiqaq.github.io/)

## 如何维护

根目录 `README.md` 同时是 GitHub 首页和网站公开清单。新增或更新内容时：

1. 将笔记和附件放在 `notes/` 对应分类中。
2. 在下方两个 `site-catalog` 标记之间，按现有格式新增一条链接。
3. 提交并 `push` 到 `main`；GitHub Pages 会自动重新构建网站。

清单中的本地 Markdown 会成为网站指南；外部链接和本地脚本等文件会出现在网站“资源”页。标记外的说明文字不会发布为网站内容。

<!-- site-catalog:start -->

## 基础环境

- [Git 指南](notes/others/git.md) — Git 安装、配置与常用操作。
- [UV 指南](notes/programme-env/uv.md) — Python 环境与依赖管理。
- [Node.js 指南](notes/programme-env/nodejs.md) — Node.js 安装与环境配置。
- [Miniforge 指南](notes/programme-env/miniforge.md) — Conda 环境安装与使用。

## 系统与运行环境

- [WSL 指南](notes/operating-system/wsl.md) — Windows 上的 Linux 开发环境。
- [Ubuntu 常用命令与配置](notes/operating-system/linux.md) — Linux 日常使用速查。
- [Hyper-V 指南](notes/operating-system/Hyper-V.md) — Hyper-V 安装与配置。

## 智能体

### Claude Code

- [Claude Code 指南](notes/agents/claude-code/claude-code.md) — 安装、配置与基础使用。
- [国内 Claude Code 安装保姆级教程](https://www.bilibili.com/video/BV1AjGD6mEV4) — 视频教程。
- [Claude Code 一键快捷启动脚本](notes/agents/claude-code/cc.bat) — Windows 启动脚本源码。
- [Claude Code macOS 快捷启动脚本](notes/agents/claude-code/ccmac.sh) — macOS 启动脚本源码。
- [Claude Code Linux/WSL 快捷启动脚本](notes/agents/claude-code/cclinux.sh) — Linux/WSL 启动脚本源码。
- [CLAUDE.md 全局指令示范](notes/agents/claude-code/CLAUDE.md) — 可复用的全局指令示例。
- [Claude Code 常用命令](notes/agents/claude-code/tutorial/常用命令.md) — 常用命令说明。
- [常用命令视频](https://www.bilibili.com/video/?p=1) — 配套视频。
- [Claude Code 交互模式](notes/agents/claude-code/tutorial/交互模式.md) — 交互模式说明。
- [交互模式视频](https://www.bilibili.com/video/?p=2) — 配套视频。
- [Claude Code 最佳实践](notes/agents/claude-code/tutorial/最佳实践.md) — 日常使用建议。
- [最佳实践视频](https://www.bilibili.com/video/?p=3) — 配套视频。

### Codex

- [Codex 指南](notes/agents/codex/codex.md) — 安装、配置与基础使用。
- [Codex 指南 GitHub 备用地址](https://github.com/psiQAQ/psiQAQ.github.io/blob/main/notes/agents/codex/codex.md) — GitHub 原始内容入口。
- [AGENTS.md 全局指令示范](notes/agents/codex/AGENTS.md) — 可复用的全局指令示例。
- [GPT 套餐周额度重置时间查询脚本](notes/agents/codex/codex-reset-remaining.py) — Python 脚本源码。

## 智能体扩展

### Skills

- [Skills 指南](notes/agents/skills/skills.md) — Skill 的安装与使用。
- [PPT 相关 Skills](notes/agents/skills/pptx-related-skills.md) — 幻灯片任务相关 Skill。

### MCP

- [Context7 MCP](notes/agents/MCP/context7.md) — 文档检索 MCP。
- [Exa](notes/agents/MCP/Exa.md) — 搜索工具说明。
- [gh_grep](notes/agents/MCP/gh_grep.md) — GitHub 代码搜索工具。

### 周边工具与扩展

- [claude-tap](notes/agents/tools/claude-tap.md) — Claude Code 周边工具。
- [ccstatueline](notes/agents/tools/ccstatueline.md) — 状态栏扩展。
- [Blender 指南](notes/others/blender.md) — Blender 安装与科研使用。

### 代码读取与生成

- [graphify](notes/agents/tools/graphify.md) — 代码图谱工具。
- [ponytail](notes/agents/tools/ponytail.md) — 简化 Agent 编码方案的插件。

## 科研助力

- [Zotero 指南](notes/others/zotero.md) — 文献管理与 Agent 协作。
- [academic-research-skills](notes/agents/tools/academic-research-skills.md) — 学术研究 Skills。

## 大模型选型与排行榜

- [Models.dev](notes/models/models-dev.md) — AI 模型规格、价格与能力查询。
- [Artificial Analysis](https://artificialanalysis.ai/) — AI 模型评测与 API 性能分析。
- [Arena AI](https://arena.ai/) — 大模型竞技场与排行榜。

## AI 新闻

- [24 小时 AI 更新雷达](https://learnprompt.github.io/ai-news-radar/) — AI 新闻聚合。
- [AIHOT](https://aihot.virxact.com/) — AI 热点内容聚合。

## 补充资料

### 外部 Agent 学习指南

- [AI 编程指南：Claude Code](https://coding.stormzhang.ai/) — 外部学习指南。
- [AI 编程指南：Codex](https://coding.stormzhang.ai/) — 外部学习指南。

### bilibili：技术爬爬虾

- [Codex APP 保姆级全攻略](https://www.bilibili.com/video/BV1Kk9kBAEJv) — Codex 实战视频。
- [Git 与 GitHub 核心概念](https://www.bilibili.com/video/BV1ySLc6QEcB) — Git 入门视频。

### bilibili：张司机在路上

- [Claude Code 与 Anthropic 后端通信](https://www.bilibili.com/video/BV1G2o5BqELx) — 技术解析视频。
- [提升 Claude Code 缓存命中](https://www.bilibili.com/video/BV1ZQ5u6bEJ7) — Token 使用优化视频。

### 其他

- [Markdown 完全指南](https://www.bilibili.com/video/BV1tJXZBgEoC) — Markdown 入门视频。
- [Zotero 8/9 零基础教程](https://www.bilibili.com/video/BV1ecQBBZESv) — Zotero 视频教程。
- [Codex 提升科研效率](https://www.bilibili.com/video/BV1NwEb6gEy1) — 科研工作流视频。
- [AI Agent 编年史](https://www.bilibili.com/video/BV1NL9tBsELS) — Agent 发展回顾。
- [姚顺宇四小时访谈](https://www.bilibili.com/video/BV1YR5E6EE9o) — 行业访谈。
- [中美大模型差距讨论](https://www.bilibili.com/video/BV1HDVT6bE8x) — Hugging Face 相关访谈。
- [程序员眼中的 AI 叙事](https://www.bilibili.com/video/BV1gyEd6xEyu) — 行业讨论。
- [Can I Run AI](https://www.canirun.ai) — 检测本地设备可运行的 AI 模型。

<!-- site-catalog:end -->
