# graphify 代码库加速 skill

Graphify 是一个面向 AI 编码助手的本地优先知识图谱工具。它可以把代码库、文档、PDF、图片、音视频等内容映射成一张可查询、可追踪路径的图，而不只是做关键词搜索或向量检索。

适合在这些场景使用：

- 代码库较大，单靠 `grep` 很难快速建立全局理解
- 文档、论文、截图、设计说明分散在不同目录
- 需要跨文件追踪调用链、依赖关系、模块边界和架构原因
- 希望让 AI 助手优先利用结构化图谱，而不是每次都从原始文件重新读起

官方仓库：
<https://github.com/Graphify-Labs/graphify>

## 1. 安装方式：推荐使用 `uv tool`

基础要求：

| 项目 | 要求 |
| --- | --- |
| Python | `>=3.10` |
| 推荐安装工具 | `uv tool` |
| PyPI 包名 | `graphifyy` |
| CLI 命令 | `graphify` |
| 对话命令 | `/graphify`（Codex 用 `$graphify`，PowerShell 用 `graphify .`） |

需要特别注意的是，官方 PyPI 包名仍然是 `graphifyy`，但安装后使用的命令依然是 `graphify`。`graphify` 这个名字目前还在 PyPI 上回收中，所以不要安装其他同名或近似包。来源：官方 README 与 PyPI 说明。  
参考：
- [Graphify 官方 README](https://github.com/Graphify-Labs/graphify)
- [graphifyy on PyPI](https://pypi.org/project/graphifyy/)

### 通用安装

```bash
# 推荐：安装到 uv tool 隔离环境
uv tool install graphifyy

# 如果安装后命令还不可用，可刷新 shell
uv tool update-shell
```

然后把 Graphify 安装到你当前使用的 AI 助手：

```bash
# 自动检测当前平台
graphify install

# 或显式指定部分平台
graphify install --platform codex
graphify install --platform opencode

# 项目级安装（写入当前目录 .claude/skills/ 等，可提交到 git）
graphify install --project
graphify install --project --platform codex
```

安装完后，在目标项目目录中打开你正在使用的 AI 助手，在对话里输入：

```text
/graphify .
```

这一步是在助手对话内执行，不是在系统 shell 里执行。

构图完成后，官方还推荐在项目根目录再执行一次平台常驻安装，让助手后续优先读图谱：

```bash
graphify codex install
graphify claude install
graphify opencode install
```

项目级安装加上 `--project` 标志即可写入当前目录（如 `.claude/skills/graphify/SKILL.md`），可提交到 git 供团队共享：

```bash
graphify claude install --project
graphify codex install --project
```

### 当前平台支持

Graphify 现在已经不只支持 Claude Code。官方 README（v0.9.16）当前列出的平台包括：

| 平台 | 安装方式 |
| --- | --- |
| Claude Code (Linux/Mac) | `graphify install` |
| Claude Code (Windows) | `graphify install`（自动检测）或 `graphify install --platform windows` |
| CodeBuddy | `graphify install --platform codebuddy` |
| Codex | `graphify install --platform codex` |
| OpenCode | `graphify install --platform opencode` |
| Kilo Code | `graphify install --platform kilo` |
| GitHub Copilot CLI | `graphify install --platform copilot` |
| VS Code Copilot Chat | `graphify vscode install` |
| Aider | `graphify install --platform aider` |
| OpenClaw | `graphify install --platform claw` |
| Factory Droid | `graphify install --platform droid` |
| Trae | `graphify install --platform trae` |
| Trae CN | `graphify install --platform trae-cn` |
| Gemini CLI | `graphify install --platform gemini` |
| Hermes | `graphify install --platform hermes` |
| Kimi Code | `graphify install --platform kimi` |
| Amp | `graphify amp install` |
| Agent Skills（跨框架通用） | `graphify install --platform agents`（别名 `--platform skills`） |
| Kiro IDE/CLI | `graphify kiro install` |
| Pi | `graphify install --platform pi` |
| Cursor | `graphify cursor install` |
| Devin CLI | `graphify devin install` |
| Google Antigravity | `graphify antigravity install` |

> **注意**：Codex 使用 `$graphify` 而非 `/graphify` 作为对话命令前缀。Codex 用户还需在 `~/.codex/config.toml` 的 `[features]` 下设置 `multi_agent = true` 以启用并行提取。PowerShell 用户应使用 `graphify .` 而非 `/graphify .`（开头的斜杠在 PowerShell 中是路径分隔符）。

官方仓库还提到支持更多平台；如果你使用的是较新的客户端，优先以仓库 README 为准。

### 项目常驻集成：CLAUDE.md / AGENTS.md 推荐内容

`graphify <platform> install` 会在项目根目录写入常驻指令，让 AI 助手在后续会话中优先利用知识图谱。同时会在对应平台安装 hook（如 `PreToolUse`），在搜索/读文件类工具调用前自动提醒优先使用图谱查询。

以下是推荐在项目 `CLAUDE.md` 或 `AGENTS.md` 中维护的完整内容。其中 `## graphify` 规则块来自 `graphify <platform> install` 自动写入，`### 调用规则` 为手动补充的 CLI 使用规范，建议一并写入：

#### Claude Code（写入 `CLAUDE.md`）

`graphify claude install` 自动生成 `## graphify` 规则块并安装 PreToolUse hook 到 `.claude/settings.json`。建议在下方手动补充 `### 调用规则`：

```markdown
## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.

### 调用规则

graphify 已通过 `uv tool install graphifyy` 安装，禁止重复安装（`uv run --with`、`uvx`、`pip install`、项目 `.venv` 安装均禁止）。

- **CLI**：直接用 `graphify <args>`；PATH 不可用时执行 `$(uv tool dir --bin)/graphify`
- **Python API**：复用 tool venv 的 python，禁止 `uv run --with`
  - Windows: `%APPDATA%\uv\tools\graphifyy\Scripts\python.exe`
  - Linux/macOS: `$(uv tool dir)/graphifyy/bin/python`
  - 脚本中禁止硬编码用户名路径，调用前用 `uv tool list` 检查是否已安装；未安装则提示 `uv tool install graphifyy`
```

Hook 平台（Claude Code、Gemini CLI、Codex、CodeBuddy）：hook 会在 Bash 搜索类工具调用、Read/Glob 调用前自动触发，提醒助手优先走 `graphify query` 而非直接 grep/读原始文件。

#### Codex（写入 `AGENTS.md`）

`graphify codex install` 自动生成 `## graphify` 规则块并安装 PreToolUse hook 到 `.codex/hooks.json`。建议在下方手动补充 `### 调用规则`：

```markdown
## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
- Dirty graphify-out/ files are expected after `graphify update` and are not a reason to skip graphify

### 调用规则

graphify 已通过 `uv tool install graphifyy` 安装，禁止重复安装（`uv run --with`、`uvx`、`pip install`、项目 `.venv` 安装均禁止）。

- **CLI**：直接用 `graphify <args>`；PATH 不可用时执行 `$(uv tool dir --bin)/graphify`
- **Python API**：复用 tool venv 的 python，禁止 `uv run --with`
  - Windows: `%APPDATA%\uv\tools\graphifyy\Scripts\python.exe`
  - Linux/macOS: `$(uv tool dir)/graphifyy/bin/python`
  - 脚本中禁止硬编码用户名路径，调用前用 `uv tool list` 检查是否已安装；未安装则提示 `uv tool install graphifyy`
```

指令文件平台（OpenCode、Cursor、Trae、Aider、OpenClaw 等）：写入 `AGENTS.md`、`.cursor/rules/graphify.mdc` 等持久指令文件，提供相同的"图谱优先"引导。这些平台不依赖 PreToolUse hook，指令文件本身就是常驻机制。

> **Codex 注意**：Codex 中对话命令前缀是 `$graphify` 而非 `/graphify`。需在 `~/.codex/config.toml` 中配置 `multi_agent = true` 才能启用并行提取。

### 实现过程

- Codex

| 操作 | 执行位置 | 作用 |
| --- | --- | --- |
| `uv tool install graphifyy` | 系统命令行 | 安装 Graphify CLI |
| `graphify install --platform codex` | 系统命令行 | 安装 Codex 可调用的 Graphify skill |
| `$graphify .` | Codex 对话内部 | 触发 skill，对当前目录建图（Codex 用 `$` 前缀而非 `/`） |
| `graphify codex install` | 系统命令行，项目根目录 | 写入 `AGENTS.md` 规则并安装 `.codex/hooks.json` PreToolUse hook |

Codex 的常驻集成同时做了两件事：把规则写入 `AGENTS.md`，并在 `.codex/hooks.json` 中安装 PreToolUse hook（与 Claude Code 机制相同），在 Bash 工具调用前自动提醒优先使用图谱查询。此外还需要在 `~/.codex/config.toml` 的 `[features]` 下设置 `multi_agent = true` 以启用并行提取。

- Claude Code

| 操作 | 执行位置 | 作用 |
| --- | --- | --- |
| `uv tool install graphifyy` | 系统命令行 | 安装 Graphify CLI |
| `graphify install` | 系统命令行 | 安装 Claude Code 可调用的 Graphify skill |
| `/graphify .` | Claude Code 对话内部 | 触发 skill，对当前目录建图 |
| `graphify claude install` | 系统命令行，项目根目录 | 写入 `CLAUDE.md` 并安装 `.claude/settings.json` PreToolUse hook |

Claude Code 的常驻集成做两件事：写入 `CLAUDE.md` 规则（引导优先使用 `graphify query` 而非直接读报告或 grep 原始文件），并通过 `.claude/settings.json` 中的 PreToolUse hook 在 Bash 搜索类工具和 Read/Glob 调用前自动提醒，让 Claude 优先走图谱查询路径。

- OpenCode

| 操作 | 执行位置 | 作用 |
| --- | --- | --- |
| `uv tool install graphifyy` | 系统命令行 | 安装 Graphify CLI |
| `graphify install --platform opencode` | 系统命令行 | 安装 OpenCode 可调用的 skill |
| `/graphify .` | OpenCode 对话内部 | 触发 skill，对当前目录建图 |
| `graphify opencode install` | 系统命令行，项目根目录 | 写入 `AGENTS.md` 及 OpenCode 插件配置 |

OpenCode 属于指令文件平台，常驻机制是写入 `AGENTS.md` 规则和插件配置，不依赖 PreToolUse hook。

---

## 2. `/graphify .` 到底在哪里执行？

结论：

| 命令 | 执行位置 | 是否是系统命令 |
| --- | --- | --- |
| `graphify install` | 系统命令行 | 是 |
| `graphify codex install` | 系统命令行 | 是 |
| `graphify claude install` | 系统命令行 | 是 |
| `graphify opencode install` | 系统命令行 | 是 |
| `/graphify .` | AI 助手对话框内部 | 不是普通 shell 命令 |
| `graphify query ...` | 系统命令行 | 是 |
| `graphify path ...` | 系统命令行 | 是 |
| `graphify explain ...` | 系统命令行 | 是 |

官方文档把 `/graphify .` 放在“打开 AI 助手之后输入”的步骤中，而 `query`、`path`、`explain`、`hook install` 等则明确是 CLI 子命令。这两类入口不要混用。

---

## 3. `.` 的含义

`.` 不是“所有文件”的意思，而是**当前目录路径**。

在：

```text
/graphify .
```

这里：

```text
. = 当前工作目录
```

如果你是在项目根目录启动 Codex、Claude Code 或其他支持平台，那么：

```text
/graphify .
```

表示的就是：

```text
对当前项目根目录构建知识图谱
```

官方 README 同时给出了 `/graphify` 和 `/graphify ./raw` 两种写法，分别表示“对当前目录运行”和“对指定目录运行”。

---

## 4. 是否只能处理当前文件夹？

不是。Graphify 支持对指定路径运行，也支持后续更新和导出。

官方 README 当前示例包括：

```text
/graphify
/graphify .
/graphify ./raw
/graphify ./raw --mode deep
/graphify ./raw --update
/graphify ./raw --watch
/graphify ./raw --wiki
/graphify ./raw --svg
/graphify ./raw --graphml
/graphify ./raw --neo4j
```

还有一类是图构建完成后的 CLI 查询：

```bash
graphify query "what connects attention to the optimizer?"
graphify path "DigestAuth" "Response"
graphify explain "SwinTransformer"
```

因此：

| 输入 | 含义 |
| --- | --- |
| `/graphify` | 对当前目录运行 |
| `/graphify .` | 对当前目录运行，`.` 是显式写法 |
| `/graphify ./raw` | 对当前目录下的 `raw` 子目录运行 |
| `/graphify ../other-project` | 对上一级目录中的另一个项目运行 |
| `graphify query "..."` | 对已经生成的图进行自然语言查询 |
| `graphify path "A" "B"` | 查询两个节点之间的路径 |
| `graphify explain "X"` | 解释某个节点及其连接关系 |

在 Windows 上，更稳妥的做法通常仍然是先进入目标目录，再启动 AI 助手，然后运行：

```powershell
cd D:\project\repo
codex
```

接着在助手对话中输入：

```text
/graphify .
```

---

## 5. `.` 是否代表“所有文件”？

不是。`.` 只代表“当前目录”这个路径。

但 Graphify 会从这个目录开始，递归处理它支持的文件类型。当前官方 README 明确提到支持这些内容：

| 类型 | 典型内容 |
| --- | --- |
| 代码 | Python、TypeScript、JavaScript、Go、Rust、Java、C/C++ 等 |
| 文档 | Markdown、TXT、RST |
| 论文 | PDF |
| 图片 | 截图、流程图、白板照片、其他语言图片 |
| 其他多模态材料 | 音视频等 |

代码部分以本地 AST 分析为主；文档、PDF、图片和其他多模态内容则走语义提取流程，再合并到同一张图里。

所以更准确的理解是：

```text
/graphify .
```

表示：

```text
以当前目录作为输入根目录，扫描并处理其中支持的文件类型，输出 graphify-out/
```

而不是：

```text
. = 所有文件
```

---

## 6. 最终结论

| 问题 | 结论 |
| --- | --- |
| `/graphify .` 是系统命令行执行吗？ | 不是，它是 AI 助手对话里的 slash command / skill 入口（Codex 用 `$graphify`） |
| `.` 是什么意思？ | 当前目录路径 |
| `.` 是否代表所有文件？ | 不是；它只代表当前目录，但 Graphify 会递归处理其中支持的文件 |
| 是否只能处理当前目录？ | 不是，支持传入指定路径 |
| 图构建完后还能做什么？ | 可以继续用 `graphify query`、`graphify path`、`graphify explain` 查询图谱 |
| Codex 常驻机制 | `graphify codex install` 写入 `AGENTS.md` 规则 + `.codex/hooks.json` PreToolUse hook |
| Claude Code 常驻机制 | `graphify claude install` 写入 `CLAUDE.md` 规则 + `.claude/settings.json` PreToolUse hook |
| OpenCode 常驻机制 | `graphify opencode install` 写入 `AGENTS.md` 与插件配置 |
| 当前官方推荐安装方式 | `uv tool install graphifyy`，再执行 `graphify install` |
| 常驻集成核心策略 | 引导 AI 助手优先使用 `graphify query` 而非读取原始文件或 `GRAPH_REPORT.md` |

## 7. 附加说明

### 1. 旧教程里哪些信息已经过时

下面这些内容不建议再按旧版本记忆：

- 旧仓库名 `safishamsi/graphify` 不再作为主要入口，当前官方仓库应以 `Graphify-Labs/graphify` 为准
- 旧中文文档中只列出 `Claude Code / OpenCode / Codex`，现在官方已经扩展到 20+ 平台
- 旧版本里把平台集成主要描述成 Claude / OpenCode 两类，当前官方安装命令已经统一到 `graphify install` 与 `graphify <platform> install`
- 旧版本认为 Codex 没有 PreToolUse hook——当前 Codex 已通过 `.codex/hooks.json` 支持 PreToolUse hook
- 旧版本强调"先读 `GRAPH_REPORT.md`"——当前策略是优先使用 `graphify query` 进行精准子图查询，`GRAPH_REPORT.md` 仅用于宏观架构审视
- 旧附录里对 `site-packages` 目录结构的手动拆解没有太大使用价值，也容易跟随版本失效
- Codex 对话命令前缀已从 `/graphify` 改为 `$graphify`

### 2. 现在最实用的使用顺序

如果只是日常使用，按下面的顺序就够了：

1. 在系统命令行安装：`uv tool install graphifyy`
2. 给当前助手安装 skill：`graphify install --platform codex` 或对应平台命令
3. 进入目标项目目录，启动助手
4. 在对话里运行：`/graphify .`（Codex 用 `$graphify .`，PowerShell 用 `graphify .`）
5. 回到系统命令行，在项目根目录执行：`graphify codex install` 或对应平台命令
6. 后续优先让助手用 `graphify query "<问题>"` 精准查询，`GRAPH_REPORT.md` 仅用于宏观架构审视

### 3. 输出目录里最值得先看的文件

典型输出目录如下：

```text
graphify-out/
├── graph.html
├── GRAPH_REPORT.md
├── graph.json
└── cache/
```

其中最值得先看的通常是：

- `GRAPH_REPORT.md`：适合人和 AI 助手先快速建立全局理解
- `graph.html`：适合自己交互式查看社区和节点关系
- `graph.json`：适合后续 `query` / `path` / `explain` 复用
