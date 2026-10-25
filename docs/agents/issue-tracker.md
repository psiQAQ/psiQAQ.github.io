# Issue tracker：本地 Markdown

本仓库的 issue 和 spec 保存在 `.scratch/`。

## 文件约定

- 每个功能使用一个目录：`.scratch/<feature-slug>/`。
- Spec 保存为 `.scratch/<feature-slug>/spec.md`。
- 实施任务分别保存为 `.scratch/<feature-slug>/issues/<NN>-<slug>.md`，
  从 `01` 编号，每个任务一个文件。
- Triage 状态写在任务文件开头的 `Status:` 行；
  状态名见 [triage-labels.md](triage-labels.md)。
- 评论和对话历史追加到文件末尾的 `## Comments` 下。

## 发布与读取

Skill 要求“发布到 issue tracker”时，在对应功能目录中创建文件。
要求“读取相关 ticket”时，读取用户给出的路径；只有编号时，
先在对应功能目录定位，编号不唯一时确认所属功能。

## 完成与恢复

任务完成后，将 `Status:` 改为 `resolved`，勾选实际满足的验收项，
并在 `## Comments` 下记录结果和验证依据。`resolved` 表示任务完成，
五个 triage 角色的映射保持不变。

恢复任务时先读取对应 `spec.md` 与任务的 Comments；只选择尚未 resolved、
且所有阻塞任务均已 resolved 的任务。已完成的历史任务保留原完成日期，
历史验证与本次执行的验证分别记录。

## Wayfinder 导航任务

- Map 保存为 `.scratch/<effort>/map.md`，
  包含 Notes、Decisions-so-far 和 Fog。
- 子任务保存为 `.scratch/<effort>/issues/NN-<slug>.md`。
- `Type:` 使用 `research`、`prototype`、`grilling` 或 `task`。
- 此流程的 `Status:` 使用 `open`、`claimed` 或 `resolved`。
- 依赖写为 `Blocked by: NN, NN`；
  所有依赖任务均为 `resolved` 后才可开始。
- 按编号选择首个 open、无未解决依赖且尚未领取的任务。
- 开始工作前，将状态写为 `claimed`。
- 完成后在 `## Answer` 下追加答案，将状态改为 `resolved`，
  并在 map 的 Decisions-so-far 中追加摘要和相对链接。
