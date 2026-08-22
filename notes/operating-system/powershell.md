# PowerShell 7：Windows Agent 终端优化

在 Windows 上使用终端型 Agent 时，建议优先使用 PowerShell 7（命令为 `pwsh`），而不是系统自带的 Windows PowerShell 5.1（命令为 `powershell`）。它们可并行安装，不会覆盖旧版；遇到依赖旧模块的脚本时，仍可随时回到 5.1。

PowerShell 7 适合 Claude Code、Codex、OpenCode 等需要频繁执行命令的 Agent，也适合日常开发终端。

## 为什么值得升级

| 项目 | Windows PowerShell 5.1 | PowerShell 7 |
| --- | --- | --- |
| 运行时 | .NET Framework 4.x | 现代 .NET；版本 7.4 基于 .NET 8，后续版本会随 .NET 更新 |
| 平台 | 仅 Windows | Windows、macOS、Linux |
| 命令体验 | 较旧的默认交互体验 | 可使用 PSReadLine 历史预测补全 |
| 文本输出 | 各 cmdlet 默认编码并不一致 | 默认以 `utf8NoBOM` 输出文本 |
| 安装关系 | 系统自带 | 与 5.1 并存，不替换 5.1 |

这不能保证每台机器的启动或命令执行都达到固定倍数提升；实际速度取决于配置文件、模块加载、磁盘和安全软件。对 Agent 而言，更直接的收益是减少终端编码和补全摩擦，降低因命令重试、乱码排查带来的额外上下文与操作成本。

> PowerShell 7 的 UTF-8 默认输出能避免许多 5.1 的编码陷阱，但外部程序、旧脚本或已有文件仍可能使用其他编码。遇到问题时，应检查该命令、文件与外部程序三端的编码设置。

## 安装 PowerShell 7

1. 打开 Windows PowerShell：在开始菜单搜索 `PowerShell`，或按 `Win + R` 后输入 `powershell`。
2. 执行安装命令：

```powershell
winget install --id Microsoft.PowerShell --source winget
```

3. 关闭并重新打开终端，执行下面的命令启动新版：

```powershell
pwsh
```

4. 验证当前会话版本：

```powershell
$PSVersionTable.PSVersion.ToString()
```

输出 `7.x` 即表示当前正在使用 PowerShell 7。

若 `winget` 不可用，请查看文末“Windows 10 的 WinGet 问题”附录；也可直接按 [PowerShell 官方安装文档](https://learn.microsoft.com/powershell/scripting/install/install-powershell-on-windows)下载并安装 MSI 或 MSIX 包。

## 推荐完成项：使用 Windows Terminal 作为默认入口

完成 PowerShell 7 安装后，推荐使用 Windows Terminal 作为默认入口。它能集中管理 PowerShell、命令提示符和 WSL 等多个终端配置文件，并通常会自动发现已安装的 PowerShell。

```powershell
winget install --id Microsoft.WindowsTerminal --source winget
```

安装完成后，打开 Windows Terminal，按 `Ctrl + ,` 进入设置：

1. 打开“启动”。
2. 将“默认配置文件”设为 **PowerShell**，不要选 **Windows PowerShell**。
3. 新建标签页后运行 `$PSVersionTable.PSVersion`，确认显示 `7.x`。

## 可选：启用历史预测补全

PowerShell 7.2 及更高版本在支持虚拟终端的环境下可默认启用 PSReadLine 的历史预测。先查看状态：

```powershell
Get-PSReadLineOption | Select-Object PredictionSource, PredictionViewStyle
```

若 `PredictionSource` 为 `None`，可在当前会话启用历史预测：

```powershell
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -PredictionViewStyle InlineView
```

灰色建议出现后按右方向键接受；按 `F2` 可在行内与列表视图间切换。只想让它在当前窗口生效时，不必写入 PowerShell profile。

## 与 5.1 共存时的注意事项

- `powershell` 启动 Windows PowerShell 5.1；`pwsh` 启动 PowerShell 7。给 Agent 配置终端时，确认其启动命令为 `pwsh`。
- 少数仅支持 .NET Framework 的旧模块或企业脚本仍可能需要 5.1；这时单独用 `powershell` 运行即可。
- 脚本涉及中文或跨平台文件时，显式使用 `-Encoding utf8`，并在提交前用目标环境实测读取结果。

## 附录：Windows 10 的 WinGet 问题

### `winget` 找不到命令

如果运行 `winget` 后出现下面的错误，表示当前用户无法从 PATH 解析 Windows Package Manager：

```text
winget: The term 'winget' is not recognized as a name of a cmdlet, function, script file, or executable program.
```

按以下顺序处理：

1. 按 `Win + R`，输入 `winver`，确认 Windows 10 至少为 **1809（内部版本 17763）**。更旧版本不支持 WinGet，应先通过 Windows Update 升级系统；不要从不明来源下载 `winget.exe`。
2. 安装或更新 [App Installer（Microsoft Store）](https://apps.microsoft.com/detail/9nblggh4nns1?hl=en-US&gl=CN)。WinGet 随 App Installer 一起提供，不是独立的 PowerShell 模块。
3. 关闭所有 PowerShell 窗口，再新开一个窗口运行 `winget --version`。

### 已安装 App Installer，仍找不到 `winget`

先检查当前用户的应用执行别名是否存在。`True` 表示 `winget` 已安装，只是标准别名目录未在 PATH 中：

```powershell
$windowsApps = Join-Path $env:LOCALAPPDATA 'Microsoft\WindowsApps'
$wingetAlias = Join-Path $windowsApps 'winget.exe'
Test-Path -LiteralPath $wingetAlias
```

若输出为 `True`，执行下面的幂等命令，永久把该目录追加到**用户变量** `Path`；已有时不会重复添加：

```powershell
$windowsApps = Join-Path $env:LOCALAPPDATA 'Microsoft\WindowsApps'
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$pathEntries = @($userPath -split ';' | Where-Object { $_ })

if ($pathEntries -notcontains $windowsApps) {
    [Environment]::SetEnvironmentVariable(
        'Path',
        (($pathEntries + $windowsApps) -join ';'),
        'User'
    )
}
```

关闭并重新打开 PowerShell（已打开的终端不会自动读取新 PATH），再确认：

```powershell
Get-Command winget
winget --version
```

能显示 `winget.exe` 的命令路径和版本号，即表示配置完成。

若别名不存在，可先重新注册当前用户的 App Installer：

```powershell
Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe
```

然后重新打开终端，从上述“检查别名”步骤继续。若 Microsoft Store 被禁用或企业组策略限制了 App Installer，请联系 IT 管理员；也可从 [WinGet 官方 GitHub Releases](https://github.com/microsoft/winget-cli/releases) 获取最新 `.msixbundle`。

## 参考

- [Microsoft Learn：在 Windows 上安装 PowerShell](https://learn.microsoft.com/powershell/scripting/install/install-powershell-on-windows)
- [Microsoft Learn：从 Windows PowerShell 5.1 迁移到 PowerShell 7](https://learn.microsoft.com/powershell/scripting/whats-new/migrating-from-windows-powershell-51-to-powershell-7)
- [Microsoft Learn：PowerShell 字符编码](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_character_encoding)
- [Microsoft Learn：使用 PSReadLine 预测器](https://learn.microsoft.com/powershell/scripting/learn/shell/using-predictors)
- [Microsoft Learn：Windows Terminal 启动设置](https://learn.microsoft.com/windows/terminal/customize-settings/startup)
