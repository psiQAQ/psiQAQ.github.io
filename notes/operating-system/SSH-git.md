# Git 远程仓库 SSH 配置（Windows / Linux / macOS）

这篇文档用于在本机生成 SSH 密钥、添加到 GitHub、GitLab 或自建 GitLab，并通过 SSH 克隆、拉取和推送 Git 仓库。适合同时使用命令行和 VS Code 的开发环境；VS Code 使用本机 Git，因此终端中的 SSH 连接正常后，编辑器中的 Git 操作通常也会正常。([VS Code][4])

已熟悉完整流程、需要在新系统快速部署的开发者，可直接使用文末的[附录：GitHub SSH 快速部署命令](#附录github-ssh-快速部署命令)；其中按系统提供从设置变量到认证测试的完整命令块。

以下占位符表格中展示了本文会用到的变量名及其含义。以下示例使用 `ED25519` 密钥。同一台电脑连接多个平台或账户时，应为每个账户/平台使用不同的密钥文件名。

> `ED25519` 是现代椭圆曲线密钥算法，密钥更短、生成和认证更快，且已被 GitHub、GitLab 等主流平台支持，应作为默认选择。RSA 的兼容性更广，仅在目标平台或旧 SSH 服务明确不支持 ED25519 时使用；此时选择至少 4096 位的 RSA。两者不影响后续 Git 工作流；改用 RSA 时只需更新 `KEY_NAME`，再按第 2 节重新生成密钥。

| 占位符名字 | 示例 | 说明 |
| --- | --- | --- |
| `GIT_EMAIL` | `name@example.com` | Git 提交显示邮箱（非登录使用，可匿名） |
| `GIT_USER_NAME` | `Your Name` | Git 提交显示昵称（非登录使用，可匿名） |
| `KEY_NAME` | `id_ed25519_github / id_RSA_xxx` | 私钥文件名，不含 `.pub` |
| `KEY_COMMENT` | `name@example.com / MacBook` | 传给 `ssh-keygen -C` 的公钥注释 |
| `GIT_HOST` | `github.com / gitlab.example.com` | Git 托管平台域名，也是在 remote 中使用的 SSH 主机或别名 |
| `GIT_SSH_HOST` | `github.com / gitlab.example.com` | 实际 SSH 连接主机；通常与 `GIT_HOST` 相同 |
| `SSH_PORT` | `22` | SSH 端口，默认 22，不建议改 |
| `REPOSITORY_PATH` | `owner/project` | 仓库 SSH 路径；GitLab 常为 `group/project` |

复制下方**对应系统**的变量代码块到终端，将示例值替换为实际内容后执行。执行后，后续所有包含账户、密钥、主机、端口或仓库信息的 shell 命令都会直接引用这组临时变量，无需再次手工替换。

1. Windows PowerShell

    ```powershell
    $GIT_EMAIL = "name@example.com"
    $GIT_USER_NAME = "Your Name"
    $KEY_NAME = "id_ed25519_github"
    $KEY_COMMENT = "name@example.com / Windows-PC"
    $GIT_HOST = "github.com"
    $GIT_SSH_HOST = $GIT_HOST
    $SSH_PORT = 22
    $REPOSITORY_PATH = "owner/project"
    $REPOSITORY_NAME = Split-Path -Leaf $REPOSITORY_PATH
    ```

2. Linux / macOS shell

    ```bash
    export GIT_EMAIL="name@example.com"
    export GIT_USER_NAME="Your Name"
    export KEY_NAME="id_ed25519_github"
    export KEY_COMMENT="name@example.com / Linux-or-Mac"
    export GIT_HOST="github.com"
    export GIT_SSH_HOST="$GIT_HOST"
    export SSH_PORT=22
    export REPOSITORY_PATH="owner/project"
    export REPOSITORY_NAME="${REPOSITORY_PATH##*/}"
    ```

> 变量只在当前 shell 会话有效；重新打开终端后需要重新设置。
> 私钥是无 `.pub` 后缀的文件，只能保留在本机；可以上传或分享的是同名 `.pub` 公钥文件。不要把私钥贴到网页、聊天记录、仓库或密码管理器以外的地方。

## 1. 检查并安装 Git 与 OpenSSH

三种系统先在终端执行以下命令；均能显示版本号即可继续。

```bash
git --version
ssh -V
```

### Windows 安装 Git 与 OpenSSH

1. 安装 Git for Windows：
    1. 可执行进行安装：

        ```powershell
        # 已安装 `winget` 时（windows 11 已预装），用 powershell 执行
        winget install --id Git.Git -e --source winget
        ```

    2. 或者自行下载 [Git for Windows](https://mirrors.tuna.tsinghua.edu.cn/github-release/git-for-windows/git/LatestRelease/) 安装包，并按提示完成安装，参考 [Git 指南](../others/git.md)。

2. Windows 10/11 通常已带 OpenSSH Client；若 `ssh -V` 找不到命令，在**管理员 PowerShell** 中安装：

    ```powershell
    Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
    ```

### Linux 安装 Git 与 OpenSSH

Ubuntu / Debian：

```bash
sudo apt update
sudo apt install -y git openssh-client
```

其他发行版请使用其包管理器安装 `git` 与 OpenSSH client 软件包。

### macOS 安装 Git 与 OpenSSH

macOS 自带 OpenSSH。若 `git --version` 提示需要 Command Line Tools，执行下列命令并按弹窗完成安装：

```bash
xcode-select --install
```

## 2. 检查或生成专用密钥

已有可用密钥可以继续使用；不要为了重新配置而覆盖私钥。以下命令会尝试创建 `.ssh` 目录，再列出已有内容、设置权限并生成由 `KEY_NAME` 指定的新密钥。

### Windows 生成专用密钥

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.ssh"
Get-ChildItem "$env:USERPROFILE\.ssh" -Force

# 使用 PowerShell ACL，避免部分系统上 icacls /grant 参数的兼容问题。
function Set-CurrentUserOnlyAcl {
    param([Parameter(Mandatory)][string]$KeyPath)

    $Acl = Get-Acl $KeyPath
    $Acl.SetAccessRuleProtection($true, $false)
    $Acl.Access | ForEach-Object { [void]$Acl.RemoveAccessRule($_) }
    $CurrentUser = [System.Security.Principal.NTAccount]("$env:USERDOMAIN\$env:USERNAME")
    $Rule = New-Object System.Security.AccessControl.FileSystemAccessRule($CurrentUser, "FullControl", "Allow")
    $Acl.SetOwner($CurrentUser)
    $Acl.AddAccessRule($Rule)
    Set-Acl -Path $KeyPath -AclObject $Acl
}

Set-CurrentUserOnlyAcl "$env:USERPROFILE\.ssh"

# 若需 RSA，请将下一行的 -t ed25519 替换为 -t rsa -b 4096。
ssh-keygen -t ed25519 -C "$KEY_COMMENT" -f "$env:USERPROFILE\.ssh\$KEY_NAME"

Set-CurrentUserOnlyAcl "$env:USERPROFILE\.ssh\$KEY_NAME"
Set-CurrentUserOnlyAcl "$env:USERPROFILE\.ssh\$KEY_NAME.pub"
```

### Linux 与 macOS 生成专用密钥

```bash
mkdir -p ~/.ssh
ls -lah ~/.ssh
chmod 700 ~/.ssh

# 若需 RSA，请将下一行的 -t ed25519 替换为 -t rsa -b 4096。
ssh-keygen -t ed25519 -C "$KEY_COMMENT" -f "$HOME/.ssh/$KEY_NAME"
chmod 600 "$HOME/.ssh/$KEY_NAME"
chmod 644 "$HOME/.ssh/$KEY_NAME.pub"
```

`ssh-keygen` 会询问 passphrase（也可直接回车不设置）。建议为私钥设置 passphrase；之后通过 `ssh-agent` 保存管理它。

## 3. 启动 ssh-agent 并加载私钥

`ssh-agent` 是在后台运行的密钥代理。它在内存中保存已解锁的私钥，`ssh-add` 将私钥交给它后，后续 `ssh`、`git fetch` 和 `git push` 会向代理请求签名，而不是每次都重新读取私钥并询问 passphrase。它不会上传私钥，也不会替代 Git 托管平台中的公钥配置；作用只是让本机当前登录会话更方便、安全地使用已解锁的密钥。

### Windows 启动 ssh-agent 并加载私钥

先在**管理员 PowerShell** 中将 Windows OpenSSH agent 设为自动启动并启动服务：

```powershell
Get-Service -Name ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent
```

关闭管理员终端，改在普通 PowerShell 中加载密钥并确认：

```powershell
ssh-add "$env:USERPROFILE\.ssh\$KEY_NAME"
ssh-add -l
```

Windows 同时可能存在系统 OpenSSH 和 Git for Windows 自带的 `ssh.exe`。若 `ssh-add -l` 能看到密钥，但 `git push` 仍重复询问 passphrase，可让 Git 明确使用系统 OpenSSH：

```powershell
git config --global core.sshCommand "C:/Windows/System32/OpenSSH/ssh.exe"
```

### Linux 启动 ssh-agent 并加载私钥

`eval "$(ssh-agent -s)"` 会启动一个 agent，并把连接它所需的环境变量写入**当前 shell**；紧接着的 `ssh-add` 才能把私钥加载进这个 agent。执行后用 `ssh-add -l` 确认密钥已在内存中：

```bash
eval "$(ssh-agent -s)"
# 正常类似：Agent pid 12345
ssh-add "$HOME/.ssh/$KEY_NAME"
ssh-add -l
```

这个命令启动的 agent 通常只对当前终端及其子进程直接可见。关闭终端、重新登录，或在另一个未继承这些环境变量的 shell 中工作时，可能再次看到 `The agent has no identities.`；此时重新执行上述三行即可。部分桌面环境会通过 GNOME Keyring、KWallet 等自动管理 agent，若 `ssh-add -l` 已能列出密钥，就不必重复启动。

### macOS 启动 ssh-agent 并加载私钥

先用 `eval "$(ssh-agent -s)"` 让当前 Terminal 连接到 agent，再用 macOS 自带的 `ssh-add` 加载私钥。带 passphrase 时，`--apple-use-keychain` 会把**passphrase**保存到登录 Keychain；私钥文件仍只保留在 `~/.ssh/`，之后新的 Terminal 会话可由 macOS 按配置自动取回 passphrase：

```bash
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain "$HOME/.ssh/$KEY_NAME"
ssh-add -l
```

如果密钥没有设置 passphrase，请省略 `--apple-use-keychain`。若新 Terminal 仍要求输入 passphrase，先重新执行上面的命令，再检查第 4 节中的 `AddKeysToAgent yes` 和 `UseKeychain yes` 是否已加入对应 `Host` 块。([GitHub][1])

## 4. 配置 `~/.ssh/config`

此配置让 SSH 在访问指定主机时固定使用对应私钥。Windows 文件位置是 `$env:USERPROFILE\.ssh\config`，Linux 与 macOS 是 `~/.ssh/config`。下列命令会先检查 `config` 是否存在：仅在缺失时创建空文件；已存在时保留原内容，再将当前变量展开后的 `Host` 块直接追加到文件末尾。

> 注意：每次执行都会追加一个 `Host` 块；如需更新同一主机的配置，应先删除文件中原有的同名 `Host` 块，再执行本节命令，避免配置冲突。

### Windows ssh config 配置

直接执行：

```powershell
$ConfigPath = "$env:USERPROFILE\.ssh\config"
if (-not (Test-Path -LiteralPath $ConfigPath)) {
    New-Item -ItemType File -Path $ConfigPath | Out-Null
}
$ConfigBlock = @"
Host $GIT_HOST
    HostName $GIT_SSH_HOST
    User git
    Port $SSH_PORT
    IdentityFile ~/.ssh/$KEY_NAME
    IdentitiesOnly yes
"@
[System.IO.File]::AppendAllText($ConfigPath, [Environment]::NewLine + $ConfigBlock + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
```

### Linux ssh config 配置

直接执行：

```bash
if [ ! -e "$HOME/.ssh/config" ]; then
    touch "$HOME/.ssh/config"
fi
printf '\n' >> "$HOME/.ssh/config"
cat >> "$HOME/.ssh/config" <<EOF
Host $GIT_HOST
    HostName $GIT_SSH_HOST
    User git
    Port $SSH_PORT
    IdentityFile ~/.ssh/$KEY_NAME
    IdentitiesOnly yes
EOF
chmod 600 "$HOME/.ssh/config"
```

### macOS ssh config 配置

直接执行。下列块假设私钥设置了 passphrase，因此会启用 Keychain：

```bash
if [ ! -e "$HOME/.ssh/config" ]; then
    touch "$HOME/.ssh/config"
fi
printf '\n' >> "$HOME/.ssh/config"
cat >> "$HOME/.ssh/config" <<EOF
Host $GIT_HOST
    HostName $GIT_SSH_HOST
    User git
    Port $SSH_PORT
    IdentityFile ~/.ssh/$KEY_NAME
    IdentitiesOnly yes
    AddKeysToAgent yes
    UseKeychain yes
EOF
chmod 600 "$HOME/.ssh/config"
```

若 macOS 私钥没有设置 passphrase，执行前从代码块中删除 `AddKeysToAgent yes` 与 `UseKeychain yes` 两行。

## 5. 将公钥添加到 Git 托管平台

先复制公钥内容；必须复制完整的一行、且只复制 `.pub` 文件。

### Windows 公钥

```powershell
# Windows
Get-Content "$env:USERPROFILE\.ssh\$KEY_NAME.pub" | Set-Clipboard
# Linux
cat "$HOME/.ssh/$KEY_NAME.pub"
# macOS
pbcopy < "$HOME/.ssh/$KEY_NAME.pub"
```

Linux 直接复制终端中输出的完整一行即可。若已安装 `xclip`，也可用 `xclip -selection clipboard < "$HOME/.ssh/$KEY_NAME.pub"` 复制到剪贴板。

GitHub 进入头像 → `Settings` → `SSH and GPG keys` → `New SSH key`；GitLab 进入头像 → `Preferences` 或 `Edit profile` → `SSH Keys`。为密钥填写能识别设备的标题，例如 `MacBook`、`Windows-PC`，粘贴公钥后保存。个人账户 SSH Key 与仓库的 Deploy Key 不同：前者可访问该账户已获授权的多个仓库。([GitLab][2])

GitHub 保存公钥后立即测试时，偶尔会先出现 `Could not resolve hostname github.com`（Windows 本地化错误信息可能显示为转义字符）。这发生在 SSH 连接到 GitHub、开始公钥认证之前，表示本机当时未能完成 DNS 解析，并不说明公钥尚未生效。稍后重试即可恢复时，通常是临时的 DNS 或网络问题；若持续出现，按第 10 节“检查 DNS 与 SSH 22 端口连通性”排查。若使用变量的命令失败而直接执行 `ssh -T git@github.com` 成功，还应重新检查 `GIT_HOST` 是否仍为 `github.com`，且未包含空格或其他不可见字符。

## 6. 测试 SSH 身份认证

使用目标平台的变量测试；SSH 登录用户名通常固定为 `git`，不是网站登录用户名。

```bash
# Windows / Linux / macOS
ssh -T "git@$GIT_HOST"
```

第一次连接会询问是否信任主机。先核对 Git 托管平台公布的 SSH 指纹，再确认保存；不要在未核验主机身份时直接输入 `yes`。GitHub 成功时会提示已认证但不提供 shell；GitLab 通常会显示欢迎信息。

失败时使用详细日志，并确认实际使用的私钥：

```bash
# Windows / Linux / macOS
ssh -vT "git@$GIT_HOST"
ssh -G "$GIT_HOST"
```

若出现 `Permission denied (publickey)`，依次检查公钥是否添加到正确账户、`ssh-add -l` 是否列出私钥、`~/.ssh/config` 中的 `Host` 与 `IdentityFile` 是否匹配。GitLab 官方也将这些列为主要排查方向。([GitLab SSH 排查][3])

### GitHub 的 SSH over 443

若 GitHub.com 的 `ssh -T` 测试因公司网络或防火墙无法连接 22 端口，可按系统更新变量并测试 GitHub 的 443 端口：

```powershell
# Windows
$GIT_HOST = "github.com"
$GIT_SSH_HOST = "ssh.github.com"
$SSH_PORT = 443
```

```bash
# Linux / macOS
export GIT_HOST="github.com"
export GIT_SSH_HOST="ssh.github.com"
export SSH_PORT=443
```

```bash
# Windows / Linux / macOS
ssh -T -p "$SSH_PORT" "git@$GIT_SSH_HOST"
```

认证成功后，重新执行第 4 节对应系统的配置生成命令，并用新 `Host` 块替换 `config` 中原有的 `github.com` 块，避免同一主机出现冲突配置。这只适用于 GitHub.com；自建 GitLab、GitHub Enterprise 或其他服务应使用管理员提供的 SSH 主机与端口。([GitHub SSH over 443][5])

## 7. 用 SSH 克隆或切换仓库远程地址

在仓库网页的 `Code` / `Clone` 菜单中确认 SSH 地址；常规 22 端口地址由 `GIT_HOST` 和 `REPOSITORY_PATH` 组合而成。

克隆新仓库：

```shell
# Windows
git clone "git@${GIT_HOST}:$REPOSITORY_PATH.git"
Set-Location $REPOSITORY_NAME

# Linux / macOS
git clone "git@$GIT_HOST:$REPOSITORY_PATH.git"
cd "$REPOSITORY_NAME"

# Windows / Linux / macOS
git remote -v
```

已有仓库从 HTTPS 切换到 SSH：

```shell
# Windows
git remote -v
git remote set-url origin "git@${GIT_HOST}:$REPOSITORY_PATH.git"
git remote -v

# Linux / macOS
git remote -v
git remote set-url origin "git@$GIT_HOST:$REPOSITORY_PATH.git"
git remote -v
```

若服务使用非 22 端口，remote 地址必须使用完整 URI：

```shell
# Windows
git remote set-url origin "ssh://git@${GIT_HOST}:$SSH_PORT/$REPOSITORY_PATH.git"

# Linux / macOS
git remote set-url origin "ssh://git@$GIT_HOST:$SSH_PORT/$REPOSITORY_PATH.git"
```

上述 Git 子命令相同；PowerShell 与 Linux/macOS shell 仅在变量引用和本地目录切换写法上不同。

## 8. 验证仓库读取和写入权限

先读取远端；成功表示 SSH 认证和该仓库的读取权限均正常。

```shell
# Windows / Linux / macOS
git fetch origin
```

首次提交前，若 Git 尚未设置身份信息，先配置自己的显示名称和邮箱：

```shell
# Windows / Linux / macOS
git config --global user.name "$GIT_USER_NAME"
git config --global user.email "$GIT_EMAIL"
```

只有在允许创建测试提交的仓库中，才使用临时分支验证写入权限：

```shell
# Windows / Linux / macOS
git switch -c ssh-test
git commit --allow-empty -m "test: verify SSH push"
git push -u origin ssh-test
```

测试完成后，删除远端和本地测试分支，再切回原分支名称：

```shell
# Windows / Linux / macOS
git push origin --delete ssh-test
git branch -D ssh-test
git switch main
```

如果默认分支不是 `main`，将最后一条命令替换为实际分支名。不要为测试向受保护分支直接推送。

## 9. 同一电脑配置多个账户或平台

为每个身份创建不同密钥，并在 `~/.ssh/config` 使用别名。例如个人 GitHub 和公司 GitLab：

```sshconfig
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github_personal
    IdentitiesOnly yes

Host gitlab-work
    HostName gitlab.example.com
    User git
    IdentityFile ~/.ssh/id_ed25519_gitlab_work
    IdentitiesOnly yes
```

随后在 remote 中使用别名，而不是实际域名：

```shell
# Windows：选择已在 config 中定义的别名，并设置要克隆的仓库
$GIT_HOST = "github-personal"
$REPOSITORY_PATH = "YOUR_USERNAME/REPOSITORY"
git clone "git@${GIT_HOST}:$REPOSITORY_PATH.git"

# Linux / macOS：选择已在 config 中定义的别名，并设置要克隆的仓库
export GIT_HOST="gitlab-work"
export REPOSITORY_PATH="GROUP/REPOSITORY"
git clone "git@$GIT_HOST:$REPOSITORY_PATH.git"
```

macOS 的每个带 passphrase 的 `Host` 块还应包含 `AddKeysToAgent yes` 和 `UseKeychain yes`。Windows、Linux 与 macOS 都可以使用上述别名机制。

## 10. 常见问题

| 现象 | 常见原因 | 处理 |
| --- | --- | --- |
| `Permission denied (publickey)` | 公钥未添加、加载了错误私钥或 SSH 配置不匹配 | 运行 `ssh-add -l`、第 6 节调试命令和本节“单次强制指定私钥测试”，核对公钥与 `IdentityFile` |
| 提示输入 SSH 密码 | SSH Key 未生效，正在回退到密码认证 | 检查 `User git`、agent 与 `IdentitiesOnly yes` |
| `Could not resolve hostname` 或连接超时 | 域名、VPN、公司 DNS 或 SSH 端口受限 | 运行本节“检查 DNS 与 SSH 22 端口连通性”，再按结果处理 |
| `Repository not found` | SSH 已认证，但仓库路径错误或账户无权限 | 重新从网页复制 SSH 地址，确认仓库授权 |
| Windows 中 `ssh-add` 有密钥但 Git 仍要密码 | Git for Windows 使用了另一套 `ssh.exe` | 设置 `core.sshCommand` 使用系统 OpenSSH，见第 3 节 |
| macOS 提示 `Bad configuration option: UseKeychain` | 当前并非 Apple 自带 OpenSSH，或版本不支持该选项 | 删除 `UseKeychain`，或按 GitHub 文档添加兼容设置 |
| VS Code 能提交但不能推送 | 本地提交不需要远端认证 | 在终端运行 `git push` 查看完整错误；VS Code 使用本机 Git 配置 |

### 检查 DNS 与 SSH 22 端口连通性

先确认实际 SSH 主机能解析，再确认目标端口可建立 TCP 连接。DNS 失败时检查域名、VPN 或公司 DNS；DNS 正常但 TCP 失败时，通常是网络拦截了端口。GitHub.com 的 22 端口受限时可改用第 6 节的 SSH over 443。

```shell
# Windows PowerShell：查看 Resolve-DnsName 结果，以及 TcpTestSucceeded 是否为 True。
Resolve-DnsName $GIT_SSH_HOST
Test-NetConnection $GIT_SSH_HOST -Port $SSH_PORT

# Linux：第一条有地址输出即 DNS 正常；第二条无报错即 TCP 端口可达。
getent hosts "$GIT_SSH_HOST"
timeout 5 bash -c '>/dev/tcp/$0/$1' "$GIT_SSH_HOST" "$SSH_PORT"

# macOS：第一条有地址输出即 DNS 正常；第二条显示 succeeded 即 TCP 端口可达。
dscacheutil -q host -a name "$GIT_SSH_HOST"
nc -G 5 -vz "$GIT_SSH_HOST" "$SSH_PORT"
```

### 单次强制指定私钥测试

多套密钥共存时，此测试忽略 agent 中的其他密钥，只用 `KEY_NAME` 对应的私钥认证。若该命令成功而普通 `ssh -T` 失败，优先检查第 4 节中该主机的 `Host`、`IdentityFile` 与 `IdentitiesOnly` 配置。

```shell
# Windows PowerShell
ssh -i "$env:USERPROFILE\.ssh\$KEY_NAME" -o IdentitiesOnly=yes -T -p "$SSH_PORT" "git@$GIT_SSH_HOST"

# Linux / macOS
ssh -i "$HOME/.ssh/$KEY_NAME" -o IdentitiesOnly=yes -T -p "$SSH_PORT" "git@$GIT_SSH_HOST"
```

## 11. 日常检查命令

以下命令可在三种系统的对应终端中执行；SSH 身份检查按当前系统引用开头已设置的变量。

```shell
# Windows / Linux / macOS
git --version
ssh -V
ssh-add -l
ssh -T "git@$GIT_HOST"
git remote -v
git fetch origin
git push
```

按系统查看密钥文件：

```shell
# Windows
Get-ChildItem "$env:USERPROFILE\.ssh"

# Linux / macOS
ls -lah ~/.ssh
```

完成的最小判据是第 11 节中对应系统的 `ssh -T` 命令能认证、`git fetch origin` 能读取，以及在有写入权限的仓库中 `git push` 能推送。

## 附录：GitHub SSH 快速部署命令

以下命令以 GitHub.com 为例，适合已熟悉正文流程、需要在新系统快速部署的使用者。每个代码块从安装或核验 Git 与 OpenSSH Client 开始，到测试 SSH 身份认证为止；请只执行与当前系统对应的完整代码块。

### Windows

```powershell
# !!! 请以管理员身份打开 PowerShell；先安装 Git 与 OpenSSH Client。
winget install --id Git.Git -e --source winget
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
git --version
ssh -V

# !!! 将下面四项替换为真实信息，再继续执行。
$GIT_EMAIL = "name@example.com"
$GIT_USER_NAME = "Your Name"
$KEY_NAME = "id_ed25519_github"
$KEY_COMMENT = "name@example.com / Windows-PC"
$GIT_HOST = "github.com"
$GIT_SSH_HOST = $GIT_HOST
$SSH_PORT = 22

New-Item -ItemType Directory -Force "$env:USERPROFILE\.ssh" | Out-Null
function Set-CurrentUserOnlyAcl {
    param([Parameter(Mandatory)][string]$KeyPath)

    $Acl = Get-Acl $KeyPath
    $Acl.SetAccessRuleProtection($true, $false)
    $Acl.Access | ForEach-Object { [void]$Acl.RemoveAccessRule($_) }
    $CurrentUser = [System.Security.Principal.NTAccount]("$env:USERDOMAIN\$env:USERNAME")
    $Rule = New-Object System.Security.AccessControl.FileSystemAccessRule($CurrentUser, "FullControl", "Allow")
    $Acl.SetOwner($CurrentUser)
    $Acl.AddAccessRule($Rule)
    Set-Acl -Path $KeyPath -AclObject $Acl
}
Set-CurrentUserOnlyAcl "$env:USERPROFILE\.ssh"

# !!! 确认同名私钥不存在；如已存在，请更换 $KEY_NAME，避免覆盖。ssh-keygen 提示时建议设置 passphrase。
ssh-keygen -t ed25519 -C "$KEY_COMMENT" -f "$env:USERPROFILE\.ssh\$KEY_NAME"
Set-CurrentUserOnlyAcl "$env:USERPROFILE\.ssh\$KEY_NAME"
Set-CurrentUserOnlyAcl "$env:USERPROFILE\.ssh\$KEY_NAME.pub"

Get-Service -Name ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent
ssh-add "$env:USERPROFILE\.ssh\$KEY_NAME"
ssh-add -l

# !!! 若 config 已有同名 Host 块，先手动合并或删除旧块；以下命令会追加新块。
$ConfigPath = "$env:USERPROFILE\.ssh\config"
if (-not (Test-Path -LiteralPath $ConfigPath)) { New-Item -ItemType File -Path $ConfigPath | Out-Null }
$ConfigBlock = @"
Host $GIT_HOST
    HostName $GIT_SSH_HOST
    User git
    Port $SSH_PORT
    IdentityFile ~/.ssh/$KEY_NAME
    IdentitiesOnly yes
"@
[System.IO.File]::AppendAllText($ConfigPath, [Environment]::NewLine + $ConfigBlock + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))

Get-Content "$env:USERPROFILE\.ssh\$KEY_NAME.pub" | Set-Clipboard
# !!! 打开 GitHub：Settings → SSH and GPG keys → New SSH key，粘贴刚复制的公钥并保存；完成后再继续。
# !!! 首次连接时，先核对 GitHub 公布的主机指纹，确认无误后才输入 yes。
ssh -T "git@$GIT_HOST"
```

### Linux

```bash
# !!! Ubuntu / Debian：先安装 Git 与 OpenSSH Client。其他发行版请使用对应包管理器安装同名软件包。
sudo apt update
sudo apt install -y git openssh-client
git --version
ssh -V

# !!! 将下面四项替换为真实信息，再继续执行；变量仅在当前 shell 会话有效。
export GIT_EMAIL="name@example.com"
export GIT_USER_NAME="Your Name"
export KEY_NAME="id_ed25519_github"
export KEY_COMMENT="name@example.com / Linux-PC"
export GIT_HOST="github.com"
export GIT_SSH_HOST="$GIT_HOST"
export SSH_PORT=22

mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
# !!! 确认同名私钥不存在；如已存在，请更换 $KEY_NAME，避免覆盖。ssh-keygen 提示时建议设置 passphrase。
ssh-keygen -t ed25519 -C "$KEY_COMMENT" -f "$HOME/.ssh/$KEY_NAME"
chmod 600 "$HOME/.ssh/$KEY_NAME"
chmod 644 "$HOME/.ssh/$KEY_NAME.pub"

eval "$(ssh-agent -s)"
ssh-add "$HOME/.ssh/$KEY_NAME"
ssh-add -l

# !!! 若 config 已有同名 Host 块，先手动合并或删除旧块；以下命令会追加新块。
if [ ! -e "$HOME/.ssh/config" ]; then touch "$HOME/.ssh/config"; fi
cat >> "$HOME/.ssh/config" <<EOF
Host $GIT_HOST
    HostName $GIT_SSH_HOST
    User git
    Port $SSH_PORT
    IdentityFile ~/.ssh/$KEY_NAME
    IdentitiesOnly yes
EOF
chmod 600 "$HOME/.ssh/config"

cat "$HOME/.ssh/$KEY_NAME.pub"
# !!! 复制上方完整的一行，在 GitHub：Settings → SSH and GPG keys → New SSH key 中粘贴并保存；完成后再继续。
# !!! 首次连接时，先核对 GitHub 公布的主机指纹，确认无误后才输入 yes。
ssh -T "git@$GIT_HOST"
```

### macOS

```bash
# !!! Git 缺失时会弹出 Command Line Tools 安装窗口；完成安装后重新执行本块。
git --version || xcode-select --install
ssh -V

# !!! 将下面四项替换为真实信息，再继续执行；变量仅在当前 shell 会话有效。
export GIT_EMAIL="name@example.com"
export GIT_USER_NAME="Your Name"
export KEY_NAME="id_ed25519_github"
export KEY_COMMENT="name@example.com / Mac"
export GIT_HOST="github.com"
export GIT_SSH_HOST="$GIT_HOST"
export SSH_PORT=22

mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
# !!! 确认同名私钥不存在；如已存在，请更换 $KEY_NAME，避免覆盖。ssh-keygen 提示时建议设置 passphrase；后续命令假设已设置。
ssh-keygen -t ed25519 -C "$KEY_COMMENT" -f "$HOME/.ssh/$KEY_NAME"
chmod 600 "$HOME/.ssh/$KEY_NAME"
chmod 644 "$HOME/.ssh/$KEY_NAME.pub"

eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain "$HOME/.ssh/$KEY_NAME"
ssh-add -l

# !!! 若 config 已有同名 Host 块，先手动合并或删除旧块；以下命令会追加新块。
if [ ! -e "$HOME/.ssh/config" ]; then touch "$HOME/.ssh/config"; fi
cat >> "$HOME/.ssh/config" <<EOF
Host $GIT_HOST
    HostName $GIT_SSH_HOST
    User git
    Port $SSH_PORT
    IdentityFile ~/.ssh/$KEY_NAME
    IdentitiesOnly yes
    AddKeysToAgent yes
    UseKeychain yes
EOF
chmod 600 "$HOME/.ssh/config"

pbcopy < "$HOME/.ssh/$KEY_NAME.pub"
# !!! 在 GitHub：Settings → SSH and GPG keys → New SSH key 中粘贴公钥并保存；完成后再继续。
# !!! 首次连接时，先核对 GitHub 公布的主机指纹，确认无误后才输入 yes。
ssh -T "git@$GIT_HOST"
```

---

[1]: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent?apiVersion=2022-11-28&platform=mac "Generating a new SSH key and adding it to the ssh-agent - GitHub Docs"
[2]: https://docs.gitlab.com/user/ssh/ "Use SSH keys with GitLab - GitLab Docs"
[3]: https://docs.gitlab.com/user/ssh_troubleshooting/ "Troubleshooting SSH - GitLab Docs"
[4]: https://code.visualstudio.com/docs/sourcecontrol/overview "Source Control in VS Code"
[5]: https://docs.github.com/en/authentication/troubleshooting-ssh/using-ssh-over-the-https-port "Using SSH over the HTTPS port - GitHub Docs"
