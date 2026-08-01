# Miniforge 指南

Miniforge 是轻量的 Conda 发行版，内置 `conda` 和 `mamba`，适合管理隔离 Python 环境和科学计算依赖；这篇文档依次覆盖下载安装、环境变量、命令行初始化、镜像配置和基础项目创建。

## 下载 Miniforge

**清华大学镜像站** (国内推荐)：
<https://mirrors.tuna.tsinghua.edu.cn/github-release/conda-forge/miniforge/LatestRelease/>

点击目前最新版本，例如 `Miniforge3-Windows-x86_64.exe`

## 安装建议

1. **安装位置**：C盘空间紧张时，建议自定义路径，避免空格，例如 `D:\ProgramData\miniforge3`
2. **安装选项**：建议选择 "Install for All Users"（这通常需要管理员权限），方便统一管理
3. **环境变量**：安装向导中不要勾选 "Add Miniforge3 to my PATH environment variable"（推荐后续手动配置，更安全）

## 手动配置环境变量

**假设安装路径为**：`D:\ProgramData\miniforge3`

```bash
# 写入用户变量
setx Path "%Path%;D:\ProgramData\miniforge3;D:\ProgramData\miniforge3\Scripts;D:\ProgramData\miniforge3\Library\bin"

# 重新打开 CMD 后测试
mamba --version
mamba info --help
```

## 初始化命令行配置

```bash
# 初始化 CMD
mamba shell init --shell cmd.exe
```

```powershell
# 初始化 PowerShell，注意：`--root-prefix` 需要修改为实际安装路径
mamba shell init --shell powershell --root-prefix "D:\ProgramData\miniforge3"
```

## 配置镜像

**添加清华镜像站配置**：：

```bash
# 用记事本打开 `C:\Users\用户名\.condarc` 文件，初次打开文件不存在，点“是”进行创建
notepad "%USERPROFILE%\.condarc"
```

粘贴以下内容
> 注意：`pkgs_dirs` 和 `envs_dirs` 的路径需要根据实际安装路径修改

```yaml
channel_priority: strict
show_channel_urls: true
auto_activate: false
channels:
- https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge
- https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/msys2
- https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/pytorch

default_channels: []

custom_channels: {}

pkgs_dirs:
- D:\ProgramData\miniforge3\pkgs\

envs_dirs:
- D:\ProgramData\miniforge3\envs\

always_yes: true

repodata_fns:
- repodata.json
repodata_ttl: 86400
```

## 基础项目创建

```bash
# 创建环境 python==3.11
mamba create -n my_base python=3.11
# 激活环境，可复制到~/.bashrc，每次启动终端自动激活
mamba activate my_base
# 安装常用工具
mamba install numpy pandas matplotlib
```
