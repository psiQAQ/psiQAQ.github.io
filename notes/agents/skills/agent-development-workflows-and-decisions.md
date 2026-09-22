# Agent 开发工作流与决策流：四个方案

本文介绍编码 Agent 怎样澄清需求、评审方案、安排实施、验证结果并交接工作。适合需要明确每个阶段的决策和证据的读者。本文只介绍 [Superpowers][sp]、[Matt Pocock Skills][mp]、[ECC][ecc] 和 [gstack][gs]；规格及任务文档的持续维护见[Agent 文档生命周期规划](agent-document-lifecycle-planning.md)。

## 0. 选型与安装速览

下面两块是**按平台和项目分别选择的命令清单**，不要整块连续运行。`# 对话` 后的斜杠命令输入 Agent 对话框；`# 终端` 后的命令在对应系统的终端执行。只安装本次需要的方案；同一项目如组合使用，请确定唯一的主计划与验证记录位置。插件、Skill 和 Hook 的实际发现范围见后文。

### Codex：安装所选方案

```text
# Superpowers：串起需求讨论、计划、执行和验证；适合需要完整开发流程的功能或重构。
# Codex CLI 对话：打开插件列表，搜索 superpowers 后选择安装；Codex 应用可在 Plugins 中安装。
/plugins

# Matt Pocock Skills：按需追问、写规格、拆工作项和交接；适合保留现有开发习惯并组合小模块。
# 终端：选中所需 Skills，至少包含 setup-matt-pocock-skills；之后在每个项目运行一次初始化。
npx skills@latest add mattpocock/skills -g -a codex

# ECC：整合计划评审、测试、代码审查及上下文工具；适合希望一套工程工具协同工作的团队。
# 终端：注册官方仓库为市场并安装插件；新 Hook 的执行信任需在 Codex 中核对。
codex plugin marketplace add affaan-m/ECC
codex plugin add ecc@ecc

# gstack：从产品、工程和设计视角审查方案，并保存交接状态；适合反复评审复杂决策。
# bash / Git Bash / WSL 终端：克隆到用户目录后运行对应 Agent 的 setup；先检查同名目录是否已存在。
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup --host codex
```

### Claude Code：安装所选方案

```text
# Superpowers：串起需求讨论、计划、执行和验证；适合需要完整开发流程的功能或重构。
# Claude Code 对话：从官方插件市场安装。
/plugin install superpowers@claude-plugins-official

# Matt Pocock Skills：按需追问、写规格、拆工作项和交接；适合保留现有开发习惯并组合小模块。
# Claude Code 对话：官方市场已提供插件；之后在每个项目运行一次初始化。
/plugin install mattpocock-skills

# ECC：整合计划评审、测试、代码审查及上下文工具；适合希望一套工程工具协同工作的团队。
# Claude Code 对话：注册官方仓库市场并安装插件。
/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc@ecc

# gstack：从产品、工程和设计视角审查方案，并保存交接状态；适合反复评审复杂决策。
# bash / Git Bash / WSL 终端：克隆到 Claude Code 的用户 Skills 目录；先检查同名目录是否已存在。
mkdir -p ~/.claude/skills
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup
```

### 从问题到交付

| 阶段 | 需要明确的决定或证据 | 适合的入口 |
| --- | --- | --- |
| 澄清问题 | 目标、约束、验收条件 | Superpowers 的 brainstorming；Matt Pocock Skills 的 grill-with-docs |
| 评审方案 | 方案取舍、遗漏、可执行性 | gstack 的多视角计划评审；ECC 的 plan-canvas |
| 制定计划 | 工作项、涉及文件、验证方式 | Superpowers 的 writing-plans；Matt Pocock Skills 的 to-spec / to-tickets |
| 执行与验证 | 实际改动、测试结果、未完成事项 | Superpowers 的 executing-plans；ECC 的工程工作流 |
| 交接 | 已确认决策、当前状态、下一步 | Matt Pocock Skills 的 handoff；gstack 的 context-save |

每个阶段以实际文档和验证结果作为证据。若组合使用多个方案，指定一份当前主计划，避免维护彼此冲突的进度表。

### 安装范围与生效入口

本文的全局安装指当前用户范围。Skill 是 Agent 读取的工作说明；Hook 在特定事件执行；插件可以打包多个入口。仓库中存在 `hooks/` 不代表当前平台已加载，仍需核查实际插件清单。[Codex 插件说明][codex-plugins]、[Skills 说明][codex-skills]

`~` 指运行 Agent 的用户主目录，`CODEX_HOME` 未设置时通常为 `~/.codex`；Windows 原生 Codex 和 WSL 使用不同目录。原生 Codex 插件的市场源码与运行缓存由 Codex 管理，安装后用 `codex plugin list --json` 查看实际来源和版本。[市场目录源码][codex-marketplaces]、[插件加载源码][codex-loader]

## 1. Superpowers：从需求澄清走到执行验证

项目地址：[obra/superpowers][sp]。

Superpowers 不只是让 Agent 写一个待办列表。它会引导 Agent 讨论需求、选择合适的设计深度、形成设计与实施计划，再衔接执行、测试和审查。与文档规划直接相关的是 `brainstorming`、`writing-plans` 和 `executing-plans`；其他 Skills 负责调试、代码审查、验证与分支收尾。[当前使用说明][sp-readme]。

它适合复杂功能、重构和需要明确验收标准的任务。当前 `brainstorming` 会区分任务复杂度，不应理解为每个小修改都必须生成一套长篇设计文档。[需求讨论 Skill][sp-brainstorm]。

### 1.1 推荐安装：Codex 原生插件

上游目前优先推荐 Codex 原生插件，不再把手动克隆仓库并建立 Skills 链接作为首选。[Codex 安装入口][sp-readme]。

1. 在 Codex CLI 对话中输入 `/plugins`，搜索 `superpowers`，选择插件并安装。Codex 应用也可在 Plugins 的 Coding 分类中安装 Superpowers。
2. 安装后新建会话，确认可发现相关 Skills。
3. 在系统终端检查插件记录：

```bash
codex plugin list --json
```

本文以 Codex CLI / 应用为例。原生插件与独立 Skills 的支持范围不同，不能把 CLI 的 `/plugins` 安装说明直接套到所有 IDE 插件界面。[Codex 官方插件说明][codex-plugins]。

安装之前，先检查是否已经手工安装过 Superpowers。原生插件与旧的独立 Skills 同时保留，可能让同名 Skill 被重复发现。不要直接删除整个 `~/.agents/skills` 或 `$CODEX_HOME/skills`；只处理确认属于旧安装的 Superpowers 项目。

### 1.2 安装后哪些文件影响 Codex

查询时仓库的 Codex 插件清单版本为 **6.4.1**。真正的注册入口是 `.codex-plugin/plugin.json`：它声明加载 `./skills/`，而 `hooks` 是空对象。也就是说，**这个 Codex 安装形式没有注册 Superpowers Hook**，不能把 Claude Code 的 Hook 机制写成 Codex 也会自动执行。[插件清单][sp-manifest]。

```text
$CODEX_HOME/
├── config.toml                                      # 由 Codex 写入插件相关配置
├── .tmp/marketplaces/<source-directory>/            # 对应市场已添加时，由 Codex 管理
└── plugins/cache/<marketplace>/superpowers/<cache-version>/
    ├── .codex-plugin/
    │   └── plugin.json                             # Codex 插件入口
    └── skills/                                     # 整目录加载；下列为主要工作入口
        ├── brainstorming/SKILL.md
        ├── writing-plans/SKILL.md
        ├── executing-plans/SKILL.md
        ├── subagent-driven-development/SKILL.md
        ├── test-driven-development/SKILL.md
        ├── systematic-debugging/SKILL.md
        ├── verification-before-completion/SKILL.md
        ├── requesting-code-review/SKILL.md
        ├── receiving-code-review/SKILL.md
        ├── using-git-worktrees/SKILL.md
        ├── finishing-a-development-branch/SKILL.md
        ├── dispatching-parallel-agents/SKILL.md
        ├── diagnosing-superpowers/SKILL.md
        ├── writing-skills/SKILL.md
        └── using-superpowers/SKILL.md
```

缓存可能还带有其他平台的清单与脚本，但它们不是这个 Codex 清单注册的额外入口。此次安装不要求把 Superpowers 内容追加到全局 `AGENTS.md`，也不要求另建 `$CODEX_HOME/commands/` 或复制一套 MCP 配置。

### 1.3 使用时生成哪些项目文档

设计和计划是在调用相应流程后生成的，不是安装时生成。上游默认路径如下；已有项目约定或用户指定路径可以覆盖默认位置。[设计文档规则][sp-brainstorm]、[实施计划规则][sp-plans]。

```text
<project>/
└── docs/superpowers/
    ├── specs/
    │   └── YYYY-MM-DD-<topic>-design.md             # 需要正式设计文档时生成
    └── plans/
        └── YYYY-MM-DD-<feature-name>.md             # 实施步骤、目标文件、验证方式
```

这里的计划不是单纯描述“先做 A，再做 B”，还会把任务与具体文件、操作步骤和验证关联起来。它适合作为另一次会话继续执行的依据。

第一次使用可在 Codex 中输入：

> 使用 Superpowers 的 brainstorming 澄清这个功能。先检查已有代码和项目约定，只形成必要的设计文档；未经我确认，不实施、不提交。

设计确认后再进入下一阶段：

> 使用 writing-plans，根据已确认的设计生成实施计划。每个任务写清修改文件和验证方式，暂不执行代码修改。

设计流程的上游说明包含提交设计文档的步骤，因此“本轮只写文档、不提交”应明确写进要求。Git worktree、实现代码和提交记录是后续流程的行为，不属于插件安装本身。[需求讨论 Skill][sp-brainstorm]。

## 2. Matt Pocock Skills：按阶段形成决策与交接材料

项目地址：[mattpocock/skills][mp]。

这套 Skills 更接近可组合的工程工具箱：`grill-me` 与 `grill-with-docs` 用来追问和收敛问题，`to-spec` 形成规格，`to-tickets` 拆分工作项，`wayfinder` 辅助规划，`handoff` 处理交接；`domain-modeling` 等 Skills 维护可供后续工作读取的领域知识。[当前 Skill 列表与安装说明][mp-readme]。

它适合已经有开发习惯、不希望另加一整套强制流程的使用者。规划文档可以存到本地，也可以与工作项跟踪系统配合；具体位置由每个项目初始化时确定。

### 2.1 推荐安装：通过 Skills CLI 全局安装到 Codex

上游给 Codex 的当前安装方式是 `npx skills@latest add mattpocock/skills`。本文增加 `-g -a codex`，明确选择用户级范围与 Codex；不把尚在路线图中的 Codex 原生插件写成已可用功能。[上游安装说明][mp-readme]。

需要 Node.js / npm 提供 `npx`，以及可正常访问仓库的 Git 环境。在系统终端执行：

```bash
npx skills@latest add mattpocock/skills -g -a codex
```

在选择界面中勾选准备使用的 Skills，**务必包含 `setup-matt-pocock-skills`**。以文档规划为主，可以从 `grill-with-docs`、`to-spec`、`to-tickets`、`wayfinder`、`handoff` 入手，再按各 Skill 中的引用保留所需辅助 Skills。安装命令不会替你证明跨 Skill 的依赖已经齐全。

安装方式优先选择 CLI 推荐的 **Symlink**。Windows 无法使用链接时再选择 Copy。需要完整安装当前仓库全部 Skills 时，可以使用以下明确限定 Codex 的写法；这不是要求所有读者全部安装。

```bash
npx skills@latest add mattpocock/skills -g -a codex --skill '*'
```

**不要用 `--all` 替代 `--skill '*'`**：当前 Skills CLI 的 `--all` 含义是向所有 Agent 安装全部 Skills。重装或更新同名 Skill 可能替换其目录内容，修改过 Skill 正文的使用者应先备份对应目录。[CLI 选项与安装方式][skills-cli]、[安装源码][skills-installer]。

### 2.2 两种安装方式的全局路径不同

当前 Skills CLI 源码把 Codex 视为使用 `.agents/skills` 的通用目录客户端。**全局 Symlink 路径会直接保留规范副本，不再额外为 Codex 建一个同内容链接**。因此，不能仅看 README 的 Agent 路径表就断言每次一定新增 `~/.codex/skills/<name>`。[安装源码][skills-installer]、[Agent 目录判定][skills-agents]。

选择推荐的 Symlink 方式时，安装范围是：

```text
~/
└── .agents/
    ├── .skill-lock.json                            # 默认的全局安装/更新记录
    └── skills/
        ├── setup-matt-pocock-skills/               # 整个 Skill 目录，包括配置模板
        │   ├── SKILL.md
        │   ├── issue-tracker-github.md
        │   ├── issue-tracker-gitlab.md
        │   ├── issue-tracker-local.md
        │   ├── triage-labels.md
        │   └── domain.md
        ├── grill-with-docs/                       # 以下仅在选中时新增；均为整目录
        ├── grill-me/
        ├── to-spec/
        ├── to-tickets/
        ├── wayfinder/
        ├── handoff/
        ├── domain-modeling/
        ├── grilling/
        ├── writing-for-agents/
        └── <其他选中的 Skill 名称>/
```

选择 Copy 时，副本放入 CLI 为 Codex 解析的全局目录，默认是 `~/.codex/skills/<name>/`，而不是上述规范副本目录。不要把两棵树理解为同一次安装一定同时生成。

```text
~/
├── .codex/skills/
│   └── <选中的 Skill 名称>/                       # Copy 方式：独立副本，整目录
└── .agents/.skill-lock.json                       # 默认全局记录
```

设置 `XDG_STATE_HOME` 时，全局记录文件改为 `$XDG_STATE_HOME/skills/.skill-lock.json`。安装位置应以 CLI 的安装摘要为准。[锁文件源码][skills-lock]。

这条安装路线**不会仅因某个目录叫 Skill 就执行其中的项目配置步骤**，也不会自动注册 Hooks、MCP 或修改 Codex 的 `config.toml`。共享 `.agents/skills` 的其他 Agent 也可能发现这些 Skills；`-a codex` 不是对共享目录的访问隔离措施。

### 2.3 每个项目需要执行一次初始化

全局安装后，在目标项目的 Codex 会话中显式调用：

> $setup-matt-pocock-skills 为当前项目完成初始化。本项目先使用本地 Markdown 跟踪工作，不创建远程 Issue。保留已有规范，先展示准备修改的文件和内容，再让我确认。

上游默认会根据 Git 远端建议 GitHub 或 GitLab；上面的“本地 Markdown”是这个示例主动选择的工作方式，不是项目原有默认值。[初始化 Skill][mp-setup]。

初始化会写入以下**项目级**约定：

```text
<project>/
├── CLAUDE.md 或 AGENTS.md                          # 更新其中一个文件的 Agent skills 区块
└── docs/agents/
    ├── issue-tracker.md                           # 工作项放在哪里、如何读写
    ├── domain.md                                  # 领域文档布局与读取规则
    └── triage-labels.md                           # 仅安装 triage 且执行相应初始化时写入
```

上游的文件选择顺序是：**已有 `CLAUDE.md` 时先修改它，否则修改已有的 `AGENTS.md`；两者都没有则询问创建哪一个**。它会更新自己的区块，不应覆盖外围的用户内容。对 Codex 项目，需要确认相关规则确实能通过 Codex 的指令文件读取到；不能假定初始化一定修改了 `AGENTS.md`。[初始化文件选择规则][mp-setup]。

使用相应 Skills 后，项目还可能增加以下工作文档。它们与初始化约定文件分开管理，不是 setup 一次性填满的模板包。

```text
<project>/
├── CONTEXT.md                                    # 单领域布局下的领域知识
├── docs/adr/                                     # 架构决策记录
├── .scratch/<feature>/                           # 选择本地 Markdown 跟踪时的工作项
└── CONTEXT-MAP.md                                # 选择多领域布局时使用，不要求所有项目都有
```

大多数项目可采用一个 `CONTEXT.md` 加 `docs/adr/`；只有真实存在多包、多领域结构时才考虑多个上下文文件。规格、工作项和交接文档的最终路径还要遵循当前项目的配置与对应 Skill 说明。

### 2.4 按阶段调用，不必一次运行全部 Skills

开始时先让 `grill-with-docs` 根据代码和现有文档查缺补漏；问题收敛后再调用 `to-spec`，然后视需要使用 `to-tickets` 或 `wayfinder`。暂停任务时再使用 `handoff`。[上游工作方式][mp-readme]。

一个适合已有项目的入口是：

> $grill-with-docs 围绕这次功能变更，先读取现有实现与 docs/agents 中的约定，区分已确定事实、待选方案和必须向我确认的问题。把确认后的决策记录到项目文档，暂不实施。

可在终端检查当前用户安装的 Skills：

```bash
npx skills@latest ls -g -a codex
```

## 3. ECC：把计划评审接入工程执行

项目地址：[affaan-m/ECC][ecc]。旧资料中的 `everything-claude-code` 对应的是这个项目的旧名称；本文采用当前仓库和插件名。

ECC 是包含大量 Skills、脚本和工具配置的工程套件。与本文主题直接相关的 `plan-canvas` 可以让用户在本地浏览器中批注、批准或要求修改计划；`plan-orchestrate` 可以把已有计划转成分步骤的编排提示。后者的当前说明仍围绕 Claude Code 的命令与 Agent 名称，**不能直接当成 Codex 已注册相同编排命令的证据**。[计划画布][ecc-plan-canvas]、[计划编排 Skill][ecc-plan-orchestrate]。

ECC 适合希望同时引入规划、代码审查、测试与上下文管理的使用者。如果只需要少量 Markdown 计划文件，它的安装面明显比独立 Skill 更广。

### 3.1 推荐安装：使用 ECC 的 Codex 原生插件

当前 Codex 专用文档要求支持相应插件功能的 Codex CLI，文档标注 **0.146.0+**。同时需要 Node.js / npm，因为 Hook 和默认 MCP 都会调用 Node 工具。[Codex 专用安装说明][ecc-codex]。

在系统终端执行：

```bash
codex plugin marketplace add affaan-m/ECC
codex plugin add ecc@ecc
codex plugin list --json
```

安装后新建 Codex 会话。需要启用插件 Hook 时，使用 `/hooks` 检查并信任对应代码；插件已经启用，不等于所有新 Hook 已获得执行信任。也应检查插件带入的 MCP，按实际需要启用，避免无意启动额外工具。[Codex 专用安装说明][ecc-codex]。

本文不同时执行旧的 `scripts/sync-ecc-to-codex.sh`，也不复制整份仓库示例 `config.toml` 到用户配置。原生插件与手工同步是不同安装路线，叠加会使文件来源和后续更新难以判断。

### 3.2 原生插件究竟注册了什么

查询时 `.codex-plugin/plugin.json` 版本为 **2.2.2**，清单声明三个入口：`skills/`、`.mcp.json`、`hooks/codex-hooks.json`。说明中列出 281 个 Skills；本文不把这一数量理解为每个 Skill 都具备同样完整的 Codex 适配。[Codex 插件清单][ecc-manifest]。

```text
$CODEX_HOME/
├── config.toml                                   # Codex 管理 ecc 市场与插件配置
├── .tmp/marketplaces/<source-directory>/         # ECC 市场源码范围，由 Codex 管理
└── plugins/cache/ecc/ecc/<cache-version>/
    ├── .codex-plugin/
    │   ├── plugin.json                          # 注册 Skills、MCP、Codex Hook
    │   └── README.md                            # Codex 专用说明
    ├── skills/                                  # 整目录加载，不只安装规划类 Skills
    │   ├── plan-canvas/
    │   ├── plan-orchestrate/
    │   └── <其他上游 Skills>/
    ├── .mcp.json                                # 当前默认只有 chrome-devtools
    ├── hooks/
    │   └── codex-hooks.json                     # 当前只注册 SessionStart
    ├── scripts/                                 # 整目录随插件提供，入口包括：
    │   ├── plan-canvas.js
    │   ├── hooks/
    │   │   ├── plugin-hook-bootstrap.js
    │   │   ├── session-start-bootstrap.js
    │   │   ├── run-with-flags.js
    │   │   └── session-start.js
    │   ├── lib/                                 # 上述脚本的共享依赖
    │   └── codex/check-plugin-cache.js
    └── assets/                                  # 插件图标等资源
```

**MCP：** 当前根目录 `.mcp.json` 只配置 `chrome-devtools`，通过 `npx -y chrome-devtools-mcp@latest` 启动。不要把旧教程列出的多个 MCP 服务当作此次安装全部默认启用的内容。[实际 MCP 配置][ecc-mcp]。

**Hook：** 当前 `codex-hooks.json` 只有 `SessionStart`，用于恢复先前上下文、识别包管理器等启动工作。它转交 Node 启动脚本，再按配置执行实际逻辑。Claude Code 配置中的 `PreToolUse`、`PostToolUse`、`Stop` 等不能直接算到这个 Codex 安装上。[实际 Hook 配置][ecc-hooks]、[启动脚本][ecc-bootstrap]。

**Commands 与 Agent 定义：** 仓库中其他平台的 `commands/`、`agents/` 或示例配置，不因出现在插件源码中就变成 `$CODEX_HOME/commands/` 或 `$CODEX_HOME/agents/` 下的新安装项。上面的 Codex 清单并没有把这些目录声明为对应注册入口。

此安装会让 Codex 维护插件相关配置，但不要求用 ECC 示例覆盖现有的模型、沙箱、审批策略或全局 `AGENTS.md`。后续运行 `configure-ecc` 等配置工作流属于额外操作，应另行审阅其修改范围。

### 3.3 计划画布的运行路径与使用边界

`plan-canvas` 评审的是已有本地 Markdown / HTML 文件，不限定必须使用 `.claude/plans/`。例如可以把自己的主计划保留在 `docs/plans/feature.md`，再用画布评审。[画布 Skill][ecc-plan-canvas]。

```text
<project>/
└── docs/plans/feature.md                         # 本文示例选择的计划路径，不是强制默认值

~/
└── .claude/plan-canvas/                          # 使用画布后产生的默认运行状态目录
```

即使由 Codex 调用，当前画布状态目录仍默认使用 `~/.claude/plan-canvas/`；可通过 `ECC_PLAN_CANVAS_STATE_DIR` 更改。画布运行时使用本地回环服务，默认地址为 `127.0.0.1:4517`，不是安装时创建一个公网服务。[画布运行说明][ecc-plan-canvas]。

在 Codex 中可输入：

> $plan-canvas 评审 docs/plans/feature.md。只展示和修订计划，不进入实现。先确认画布脚本可执行；找不到 ecc-plan-canvas 命令时，从当前已安装插件目录定位 scripts/plan-canvas.js，不另行全局安装第二套 ECC。

原生插件缓存存在，不应被理解为 npm 的命令入口一定已经加入系统 `PATH`。画布脚本可用 Node 从其真实插件目录调用。当前 Codex Hook 清单也没有画布说明中的 Stop 反馈阻塞 Hook，因此不能承诺 Codex 会获得与 Claude Code 完全相同的自动等待机制。

需要排查安装时，可从实际插件根目录运行 `node scripts/codex/check-plugin-cache.js --plugin-dir .`。这个脚本检查其覆盖的清单引用是否存在；**插件出现在列表里、文件检查通过、Skill 和 Hook 真正运行成功，是不同层次的验证**。[检查脚本][ecc-cache-check]。

## 4. gstack：多视角评审产品与工程决策

项目地址：[garrytan/gstack][gs]。

gstack 把产品判断、工程计划审查、设计审查、代码评审和浏览器 QA 做成一组 Skills。计划与决策相关入口包括 `office-hours`、`plan-ceo-review`、`plan-eng-review`、`plan-design-review`，以及保存和恢复工作上下文的 `context-save`、`context-restore`。[项目说明][gs-readme]、[上下文保存 Skill][gs-context]。

它适合不仅想“写一份计划”，还想从不同角度反复审查方案、持续积累决策和交接记录的使用者。它不只是 Markdown 提示词包，安装时还会准备脚本、依赖和浏览器相关运行文件。

### 4.1 推荐安装：运行官方 setup，明确选择 Codex

上游的 Codex 安装方式是把仓库放到独立位置，然后执行 `./setup --host codex`。需要 Git、Bun 和可运行 setup 的 Bash 环境；Windows 还需要 Node.js。Windows 原生安装使用 Git Bash，WSL 安装则在 WSL 内执行，不把 POSIX 命令直接粘贴到 PowerShell。[安装说明][gs-readme]、[setup 源码][gs-setup]。

已有 `~/gstack` 或 `$CODEX_HOME/skills/gstack` 时，先检查其内容。当前 setup 会重建 Codex 的 `skills/gstack` 运行目录，不能把自己手写且未备份的 Skill 放在这个路径里。

在 Bash / Git Bash 中执行：

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack
./setup --host codex
```

**保留 `~/gstack` 这个源码目录。** 在使用链接的系统上，全局 Skills 和运行脚本仍指向它。不要把整个仓库直接克隆进 Codex 会递归扫描的 Skills 目录，否则源 Skill 与生成的 Codex Skill 可能同时被发现。[Codex 安装目录处理][gs-setup]。

setup 会检测和准备运行依赖，可能下载浏览器资源、生成文档或编译可用组件。附加组件有独立前置条件；不要把“计划评审 Skills 已安装”解释成所有浏览器或原生辅助组件均已通过运行验证。

### 4.2 从源码到全局 Skills 的文件范围

gstack 先在源码目录生成 Codex 格式的 Skills，再把这些生成结果安装到 `$CODEX_HOME/skills`。这与“把 Claude Code 的 Skill 原文直接复制给 Codex”不是同一种做法。[生成与安装源码][gs-setup]。

```text
~/gstack/                                       # 完整源码与本地构建范围
├── setup
├── .agents/skills/                             # setup 生成的 Codex 版本，整目录
│   ├── gstack/
│   └── gstack-<skill-name>/
├── bin/                                        # 辅助命令
├── lib/                                        # 辅助命令的共享依赖
├── browse/                                     # 浏览器工具源码、脚本、构建输出
├── node_modules/                               # 本地依赖，按 setup 安装结果产生
└── <其余上游源码与构建资源>

$CODEX_HOME/skills/
├── gstack/                                     # setup 管理的运行目录
│   ├── SKILL.md
│   ├── bin/                                    # 链接或复制源码中的运行命令
│   ├── lib/
│   ├── browse/
│   │   ├── dist/
│   │   └── bin/
│   ├── gstack-upgrade/SKILL.md
│   ├── office-hours/SKILL.md
│   ├── review/
│   │   ├── checklist.md
│   │   ├── design-checklist.md
│   │   ├── greptile-triage.md
│   │   └── TODOS-format.md
│   ├── ETHOS.md
│   └── supabase/config.sh                      # 运行配置资源，不代表配置了用户密钥
├── gstack-office-hours/
├── gstack-plan-ceo-review/
├── gstack-plan-eng-review/
├── gstack-plan-design-review/
├── gstack-context-save/
├── gstack-context-restore/
└── gstack-<其他已生成 Skill>/                   # 每个均为整目录，不仅是上面几个规划入口
```

Unix 路径主要通过链接连接到源码目录，Windows 分支会使用复制来保证可用性。更新源码后，应重新执行官方 setup 刷新生成内容和安装副本，而不是只更新 Git checkout 就认为所有 Windows Skills 已同步。[setup 的平台分支][gs-setup]。

安装脚本会读取 `$CODEX_HOME/config.toml` 中的模型信息来选择生成内容，但这与覆盖用户模型配置不是一回事。Codex 这条路线的主要生效入口是上述 Skills 和脚本，不是新增一套 Claude Code 的斜杠命令配置。

### 4.3 用户状态目录与条件性的 Claude Code 配置修改

除了 Skills，setup 和后续使用还会管理 gstack 自己的状态范围。默认位于 `~/.gstack`；部分路径可受 `GSTACK_HOME` 等配置影响。[setup 源码][gs-setup]、[上下文保存规则][gs-context]。

```text
~/
└── .gstack/                                    # gstack 用户状态，整目录
    ├── config.yaml                             # 偏好与选择，例如功能开关
    ├── .welcome-seen                           # setup / 首次使用相关标记
    └── projects/
        └── <project-slug>/                      # 各项目的状态和文档，按使用产生
            ├── ceo-plans/
            ├── checkpoints/                    # context-save 的保存目录
            ├── decisions.active.json
            ├── timeline.jsonl
            └── <分支评审记录及其他运行资产>
```

**`--host codex` 不等于保证完全不接触已有的 Claude Code 配置。** 当前 setup 在安装 Skills 之外，还有独立的旧 Hook 清理和维护逻辑：已有 Claude Code gstack 安装时，可能清理失效路径、刷新注册，或按配置处理 plan-tune 与 timeline Hook。[setup 的 Hook 维护分支][gs-setup]。

这些是条件性修改，不应画成一个全新 Codex 安装必定新增的 Claude 插件：

```text
~/.claude/                                     # 设置 CLAUDE_CONFIG_DIR 时按实际路径检查
├── settings.json                              # 已有 Hook 的清理/刷新，或选择启用后的注册
└── settings.json.bak.<timestamp>               # 实际修改前由辅助工具生成的备份
```

plan-tune 相关 Hook 面向 Claude Code 的 `AskUserQuestion` 等事件；timeline Stop Hook 也在 Claude Code 的注册路径下。它们不是 Codex 已获得同名 Hook 的证据。对已有双 Agent 安装的环境，应同时审查这两个位置，而不只是查看 `$CODEX_HOME/skills`。

setup 还可能询问后续是否使用推送前检查等能力；**安装时记录同意，与随后在具体项目中安装 Git Hook 是不同阶段**。当前源码明确把项目的推送前 Hook 安装留给后续工作流，不在 gstack 的源码 checkout 中顺手安装它。[setup 的推送检查配置分支][gs-setup]。

### 4.4 以计划评审和交接开始使用

Codex 生成版使用 `gstack-` 前缀。第一次可以只评审已有方案：

> $gstack-plan-eng-review 审查 docs/plans/feature.md。重点检查依赖、失败路径、测试和回滚方式；把结论写回这份主计划，不另建竞争计划，不实施、不提交。

暂停任务时使用：

> $gstack-context-save 保存当前目标、已经确认的决策、验证结果和下一步，明确哪些内容仍未证实，不把未执行的测试记为通过。

当前 `context-save` 的磁盘目录仍叫 `checkpoints/`。恢复工作时应使用相应恢复 Skill，而不是根据名称猜测它写在 `contexts/` 下。[保存路径规则][gs-context]。

如果计划需要跟随 Git 仓库评审与共享，应把最终确认的设计和计划保留在项目文档目录中，或明确要求同步过去。`~/.gstack/projects/` 下的个人状态文件，不会仅因与项目同名就自动成为该仓库的版本化文档。

## 附录 A：安装与使用核对

| 检查项 | 需要确认 |
| --- | --- |
| 发现入口 | 当前 Agent 会话能发现对应插件或 Skill，来源与安装范围一致 |
| 配置与 Hooks | 安装没有覆盖自定义配置；Hook 已按平台实际注册并获得所需信任 |
| 主计划 | 组合使用时只有一份当前主计划，评审结果写回约定位置 |
| 验证和交接 | 测试结果来自实际运行；未解决问题和下一步可供新会话读取 |

本文根据上游 README、插件清单和安装源码静态核查，未在所有平台逐一执行四套安装和端到端验收。文件树描述的是核查时的主要安装范围，以本机实际结果为准。

[codex-loader]: https://github.com/openai/codex/blob/639d2478cc2e16d6ca715952d2e726a3aecc024e/codex-rs/core-plugins/src/loader.rs
[codex-marketplaces]: https://github.com/openai/codex/blob/639d2478cc2e16d6ca715952d2e726a3aecc024e/codex-rs/core-plugins/src/installed_marketplaces.rs
[codex-plugins]: https://learn.chatgpt.com/docs/plugins
[codex-skills]: https://learn.chatgpt.com/docs/build-skills
[ecc]: https://github.com/affaan-m/ECC
[ecc-bootstrap]: https://github.com/affaan-m/ECC/blob/main/scripts/hooks/session-start-bootstrap.js
[ecc-cache-check]: https://github.com/affaan-m/ECC/blob/main/scripts/codex/check-plugin-cache.js
[ecc-codex]: https://github.com/affaan-m/ECC/blob/main/.codex-plugin/README.md
[ecc-hooks]: https://github.com/affaan-m/ECC/blob/main/hooks/codex-hooks.json
[ecc-manifest]: https://github.com/affaan-m/ECC/blob/main/.codex-plugin/plugin.json
[ecc-mcp]: https://github.com/affaan-m/ECC/blob/main/.mcp.json
[ecc-plan-canvas]: https://github.com/affaan-m/ECC/blob/main/skills/plan-canvas/SKILL.md
[ecc-plan-orchestrate]: https://github.com/affaan-m/ECC/blob/main/skills/plan-orchestrate/SKILL.md
[gs]: https://github.com/garrytan/gstack
[gs-context]: https://github.com/garrytan/gstack/blob/main/context-save/SKILL.md
[gs-readme]: https://github.com/garrytan/gstack/blob/main/README.md
[gs-setup]: https://github.com/garrytan/gstack/blob/main/setup
[mp]: https://github.com/mattpocock/skills
[mp-readme]: https://github.com/mattpocock/skills/blob/main/README.md
[mp-setup]: https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md
[skills-agents]: https://github.com/vercel-labs/skills/blob/7407f3893ad4dceab546ac002c3ef806e4000c73/src/agents.ts
[skills-cli]: https://github.com/vercel-labs/skills/blob/main/README.md
[skills-installer]: https://github.com/vercel-labs/skills/blob/7407f3893ad4dceab546ac002c3ef806e4000c73/src/installer.ts
[skills-lock]: https://github.com/vercel-labs/skills/blob/main/src/skill-lock.ts
[sp]: https://github.com/obra/superpowers
[sp-brainstorm]: https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md
[sp-manifest]: https://github.com/obra/superpowers/blob/main/.codex-plugin/plugin.json
[sp-plans]: https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md
[sp-readme]: https://github.com/obra/superpowers/blob/main/README.md
