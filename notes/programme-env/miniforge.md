# Miniforge 指南

Miniforge 是轻量的 Conda 发行版，内置 `conda` 和 `mamba`，适合管理隔离 Python 环境和科学计算依赖；这篇文档依次覆盖下载安装、环境变量、命令行初始化、镜像配置和基础项目创建。

## 与 `uv` 的关系和区别

`uv` 和 `Miniforge` 都属于 Python 环境管理与包管理工具（或称为 Python 工具链 / 开发基础设施）。

| 工具 | 所属类别 | 核心作用 |
| --- | --- | --- |
| **uv** | **包管理器 + 虚拟环境管理器** | 替代 `pip` + `virtualenv`，同时覆盖 `poetry`/`pdm` 的项目管理功能，用 Rust 编写，速度极快 |
| **miniforge** | **Python 发行版（Distribution）** | `conda` 的轻量级社区发行版，内含 `conda` 环境/包管理器，默认使用 `conda-forge` 软件源 |

如果把 Python 开发比作做菜：
- uv 类似于一个极速的食材采购+配菜系统——你告诉它需要什么包，它飞速下载并整理好，还能自动创建隔离的"厨房"（虚拟环境）。
- miniforge 类似于一个精简版厨房套装——它不仅自带了采购系统（conda），还自带了 Python 本体，并且默认从社区仓库（conda-forge）取货。

## Windows 安装 Miniforge

下载地址：**清华大学镜像站** (国内推荐)：
<https://mirrors.tuna.tsinghua.edu.cn/github-release/conda-forge/miniforge/LatestRelease/>

点击下载目前最新版本，例如 `Miniforge3-Windows-x86_64.exe`

### 安装建议

1. **安装位置**：C盘空间紧张时，建议自定义路径，避免空格，例如 `D:\ProgramData\miniforge3`
2. **安装选项**：建议选择 "Install for All Users"（这通常需要管理员权限），方便统一管理
3. **环境变量**：安装向导中不要勾选 "Add Miniforge3 to my PATH environment variable"（推荐后续手动配置，更安全）

### 手动配置环境变量

**假设安装路径为**：`D:\ProgramData\miniforge3`

```bash
# 写入用户变量
setx Path "%Path%;D:\ProgramData\miniforge3;D:\ProgramData\miniforge3\Scripts;D:\ProgramData\miniforge3\Library\bin"

# 重新打开 CMD 后测试
mamba --version
mamba info --help
```

### 初始化命令行配置

```bash
# CMD 中执行 mamba 初始化
mamba shell init --shell cmd.exe
```

```powershell
# PowerShell 中执行 mamba 初始化，注意：`--root-prefix` 需要修改为实际安装路径
mamba shell init --shell powershell --root-prefix "D:\ProgramData\miniforge3"
```

## Linux/WSL 安装 Miniforge

```bash
wget https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Linux-x86_64.sh
# 或者使用镜像
wget https://mirrors-i.tuna.tsinghua.edu.cn/github-release/conda-forge/miniforge/LatestRelease/Miniforge3-Linux-x86_64.sh
# 安装
bash Miniforge3-Linux-x86_64.sh
source ~/.bashrc
```

## MacOS 安装 Miniforge

```bash
# Apple Silicon 下载
wget https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-MacOSX-arm64.sh
# Intel 芯片下载
wget https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-MacOSX-x86_64.sh
# 或者使用镜像
# Apple Silicon 下载
wget https://mirrors-i.tuna.tsinghua.edu.cn/github-release/conda-forge/miniforge/LatestRelease/Miniforge3-MacOSX-arm64.sh
# Intel 芯片下载
wget https://mirrors-i.tuna.tsinghua.edu.cn/github-release/conda-forge/miniforge/LatestRelease/Miniforge3-MacOSX-x86_64.sh
# 安装
bash Miniforge3-MacOSX-*.sh
source ~/.bashrc
```

## 配置镜像

**添加清华镜像站配置**：：

```bash
# Windows 用记事本打开 `C:\Users\用户名\.condarc` 文件，初次打开文件不存在，点“是”进行创建
notepad "%USERPROFILE%\.condarc"
# MacOS/Linux/WSL 用 nano 打开 `~/.condarc` 文件
nano ~/.condarc
```

粘贴以下内容
> 注意：`pkgs_dirs` 和 `envs_dirs` 的路径需要根据实际安装路径修改，可以参考：
> Windows 使用 `D:\ProgramData\miniforge3\pkgs\` 和 `D:\ProgramData\miniforge3\envs\`
> MacOS 使用 `/Users/用户名/miniforge3/pkgs` 和 `/Users/用户名/miniforge3/envs`
> Linux/WSL 使用 `/home/用户名/miniforge3/pkgs` 和 `/home/用户名/miniforge3/envs`

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
```

## 常用安装包推荐

```bash
# 数据分析
mamba install numpy matplotlib scipy pandas openpyxl
# 图像
mamba install opencv pillow imageio
# 音视频处理
mamba install imageio-ffmpeg moviepy
# 机器学习
mamba install scikit-learn xgboost lightgbm catboost
# jupyter
mamba install ipykernel jupyterlab jupyterlabthemes
# 数据库
mamba install sqlite
# 3D
mamba install open3d
# Windows 系统调用
mamba install pywin32
```

## 更多内容

[Windows基于WSL搭建Python数据分析环境](https://mdnice.com/writing/a86bcac055e34f6cba49fed110367268)
