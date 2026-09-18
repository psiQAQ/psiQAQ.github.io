# Global-Agent-Instructions-revolution

这份记录说明共享全局指令的来源、平台适配方式和历次演进。运行中的规则只放在 [AGENTS.md](./AGENTS.md)；历史、实验数据和设计依据集中在本文。

## 使用入口

- [当前共享全局指令模板](./AGENTS.md)
- [Codex 平台指南](../codex/codex.md)
- [Claude Code 平台指南](../claude-code/claude-code.md)
- [Claude Code 专用模板](../claude-code/CLAUDE.md)

## 平台官方规则

### Codex：AGENTS.md 加载链

Codex 在开始任务前读取适用的 AGENTS.md。用户级全局文件通常位于 ~/.codex/AGENTS.md；设置 CODEX_HOME 时以该目录为准，Windows 默认对应 %USERPROFILE%\.codex\AGENTS.md。项目目录可以继续放置项目根级和子目录级 AGENTS.md，Codex 按项目路径从上到下组合规则，越接近当前工作目录的内容越具体。

同一目录同时存在 AGENTS.override.md 和 AGENTS.md 时，override 文件优先。文件应保持简洁，当前官方说明给出的单文件限制为 32 KiB。加载验证应同时检查 Codex 的指令来源或状态信息，并用一个可观察行为确认规则确实影响了目标目录。

Codex 官方资料：

- [AGENTS.md 配置说明](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Codex 配置基础](https://developers.openai.com/codex/config-basic)

### Claude Code：CLAUDE.md 与导入

Claude Code 使用 CLAUDE.md 保存持久化指令，范围包括受管策略、用户级、项目级、项目局部规则和子目录规则。常见用户级文件是 ~/.claude/CLAUDE.md，项目级文件是项目中的 CLAUDE.md 或 .claude/CLAUDE.md；局部规则可使用 Claude Code 当前版本支持的 local memory 文件。

Claude Code 不会因为文件名是 AGENTS.md 就自动读取它。需要共享同一份规则时，在同目录的 CLAUDE.md 中写入导入语句：

    @AGENTS.md

导入路径相对于包含它的文件，官方文档限制导入深度为四层。Claude Code 将这些文件作为上下文指导；需要强制阻断的检查应使用 hooks 或其他平台机制。

Claude Code 官方资料：

- [Memory：CLAUDE.md 和导入](https://code.claude.com/docs/en/memory)
- [Claude Code 配置目录](https://code.claude.com/docs/en/claude-directory)

## 三种共享方式

notes/agents/claude-code/claude-code.md 保留平台说明，notes/agents/claude-code/CLAUDE.md 保留 Claude 专用规则。使用者可以按任务选择：

1. 只安装或引用共享 AGENTS.md，适合希望 Codex、Claude Code 和其他支持该文件名的工具共用一套规则的场景。
2. 只使用 Claude 专用 CLAUDE.md，适合需要 Claude Code 特有约定的场景。
3. 在同一目录使用 @AGENTS.md 加载共享规则，再在其后追加 Claude 专用规则，适合同时需要通用约束和 Claude Code 特有行为的场景。

共享文件和 Claude 文件需要明确分工：通用规则保持平台中立，平台特有的命令、权限和配置留在对应指南或专用模板中。

## 演进依据

### GPT-5.6 调整

初始模板依据 GPT-5.6 时代的任务执行经验，重点整理结果导向沟通、最小修改、环境复用、Git 权限边界和验证状态。调整目标是让规则能直接复制到用户级目录，并让代码、文档和命令说明保持一致。

参考：[GPT-5.6 模型指南](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.6)。

### Windows PowerShell A/B 实验

Windows 原生环境的实验固定了 Codex CLI 0.142.5、gpt-5.4、未提权的 Windows sandbox、测试夹具、超时和重复次数。baseline 与 candidate 各运行 12 个案例、每个案例 3 次，由独立验证器统计结果。候选规则将准确率从 83.33% 提高到 100%，平均得分从 76.61 提高到 90.17，中位耗时从 78.224 秒降到 67.285 秒，命令数从 457 降到 386，失败命令从 46 降到 34。

实验只保留两条具有明确证据的 Windows 规则：

- 修改 UTF-8 文件时保留 BOM 状态和换行格式，避免 PowerShell 5.1 的 Set-Content、Out-File 和重定向引起整文件变化。
- 需要稳定路径顺序时按 Unicode code point 排序，避免依赖系统区域设置的 Sort-Object。

该实验只代表固定环境，不推断所有 Windows 版本、终端、模型或项目的绝对效果。参考：[Codex Windows Efficiency Kit](https://github.com/psiQAQ/codex-windows-efficiency-kit)。

### GPT-6 Astra 重构

GPT-6 Astra 阶段重新审查了主动推进、用户指令优先级、Skill 与 AGENTS.md 的关系、审批边界、并行协作和校准验证。模板因此保留明确的执行边界，同时压缩空泛流程语句，增加失败证据、最终状态和用户插问恢复规则。

参考：[GPT-6 Astra 模型指南](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra)。

### 上游 AGENTS.md 的 41 项融合

对 [上游 AGENTS.md](https://github.com/Da1sypetals/AGENTS.md) 的规则逐项审查后，本轮采用默认推荐选择，并将其改写为适合跨项目使用的规则：

| 编号 | 当前采用的方向 |
|------|----------------|
| 1–4 | 分层强制；明确讨论目标文件时重读；约束所有可见制品；禁止无请求的否定式对比 |
| 5–8 | 禁止空泛过程开场；一次规划、分步验证；默认单方案；禁止空洞元话语 |
| 9–15 | 使用清晰完整词语；不自造缩略词；关键操作使用完整动宾结构；避免黑话；保留必要英文术语 |
| 16–18 | 必需依赖直接导入；服从宿主和用户的 Plan Mode；使用安全的 Git 回退流程 |
| 19–22 | 使用项目内被忽略的临时目录；按需读取网页；怀疑用法时核对官方资料；视觉功能按需使用 |
| 23–26 | 不以依赖数量为目标；优先复用成熟能力；必需前置条件明确失败；替身只隔离明确边界 |
| 27–30 | 插问后恢复原任务；实施、运行、测试、迭代到可用；不用 ASCII Art；复杂脚本写入可审查文件 |
| 31–34 | 不机械禁止 docstring、shebang 或程序化编辑；成熟格式优先使用现有实现或可靠库 |
| 35–38 | 疑问句默认只回答问题；不追加泛化尾巴；不评价工作量；采用中性工具角色 |
| 39–41 | 保留简洁和最小修改；接受修正后继续；运行制品只描述当前有效状态 |

参考依据还包括当前仓库的 GPT-6 适配模板历史和 Windows 实验记录。

## 演进节点

| 日期 | 节点 | 主要变化 |
|------|------|----------|
| 2026-06-14 | 初始模板 | 建立中文沟通、任务执行、验证、Python、Git、文档和 Windows 基本约定 |
| 2026-07-17 | GPT-5.6 调整 | 收敛输出结构，明确最小修改、权限边界和可观察验证 |
| 2026-07-19 | Windows A/B 验证 | 将编码/BOM/换行和 Unicode 路径排序纳入 Windows 可靠性规则 |
| 2026-09-12 | GPT-6 Astra 重构 | 压缩流程性文字，强化主动推进、失败证据、审批和最终状态 |
| 2026-09-18 | 41 项规则融合 | 将上游规则按默认推荐方案整合到共享模板，并与 Codex、Claude Code 解耦 |

## 后续维护记录格式

每次实质性演进追加一条记录，保持运行中的 AGENTS.md 只包含当前规则：

    ### YYYY-MM-DD：简短节点名称

    - 依据：官方文档、模型指南、实验、用户确认或项目实践
    - 主要变化：新增、删除或调整的规则范围
    - 验证结果：执行的检查、观察到的结果和证据边界
    - 限制：尚未覆盖的环境、版本或已知风险

涉及平台官方行为时保留官方链接；涉及个人偏好时记录确认来源；涉及实验时记录环境、样本和验证方法。历史条目不回写到运行中的共享模板。
