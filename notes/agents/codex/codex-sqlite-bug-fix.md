# Codex `logs_2.sqlite` 高频写盘问题排查与止血方案

## 1. 问题背景

近期 Codex 在流式传输、自动化任务、桌面端、CLI 或 VSCode 插件运行过程中，可能出现异常高频日志写入现象。问题集中表现为：`~/.codex/logs_2.sqlite` 持续写入大量日志，尤其是 `TRACE`、`DEBUG`、`INFO` 等低价值高频日志。

部分用户观察到，日志系统可能以 MB/s 级别持续写入磁盘。即使 `logs_2.sqlite` 文件本身看起来没有明显变大，底层 SQLite WAL 日志、重复 INSERT / DELETE、checkpoint 与文件系统写放大仍可能造成 SSD 累计写入量快速增长。

这个问题不是你“执行 SQL”触发的，而是 Codex 本地进程把诊断日志写入 ~/.codex/logs_2.sqlite 时触发。高风险场景是：流式输出、多会话并发、长会话、Desktop app-server、WSL/Windows 跨文件系统、旧 Codex 进程未退出。

目前公开 issue 里没有一个“100% 最小复现脚本”，但已经能归纳出明确的触发条件。一个 issue 明确说没有稳定最小复现，但在真实使用中多次复现：多个 TUI 会话运行数日、部分会话悬挂在 tmux 中、累积足够 Codex 活动后，logs_2.sqlite-wal 可增长到数百 GB。<https://github.com/openai/codex/issues/22444>

一个典型现象是：

```text
TRACE|57273
INFO|31279
DEBUG|16060
WARN|2358
ERROR|53
```

在这个例子中，`TRACE` 日志超过 5 万条，占比超过一半。这说明日志系统不是单纯记录错误，而是在记录大量运行时内部事件，例如网络包、文件监听、运行时状态变化、tokio 任务状态等。

需要注意：

* `logs_2.sqlite` 当前文件大小 ≠ SSD 实际累计写入量。
* SQLite WAL 模式下，即使主数据库文件不大，SSD 仍可能已经发生大量物理写入。
* 删除日志文件只能临时清理空间，不等于解决持续写入问题。
* 本文方案是本地止血 workaround，不代表官方修复。

---

## 2. 目标

本文目标是提供跨系统的本地处理方案，用于：

1. 检查 Codex 日志是否存在异常写入。
2. 安装 SQLite 命令行工具。
3. 使用 SQLite trigger 屏蔽高频日志写入。
4. 使用文件系统权限强制阻断日志写入。
5. 将日志重定向到内存盘或副盘。
6. 给出所有方案的撤回命令。
7. 对比不同方案的优劣与适用场景。

---

## 3. 默认日志路径

| 系统 | 默认路径 |
| ----------- | ------------------------------------ |
| Windows | `%USERPROFILE%\.codex\logs_2.sqlite` |
| Linux / WSL | `~/.codex/logs_2.sqlite` |
| macOS | `~/.codex/logs_2.sqlite` |

建议在操作前关闭：

* Codex CLI
* Codex Desktop
* VSCode Codex 插件
* 其他可能正在调用 Codex 的终端或编辑器

---

## 4. 安装 SQLite

如果要使用 trigger 方案，需要先安装 `sqlite3`。

```bash
# Windows PowerShell
winget install SQLite.SQLite

# macOS
brew install sqlite

# Linux / WSL
sudo apt update
sudo apt install sqlite3 -y

# 检查 sqlite3 是否安装成功
sqlite3 --version
```

如果 Windows 安装后仍提示 `sqlite3` 无法识别，重新打开 PowerShell / CMD。

---

## 5. 检查日志大小与 WAL 文件

```bash
# Windows PowerShell
Get-ChildItem "$env:USERPROFILE\.codex\logs_2.sqlite*"

# Windows CMD
dir "%USERPROFILE%\.codex\logs_2.sqlite*"

# macOS / Linux / WSL
ls -lh ~/.codex/logs_2.sqlite*
```

重点观察是否存在：

```text
logs_2.sqlite
logs_2.sqlite-wal
logs_2.sqlite-shm
```

如果 `-wal` 文件持续变化，说明 SQLite 仍在写入。

---

## 6. 检查日志级别分布

```bash
# Windows PowerShell
sqlite3 "$env:USERPROFILE\.codex\logs_2.sqlite" "SELECT level, COUNT(*) FROM logs GROUP BY level ORDER BY COUNT(*) DESC;"

# Windows CMD
sqlite3 "%USERPROFILE%\.codex\logs_2.sqlite" "SELECT level, COUNT(*) FROM logs GROUP BY level ORDER BY COUNT(*) DESC;"

# macOS / Linux / WSL
sqlite3 ~/.codex/logs_2.sqlite "SELECT level, COUNT(*) FROM logs GROUP BY level ORDER BY COUNT(*) DESC;"
```

如果输出类似：

```text
TRACE|57273
INFO|31279
DEBUG|16060
WARN|2358
ERROR|53
```

说明 `TRACE / DEBUG / INFO` 是主要写入来源，可以考虑屏蔽这些低价值日志。

---

## 7. 检查 SQLite 表结构

使用 trigger 前，先确认数据库中存在 `logs` 表。

```bash
# Windows PowerShell
sqlite3 "$env:USERPROFILE\.codex\logs_2.sqlite" ".tables"

# Windows CMD
sqlite3 "%USERPROFILE%\.codex\logs_2.sqlite" ".tables"

# macOS / Linux / WSL
sqlite3 ~/.codex/logs_2.sqlite ".tables"
```

如果输出里有：

```text
logs
```

说明可以使用 trigger 方案。

如果文件已经被你删成 0 字节空文件，则不会有 `logs` 表。此时可以选择：

* 撤回空文件锁定，让 Codex 重建数据库后再添加 trigger；
* 或直接使用“空文件 + 权限锁写”方案。

---

## 8. 解决方案

### 方案 1：最推荐，屏蔽 TRACE / DEBUG / INFO，保留 WARN / ERROR

这个方案最平衡。它不是完全关闭日志，而是屏蔽最容易造成高频写盘的低等级日志，同时保留警告和错误日志。

#### 1.1 执行命令

```bash
# Windows PowerShell
sqlite3 "$env:USERPROFILE\.codex\logs_2.sqlite" "CREATE TRIGGER IF NOT EXISTS block_noisy_logs BEFORE INSERT ON logs WHEN NEW.level IN ('TRACE','DEBUG','INFO') BEGIN SELECT RAISE(IGNORE); END;"

# Windows CMD
sqlite3 "%USERPROFILE%\.codex\logs_2.sqlite" "CREATE TRIGGER IF NOT EXISTS block_noisy_logs BEFORE INSERT ON logs WHEN NEW.level IN ('TRACE','DEBUG','INFO') BEGIN SELECT RAISE(IGNORE); END;"

# macOS / Linux / WSL
sqlite3 ~/.codex/logs_2.sqlite "CREATE TRIGGER IF NOT EXISTS block_noisy_logs BEFORE INSERT ON logs WHEN NEW.level IN ('TRACE','DEBUG','INFO') BEGIN SELECT RAISE(IGNORE); END;"
```

#### 1.2 撤回命令

```bash
# Windows PowerShell
sqlite3 "$env:USERPROFILE\.codex\logs_2.sqlite" "DROP TRIGGER IF EXISTS block_noisy_logs;"

# Windows CMD
sqlite3 "%USERPROFILE%\.codex\logs_2.sqlite" "DROP TRIGGER IF EXISTS block_noisy_logs;"

# macOS / Linux / WSL
sqlite3 ~/.codex/logs_2.sqlite "DROP TRIGGER IF EXISTS block_noisy_logs;"
```

#### 1.3 验证

再次查看日志等级数量：

```bash
# Windows PowerShell
sqlite3 "$env:USERPROFILE\.codex\logs_2.sqlite" "SELECT level, COUNT(*) FROM logs GROUP BY level ORDER BY COUNT(*) DESC;"

# Windows CMD
sqlite3 "%USERPROFILE%\.codex\logs_2.sqlite" "SELECT level, COUNT(*) FROM logs GROUP BY level ORDER BY COUNT(*) DESC;"

# macOS / Linux / WSL
sqlite3 ~/.codex/logs_2.sqlite "SELECT level, COUNT(*) FROM logs GROUP BY level ORDER BY COUNT(*) DESC;"
```

理论上后续 `TRACE / DEBUG / INFO` 不应继续快速增加。

---

### 方案 2：更暴力，屏蔽所有日志 INSERT

这个方案会让 `logs` 表完全拒绝新增日志。它适合只想快速止血、不需要任何 Codex 本地诊断日志的情况。

#### 2.1 执行命令

```bash
# Windows PowerShell
sqlite3 "$env:USERPROFILE\.codex\logs_2.sqlite" "CREATE TRIGGER IF NOT EXISTS block_log_inserts BEFORE INSERT ON logs BEGIN SELECT RAISE(IGNORE); END;"

# Windows CMD
sqlite3 "%USERPROFILE%\.codex\logs_2.sqlite" "CREATE TRIGGER IF NOT EXISTS block_log_inserts BEFORE INSERT ON logs BEGIN SELECT RAISE(IGNORE); END;"

# macOS / Linux / WSL
sqlite3 ~/.codex/logs_2.sqlite "CREATE TRIGGER IF NOT EXISTS block_log_inserts BEFORE INSERT ON logs BEGIN SELECT RAISE(IGNORE); END;"
```

## 2.2 撤回命令

```bash
# Windows PowerShell
sqlite3 "$env:USERPROFILE\.codex\logs_2.sqlite" "DROP TRIGGER IF EXISTS block_log_inserts;"

# Windows CMD
sqlite3 "%USERPROFILE%\.codex\logs_2.sqlite" "DROP TRIGGER IF EXISTS block_log_inserts;"

# macOS / Linux / WSL
sqlite3 ~/.codex/logs_2.sqlite "DROP TRIGGER IF EXISTS block_log_inserts;"
```

---

### 方案 3：强制止血，创建 0 字节空文件并禁止写入

这个方案不依赖 SQLite 表结构。它的思路是：删除原日志库与 WAL 文件，创建一个 0 字节同名文件，然后通过文件系统权限让 Codex 无法写入。

适合：

* `logs_2.sqlite` 已经不是有效 SQLite 数据库；
* 不想安装 sqlite3；
* trigger 方案失败；
* 需要立即硬阻断写盘。

#### 3.1 执行命令

```bash
# Windows PowerShell
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite-wal" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite-shm" -Force -ErrorAction SilentlyContinue
New-Item "$env:USERPROFILE\.codex\logs_2.sqlite" -ItemType File -Force
attrib +R "$env:USERPROFILE\.codex\logs_2.sqlite"
icacls "$env:USERPROFILE\.codex\logs_2.sqlite" /deny "$($env:USERNAME):(W,M)"

# Windows CMD
del "%USERPROFILE%\.codex\logs_2.sqlite" /F /Q
del "%USERPROFILE%\.codex\logs_2.sqlite-wal" /F /Q
del "%USERPROFILE%\.codex\logs_2.sqlite-shm" /F /Q
type nul > "%USERPROFILE%\.codex\logs_2.sqlite"
attrib +R "%USERPROFILE%\.codex\logs_2.sqlite"
icacls "%USERPROFILE%\.codex\logs_2.sqlite" /deny "%USERNAME%:(W,M)"

# Linux / WSL
rm -f ~/.codex/logs_2.sqlite ~/.codex/logs_2.sqlite-wal ~/.codex/logs_2.sqlite-shm
touch ~/.codex/logs_2.sqlite
chmod a-w ~/.codex/logs_2.sqlite
sudo chattr +i ~/.codex/logs_2.sqlite

# macOS
rm -f ~/.codex/logs_2.sqlite ~/.codex/logs_2.sqlite-wal ~/.codex/logs_2.sqlite-shm
touch ~/.codex/logs_2.sqlite
chmod a-w ~/.codex/logs_2.sqlite
chflags uchg ~/.codex/logs_2.sqlite
```

说明：

* Windows 的 `attrib +R` 是只读属性。
* Windows 的 `icacls /deny` 是更强的 NTFS 权限拒写。
* Linux 的 `chattr +i` 是不可变属性，强度高于普通 `chmod`。
* macOS 的 `chflags uchg` 是用户不可变标志。

## 3.2 撤回命令

```bash
# Windows PowerShell
icacls "$env:USERPROFILE\.codex\logs_2.sqlite" /remove:d "$env:USERNAME"
attrib -R "$env:USERPROFILE\.codex\logs_2.sqlite"
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite" -Force

# Windows CMD
icacls "%USERPROFILE%\.codex\logs_2.sqlite" /remove:d "%USERNAME%"
attrib -R "%USERPROFILE%\.codex\logs_2.sqlite"
del "%USERPROFILE%\.codex\logs_2.sqlite" /F /Q

# Linux / WSL
sudo chattr -i ~/.codex/logs_2.sqlite 2>/dev/null
chmod u+w ~/.codex/logs_2.sqlite
rm -f ~/.codex/logs_2.sqlite

# macOS
chflags nouchg ~/.codex/logs_2.sqlite
chmod u+w ~/.codex/logs_2.sqlite
rm -f ~/.codex/logs_2.sqlite
```

---

### 方案 4：将日志重定向到 RAM disk / tmpfs

这个方案不是禁止 Codex 写日志，而是让它写到内存里，避免写 SSD。

适合：

* 想让 Codex 尽量保持原行为；
* 不想 SSD 持续写入；
* 能接受日志重启后消失。

#### 4.1 Windows 说明

Windows 原生没有统一的临时 RAM disk 命令。需要先用第三方工具创建 RAM disk，例如：

* ImDisk
* SoftPerfect RAM Disk
* AMD Radeon RAMDisk

假设 RAM disk 盘符是：

```text
R:
```

#### 4.2 执行命令

注意：Windows 中 `mklink` 是 CMD 内置命令，不是 PowerShell 命令。PowerShell 要用 `New-Item -ItemType SymbolicLink`。

```bash
# Windows PowerShell，假设 RAM disk 是 R:
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite-wal" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite-shm" -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory "R:\codex_logs" -Force
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.codex\logs_2.sqlite" -Target "R:\codex_logs\logs_2.sqlite"

# Windows CMD，假设 RAM disk 是 R:
del "%USERPROFILE%\.codex\logs_2.sqlite" /F /Q
del "%USERPROFILE%\.codex\logs_2.sqlite-wal" /F /Q
del "%USERPROFILE%\.codex\logs_2.sqlite-shm" /F /Q
mkdir "R:\codex_logs"
mklink "%USERPROFILE%\.codex\logs_2.sqlite" "R:\codex_logs\logs_2.sqlite"

# Linux / WSL，使用 /dev/shm
rm -f ~/.codex/logs_2.sqlite ~/.codex/logs_2.sqlite-wal ~/.codex/logs_2.sqlite-shm
mkdir -p /dev/shm/codex_logs
ln -s /dev/shm/codex_logs/logs_2.sqlite ~/.codex/logs_2.sqlite

# macOS，创建 256MB RAM disk
diskutil erasevolume HFS+ "CodexRAM" $(hdiutil attach -nomount ram://524288)
rm -f ~/.codex/logs_2.sqlite ~/.codex/logs_2.sqlite-wal ~/.codex/logs_2.sqlite-shm
mkdir -p /Volumes/CodexRAM/codex_logs
ln -s /Volumes/CodexRAM/codex_logs/logs_2.sqlite ~/.codex/logs_2.sqlite
```

注意：

* Windows 文件软链接用 `mklink`，不要加 `/J`。
* `mklink /J` 是目录联接，不适合把 `logs_2.sqlite` 这个文件路径伪装成目录。
* 如果系统不允许创建软链接，Windows 可以开启“开发者模式”，或用管理员权限运行终端。

#### 4.3 撤回命令

```bash
# Windows PowerShell
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite" -Force

# Windows CMD
del "%USERPROFILE%\.codex\logs_2.sqlite" /F /Q

# Linux / WSL
rm -f ~/.codex/logs_2.sqlite
rm -rf /dev/shm/codex_logs

# macOS
rm -f ~/.codex/logs_2.sqlite
diskutil eject /Volumes/CodexRAM
```

---

### 方案 5：移动到第二块硬盘或机械硬盘

这个方案不是减少写入，只是把写入从主 SSD 转移到其他盘。适合保护系统盘。

假设：

* Windows 目标目录：`D:\codex_logs`
* Linux 目标目录：`/mnt/hdd/codex_logs`
* macOS 目标目录：`/Volumes/HDD/codex_logs`

## 5.1 执行命令

```bash
# Windows PowerShell
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite-wal" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite-shm" -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory "D:\codex_logs" -Force
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.codex\logs_2.sqlite" -Target "D:\codex_logs\logs_2.sqlite"

# Windows CMD
del "%USERPROFILE%\.codex\logs_2.sqlite" /F /Q
del "%USERPROFILE%\.codex\logs_2.sqlite-wal" /F /Q
del "%USERPROFILE%\.codex\logs_2.sqlite-shm" /F /Q
mkdir "D:\codex_logs"
mklink "%USERPROFILE%\.codex\logs_2.sqlite" "D:\codex_logs\logs_2.sqlite"

# Linux / WSL
rm -f ~/.codex/logs_2.sqlite ~/.codex/logs_2.sqlite-wal ~/.codex/logs_2.sqlite-shm
mkdir -p /mnt/hdd/codex_logs
ln -s /mnt/hdd/codex_logs/logs_2.sqlite ~/.codex/logs_2.sqlite

# macOS
rm -f ~/.codex/logs_2.sqlite ~/.codex/logs_2.sqlite-wal ~/.codex/logs_2.sqlite-shm
mkdir -p /Volumes/HDD/codex_logs
ln -s /Volumes/HDD/codex_logs/logs_2.sqlite ~/.codex/logs_2.sqlite
```

## 5.2 撤回命令

```bash
# Windows PowerShell
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite" -Force

# Windows CMD
del "%USERPROFILE%\.codex\logs_2.sqlite" /F /Q

# Linux / WSL
rm -f ~/.codex/logs_2.sqlite

# macOS
rm -f ~/.codex/logs_2.sqlite
```

---

### 方案 6：只读属性 / 去掉写权限

这是轻量方案，执行简单，但阻断强度不如 ACL、`chattr`、`chflags`。

#### 6.1 执行命令

```bash
# Windows PowerShell
attrib +R "$env:USERPROFILE\.codex\logs_2.sqlite"

# Windows CMD
attrib +R "%USERPROFILE%\.codex\logs_2.sqlite"

# Linux / WSL
chmod a-w ~/.codex/logs_2.sqlite

# macOS
chmod a-w ~/.codex/logs_2.sqlite
```

#### 6.2 撤回命令

```bash
# Windows PowerShell
attrib -R "$env:USERPROFILE\.codex\logs_2.sqlite"

# Windows CMD
attrib -R "%USERPROFILE%\.codex\logs_2.sqlite"

# Linux / WSL
chmod u+w ~/.codex/logs_2.sqlite

# macOS
chmod u+w ~/.codex/logs_2.sqlite
```

---

### 方案 7：目录级封锁 `.codex`

这个方案非常强，但副作用也最大。它可能导致 Codex 无法写配置、缓存、状态、会话相关文件。因此只建议紧急止血，不建议长期使用。

#### 7.1 执行命令

```bash
# Windows PowerShell
icacls "$env:USERPROFILE\.codex" /deny "$($env:USERNAME):(W,M)"

# Windows CMD
icacls "%USERPROFILE%\.codex" /deny "%USERNAME%:(W,M)"

# Linux / WSL
chmod a-w ~/.codex
sudo chattr +i ~/.codex

# macOS
chmod a-w ~/.codex
chflags uchg ~/.codex
```

#### 7.2 撤回命令

```bash
# Windows PowerShell
icacls "$env:USERPROFILE\.codex" /remove:d "$env:USERNAME"

# Windows CMD
icacls "%USERPROFILE%\.codex" /remove:d "%USERNAME%"

# Linux / WSL
sudo chattr -i ~/.codex 2>/dev/null
chmod u+w ~/.codex

# macOS
chflags nouchg ~/.codex
chmod u+w ~/.codex
```

---

### 方案 8：仅删除日志文件

这是临时清理空间，不是根治方案。Codex 可能很快重新创建日志文件。

#### 8.1 执行命令

```bash
# Windows PowerShell
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite-wal" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite-shm" -Force -ErrorAction SilentlyContinue

# Windows CMD
del "%USERPROFILE%\.codex\logs_2.sqlite" /F /Q
del "%USERPROFILE%\.codex\logs_2.sqlite-wal" /F /Q
del "%USERPROFILE%\.codex\logs_2.sqlite-shm" /F /Q

# macOS / Linux / WSL
rm -f ~/.codex/logs_2.sqlite ~/.codex/logs_2.sqlite-wal ~/.codex/logs_2.sqlite-shm
```

### 8.2 撤回命令

无严格撤回命令。重新启动 Codex 后通常会自动重建。

---

## 16. 如果误创建了 Windows Junction，如何取消

如果之前执行过类似命令：

```cmd
mklink /J "%USERPROFILE%\.codex\logs_2.sqlite" "C:\temp\codex_logs"
```

这会把 `logs_2.sqlite` 变成目录联接。这个用法不推荐，因为 `logs_2.sqlite` 本应是文件路径。

取消 Junction 要用 CMD 的 `rmdir`，不要用 `del`。

```bash
# Windows CMD
rmdir "%USERPROFILE%\.codex\logs_2.sqlite"
```

然后可以重新执行“空文件 + 权限锁写”方案。

---

## 17. 验证是否锁写成功

### 17.1 查看文件状态

```bash
# Windows PowerShell
Get-Item "$env:USERPROFILE\.codex\logs_2.sqlite" | Format-List *

# Windows CMD
dir "%USERPROFILE%\.codex\logs_2.sqlite"

# Linux / WSL
ls -l ~/.codex/logs_2.sqlite
lsattr ~/.codex/logs_2.sqlite 2>/dev/null

# macOS
ls -lO ~/.codex/logs_2.sqlite
```

Windows 如果看到类似：

```text
-ar---  0 logs_2.sqlite
```

说明文件是只读的 0 字节文件。

### 17.2 测试是否能写入

```bash
# Windows PowerShell
echo test >> "$env:USERPROFILE\.codex\logs_2.sqlite"

# Windows CMD
echo test >> "%USERPROFILE%\.codex\logs_2.sqlite"

# Linux / WSL
echo test >> ~/.codex/logs_2.sqlite

# macOS
echo test >> ~/.codex/logs_2.sqlite
```

如果锁定成功，应出现类似：

```text
Access is denied
Permission denied
Operation not permitted
```

---

## 18. 方法优劣对比

| 排名 | 方法 | 推荐度 | 优点 | 缺点 | 适合场景 |
| -: | -------------------------------------- | --- | -------------------------------- | --------------------------- | ------------------------ |
| 1 | SQLite trigger 屏蔽 TRACE / DEBUG / INFO | 最高 | 精准、可撤回、保留 WARN/ERROR、对 Codex 破坏小 | 需要 SQLite 文件有效且存在 `logs` 表 | 长期止血的首选方案 |
| 2 | SQLite trigger 屏蔽全部 INSERT | 很高 | 写入几乎归零、容易撤回、命令简单 | ERROR/WARN 也不保留 | 不需要本地日志，只想快速止血 |
| 3 | 空文件 + 只读 + ACL/chattr/chflags 锁写 | 高 | 不依赖数据库结构，阻断强 | Codex 可能报错或反复重试 | 数据库已损坏、无 `logs` 表、需要强制阻断 |
| 4 | RAM disk / tmpfs 重定向 | 高 | 不写 SSD，Codex 日志行为基本保留 | Windows 需额外 RAM disk；重启日志消失 | 想保留日志功能但不想写 SSD |
| 5 | 移动到副盘 / 机械盘 | 中 | 保护主 SSD，Codex 行为基本不变 | 仍然高频写盘，只是换地方磨损 | 有机械盘或不重要副盘 |
| 6 | 只读属性 / chmod 去写权限 | 中低 | 简单、快速 | 阻断不彻底，可能被覆盖或绕过 | 临时止血 |
| 7 | 目录级封锁 `.codex` | 低 | 阻断强 | 副作用极大，可能影响 Codex 配置和状态 | 紧急止血，不建议长期 |
| 8 | 仅删除日志文件 | 最低 | 快速释放空间 | Codex 可能马上重建，不能解决持续写入 | 临时清理 |

---

## 19. 推荐执行顺序

如果你只想要最稳妥的处理流程，按下面顺序判断：

1. 先检查 `logs` 表是否存在。
2. 如果存在 `logs` 表，优先使用“方案 1：屏蔽 TRACE / DEBUG / INFO”。
3. 如果完全不需要日志，使用“方案 2：屏蔽全部 INSERT”。
4. 如果 `logs_2.sqlite` 已经被删成 0 字节，或者 trigger 无法执行，使用“方案 3：空文件 + 权限锁写”。
5. 如果想保留日志但不想写 SSD，使用“方案 4：RAM disk / tmpfs 重定向”。
6. 不建议长期使用目录级封锁 `.codex`，除非只是紧急止血。

---

## 20. 最小推荐命令

如果数据库仍然有效，最推荐只执行这一条：

```bash
# Windows PowerShell
sqlite3 "$env:USERPROFILE\.codex\logs_2.sqlite" "CREATE TRIGGER IF NOT EXISTS block_noisy_logs BEFORE INSERT ON logs WHEN NEW.level IN ('TRACE','DEBUG','INFO') BEGIN SELECT RAISE(IGNORE); END;"

# Windows CMD
sqlite3 "%USERPROFILE%\.codex\logs_2.sqlite" "CREATE TRIGGER IF NOT EXISTS block_noisy_logs BEFORE INSERT ON logs WHEN NEW.level IN ('TRACE','DEBUG','INFO') BEGIN SELECT RAISE(IGNORE); END;"

# macOS / Linux / WSL
sqlite3 ~/.codex/logs_2.sqlite "CREATE TRIGGER IF NOT EXISTS block_noisy_logs BEFORE INSERT ON logs WHEN NEW.level IN ('TRACE','DEBUG','INFO') BEGIN SELECT RAISE(IGNORE); END;"
```

如果数据库已经无效，最推荐使用强制锁写：

```bash
# Windows PowerShell
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite-wal" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.codex\logs_2.sqlite-shm" -Force -ErrorAction SilentlyContinue
New-Item "$env:USERPROFILE\.codex\logs_2.sqlite" -ItemType File -Force
attrib +R "$env:USERPROFILE\.codex\logs_2.sqlite"
icacls "$env:USERPROFILE\.codex\logs_2.sqlite" /deny "$($env:USERNAME):(W,M)"

# Windows CMD
del "%USERPROFILE%\.codex\logs_2.sqlite" /F /Q
del "%USERPROFILE%\.codex\logs_2.sqlite-wal" /F /Q
del "%USERPROFILE%\.codex\logs_2.sqlite-shm" /F /Q
type nul > "%USERPROFILE%\.codex\logs_2.sqlite"
attrib +R "%USERPROFILE%\.codex\logs_2.sqlite"
icacls "%USERPROFILE%\.codex\logs_2.sqlite" /deny "%USERNAME%:(W,M)"

# Linux / WSL
rm -f ~/.codex/logs_2.sqlite ~/.codex/logs_2.sqlite-wal ~/.codex/logs_2.sqlite-shm
touch ~/.codex/logs_2.sqlite
chmod a-w ~/.codex/logs_2.sqlite
sudo chattr +i ~/.codex/logs_2.sqlite

# macOS
rm -f ~/.codex/logs_2.sqlite ~/.codex/logs_2.sqlite-wal ~/.codex/logs_2.sqlite-shm
touch ~/.codex/logs_2.sqlite
chmod a-w ~/.codex/logs_2.sqlite
chflags uchg ~/.codex/logs_2.sqlite
```
