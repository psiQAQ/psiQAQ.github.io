# UV 指南

`uv` 是 Astral 推出的 Python 工具链，可统一管理 Python 版本、虚拟环境和项目依赖，也适合直接运行项目命令。这篇文档按“安装与 Shell 配置 -> 镜像源配置 -> 基础项目创建 -> 常用命令速查”的顺序展开。

## 与 `Miniforge` 的关系和区别

`uv` 和 `Miniforge` 都属于 Python 环境管理与包管理工具（或称为 Python 工具链 / 开发基础设施）。

| 工具 | 所属类别 | 核心作用 |
| --- | --- | --- |
| **uv** | **包管理器 + 虚拟环境管理器** | 替代 `pip` + `virtualenv`，同时覆盖 `poetry`/`pdm` 的项目管理功能，用 Rust 编写，速度极快 |
| **miniforge** | **Python 发行版（Distribution）** | `conda` 的轻量级社区发行版，内含 `conda` 环境/包管理器，默认使用 `conda-forge` 软件源 |

如果把 Python 开发比作做菜：
- uv 类似于一个极速的食材采购+配菜系统——你告诉它需要什么包，它飞速下载并整理好，还能自动创建隔离的"厨房"（虚拟环境）。
- miniforge 类似于一个精简版厨房套装——它不仅自带了采购系统（conda），还自带了 Python 本体，并且默认从社区仓库（conda-forge）取货。

## 安装与 Shell 配置

### windows 安装 uv

```bash
# windows 安装 uv
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
# 新开窗口测试
uv --version
```

（可选）启用 powershell 自动补全

```powershell
# ============================================================
# Enable uv PowerShell completion
# 推荐写入 CurrentUserAllHosts：
# 对当前用户的多个 PowerShell Host 更通用
# ============================================================
# 选择 profile 路径
$profilePath = $PROFILE.CurrentUserAllHosts
# 打印实际写入路径，方便检查
Write-Host "Profile path: $profilePath"
# 如果 profile 文件不存在，则创建
if (!(Test-Path -LiteralPath $profilePath)) {
    New-Item -ItemType File -Path $profilePath -Force | Out-Null
}
# uv 的 PowerShell 补全加载命令
$uvCompletionLine = '(& uv generate-shell-completion powershell) | Out-String | Invoke-Expression'
# 检查 profile 中是否已经包含该命令
# -SimpleMatch 表示按普通字符串查找，不按通配符或正则解析
# -Quiet 表示只返回 True / False，不输出匹配内容
if (!(Select-String -LiteralPath $profilePath -SimpleMatch $uvCompletionLine -Quiet -ErrorAction SilentlyContinue)) {
    Add-Content -LiteralPath $profilePath -Value ""
    Add-Content -LiteralPath $profilePath -Value "# uv PowerShell completion"
    Add-Content -LiteralPath $profilePath -Value $uvCompletionLine
}
# 显示写入后的 profile 内容
Get-Content -LiteralPath $profilePath -Raw
# 用记事本打开，方便人工检查
notepad $profilePath
```

### Linux/WSL/MacOS 安装 uv

```bash
# Linux/WSL/MacOS 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Linux/WSL 启用 bash 自动补全
echo 'eval "$(uv generate-shell-completion bash)"' >> ~/.bashrc
source ~/.bashrc

# macOS 默认使用 zsh，启用 zsh 自动补全
echo 'eval "$(uv generate-shell-completion zsh)"' >> ~/.zshrc
source ~/.zshrc

# 验证安装
uv --version
```

## 镜像源配置

### Python 本体安装源配置

```bash
# Windows CMD：当前用户永久设置
setx UV_PYTHON_INSTALL_MIRROR "https://mirror.nju.edu.cn/github-release/astral-sh/python-build-standalone"

# Linux / WSL：写入 Bash 全局用户环境
cat >> ~/.bashrc <<'EOF'

# uv Python 下载镜像：NJU
export UV_PYTHON_INSTALL_MIRROR="https://mirror.nju.edu.cn/github-release/astral-sh/python-build-standalone"
EOF

# MacOS：Bash 环境
cat >> ~/.bash_profile <<'EOF'

# uv Python 下载镜像：NJU
export UV_PYTHON_INSTALL_MIRROR="https://mirror.nju.edu.cn/github-release/astral-sh/python-build-standalone"
EOF

# 新开窗口测试
uv python install 3.11 -v

# 看到以下内容即表示配置成功：
DEBUG Downloading https://mirror.nju.edu.cn/github-release/astral-sh/python-build-standalone/....
```

### python 包安装源配置

```bash
# Window CMD：当前用户永久设置
# 配置文件路径：C:\Users\<用户名>\AppData\Roaming\uv\uv.toml
mkdir "%APPDATA%\uv" 2>nul
(echo [[index]]& echo url = "https://pypi.tuna.tsinghua.edu.cn/simple"& echo default = true) > "%APPDATA%\uv\uv.toml"
# 验证成功写入
type "%APPDATA%\uv\uv.toml"

# Linux / WSL / MacOS
# 配置文件路径：`~/.config/uv/uv.toml`
mkdir -p ~/.config/uv
cat > ~/.config/uv/uv.toml <<'EOF'
[[index]]
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
default = true
EOF
# 验证成功写入
cat ~/.config/uv/uv.toml
```

> 常用镜像
> 清华大学：`https://pypi.tuna.tsinghua.edu.cn/simple`
> 阿里云：`https://mirrors.aliyun.com/pypi/simple`
> 腾讯云：`https://mirrors.cloud.tencent.com/pypi/simple`
> 豆瓣：`https://pypi.doubanio.com/simple`
> 中科大：`https://pypi.mirrors.ustc.edu.cn/simple`

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
