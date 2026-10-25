# 全局 Agent 指令演进管理

Status: resolved
Completed: 2026-09-18
Migrated: 2026-10-25

## Problem Statement

通用 Agent 规则原先绑定 Codex 文档路径，平台使用说明、个人选择和演进历史混在一起。
需要建立可供 Codex 与 Claude Code 共同引用的当前规则模板，并让目录入口、站点路由和测试同步更新。

## Solution

将通用规则迁移为共享模板，将背景、官方依据与演进记录独立存放。
平台指南保留各自的安装和加载方式，统一链接到共享内容；同步站点入口和行为测试。
后续完成措辞调整、章节归位和旧额度查询脚本清理，并按当时用户授权分别提交产品改动和任务记录。

## User Stories

1. 作为跨平台用户，我希望通用规则不绑定单个 Agent，以便复用于不同平台。
2. 作为模板使用者，我希望正文只描述当前有效规则，以便直接安装使用。
3. 作为维护者，我希望背景和变更理由独立保存，以便理解规则如何演进。
4. 作为 Codex 用户，我希望平台指南给出准确的共享模板入口，以便配置全局指令。
5. 作为 Claude Code 用户，我希望保留专用模板和平台加载方式，以便按平台规则配置。
6. 作为网站读者，我希望目录入口与在线路由跟随迁移更新，以便访问当前文档。
7. 作为维护者，我希望站点测试覆盖新资源路径和演进指南，以便发现链接或路由回归。
8. 作为读者，我希望加载链验证说明直接写明操作和检查结果，以便执行。
9. 作为读者，我希望 Windows PowerShell A/B 实验入口位于全局指令章节，以便按主题查找。
10. 作为维护者，我希望已由产品功能替代的额度查询脚本及引用一并移除，以便文档反映当前用法。
11. 作为维护者，我希望提交与推送遵守当次授权，并能区分产品改动和任务记录，以便审查交付范围。

## Implementation Decisions

- 采用当时用户确认的默认推荐方案，保留已有文档框架，仅补充必要的独立原则。
- 通用规则、平台说明和演进历史分别维护；历史记录不混入运行中的规则正文。
- 文档间使用相对链接，兼顾本地移动与在线发布后的导航。
- 复用站点已有的 Markdown 自动发现和目录分类机制；无需新增生产路由。
- 原任务保留仓库自身规则及 Claude 专用模板；该约束针对 2026-09-18 的原任务范围。
- 产品改动和任务记录分开提交；原任务的提交、推送授权不延伸到后续任务。

## Testing Decisions

优先复用站点现有测试，检查读者可见的资源路径、源文件详情页、目录入口和指南路由，
并执行差异检查、代码规范检查及完整站点构建测试。

历史执行结果集中保存在 [任务 01](issues/01-shared-documentation.md#comments) 和
[任务 04](issues/04-legacy-quota-removal.md#comments)。这些结果来自 2026-09-18 的原记录，
不代表 2026-10-25 重新运行测试。原任务未进行视觉验收，亦未记录实际执行 Windows A/B 实验。

## Out of Scope

- 重写站点生产路由或改变平台自身的规则加载行为。
- 将仓库专属的任务记录或 skill 初始化约定写入共享全局模板。
- 将本次格式迁移视为新的产品修改、提交、推送或部署授权。

## Further Notes

### 任务索引

| 编号 | 独立交付 | 状态 | Blocked by |
| --- | --- | --- | --- |
| [01](issues/01-shared-documentation.md) | 共享模板、平台入口与站点验证 | resolved | 无 |
| [02](issues/02-wording-refinement.md) | 加载链验证措辞调整 | resolved | 01 |
| [03](issues/03-section-placement.md) | Windows A/B 实验入口归位 | resolved | 01 |
| [04](issues/04-legacy-quota-removal.md) | 旧额度查询脚本与引用清理 | resolved | 01 |
| [05](issues/05-product-delivery.md) | 产品改动提交与推送 | resolved | 01、02、03、04 |
| [06](issues/06-task-record-delivery.md) | 任务记录独立本地提交 | resolved | 05 |

全部任务已经完成，无待恢复或待领取事项。详细进度、问题处理和验收记录保存在各任务的 Comments 中。

### 迁移来源与覆盖

原记录来自提交 `b4ba189`（`chore: record agent instruction migration plan`）中的
`.planning/2026-09-18-global-agent-instructions/`；2026-10-25 按用户要求转换为本地 tracker 格式。

| 原文件 | 转换去向 |
| --- | --- |
| `task_plan.md` | 本 spec 的目标与决策；Phase 1–5 对应任务 01，Phase 6–9 对应任务 02–05；错误转入任务 01 |
| `findings.md` | 本 spec 的需求、方案、决策与来源；研究发现、初始化问题转入任务 01 |
| `progress.md` | 各任务的历史行动、验证和交付记录；最终补充的本地记录提交对应任务 06 |
| `.planning/.active_plan` | 原指针仅指向本项目；项目已完成，由本 spec 和任务索引承接，不保留活动指针 |

原记录先要求不提交、不推送，后续才追加授权；顺序分别保存在任务 01、05、06 中。
原记录中“当前领先远端一个提交”等描述只代表当时状态，详见任务 06。
迁移后删除原 `.planning` 目录，不保留副本或备份。

### 2026-10-25：迁移验收

- Passed：迁移内容覆盖原计划各阶段、决策、问题处理、来源、历史验证和两次提交；6 个任务均为 resolved，依赖无环。
- Passed：11 份配置与任务 Markdown 的格式检查，以及全部 31 个本地链接和锚点检查。
- Passed：原有 5 个未提交文件的 SHA-256 未变；根目录规则原有字节保留，仅追加 Agent skills 入口。
- Passed：删除前复核 4 个源文件的 SHA-256、目录绝对路径及无重解析点；旧 `.planning` 已删除，未创建备份。
- Passed：本次差异通过 `git diff --check`。
- Not Run：站点构建、lint、运行测试和视觉验收；本次仅调整 Agent 配置与历史任务格式，未修改站点源文件。

### 原调研来源

以下链接沿用原调研记录，2026-10-25 的格式迁移未重新核查其当前内容：

- [Codex AGENTS.md 官方说明](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Claude Code memory 官方说明](https://code.claude.com/docs/en/memory)
- [GPT-6 Astra 模型指南](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra)
- [GPT-5.6 模型指南](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.6)
- [上游 AGENTS.md](https://github.com/Da1sypetals/AGENTS.md)

原任务涉及的平台资料：
[Codex 指南](../../notes/agents/codex/codex.md)、
[Claude Code 指南](../../notes/agents/claude-code/claude-code.md)、
[Claude 专用模板](../../notes/agents/claude-code/CLAUDE.md)。
