# Git PR 教程（普通贡献者视角）

> 目标：从 **他人仓库 Fork** 开始，到 **本地开发测试**，再到 **推送到你自己的 Fork 并发起 PR**，完整走一遍。
>
> 适合人群：第一次给开源项目提 PR 的小白。

---

## 0. 先理解 3 个仓库概念

- **upstream**：原作者/官方仓库（你要贡献的目标仓库）
- **origin**：你自己的 Fork 仓库（你有写权限）
- **本地仓库**：你电脑上的代码副本

常见流程是：

1. 从 upstream Fork 到你的 GitHub（生成 origin）
2. 把 origin clone 到本地
3. 在本地新建分支开发并测试
4. 把分支推送到 origin
5. 在 GitHub 发起 `origin:你的分支 -> upstream:主分支` 的 PR

---

## 1. 环境准备（只做一次）

先确认安装了 Git 和 GitHub CLI（`gh`）。

| 场景              | 只用 git                 | 使用 gh                  |
| --------------- | ---------------------- | ---------------------- |
| 提交代码            | `git push origin main` | `git push origin main` |
| 创建 GitHub 仓库    | 去浏览器点击创建               | `gh repo create`       |
| 发起 Pull Request | 去浏览器操作                 | `gh pr create`         |
| 查看 Issue 列表     | 去浏览器查看                 | `gh issue list`        |
| 合并 PR           | 去浏览器点击 Merge           | `gh pr merge`          |

```bash
# 查看 Git 是否安装成功
git --version

# 安装 GitHub CLI
sudo apt install gh

# 查看 GitHub CLI 是否安装成功
gh --version
```

登录 GitHub CLI（用于命令行 Fork、建 PR，更方便）：

```bash
# 登录 GitHub 账号，按提示完成浏览器授权
gh auth login

# 检查当前登录状态（确认账号和权限）
gh auth status
```

---

## 2. Fork 他人仓库到你名下

假设目标仓库是：`https://github.com/OWNER/REPO`

### 方式 A（推荐）：命令行 Fork

```bash
# 把官方仓库 Fork 到你自己的 GitHub 账号
# --clone=false 表示这里只做 Fork，不立即 clone（后面我们手动 clone，更清晰）
gh repo fork OWNER/REPO --clone=false
```

### 方式 B：网页 Fork

1. 打开 `https://github.com/OWNER/REPO`
2. 点击右上角 **Fork**
3. 选择你的账号并创建

---

## 3. Clone 你的 Fork 到本地

```bash
# 克隆你自己的 Fork 到本地
# 注意把 YOUR_NAME 替换成你的 GitHub 用户名
git clone https://github.com/YOUR_NAME/REPO.git

# 进入项目目录
cd REPO
```

检查当前远程仓库：

```bash
# 查看远程仓库列表和 URL
git remote -v
```

通常你会看到 `origin` 指向你自己的 Fork。

---

## 4. 添加 upstream（官方仓库）

这一步非常关键，用于后续同步官方最新代码。

```bash
# 添加官方仓库为 upstream（只需做一次）
git remote add upstream https://github.com/OWNER/REPO.git

# 再次查看远程仓库，确认 origin 和 upstream 都在
git remote -v
```

---

## 5. 同步最新主分支后再开新分支

先把本地主分支更新到最新，避免基线太旧导致冲突。

> 注意：主分支名可能是 `main` 或 `master`，下面以 `main` 为例。

```bash
# 拉取 upstream 的所有最新提交和分支信息
git fetch upstream

# 切换到本地主分支
git switch main

# 仅快进更新本地 main 到 upstream/main（更安全，不会覆盖未提交改动）
git merge --ff-only upstream/main

# 把更新后的 main 推到你自己的 Fork（可选但推荐，保持 origin/main 也最新）
git push origin main
```

---

## 6. 创建功能分支并开始修改

不要直接在 `main` 上改代码。每个 PR 用一个独立分支。

```bash
# 基于当前 main 创建并切换到新分支
# 分支名建议清晰表达目的，例如 fix/typo-readme 或 feat/add-login-check
git switch -c fix/your-change-name
```

开始你的代码修改。

---

## 7. 本地测试与自检

不同项目测试命令不同，请看仓库 `README` 或贡献指南。常见示例：

```bash
# 示例：Node.js 项目安装依赖
npm install

# 示例：运行测试
npm test

# 示例：运行代码检查
npm run lint
```

> 如果项目是 Python/Go/Rust，请使用项目文档中的对应命令。

---

## 8. 查看改动并提交 commit

先看你改了什么，再提交：

```bash
# 查看工作区状态（哪些文件改了、哪些已暂存）
git status

# 查看具体改动内容（逐行 diff）
git diff
```

暂存并提交：

```bash
# 暂存你想提交的文件（示例：暂存全部改动）
git add .

# 恢复被暂存的文件到更改状态
git restore --staged .

# 放弃文件的更改状态
git restore .

# 再次确认暂存状态
git status

# 提交，写清楚“做了什么 + 为什么”
git commit -m "fix: correct xxx behavior in yyy"
```

如果你想分多次提交，也可以按功能拆成多个 commit。

---

## 9. 推送分支到你自己的 Fork

```bash
# 首次推送当前分支到 origin，并建立本地分支与远端分支的跟踪关系
git push -u origin fix/your-change-name
```

后续同一分支继续提交时，直接：

```bash
# 因为已有 -u 建立的跟踪关系，后续可直接 push
git push
```

---

## 10. 发起 Pull Request

### 方式 A（推荐）：命令行创建 PR

```bash
# 基于当前分支创建 PR
# --base main 表示合并到 upstream 的 main
# --head YOUR_NAME:fix/your-change-name 表示来源是你 Fork 的这个分支
gh pr create \
  --repo OWNER/REPO \
  --base main \
  --head YOUR_NAME:fix/your-change-name \
  --title "fix: briefly describe your change" \
  --body "## What\n+- Explain what changed\n+\n+## Why\n+- Explain why this is needed\n+\n+## Testing\n+- Describe how you tested locally"
```

### 方式 B：网页创建 PR

1. 打开你 Fork 的分支页面
2. 点击 **Contribute** -> **Open pull request**
3. 确认方向是：`OWNER/REPO:main <- YOUR_NAME/REPO:fix/your-change-name`
4. 填写标题和描述后提交

---

## 11. 根据评审意见继续更新 PR

评审让你改内容时，不要新开 PR，直接在**同一个分支**继续提交并 push，PR 会自动更新。

```bash
# 修改代码后查看状态
git status

# 暂存改动
git add .

# 提交一条新的修复 commit
git commit -m "fix: address review comments"

# 推送到同一远端分支，PR 自动追加更新
git push
```

---

## 12. 常用同步操作（避免分支过旧）

如果官方仓库更新很快，你的分支可能落后。常见做法是把最新 `upstream/main` 合入你的功能分支：

```bash
# 拉取官方最新代码
git fetch upstream

# 确保你在功能分支上
git switch fix/your-change-name

# 把 upstream/main 合并到当前功能分支，解决潜在冲突
git merge upstream/main

# 解决冲突并完成后，推送更新到你的 Fork 分支
git push
```

---

## 13. PR 合并后清理分支

PR 合并后，建议清理本地和远端分支，保持仓库整洁。

```bash
# 切回主分支
git switch main

# 更新本地主分支到最新（从 upstream）
git fetch upstream
git merge --ff-only upstream/main

# 删除本地已完成的功能分支
git branch -d fix/your-change-name

# 删除你 Fork 上对应的远端分支
git push origin --delete fix/your-change-name
```

---

## 14. 一套最小可用命令清单（速查）

```bash
# 1) Fork（命令行）
gh repo fork OWNER/REPO --clone=false

# 2) Clone 你的 Fork
git clone https://github.com/YOUR_NAME/REPO.git
cd REPO

# 3) 添加 upstream
git remote add upstream https://github.com/OWNER/REPO.git

# 4) 同步主分支
git fetch upstream
git switch main
git merge --ff-only upstream/main

# 5) 新建分支并开发
git switch -c fix/your-change-name

# 6) 测试 + 提交
git add .
git commit -m "fix: your message"

# 7) 推送到你的 Fork
git push -u origin fix/your-change-name

# 8) 创建 PR
gh pr create --repo OWNER/REPO --base main --head YOUR_NAME:fix/your-change-name
```

---

## 15. 新手最容易踩的坑

1. **直接在 `main` 开发**：应始终新建分支。
2. **没配置 `upstream`**：后续很难同步官方更新。
3. **PR 方向选错**：必须是 `你的分支 -> 官方仓库主分支`。
4. **不先本地测试就提 PR**：容易被要求返工。
5. **commit 信息太随意**：评审看不懂你改动目的。

---

如果你愿意，我还可以再给你一份“可直接复制粘贴”的版本：把 `OWNER/REPO`、`YOUR_NAME` 和分支名替换成变量模板，一条条跟着执行就能完成第一次 PR。
