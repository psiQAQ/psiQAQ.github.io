# 01: 共享模板、平台入口与站点验证

Status: resolved
Completed: 2026-09-18
Spec: [全局 Agent 指令演进管理](../spec.md)

**What to build:** 用户可以从两套平台指南和站点目录访问同一份共享全局指令，
并独立查阅演进历史；站点测试覆盖迁移后的入口与路由。

**Blocked by:** None (can start immediately).

## Acceptance criteria

- [x] 确认用户选择、原任务范围、文档边界、运行方式及官方依据。
- [x] 共享模板和演进记录可供不同平台引用，通用内容从 Codex 专属路径迁出。
- [x] Codex 与 Claude Code 指南、README 入口和站点断言同步更新。
- [x] 原任务保留根目录仓库规则和 Claude 专用模板不变。
- [x] 原记录中的差异、lint、构建及站点测试全部通过，交付范围已说明。

## Comments

### 2026-09-18：实施与决策

- 对应原计划 Phase 1–5。用户确认采用全部默认推荐方案。
- 实施前工作树干净：`main...origin/main`，无文件变更。
- 检查仓库状态、目标文件、测试入口和内容发现逻辑，记录平台与模型文档依据。
- `lib/content.ts` 已自动发现 `notes/**/*.md`；无需增加生产路由。
- README 的 📄 条目对应指南页，🧾 条目对应资源页；演进记录与模板分别归入这两类。
- 创建 [共享模板](../../../notes/agents/prompt/AGENTS.md) 和
  [演进记录](../../../notes/agents/prompt/Global-Agent-Instructions-revolution.md)，
  将 Codex 指南中通用说明与 Windows A/B 实验内容迁入共享演进记录。
- 更新 [Codex 指南](../../../notes/agents/codex/codex.md)、
  [Claude Code 指南](../../../notes/agents/claude-code/claude-code.md) 和
  [README](../../../README.md)；Claude Code 指南说明三种组合方式。
- 保留 [Claude 专用模板](../../../notes/agents/claude-code/CLAUDE.md)；
  原任务未修改根目录 `AGENTS.md`。
- [站点测试](../../../tests/site.test.mjs) 将资源断言从
  `/resources/agents/codex/AGENTS.md` 改为 `/resources/agents/prompt/AGENTS.md`，
  并补充源文件详情页与演进指南路由断言；检查旧路径残留、当前链接和最终差异。
- 共享模板沿用现有结构，少量增补独立原则；相对链接连接文档。
  官方平台事实与个人演进选择分别记录，正文描述当前有效状态。
- 初始交付时未执行 commit、push 或外部发布；后续授权与交付见任务 05、06。

### 2026-09-18：历史验证

| 检查 | 输入 | 预期 | 原记录结果 | 状态 |
| --- | --- | --- | --- | --- |
| 工作树检查 | `git status --short --branch` | 修改前干净 | `main...origin/main`，无文件变更 | Passed |
| 差异检查 | `git diff --check` | 无空白错误 | 通过，仅提示工作树换行转换 | Passed |
| 代码规范 | `npm run lint` | ESLint 通过 | 通过 | Passed |
| 站点构建与测试 | `npm test` | 构建成功，测试全部通过 | 45 routes，22 tests，22 passed，0 failed | Passed |
| 视觉检查 | 未执行 | 不适用本次 Markdown、README、路由与测试变更 | 原记录注明无需视觉检查 | Not Run |

以上为历史记录；迁移时未重新执行原任务测试。

### 2026-09-18：问题与处理

| 问题 | 尝试次数 | 原记录中的处理 |
| --- | --- | --- |
| 初始化脚本的 PowerShell 版本仅支持根目录旧模式 | 未记录 | 使用同一 skill 提供的 Bash 版本建立独立任务目录 |
| 初次组合 `apply_patch` 补丁失败 | 1 | 分解为独立补丁，并使用动态锚点继续修改 |
| 测试补丁锚点不完整 | 1 | 使用完整行锚点后继续修改 |
| PowerShell 检查命令解析错误 | 1 | 修正 `Get-Item` 管道写法后重试 |
