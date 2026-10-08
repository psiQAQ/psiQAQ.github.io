# agent-lab-notes

面向科研工作的 Agent 工具链笔记，记录环境配置、工具选型、工作流设计和常见问题解决方案。内容尽量不绑定单一智能体，可按需用于 Claude Code、Codex 等工具。

网站：[https://psiqaq.github.io/](https://psiqaq.github.io/)

## 如何维护

根目录 `README.md` 同时是 GitHub 首页和网站公开清单。新增或更新内容时：

1. 将笔记和附件放在 `notes/` 对应分类中。
2. 在下方两个 `site-catalog` 标记之间，按现有格式新增一条链接。
3. 在本地构建并检查；有意修改公开清单或笔记正文时，按下方说明更新内容基线。
4. 提交并 `push` 到 `main`；GitHub Pages 会检查同一份构建产物，通过后再发布。

清单中的每个链接必须以类型图标开头，格式为 `- 📄[标题](路径)`，链接后不添加描述。只有 `📄` 会成为网站指南；`📺`、`🚀`、`🧾`、`📊`、`⚔️`、`📰`、`📚`、`🌐` 都会成为网站资源。标记外的说明文字不会发布为网站内容。

分类导航、资源入口和搜索索引均由这份清单生成。搜索覆盖指南的叙述正文、资源元数据和学习文章正文；脚本、指令模板及围栏代码仍完整展示，不加入全文搜索。新增公开入口需要写入清单。

根地址直接展示知识库。站点导航提供知识库和资源导航，搜索使用顶部搜索框。两个索引页的分类和分组标题均采用 `1.`、`1.1` 层级编号，侧栏链接定位对应章节。知识库按主题列出指南；资源导航依次为 Agent 安装与配置、Agent 学习资料、LLM 参数汇总、LLM 评测排行榜、开发与模型工具、AI 新闻、AI 行业观察，全部条目使用整行布局。其中“智能体”在资源页显示为“Agent 安装与配置”。Models.dev 在 LLM 参数汇总中阅读。

### 本地检查与预览

使用 Node.js 22.13.0 或更新版本，在仓库根目录运行；首次安装项目依赖使用 `npm ci`。

```powershell
npm run lint
npm run typecheck:site
npm test
npm start
```

预览地址为 `http://127.0.0.1:3000`。`npm test` 包含构建、页面与搜索测试，以及实际静态文件、锚点、附件和内容保留检查。导出产物同时提供平铺 HTML 和目录 `index.html`，使 GitHub Pages 支持普通网址及带尾部斜杠的网址；静态检查核对两种入口的完整内容一致。`typecheck:site` 检查网页代码；现有 Worker 的类型配置仍单独维护。

`tests/fixtures/site-baseline.json` 记录内容保留基线。调整展示层时保留此文件；有意修改公开内容后，先检查内容差异，再构建并更新基线，将基线变更与内容一并审阅：

```powershell
npm run build
node scripts/capture-site-baseline.mjs --update
npm run test:built
```

需要检查真实浏览器布局与交互时，先保持本地预览运行，在另一个 PowerShell 窗口指定已安装的 Chrome/Chromium：

```powershell
$env:BROWSER_EXECUTABLE = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
node scripts/browser-check.mjs
```

检查使用隔离浏览器配置，截图与结果保存在忽略提交的 `outputs/just-the-docs/`。网页改造决策和验证记录见 [实施记录](docs/superpowers/plans/2026-10-08-just-the-docs-refresh-implementation.md)。

<!-- site-catalog:start -->

## 基础环境

- 📄[Git：版本控制基础](notes/others/git.md)
- 📄[Node.js：JavaScript 运行环境](notes/programme-env/nodejs.md)
- 📄[UV：Python 开发基础设施](notes/programme-env/uv.md)
- 📄[Miniforge：Python 开发基础设施](notes/programme-env/miniforge.md)

## 系统与运行环境

- 📄[WSL：Windows Linux 子系统](notes/operating-system/wsl.md)
- 📄[Ubuntu：Linux 常用命令与配置](notes/operating-system/linux.md)
- 📄[Windows + Ubuntu 双系统安装](notes/operating-system/linux-setup.md)
- 📄[Docker：容器化部署实战](notes/operating-system/docker.md)
- 📄[Hyper-V：Windows 虚拟化](notes/operating-system/Hyper-V.md)
- 📄[PowerShell 7：Windows Agent 终端优化](notes/operating-system/powershell.md)
- 📄[Git 远程仓库 SSH 配置](notes/operating-system/SSH-git.md)
- 📄[跨系统远程 SSH 登录配置](notes/operating-system/SSH-remote-login.md)

## 智能体

### Claude Code

- 📄[Claude Code：终端编程智能体](notes/agents/claude-code/claude-code.md)
- 📺[Claude Code 国内安装视频](https://www.bilibili.com/video/BV1AjGD6mEV4)
- 🚀[Claude Code Windows 启动脚本](notes/agents/claude-code/cc.bat)
- 🚀[Claude Code Windows 更新脚本](notes/agents/claude-code/update-claude-code.bat)
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

### 通用全局指令

- 📄[Agent 全局指令演进记录](notes/agents/prompt/Global-Agent-Instructions-revolution.md)
- 🧾[Agent 通用全局指令模板](notes/agents/prompt/AGENTS.md)

## 智能体扩展

### Skills

- 📄[Skills：智能体能力扩展](notes/agents/skills/skills.md)
- 📄[ARS：学术研究工作流](notes/agents/tools/academic-research-skills.md)
- 📄[Agent 文档生命周期规划](notes/agents/skills/agent-document-lifecycle-planning.md)
- 📄[Agent 开发工作流与决策流](notes/agents/skills/agent-development-workflows-and-decisions.md)
- 📄[PPT 制作相关 Skills](notes/agents/skills/pptx-related-skills.md)

### MCP

- 📄[Zotero：文献管理](notes/agents/MCP/zotero.md)
- 📄[Blender：开源三维建模 MCP 接入](notes/agents/MCP/blender.md)
- 📄[Context7 MCP：技术文档检索](notes/agents/MCP/context7.md)
- 📄[Exa MCP：AI 联网搜索](notes/agents/MCP/Exa.md)
- 📄[gh_grep MCP：GitHub 代码搜索](notes/agents/MCP/gh_grep.md)

### 周边工具与扩展

- 📄[claude-tap：Agent 会话拆解与可视化](notes/agents/tools/claude-tap.md)
- 📄[Claude Code 会话状态栏工具](notes/agents/tools/statusline.md)

### 代码读取与生成

- 📄[graphify：代码库知识图谱](notes/agents/tools/graphify.md)
- 📄[ponytail：防止过度设计插件](notes/agents/tools/ponytail.md)

## Agent 学习资料

### Agent 入门与实践

- 📚[Claude Code 入门学习指南](https://coding.stormzhang.ai/)
- 📚[Codex 入门学习指南](https://coding.stormzhang.ai/)
- 📚[CodexGuide：OpenAI Codex 中文教程与实战指南](https://codexguide.ai/)
- 📺[Codex APP 入门实战](https://www.bilibili.com/video/BV1Kk9kBAEJv)
- 📺[Codex 科研效率实战](https://www.bilibili.com/video/BV1NwEb6gEy1)

### Agent 原理与优化

- 📺[Claude Code 后端通信原理](https://www.bilibili.com/video/BV1G2o5BqELx)
- 📺[Claude Code 缓存优化](https://www.bilibili.com/video/BV1ZQ5u6bEJ7)

### MCP 市场

- 🌐[Model Context Protocol Observatory](https://mcpobservatory.com/)

## LLM 参数汇总

- 📚[Models.dev：AI 模型参数查询](notes/models/models-dev.md)

## LLM 评测排行榜

- 📊[Artificial Analysis：大模型评测](https://artificialanalysis.ai/)
- ⚔️[Arena AI：大模型竞技排名](https://arena.ai/)

## 开发与模型工具

- 📺[Git 与 GitHub 核心概念](https://www.bilibili.com/video/BV1ySLc6QEcB)
- 📺[Markdown 完全指南](https://www.bilibili.com/video/BV1tJXZBgEoC)
- 🌐[Can I Run AI：本地模型检测](https://www.canirun.ai)
- 📚[Git PR 教程文档（普通贡献者视角）](notes/others/git-pr-contributor-tutorial.md)
- 🌐[Git PR 流程图（普通贡献者视角）](notes/others/git-pr-flowchart.html)

## AI 新闻

- 📰[24 小时更新雷达：AI 新闻聚合](https://learnprompt.github.io/ai-news-radar/)
- 📰[AIHOT：AI 热点聚合](https://aihot.virxact.com/)

## AI 行业观察

- 📺[AI Agent 发展史](https://www.bilibili.com/video/BV1NL9tBsELS)
- 📺[姚顺宇 AI 访谈](https://www.bilibili.com/video/BV1YR5E6EE9o)
- 📺[中美大模型差距讨论](https://www.bilibili.com/video/BV1HDVT6bE8x)
- 📺[程序员视角下的 AI 叙事](https://www.bilibili.com/video/BV1gyEd6xEyu)

<!-- site-catalog:end -->
