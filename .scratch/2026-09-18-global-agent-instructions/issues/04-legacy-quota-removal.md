# 04: 旧额度查询脚本与引用清理

Status: resolved
Completed: 2026-09-18
Spec: [全局 Agent 指令演进管理](../spec.md)

**What to build:** 读者按当前文档使用额度查询功能时，不再遇到已废弃脚本的入口、
说明或测试要求。

**Blocked by:** 01 — 共享模板、平台入口与站点验证。

## Acceptance criteria

- [x] README、平台指南、测试和历史资源计划中的旧脚本引用已删除。
- [x] 原额度查询脚本已删除。
- [x] 原记录中的残留搜索、lint 和站点测试通过。

## Comments

### 2026-09-18：脚本移除跟进

对应原计划 Phase 8。删除原 `notes/agents/codex/codex-reset-remaining.py`，
同步清理 [README](../../../README.md)、
[Codex 指南](../../../notes/agents/codex/codex.md)、
[站点测试](../../../tests/site.test.mjs) 和
[历史资源计划](../../../docs/superpowers/plans/2026-08-02-notes-catalog-resources.md)
中的相关引用。

| 历史检查 | 原记录结果 | 状态 |
| --- | --- | --- |
| 全仓残留搜索 | 通过 | Passed |
| `npm run lint` | 通过 | Passed |
| `npm test` | 通过；此轮未单独记录数量 | Passed |

以上是原进度日志记载的结果，迁移时未重跑这些检查。
