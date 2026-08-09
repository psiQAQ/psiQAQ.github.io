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

- 📄[Git：版本控制基础](notes/others/git.md)
- 📄[Node.js：JavaScript 运行环境](notes/programme-env/nodejs.md)
- 📄[UV：Python 开发基础设施](notes/programme-env/uv.md)
- 📄[Miniforge：Python 开发基础设施](notes/programme-env/miniforge.md)

## 系统与运行环境

- 📄[WSL：Windows Linux 子系统](notes/operating-system/wsl.md)
- 📄[Ubuntu：Linux 常用命令与配置](notes/operating-system/linux.md)
- 📄[Docker：容器化部署实战](notes/operating-system/docker.md)
- 📄[Hyper-V：Windows 虚拟化](notes/operating-system/Hyper-V.md)

## 智能体

### Claude Code

- 📄[Claude Code：终端编程智能体](notes/agents/claude-code/claude-code.md)
- 📺[Claude Code 国内安装视频](https://www.bilibili.com/video/BV1AjGD6mEV4)
- 🚀[Claude Code Windows 启动脚本](notes/agents/claude-code/cc.bat)
- 🚀[Claude Code macOS 快捷启动脚本](notes/agents/claude-code/ccmac.sh)
- 🚀[Claude Code Linux/WSL 启动脚本](notes/agents/claude-code/cclinux.sh)
- 🧾[Claude Code 全局指令模板](notes/agents/claude-code/CLAUDE.md)
- 📄[Claude Code 命令速查](notes/agents/claude-code/tutorial/常用命令.md)
- 📺[Claude Code 命令使用视频](https://www.bilibili.com/video/BV1caE86BEyQ/?p=1)
- 📄[Claude Code 交互模式指南](notes/agents/claude-code/tutorial/交互模式.md)
- 📺[Claude Code 交互模式视频](https://www.bilibili.com/video/BV1caE86BEyQ/?p=2)
- 📄[Claude Code 使用最佳实践](notes/agents/claude-code/tutorial/最佳实践.md)
- 📺[Claude Code 最佳实践视频](https://www.bilibili.com/video/BV1caE86BEyQ/?p=3)

### Codex

- 📄[Codex：OpenAI 编程智能体](notes/agents/codex/codex.md)
- 🧾[Codex 全局指令模板](notes/agents/codex/AGENTS.md)
- 🧾[Codex 周额度重置时间查询脚本](notes/agents/codex/codex-reset-remaining.py)

## 智能体扩展

### Skills

- 📄[Skills：智能体能力扩展](notes/agents/skills/skills.md)
- 📄[PPT 制作相关 Skills](notes/agents/skills/pptx-related-skills.md)

### MCP

- 📄[Context7 MCP：技术文档检索](notes/agents/MCP/context7.md)
- 📄[Exa MCP：AI 联网搜索](notes/agents/MCP/Exa.md)
- 📄[gh_grep MCP：GitHub 代码搜索](notes/agents/MCP/gh_grep.md)

### 周边工具与扩展

- 📄[claude-tap：Agent 会话拆解与可视化](notes/agents/tools/claude-tap.md)
- 📄[Claude Code 会话状态栏工具](notes/agents/tools/statusline.md)
- 📄[Blender：开源三维建模 MCP 接入](notes/others/blender.md)

### 代码读取与生成

- 📄[graphify：代码库知识图谱](notes/agents/tools/graphify.md)
- 📄[ponytail：防止过度设计插件](notes/agents/tools/ponytail.md)

## 科研助力

- 📄[Zotero：文献管理](notes/others/zotero.md)
- 📄[ARS：学术研究工作流](notes/agents/tools/academic-research-skills.md)

## 大模型选型与排行榜

- 📄[Models.dev：AI 模型参数查询](notes/models/models-dev.md)
- 📊[Artificial Analysis：大模型评测](https://artificialanalysis.ai/)
- ⚔️[Arena AI：大模型竞技排名](https://arena.ai/)

## 资源

### Agent 入门与实践

- 📚[Claude Code 入门学习指南](https://coding.stormzhang.ai/)
- 📚[Codex 入门学习指南](https://coding.stormzhang.ai/)
- 📺[Codex APP 入门实战](https://www.bilibili.com/video/BV1Kk9kBAEJv)
- 📺[Codex 科研效率实战](https://www.bilibili.com/video/BV1NwEb6gEy1)

### Agent 原理与优化

- 📺[Claude Code 后端通信原理](https://www.bilibili.com/video/BV1G2o5BqELx)
- 📺[Claude Code 缓存优化](https://www.bilibili.com/video/BV1ZQ5u6bEJ7)

### 开发与模型工具

- 📺[Git 与 GitHub 核心概念](https://www.bilibili.com/video/BV1ySLc6QEcB)
- 📺[Markdown 完全指南](https://www.bilibili.com/video/BV1tJXZBgEoC)
- 🌐[Can I Run AI：本地模型检测](https://www.canirun.ai)
- 📚[Git PR 教程文档（普通贡献者视角）](notes/others/git-pr-contributor-tutorial.md)
- 🌐[Git PR 流程图（普通贡献者视角）](notes/others/git-pr-flowchart.html)

### AI 新闻

- 📰[24 小时更新雷达：AI 新闻聚合](https://learnprompt.github.io/ai-news-radar/)
- 📰[AIHOT：AI 热点聚合](https://aihot.virxact.com/)

### AI 行业观察

- 📺[AI Agent 发展史](https://www.bilibili.com/video/BV1NL9tBsELS)
- 📺[姚顺宇 AI 访谈](https://www.bilibili.com/video/BV1YR5E6EE9o)
- 📺[中美大模型差距讨论](https://www.bilibili.com/video/BV1HDVT6bE8x)
- 📺[程序员视角下的 AI 叙事](https://www.bilibili.com/video/BV1gyEd6xEyu)

<!-- site-catalog:end -->
