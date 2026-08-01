# UV 指南

`uv` 是 Astral 推出的 Python 工具链，可统一管理 Python 版本、虚拟环境和项目依赖，也适合直接运行项目命令。这篇文档按“安装与 Shell 配置 -> 镜像源配置 -> 基础项目创建 -> 常用命令速查”的顺序展开。

## 1安装与 Shell 配置

### windows 安装 uv

```bash
# windows 安装 uv
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

新开窗口测试

```bash
uv --version
```

## 镜像源配置

### python 安装源配置

```bash
# Windows CMD：当前用户永久设置
setx UV_PYTHON_INSTALL_MIRROR "https://mirror.nju.edu.cn/github-release/astral-sh/python-build-standalone"

# 新开窗口测试
uv python install 3.11 -v

# 看到以下内容即表示配置成功：
DEBUG Downloading https://mirror.nju.edu.cn/github-release/astral-sh/python-build-standalone/....
```

### python 包安装源配置

```bash
# 配置文件路径：C:\Users\<用户名>\AppData\Roaming\uv\uv.toml
mkdir "%APPDATA%\uv" 2>nul
(echo [[index]]& echo url = "https://pypi.tuna.tsinghua.edu.cn/simple"& echo default = true) > "%APPDATA%\uv\uv.toml"

# 验证命令
type "%APPDATA%\uv\uv.toml"
```

## 基础项目创建

> 推荐了解，后期可交由 agent 管理

首次使用，需要安装 Python，例如安装 3.11 版本，执行以下命令：

```bash
uv python install 3.11
```

进入项目目录，执行以下命令：

```bash
# 1) 创建项目
uv init

# 2) 添加依赖（写入 pyproject.toml）
uv add numpy pandas

# 3) 运行代码（自动使用项目环境）
uv run python script.py
```

## 常用命令速查

> 推荐了解，后期可交由 agent 管理

```bash
# 查看当前 uv 可发现的 Python 版本，包括系统 Python、uv 已安装 Python、可下载 Python
uv python list

# 查看 uv 支持安装的所有 Python 版本，包含大量历史版本和变体
uv python list --all-versions

# 只查看当前本机已经安装、可被 uv 使用的 Python 版本
uv python list --only-installed

# 查看 uv 管理的 Python 安装目录，Windows 默认通常在 %APPDATA%\uv\data\python
uv python dir

# 删除 uv 管理的所有 Python 版本；Windows CMD 命令，谨慎执行
rmdir /s /q "%APPDATA%\uv\data\python"
# linux/wsl 版本
rm -rf ~/.local/share/uv/python/

# 安装指定 Python 版本；这里会安装 Python 3.11 和 3.12
uv python install 3.11 3.12

# 在当前项目中固定使用 Python 3.11，会生成或修改 .python-version
uv python pin 3.11

# 查找 Python 3.11 的实际解释器路径；如果本地没有，会提示未找到或按 uv 规则解析
uv python find 3.11

# 添加运行时依赖，并同步修改 pyproject.toml 和 uv.lock
uv add <package>

# 添加开发依赖，通常写入 dependency-groups.dev 或对应开发依赖组
uv add --dev <package>

# 移除指定依赖，并同步修改 pyproject.toml 和 uv.lock
uv remove <package>

# 根据 pyproject.toml 解析依赖并更新 uv.lock；默认不主动升级已有锁定版本
uv lock

# 按 pyproject.toml 和 uv.lock 同步安装依赖到当前项目的 .venv
uv sync

# 查看当前项目依赖树；只读命令，不修改 pyproject.toml、uv.lock 或 .venv
uv tree

# 在 uv 管理的项目环境中运行指定 Python 脚本
uv run python script.py

# 在 uv 管理的项目环境中运行 pytest 测试
uv run pytest

# 将 ruff 安装为全局 uv tool，适合安装独立命令行工具
uv tool install ruff

# 临时运行或调用 uv tool 环境中的 ruff，对当前目录执行代码检查
uv tool run ruff check .

# 在当前目录创建虚拟环境，默认目录通常是 .venv
uv venv

# 使用 Python 3.11 创建虚拟环境；如果本地缺少该版本，uv 可按配置自动下载
uv venv --python 3.11
```
