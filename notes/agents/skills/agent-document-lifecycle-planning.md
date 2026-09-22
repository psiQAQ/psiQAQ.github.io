# Agent 文档生命周期规划：三个方案

本文介绍怎样创建、维护和归档编码 Agent 使用的规格与任务记录。适合希望文档在长任务和多次变更后仍能反映当前状态的读者。本文只介绍 [Spec Kit][sk]、[OpenSpec][os] 和 [planning-with-files][pwf]；需求澄清、方案评审和开发执行工具见[Agent 开发工作流与决策流](agent-development-workflows-and-decisions.md)。

## 0. 选型与安装速览

先按文档的维护目标选一个项目。以下两块是**按平台和项目分别选择的命令清单**，不要当作一段脚本连续执行。`# 对话` 后的斜杠命令输入 Agent 对话框；`# 终端` 后的命令在对应系统的终端执行。`specify init` 和 `openspec init` 须在目标项目根目录运行；它们会修改项目文件，已有项目先检查并备份同名文件。已有旧版 OpenSpec 时，还要检查它可能清理的全局 Codex prompts（见第 2.5 节）。

### Codex：安装所选方案

```text
# Spec Kit：把功能规格、技术计划与任务保存到项目；适合从需求到实施都需要可追踪文档的团队。
# 终端：安装一次 CLI；进入目标项目根目录后再初始化。已有非空项目先检查同名文件，--force 允许写入受管理文件。
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v1.0.9
specify init --here --force --integration codex

# OpenSpec：分开维护当前规格和进行中的变更，并提供同步、归档；适合持续迭代的已有项目。
# 终端：安装一次 CLI；进入目标项目根目录后初始化。旧版迁移可能清理 Codex 全局 prompts，先核对备份。
npm install -g @fission-ai/openspec@latest
openspec init --tools codex --profile core

# planning-with-files：用计划、发现和进度文件续接长任务；适合跨会话或频繁压缩上下文的工作。
# 终端：以下只安装 Codex Skill。若需要会话启动等生命周期 Hooks，按第 3.1 节配置并核查。
npx skills@latest add OthmanAdi/planning-with-files --skill planning-with-files -g -a codex
```

### Claude Code：安装所选方案

```text
# Spec Kit：把功能规格、技术计划与任务保存到项目；适合从需求到实施都需要可追踪文档的团队。
# 终端：安装一次 CLI；进入目标项目根目录后初始化。已有非空项目先检查同名文件，--force 允许写入受管理文件。
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v1.0.9
specify init --here --force --integration claude

# OpenSpec：分开维护当前规格和进行中的变更，并提供同步、归档；适合持续迭代的已有项目。
# 终端：安装一次 CLI；进入目标项目根目录后初始化。已有旧版集成时先检查迁移范围。
npm install -g @fission-ai/openspec@latest
openspec init --tools claude --profile core

# planning-with-files：用计划、发现和进度文件续接长任务；适合跨会话或频繁压缩上下文的工作。
# Claude Code 对话：插件路线包含 Skill、命令和生命周期 Hooks；安装后新开会话。
/plugin marketplace add OthmanAdi/planning-with-files
/plugin install planning-with-files@planning-with-files
```

### 文档职责与维护顺序

| 文档 | 当前状态由谁维护 | 什么时候更新 |
| --- | --- | --- |
| 规格和项目原则 | Spec Kit 的 `specs/` 与 `.specify/`，或 OpenSpec 的 `openspec/specs/` | 实施范围或已确认行为变化时 |
| 本次变更材料 | Spec Kit 的规格、计划、任务，或 OpenSpec 的 `openspec/changes/` | 评审、实施和验证期间；OpenSpec 完成后同步并归档 |
| 当前任务状态 | planning-with-files 的 `task_plan.md`、`findings.md`、`progress.md` | 阶段推进、发现新证据或中断前 |

选择一个项目作为当前任务状态的主要记录位置；规格、设计、任务和验证各写其负责的内容。安装只提供能力，不会替项目写好规格，也不代表验证已经通过。

### 安装范围与路径

| 项目 | 用户级安装 | 项目内初始化或使用后的主要文件 |
| --- | --- | --- |
| Spec Kit | uv 管理的 `specify` CLI | 初始化产生 `.specify/`、`.agents/skills/speckit-*/`；使用后产生 `specs/` |
| OpenSpec | npm 管理的 `openspec` CLI | 初始化产生 `openspec/`、`.agents/skills/openspec-*/`；变更完成后归档 |
| planning-with-files | Codex Skill；可选独立 Hooks。Claude Code 插件包含 Skill、命令和 Hooks | 使用后产生 `task_plan.md`、`findings.md`、`progress.md` 或 `.planning/<任务>/` |

`~` 是运行 Agent 的用户主目录；`CODEX_HOME` 未设置时通常是 `~/.codex`。Windows 原生环境和 WSL 的用户目录不同。以下文件树是核查时的主要管理范围，具体路径以当前平台的安装结果为准。[Codex Skills 文档][codex-skills]

## 1. Spec Kit：维护功能规格、计划与任务

仓库：[github/spec-kit][sk]。

### 1.1 它如何组织文档规划

Spec Kit 将“要做什么”和“如何实现”分开：规格描述用户场景与要求，技术计划记录实现选择，任务文件承接执行；澄清、检查清单和一致性分析则帮助发现遗漏。它更像一个随项目保存的工作流程，而不是只给 Agent 增加一个聊天命令。[Spec Kit 文档][sk-docs]

### 1.2 推荐安装：固定版本的全局 CLI，再初始化项目

需要 Python 3.11+ 和 uv；下面采用官方安装指南优先推荐的、固定 release tag 的源码安装路线，因此还需要 Git。核查时最新稳定版是 **v1.0.9，发布于 2026-09-21**。[安装指南][sk-install]、[v1.0.9 发布说明][sk-release]

先在终端安装一次，Windows PowerShell、macOS/Linux shell 均可使用：

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v1.0.9
specify version
```

官方也支持 `uv tool install specify-cli` 从 PyPI 安装；这是替代路线，不要把两条命令当作连续步骤。uv 会管理隔离的工具环境，不要求在每个业务项目里再创建一个 Spec Kit 专用虚拟环境。[安装指南][sk-install]

进入要使用的项目根目录后，再运行初始化。**已有项目应先提交或备份本地修改**；`--force` 确认在非空目录中合并初始化内容，不能理解为“不会触碰同名受管理文件”。

```bash
# 在已有项目根目录执行
specify init --here --force --integration codex
```

Windows 默认使用 PowerShell 脚本，macOS/Linux 默认使用 Bash；需要显式指定时分别增加 `--script ps` 或 `--script sh`。新建项目则使用 `specify init my-project --integration codex`，不需要 `--here`。[安装指南][sk-install]、[既有项目指南][sk-existing]

### 1.3 全局层只安装什么

用下面两个命令查看实际目录，避免把 uv 的可配置路径写死：

```bash
uv tool dir
uv tool dir --bin
```

```text
<uv tool dir 的输出>/
└── specify-cli/                    # 隔离的 CLI 环境，包含 Python 依赖

<uv tool dir --bin 的输出>/
└── specify 或 specify.exe          # 用户可调用的命令入口
```

**这一步不会给所有 Codex 项目安装 `speckit-*` Skills。** Skills 和模板在下一步 `specify init` 时写进选中的项目。uv 的工具位置可以配置，以上命令是定位本机目录的依据。[uv 工具目录说明][uv-storage]、[Spec Kit 初始化说明][sk-integrations]

### 1.4 项目初始化会增加哪些文件

Codex 现在默认使用 Skills 布局，而不是旧的 prompts 目录。核心入口位于 `.agents/skills/speckit-<名称>/SKILL.md`。[Codex 集成实现][sk-codex]、[集成文档][sk-integrations]

```text
<项目根目录>/
├── .agents/
│   └── skills/
│       ├── speckit-constitution/SKILL.md
│       ├── speckit-specify/SKILL.md
│       ├── speckit-clarify/SKILL.md
│       ├── speckit-plan/SKILL.md
│       ├── speckit-tasks/SKILL.md
│       ├── speckit-analyze/SKILL.md
│       ├── speckit-checklist/SKILL.md
│       ├── speckit-implement/SKILL.md
│       ├── speckit-converge/SKILL.md
│       └── speckit-taskstoissues/SKILL.md
└── .specify/
    ├── integration.json            # 当前集成及其配置状态
    ├── integrations/
    │   └── codex.manifest.json      # 受管理文件与内容校验记录
    ├── templates/                  # 规格、计划、任务等模板及配套文件
    ├── scripts/
    │   └── powershell/             # Windows 默认；其他平台默认为 bash/
    └── memory/                     # 项目原则文档的位置
```

这是核心目录范围；`.specify/integrations/codex.manifest.json` 记录受管理文件与校验信息，不能只复制若干 `SKILL.md` 就认为完整迁移了 Spec Kit。[安装清单实现][sk-manifest]

`taskstoissues` 在核查版本仍属于核心，但发布说明已经预告未来会迁到独立 GitHub 扩展。[v1.0.9 发布说明][sk-release]、[集成状态与管理][sk-integrations]

基础初始化不要求改写 `~/.codex/config.toml`、全局 `AGENTS.md` 或安装 MCP。Codex 集成支持的事件配置目标是**项目内** `.codex/config.toml`；事件扩展启用时才需要进一步核对。用于更新 `AGENTS.md` 等上下文文件的 agent-context 扩展，也应与基础 Skills 安装分开看。[Codex 集成源码][sk-codex]、[集成文档中的上下文文件说明][sk-integrations]

### 1.5 最小使用流程与文档位置

在该项目中启动 Codex，通过 Skill 选择器选择 `speckit-*`。Codex 文档采用 `$speckit-<名称>`，不是把参考文档里的 `/speckit.plan` 原样输入终端。[调用方式][sk-integrations]

按阶段发送，例如：

> $speckit-specify 为现有文件管理工具增加批量重命名预览。明确冲突处理、撤销范围和验收标准，先不要讨论技术实现。

确认规格后：

> $speckit-plan 根据已确认规格和当前代码结构制定实施计划，保留现有接口，不引入独立服务。

接着使用 `$speckit-tasks` 拆任务，必要时用 `$speckit-analyze` 检查文档一致性；需要实现时才进入 `$speckit-implement`。项目原则可先通过 `$speckit-constitution` 建立。[Spec Kit 流程说明][sk-docs]

这些流程逐步产生下列文档，不是初始化时已经全部完成：

```text
<项目根目录>/
├── .specify/memory/
│   └── constitution.md             # 项目原则
└── specs/
    └── <功能目录>/
        ├── spec.md                 # 功能规格
        ├── plan.md                 # 技术实施计划
        ├── tasks.md                # 可执行任务
        ├── research.md             # 需要调研时的结论
        ├── data-model.md           # 需要时的数据模型
        ├── quickstart.md           # 验证/使用入口
        ├── contracts/              # 需要时的接口契约
        └── checklists/             # 检查清单
```

功能目录命名、可选文件以及 Git 分支行为应服从当前模板和扩展设置。不要假定基础初始化一定创建新 Git 仓库或功能分支；当前 Git 工作流是可选扩展。[既有项目指南][sk-existing]、[计划模板][sk-plan-template]

初始化后可用 `specify integration status` 检查缺失或被修改的管理文件。升级 CLI 后，项目内 Skills/模板仍需要按上游升级流程更新，不能把“全局命令升级了”等同于“所有项目都已经迁移”。[集成管理][sk-integrations]

## 2. OpenSpec：同步当前规格并归档变更

仓库：[Fission-AI/OpenSpec][os]。

### 2.1 它如何避免规格与改动混在一起

OpenSpec 将已经确认的系统行为放在 `openspec/specs/`，把正在推进的一次修改放在 `openspec/changes/<变更名>/`。变更目录保存提案、设计、任务和规格差异；完成后再同步规格、归档变更。它适合在既有项目上持续迭代，不要求先为整个系统重写一套完整说明。[入门指南][os-getting-started]

### 2.2 推荐安装：全局 npm 包 + 项目初始化

需要 Node.js **20.19.0 或更高版本**。先在终端安装 CLI：

```bash
npm install -g @fission-ai/openspec@latest
openspec --version
```

**已有旧版 OpenSpec 时先备份相关配置和提示词。** 带 `--tools` 的初始化可能执行旧集成清理，包括旧 Codex 全局 prompts；不要只备份当前项目的 `openspec/`。具体范围见本章 5.5。

然后进入项目根目录初始化 Codex，使用基础工作流集合：

```bash
openspec init --tools codex --profile core
```

以上是上游支持的安装及初始化路线。`-g` 只表示 npm 命令全局可用，**不表示当前用户所有项目自动装好了 OpenSpec Skills**。[安装指南][os-install]

### 2.3 全局安装与配置目录

先定位本机实际 npm 目录和 OpenSpec 配置文件：

```bash
npm root -g
npm prefix -g
openspec config path
```

```text
<npm root -g 的输出>/
└── @fission-ai/openspec/             # 全局 CLI 包及其运行依赖

<命令入口目录>/
└── openspec                         # Windows 通常还有 openspec.cmd / .ps1
                                     # Unix 常在 npm prefix -g 对应的 bin/ 下

<OpenSpec 用户配置目录>/
└── config.json                      # 配置/首次运行状态，不是 Codex config.toml
```

用户配置目录优先采用 `$XDG_CONFIG_HOME/openspec/`；没有设置时，Windows 使用 `%APPDATA%\openspec\`，macOS/Linux 使用 `~/.config/openspec/`。可选的用户数据与自定义 schema 目录另在 `$XDG_DATA_HOME/openspec/`，或 Windows `%LOCALAPPDATA%\openspec\`、macOS/Linux `~/.local/share/openspec/`。[全局配置实现][os-global-config]

`config.json` 可保存工作流选择、交付方式和匿名使用统计设置。当前实现未设置时默认开启使用统计；不需要时可明确关闭：

```bash
openspec config set telemetry.enabled false
```

这修改的是 OpenSpec 自己的用户配置，不是 Codex 的模型、权限或 MCP 配置。Shell 补全也属于单独操作，基础安装不能写成“必然修改 PowerShell PROFILE”。[全局配置实现][os-global-config]、[CLI 配置文档][os-cli]

### 2.4 Codex 项目初始化会增加哪些文件

当前 Codex 集成采用 **Skills-only**。`core` 集合包含六个工作流，不是旧教程常见的四个；即使 OpenSpec 的通用交付设置是 `both`，Codex 也不因此恢复旧的全局 prompts 安装方式。[支持列表][os-tools]、[安装说明][os-install]

```text
<项目根目录>/
├── .agents/
│   └── skills/
│       ├── .openspec-target                # OpenSpec 集成标记
│       ├── openspec-propose/SKILL.md
│       ├── openspec-explore/SKILL.md
│       ├── openspec-apply-change/SKILL.md
│       ├── openspec-update-change/SKILL.md
│       ├── openspec-sync-specs/SKILL.md
│       └── openspec-archive-change/SKILL.md
└── openspec/
    ├── config.yaml                        # 项目配置；按初始化选择创建/补充
    ├── specs/                             # 当前规格
    └── changes/                           # 进行中的变更及归档
```

此路径下的 `openspec-*` Skills 和标记文件由 OpenSpec 管理，升级时会重新生成。**干净安装不需要新增 Codex Hooks、MCP 或重写全局 `AGENTS.md` / `config.toml`。** 扩展更多工作流时再通过配置选择和 `openspec update` 更新项目，不必一开始全部开启。[安装与更新说明][os-install]

### 2.5 旧版迁移可能触及的额外文件

这部分只适用于存在旧安装的环境；它不是干净安装新增的目录。

| 旧位置 | 当前初始化/迁移可能做的操作 |
| --- | --- |
| `<CODEX_HOME>/prompts/opsx-*.md` | 清理旧版 Codex 的全局 OpenSpec 命令文件；默认在 `~/.codex/prompts/` |
| `<项目>/.codex/skills/openspec-*/` | 与新的 `.agents/skills/` 布局进行协调；受管理旧文件可能在替代项建立后移除 |
| `<项目>/AGENTS.md`、`CLAUDE.md` | 可能移除旧 OpenSpec 管理标记块；不应理解为删除整份用户指令 |
| 旧 Agent 的 `commands/openspec/` 等目录 | 根据检测到的旧集成清理管理文件 |

迁移对自定义文件有保护逻辑，但仍应先备份并检查 diff。尤其是全局 prompts 清理跨出了当前项目范围，应把它与一般的项目内 Skills 更新区别开。[旧版清理与迁移说明][os-install]

### 2.6 最小使用流程与文档产物

在 Codex 中用 `$openspec-propose` 等实际 Skill 名称；通用文档中的 `/opsx:propose` 不是终端命令，也不是这里的 Codex 调用拼写。[Codex 支持说明][os-tools]

> $openspec-propose 为现有配置加载器增加环境变量覆盖能力，变更名使用 env-overrides。先完成提案、设计、任务和规格差异；保留现有优先级规则，标出需要我确认的冲突，不开始实现。

需要先研究问题时用 `$openspec-explore`。确认方案后进入 apply；过程中补充变化可以用 update，完成后再同步和归档。[入门指南][os-getting-started]

```text
<项目根目录>/
└── openspec/
    ├── specs/
    │   └── <能力或领域>/spec.md          # 系统已经确认的行为
    └── changes/
        ├── env-overrides/
        │   ├── .openspec.yaml            # 使用相应元数据功能时可有
        │   ├── proposal.md               # 为什么改、改什么
        │   ├── design.md                 # 如何改、有哪些取舍
        │   ├── tasks.md                  # 执行清单
        │   └── specs/
        │       └── <能力或领域>/spec.md  # 此次变更对规格的差异
        └── archive/
            └── YYYY-MM-DD-env-overrides/ # 完成后归档的变更材料
```

`openspec validate` 检查的是规格与变更材料的相应规则，不能替代测试通过、兼容性验证或运行效果检查。文档完整、规划完成和代码正确是三个不同结论。[CLI 文档][os-cli]

## 3. planning-with-files：记录长期任务的状态与下一步

项目地址：[OthmanAdi/planning-with-files][pwf]。

planning-with-files 的目标最单一：把长任务的工作状态从对话上下文移到磁盘。核心是三份文件：`task_plan.md` 保存阶段、状态和关键决策，`findings.md` 保存调研与发现，`progress.md` 保存执行日志、测试和下一步。Codex 集成再通过生命周期 Hooks 在会话开始、用户提交消息、工具调用、压缩上下文和停止等阶段重新读取这些文件，从而降低 `/clear`、compaction 或长任务导致的上下文丢失。[Codex 安装说明][pwf-codex]、[核心 Skill][pwf-skill]。

它适合已有开发流程、但希望 Agent 在多步骤、跨会话或长时间任务中持续知道目标、进度与发现的项目。三份文件保存任务状态，不承担项目长期规格与变更归档。

### 3.1 安装路线与 Hooks 边界

Codex 快速安装见第 0 章：Skills CLI 只安装 Skill、脚本和模板；不会自动注册全局生命周期 Hooks。需要会话恢复、工具调用和压缩前提醒时，按[上游 Codex 安装说明][pwf-codex]选择 **workspace installation**（团队共享，推荐）或 **personal installation**（当前用户）。先核对现有 `hooks.json`，合并而非覆盖其他 Hook；不要同时启用独立 Hooks 与插件中的同一批 Hooks。Windows 原生 Codex 的路径要求见第 3.3 节。

Claude Code 使用第 0 章的插件命令，可以获得 Skill、命令和插件级 Hooks。[上游安装指南](https://github.com/OthmanAdi/planning-with-files/blob/master/docs/installation.md)

### 3.2 全局安装实际改动哪些路径

若按上游 Codex 指南选择个人全局安装，主要文件范围如下；第 0 章的 Skill-only 安装不会产生下列 `.codex/` Hooks：

```text
~/
├── .agents/
│   └── skills/
│       └── planning-with-files/
│           ├── SKILL.md                         # Codex 可发现的核心 Skill
│           ├── reference.md                     # 规则与行为参考
│           ├── examples.md                      # 使用示例
│           ├── scripts/                         # 初始化、恢复、检查、完成门禁等脚本
│           └── templates/
│               ├── task_plan.md
│               ├── findings.md
│               └── progress.md
└── .codex/
    ├── hooks.json                               # 合并 7 类 planning-with-files Hook
    └── hooks/
        ├── codex_hook_adapter.py
        ├── context_frame.py
        ├── permission_request.py
        ├── plugin_dispatch.py
        ├── post_tool_use.py
        ├── pre_tool_use.py
        ├── run_sh.py
        ├── stop.py
        ├── pwf-hook.cmd                         # Windows 启动入口
        ├── session-start.sh
        ├── user-prompt-submit.sh
        ├── pre-tool-use.sh
        ├── post-tool-use.sh
        ├── pre-compact.sh
        ├── stop.sh
        └── resolve-plan-dir.sh
```

当前 Codex standalone 配置注册七类事件：[Hook 配置][pwf-hooks]。

| Hook | 作用 |
| --- | --- |
| `SessionStart` | 会话启动、恢复、清空或压缩后重新注入当前计划状态 |
| `UserPromptSubmit` | 每次用户消息前重新提供选定的计划上下文 |
| `PreToolUse` | Bash、写文件或补丁前提醒/校验计划 |
| `PermissionRequest` | Codex 请求权限时附带有限的计划上下文 |
| `PostToolUse` | 修改文件后提醒同步 `progress.md` |
| `PreCompact` | 上下文压缩前要求把关键进展落盘 |
| `Stop` | 检查 gated mode 的完成条件；否则允许正常停止 |

这里**没有 MCP 安装**，也没有要求新增 `$CODEX_HOME/commands/`。仓库虽然还提供 `.codex-plugin/plugin.json`，当前清单同样只声明 `skills` 与 `hooks`，`commands` 是空数组；standalone 全局安装与 Codex plugin 安装是两条替代路线，不应同时启用同一批 Hooks，否则 Codex 会执行所有匹配来源，产生重复注入。[Codex 插件清单][pwf-manifest]、[Codex 安装说明][pwf-codex]。

安装或修改 Hook 后，在 Codex 中执行 `/hooks`，检查来源、匹配事件和实际命令，并对新增/变更的非托管 Hook 完成信任确认。Hooks 在当前 Codex 中默认可用，但用户或管理员仍可通过 `[features] hooks = false` 显式关闭。[Codex 安装说明][pwf-codex]。

### 3.3 Windows 全局安装需要额外注意路径

当前上游 Codex 文档明确建议 Windows 优先使用 workspace 安装，因为仓库提供的 `commandWindows` 默认使用项目内相对路径 `.codex\hooks\...`。如果坚持把 Hooks 全局放在 `~/.codex/`，就需要把 `~/.codex/hooks.json` 中的 `commandWindows` 改成指向用户目录下 Hook 的**绝对路径**；否则从任意项目启动 Codex 时，相对路径可能指向错误位置。[Codex Windows 说明][pwf-codex]。

Windows Hook 运行还依赖：

- Python，可通过 `py -3` 或 `python` 调用；
- Git for Windows，供三个基于 shell 的上下文 Hook 使用；
- 修改 Hook 后重新启动 Codex，并通过 `/hooks` 检查实际解析结果。

因此，如果主要在 Windows 原生 Codex 中使用，最稳妥的做法是：**Skill 可以全局安装，Hooks 若不想维护绝对路径，则改用每个项目提交 `.codex/hooks.json` 与 `.codex/hooks/` 的 workspace 方式。** 这也是少数需要在“全局复用”和“零路径维护”之间做选择的地方。

### 3.4 使用后项目里会生成什么

安装本身只增加 Skill 和 Hook。真正开始复杂任务后，planning-with-files 才在当前任务目录维护计划文件。[核心 Skill][pwf-skill]。

单任务或兼容旧模式时：

```text
<project>/
├── task_plan.md                                # 阶段、状态、决策、错误记录
├── findings.md                                 # 调研、发现、重要上下文
└── progress.md                                 # 执行日志、验证结果、下一步
```

并行或多个命名任务时，会使用隔离的计划目录，而不是让多个 Agent 同时改同一组三文件：

```text
<project>/
└── .planning/
    ├── YYYY-MM-DD-<task-a>/
    │   ├── task_plan.md
    │   ├── findings.md
    │   └── progress.md
    └── YYYY-MM-DD-<task-b>/
        ├── task_plan.md
        ├── findings.md
        └── progress.md
```

当一个项目同时存在多个活动计划时，上游当前要求每个 Codex 会话通过 `PLAN_ID` 明确绑定自己的计划；无法确定唯一计划时，Hook 不应猜测并读取另一个任务的状态。[Codex 多计划说明][pwf-codex]。

最简单的使用提示词可以直接写：

> 使用 planning-with-files 管理这个任务。先建立或恢复唯一的主计划，再开始工作；所有已确认决策写入 findings，实际执行与测试结果写入 progress。不要另外创建第二套竞争计划。

如果只是运行一次独立的 `codex exec`、CI review 或嵌套研究 Agent，不希望它读取当前目录正在进行的计划，可以在该进程中设置 `PLANNING_DISABLED=1`。这样七类 Hook 会在读取计划前退出，不影响同目录中正常交互式会话。[Codex 安装说明][pwf-codex]。

## 附录 A：安装后的核对

| 范围 | 需要确认 |
| --- | --- |
| 安装与初始化 | CLI 或 Skill 在目标 Agent 可见；项目初始化新增文件与已有文件无意外覆盖 |
| 当前文档 | 已确定哪份规格代表当前行为，哪份文件记录进行中的变更 |
| 长任务状态 | 只有一份主计划；计划、发现与进度文件只记录真实执行和验证结果 |
| 完成与归档 | OpenSpec 的同步、归档由项目确认后执行；规格工具的校验不能替代代码测试 |

本文的文件树依据上游 README、安装文档和安装源码静态核查；没有在所有平台逐一执行三套安装并完成端到端功能验收。安装器和路径会随版本变化，具体以本机安装记录和 diff 为准。

[codex-skills]: https://learn.chatgpt.com/docs/build-skills
[os]: https://github.com/Fission-AI/OpenSpec
[os-cli]: https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md
[os-getting-started]: https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md
[os-global-config]: https://github.com/Fission-AI/OpenSpec/blob/main/src/core/global-config.ts
[os-install]: https://github.com/Fission-AI/OpenSpec/blob/main/docs/installation.md
[os-tools]: https://github.com/Fission-AI/OpenSpec/blob/main/docs/supported-tools.md
[pwf]: https://github.com/OthmanAdi/planning-with-files
[pwf-codex]: https://github.com/OthmanAdi/planning-with-files/blob/master/docs/codex.md
[pwf-hooks]: https://github.com/OthmanAdi/planning-with-files/blob/master/.codex/hooks.json
[pwf-manifest]: https://github.com/OthmanAdi/planning-with-files/blob/master/.codex-plugin/plugin.json
[pwf-skill]: https://github.com/OthmanAdi/planning-with-files/blob/master/skills/planning-with-files/SKILL.md
[sk]: https://github.com/github/spec-kit
[sk-codex]: https://github.com/github/spec-kit/blob/b9e7389d1414cfefe3964917a7ca48cd99503815/src/specify_cli/integrations/codex/__init__.py
[sk-docs]: https://github.github.io/spec-kit/
[sk-existing]: https://github.github.io/spec-kit/guides/existing-projects.html
[sk-install]: https://github.github.io/spec-kit/installation.html
[sk-integrations]: https://github.github.io/spec-kit/reference/integrations.html
[sk-manifest]: https://github.com/github/spec-kit/blob/main/src/specify_cli/integrations/manifest.py
[sk-plan-template]: https://github.com/github/spec-kit/blob/main/templates/plan-template.md
[sk-release]: https://github.com/github/spec-kit/releases/tag/v1.0.9
[uv-storage]: https://docs.astral.sh/uv/concepts/tools/
