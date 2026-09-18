# Task Plan: 全局 Agent 指令演进管理

## Goal

完成共享全局指令模板、演进记录、Codex/Claude Code 引用、README 入口和站点测试的系统化迁移。

## Next Step

任务已完成，向用户汇总提交、推送与验证结果。

## Current Phase

Phase 9: Commit and Push

## Phases

### Phase 1: Requirements & Discovery

- [x] 确认用户计划、默认推荐选择和不可修改的根目录规则
- [x] 检查仓库状态、目标文件、测试入口和站点路由机制
- [x] 记录官方依据与现有文档演进节点
- **Status:** complete

### Phase 2: Shared Documentation Structure

- [x] 创建 `notes/agents/prompt/` 下的共享模板和演进记录
- [x] 将 Codex 模板迁移到共享路径并补齐已确认规则
- [x] 保留根目录 `AGENTS.md` 不变
- **Status:** complete

### Phase 3: Platform Guides and Catalog

- [x] 更新 Codex 和 Claude Code 指南的引用章节
- [x] 保留 Claude 专用 `CLAUDE.md` 模板
- [x] 更新 README 入口和旧路径引用
- **Status:** complete

### Phase 4: Site Tests and Verification

- [x] 更新资源路径和演进文档路由断言
- [x] 运行 `git diff --check`、`npm run lint`、`npm test`
- [x] 检查旧路径残留、当前链接和最终差异
- **Status:** complete

### Phase 5: Delivery

- [x] 汇总变更与验证结果
- [x] 明确未执行 commit、push 和外部发布
- **Status:** complete

### Phase 6: Wording Refinement

- [x] 将 Codex 加载链验证说明改写为直接的操作描述
- **Status:** complete

### Phase 7: Section Placement Refinement

- [x] 将 Windows PowerShell A/B 实验链接放入全局指令章节
- [x] 删除额度查询章节中的无关说明
- **Status:** complete

### Phase 8: Legacy Quota Script Removal

- [x] 从 README、Codex 指南、测试和历史资源计划中删除脚本引用
- [x] 删除原额度查询脚本文件
- [x] 完成残留搜索、lint 和站点测试
- **Status:** complete

### Phase 9: Commit and Push

- [x] 仅暂存本次用户请求相关文件，保留 `.planning/` 为本地任务记录
- [x] 创建单个逻辑提交并推送到 `origin/main`
- [x] 验证本地 `HEAD` 与 `origin/main` 提交一致
- **Status:** complete

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| 采用用户确认的全部默认推荐方案 | 用户明确要求后续全部按照默认推荐选择 |
| 使用共享 `notes/agents/prompt/AGENTS.md` | 通用规则不绑定单一 Agent 平台 |
| 演进历史独立存放 | 避免运行中指令消耗空间并保持当前状态清晰 |
| 不修改根目录 `AGENTS.md` | 用户计划明确要求保留为仓库自身规则 |
| 提交并推送本轮变更 | 用户后续明确要求“提交push” |

## Errors Encountered

| Error | Attempt | Resolution |
|-------|---------|------------|
| apply_patch 初次组合补丁失败 | 1 | 改用分段和动态锚点补丁继续完成修改 |
| 测试补丁锚点不完整 | 1 | 使用完整行锚点后继续修改 |
| PowerShell 检查命令解析错误 | 1 | 修正 Get-Item 管道写法后重试 |
