# claude-tap

`claude-tap` 是把多种 Agent CLI 输出接到浏览器查看器或可视化界面的工具，便于观察会话和交互过程。这篇文档先给出项目地址和安装方式，再列不同 CLI 的启动示例，最后补推荐快捷启动方式。

## 项目地址

<https://github.com/liaohch3/claude-tap>

## 安装

```bash
uv tool install claude-tap
```

## 使用方法

```bash
# Claude Code
claude-tap

# Claude Code with live browser viewer
claude-tap --tap-live
claude-tap --tap-live -- --dangerously-skip-permissions

# Codex CLI
claude-tap --tap-client codex

# Gemini CLI
claude-tap --tap-client gemini -- -p "hello"

# Kimi CLI
claude-tap --tap-client kimi

# Pi
claude-tap --tap-client pi -- --model openai-codex/gpt-5.3-codex-spark -p "hello"

# Cursor CLI
claude-tap --tap-client cursor -- -p --trust --model auto "hello"
```

## 推荐快捷启动方式

```bat
@echo off
chcp 65001 >nul

REM 进入 bat 所在目录，避免 xxx.py 相对路径错误
cd /d "%~dp0\ccworkspace"

REM 加载 conda 的 cmd 初始化脚本
CALL claude-tap --tap-live -- --dangerously-skip-permissions

REM 保留窗口，方便查看报错
pause
```
