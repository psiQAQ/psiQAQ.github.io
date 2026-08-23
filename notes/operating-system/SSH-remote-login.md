# 跨系统远程 SSH 登录配置（Windows / Linux / macOS）

本文用于让 Windows、Ubuntu / Debian 和 macOS 的任意一台计算机通过 SSH 密钥登录另一台计算机。默认以普通用户登录；[SSH-git.md](SSH-git.md) 只用于 Git 托管平台认证，两篇文档的密钥可以分别创建和管理。

> 开始前应能在服务端本地控制台操作，并确认客户端能访问服务端的网络地址。不要复制或传输私钥；整个过程只把客户端的**公钥**添加到服务端。Linux 部分以 Ubuntu / Debian 为基线，其他发行版请用其包管理器安装同名软件包。

## 1. 设置占位符

在客户端执行与系统相符的代码块，先改成实际值再执行。变量只在当前 PowerShell 或 shell 会话有效；新开终端后需重新设置。服务端需要用到端口时，也只需设置对应的 `SSH_PORT`。

### Windows PowerShell：设置变量

```powershell
$SERVER_HOST = "server.example.com"
$SERVER_USER = "remoteuser"
$SSH_PORT = 22
$KEY_NAME = "id_ed25519_remote"
$KEY_COMMENT = "$env:USERNAME@$env:COMPUTERNAME remote-login"
$SSH_ALIAS = "remote-host"
$KEY_PATH = "$HOME\.ssh\$KEY_NAME"
$PUBLIC_KEY_PATH = "$KEY_PATH.pub"
```

### Linux / macOS shell：设置变量

```bash
SERVER_HOST="server.example.com"
SERVER_USER="remoteuser"
SSH_PORT=22
KEY_NAME="id_ed25519_remote"
KEY_COMMENT="$(whoami)@$(hostname) remote-login"
SSH_ALIAS="remote-host"
KEY_PATH="$HOME/.ssh/$KEY_NAME"
PUBLIC_KEY_PATH="$KEY_PATH.pub"
```

| 占位符名字 | 示例 | 说明 |
| --- | --- | --- |
| `SERVER_HOST` | `server.example.com` | 服务端的 DNS 名称或 IP 地址。 |
| `SERVER_USER` | `remoteuser` | 服务端上的普通用户账户，不是客户端账户。 |
| `SSH_PORT` | `22` | 服务端 SSH 监听端口；首次配置先保持默认值。 |
| `KEY_NAME` | `id_ed25519_remote` | 本机私钥文件名；同一客户端连接不同服务端或账户时使用不同名称。 |
| `KEY_COMMENT` | `laptop remote-login` | 写入公钥末尾的注释，用于辨认密钥来源。 |
| `SSH_ALIAS` | `remote-host` | 本机 `~/.ssh/config` 中的连接别名。 |
| `KEY_PATH` | `~/.ssh/id_ed25519_remote` | 由 `KEY_NAME` 派生的私钥路径。 |
| `PUBLIC_KEY_PATH` | `~/.ssh/id_ed25519_remote.pub` | 由 `KEY_PATH` 派生的公钥路径；仅此文件内容可以添加到服务端。 |

`ED25519` 是目前推荐的默认密钥算法，密钥更短且认证更快。仅在目标服务端明确不支持 ED25519 时改用 RSA 4096 位：将后续 `ssh-keygen` 的 `-t ed25519` 替换为 `-t rsa -b 4096`。

| 用途 | Windows | Ubuntu / Debian、macOS |
| --- | --- | --- |
| 服务端主配置 | `C:\ProgramData\ssh\sshd_config` | `/etc/ssh/sshd_config` |
| 服务端普通用户公钥 | `C:\Users\<SERVER_USER>\.ssh\authorized_keys` | `~/.ssh/authorized_keys` |
| 客户端私钥 | `$KEY_PATH` | `$KEY_PATH` |
| 客户端连接配置 | `$HOME\.ssh\config` | `~/.ssh/config` |

## 2. 服务端安装并启用 OpenSSH Server

在将被登录的那台计算机上，以管理员权限执行相应命令。首次配置保持端口 `22`，完成密钥登录验证后再决定是否改端口。

在服务端先按其系统设置端口变量；下文的防火墙和监听检查会引用它：

```powershell
# Windows PowerShell
$SSH_PORT = 22
```

```bash
# Ubuntu / Debian 或 macOS shell
SSH_PORT=22
```

### Windows：安装并启用服务

以管理员身份打开 PowerShell：

```powershell
$ServerCapability = Get-WindowsCapability -Online |
  Where-Object Name -eq 'OpenSSH.Server~~~~0.0.1.0'

if ($ServerCapability.State -ne 'Installed') {
  Add-WindowsCapability -Online -Name 'OpenSSH.Server~~~~0.0.1.0'
}

Start-Service sshd
Set-Service -Name sshd -StartupType Automatic

if (-not (Get-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' `
    -DisplayName 'OpenSSH Server (sshd)' `
    -Enabled True -Direction Inbound -Protocol TCP -Action Allow `
    -LocalPort $SSH_PORT
}

Get-Service sshd
Get-NetTCPConnection -State Listen -LocalPort $SSH_PORT
```

Windows 安装内置 OpenSSH Server 时通常会创建名为 `OpenSSH-Server-In-TCP` 的防火墙规则；上面的命令只在规则不存在时创建它。[Microsoft 官方文档][1]

### Ubuntu / Debian：安装并启用服务

```bash
sudo apt update
sudo apt install -y openssh-server
sudo systemctl enable --now ssh
sudo systemctl status ssh --no-pager
sudo ss -tlnp | grep ":$SSH_PORT"
```

若已启用 UFW，才额外放行端口；未使用 UFW 时不要为了本步骤额外安装它：

```bash
sudo ufw status
sudo ufw allow "$SSH_PORT/tcp"
```

### macOS：启用 Remote Login

在本机 Terminal 中执行；`systemsetup` 需要管理员权限：

```bash
sudo systemsetup -setremotelogin on
sudo systemsetup -getremotelogin
sudo lsof -nP -iTCP:"$SSH_PORT" -sTCP:LISTEN
```

`systemsetup -setremotelogin on` 用于启用 macOS 的 Remote Login（SSH）。[Apple 官方文档][3]

## 3. 客户端生成专用密钥

在发起 SSH 连接的客户端执行。命令会拒绝覆盖已有同名私钥或公钥；如文件已存在，应更改 `KEY_NAME` 或先确认原密钥仍不需要。`ssh-keygen` 会交互式询问 passphrase，建议设置；它保护的是客户端私钥，不是服务端账户密码。

### Windows PowerShell：生成密钥并收紧权限

```powershell
New-Item -ItemType Directory -Path "$HOME\.ssh" -Force | Out-Null

if ((Test-Path $KEY_PATH) -or (Test-Path $PUBLIC_KEY_PATH)) {
  throw "密钥文件已存在：$KEY_PATH；请更改 KEY_NAME，避免覆盖。"
}

ssh-keygen -t ed25519 -a 100 -C "$KEY_COMMENT" -f "$KEY_PATH"

function Set-CurrentUserOnlyAcl {
  param([Parameter(Mandatory)][string]$Path, [switch]$Directory)

  $Acl = Get-Acl $Path
  $Acl.SetAccessRuleProtection($true, $false)
  $Acl.Access | ForEach-Object { [void]$Acl.RemoveAccessRule($_) }
  $CurrentUser = [System.Security.Principal.NTAccount]("$env:USERDOMAIN\$env:USERNAME")
  $Inheritance = if ($Directory) { 'ContainerInherit,ObjectInherit' } else { 'None' }
  $Rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    $CurrentUser, 'FullControl', $Inheritance, 'None', 'Allow')
  $Acl.SetOwner($CurrentUser)
  $Acl.AddAccessRule($Rule)
  Set-Acl -Path $Path -AclObject $Acl
}

Set-CurrentUserOnlyAcl -Path "$HOME\.ssh" -Directory
Set-CurrentUserOnlyAcl -Path $KEY_PATH
```

### Linux / macOS shell：生成密钥

```bash
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"

if [ -e "$KEY_PATH" ] || [ -e "$PUBLIC_KEY_PATH" ]; then
  printf '密钥文件已存在：%s；请更改 KEY_NAME，避免覆盖。\n' "$KEY_PATH" >&2
  exit 1
fi

ssh-keygen -t ed25519 -a 100 -C "$KEY_COMMENT" -f "$KEY_PATH"
```

## 4. 在服务端添加客户端公钥

先在客户端复制或显示公钥。私钥文件没有 `.pub` 后缀，绝不能添加到服务端，也不要粘贴到聊天软件或网页中。

```powershell
# Windows PowerShell：复制公钥，并显示以便核对。
Get-Content "$PUBLIC_KEY_PATH" | Set-Clipboard
Get-Content "$PUBLIC_KEY_PATH"
```

```bash
# Linux：显示公钥后复制其完整的一行。
cat "$PUBLIC_KEY_PATH"

# macOS：复制公钥；如需显示，再执行 cat "$PUBLIC_KEY_PATH"。
pbcopy < "$PUBLIC_KEY_PATH"
```

接着在服务端的本地控制台，以目标登录用户执行对应命令。打开文件后，将刚才复制的完整公钥追加为单独一行；已有公钥要保留，避免删除其他客户端的访问权限。

### Windows 服务端：普通用户

```powershell
$AuthorizedKeysPath = "$HOME\.ssh\authorized_keys"
New-Item -ItemType Directory -Path "$HOME\.ssh" -Force | Out-Null
New-Item -ItemType File -Path $AuthorizedKeysPath -Force | Out-Null
notepad $AuthorizedKeysPath
```

保存后，使用 PowerShell ACL 仅保留当前用户对目录、授权文件的控制权：

```powershell
function Set-CurrentUserOnlyAcl {
  param([Parameter(Mandatory)][string]$Path, [switch]$Directory)

  $Acl = Get-Acl $Path
  $Acl.SetAccessRuleProtection($true, $false)
  $Acl.Access | ForEach-Object { [void]$Acl.RemoveAccessRule($_) }
  $CurrentUser = [System.Security.Principal.NTAccount]("$env:USERDOMAIN\$env:USERNAME")
  $Inheritance = if ($Directory) { 'ContainerInherit,ObjectInherit' } else { 'None' }
  $Rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    $CurrentUser, 'FullControl', $Inheritance, 'None', 'Allow')
  $Acl.SetOwner($CurrentUser)
  $Acl.AddAccessRule($Rule)
  Set-Acl -Path $Path -AclObject $Acl
}

Set-CurrentUserOnlyAcl -Path "$HOME\.ssh" -Directory
Set-CurrentUserOnlyAcl -Path $AuthorizedKeysPath
```

### Ubuntu / Debian 或 macOS 服务端：普通用户

```bash
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
touch "$HOME/.ssh/authorized_keys"
chmod 600 "$HOME/.ssh/authorized_keys"
nano "$HOME/.ssh/authorized_keys"
```

保存 `nano` 后，确认公钥一行没有被折断或插入额外字符。

### Windows 服务端：管理员账户的例外

Windows 的 `C:\ProgramData\ssh\sshd_config` 若含有 `Match Group administrators`，管理员组账户不会读取用户目录的 `authorized_keys`，而是读取 `C:\ProgramData\ssh\administrators_authorized_keys`。这不是默认建议；优先使用普通用户。确需使用管理员账户时，在管理员 PowerShell 中打开该文件并追加公钥，然后仅保留 `SYSTEM` 与 `BUILTIN\Administrators` 的访问权限：

```powershell
$AuthorizedKeysPath = 'C:\ProgramData\ssh\administrators_authorized_keys'
New-Item -ItemType File -Path $AuthorizedKeysPath -Force | Out-Null
notepad $AuthorizedKeysPath

$Acl = Get-Acl $AuthorizedKeysPath
$Acl.SetAccessRuleProtection($true, $false)
$Acl.Access | ForEach-Object { [void]$Acl.RemoveAccessRule($_) }
foreach ($Identity in 'SYSTEM', 'BUILTIN\Administrators') {
  $Rule = New-Object System.Security.AccessControl.FileSystemAccessRule($Identity, 'FullControl', 'Allow')
  $Acl.AddAccessRule($Rule)
}
$Acl.SetOwner([System.Security.Principal.NTAccount]'BUILTIN\Administrators')
Set-Acl -Path $AuthorizedKeysPath -AclObject $Acl
```

OpenSSH 默认从用户主目录下的授权公钥文件读取密钥，`AuthorizedKeysFile` 可在服务端配置中改写。[OpenSSH `sshd_config` 手册][2]

## 5. 启动 ssh-agent 并保护客户端私钥

`ssh-agent` 在本机内存中临时保管已解锁的私钥。执行 `ssh-add` 后，后续 SSH 连接可用它签名，不必每次重新输入私钥 passphrase；它不会上传私钥，也不会替代服务端的 `authorized_keys`。

### Windows PowerShell：启用 agent 并加载密钥

下面的服务配置需要管理员 PowerShell；随后可在普通 PowerShell 中加载私钥。`Set-CurrentUserOnlyAcl` 会收紧私钥权限，不应对共享密钥或其他用户仍需访问的文件执行。

```powershell
# 管理员 PowerShell
Set-Service ssh-agent -StartupType Automatic
Start-Service ssh-agent

# 普通 PowerShell；第 3 节已定义 Set-CurrentUserOnlyAcl。
ssh-add "$KEY_PATH"
ssh-add -l
```

### Ubuntu / Debian：启动 agent 并加载密钥

```bash
chmod 600 "$KEY_PATH"
eval "$(ssh-agent -s)"
ssh-add "$KEY_PATH"
ssh-add -l
```

`eval "$(ssh-agent -s)"` 只让**当前 shell**连接到新启动的 agent；新开普通 Terminal 后，若桌面环境没有代管 agent，需重新执行这两行。`echo "$SSH_AUTH_SOCK"` 仅用于排查当前 shell 是否已连接到 agent，不是必经步骤。

### macOS：加载密钥到 Keychain

```bash
chmod 600 "$KEY_PATH"
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain "$KEY_PATH"
ssh-add -l
```

macOS 会将 passphrase 保存到登录 Keychain；私钥文件仍只保留在 `~/.ssh/`。后续第 6 节会为该密钥启用 `AddKeysToAgent` 与 `UseKeychain`。

## 6. 配置客户端连接别名

以下命令只会在 `config` 不存在时新建空文件，再**追加**一个 `Host` 块，不会覆盖已有配置。若已有相同的 `Host $SSH_ALIAS`，先手动合并或删除旧块，避免 SSH 读取到意外的配置。

### Windows PowerShell：追加连接别名

```powershell
$ConfigPath = "$HOME\.ssh\config"
New-Item -ItemType Directory -Path "$HOME\.ssh" -Force | Out-Null
if (-not (Test-Path $ConfigPath)) {
  New-Item -ItemType File -Path $ConfigPath | Out-Null
}

@"

Host $SSH_ALIAS
    HostName $SERVER_HOST
    User $SERVER_USER
    Port $SSH_PORT
    IdentityFile ~/.ssh/$KEY_NAME
    IdentitiesOnly yes
    PreferredAuthentications publickey
"@ | Add-Content -Path $ConfigPath

Set-CurrentUserOnlyAcl -Path $ConfigPath
```

### Ubuntu / Debian：追加连接别名

```bash
CONFIG_PATH="$HOME/.ssh/config"
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
touch "$CONFIG_PATH"
chmod 600 "$CONFIG_PATH"

cat >> "$CONFIG_PATH" <<EOF

Host $SSH_ALIAS
    HostName $SERVER_HOST
    User $SERVER_USER
    Port $SSH_PORT
    IdentityFile ~/.ssh/$KEY_NAME
    IdentitiesOnly yes
    PreferredAuthentications publickey
EOF
```

### macOS：追加连接别名

```bash
CONFIG_PATH="$HOME/.ssh/config"
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
touch "$CONFIG_PATH"
chmod 600 "$CONFIG_PATH"

cat >> "$CONFIG_PATH" <<EOF

Host $SSH_ALIAS
    HostName $SERVER_HOST
    User $SERVER_USER
    Port $SSH_PORT
    IdentityFile ~/.ssh/$KEY_NAME
    IdentitiesOnly yes
    PreferredAuthentications publickey
    AddKeysToAgent yes
    UseKeychain yes
EOF
```

## 7. 测试 SSH 身份认证

首次连接会显示服务端主机指纹。仅在通过可信渠道核对该指纹后输入 `yes`；接受后，它会保存到客户端的 `known_hosts`，后续指纹变化应先调查原因，而不是直接覆盖。

```powershell
# Windows PowerShell
ssh $SSH_ALIAS
ssh -i "$KEY_PATH" -o IdentitiesOnly=yes -p $SSH_PORT "$SERVER_USER@$SERVER_HOST"
ssh -vvv $SSH_ALIAS
```

```bash
# Linux / macOS
ssh "$SSH_ALIAS"
ssh -i "$KEY_PATH" -o IdentitiesOnly=yes -p "$SSH_PORT" "$SERVER_USER@$SERVER_HOST"
ssh -vvv "$SSH_ALIAS"
```

第一条成功后应直接进入服务端 shell，不应要求服务端账户密码；私钥有 passphrase 时，第一次由 `ssh-add` 或 SSH 客户端提示输入 passphrase 属于正常现象。

## 8. 可选：验证成功后的服务端加固

确认至少有一个客户端可通过密钥登录、且保留服务端本地控制台后，才进行本节。不要在唯一的远程会话中先关闭密码登录；另开一个终端重新测试密钥登录成功，再结束旧会话。

在服务端配置中确认或添加以下内容。将 `<SERVER_USER>`、`<SSH_PORT>` 替换为实际值；若有多个合法用户，在 `AllowUsers` 同一行列出它们。

```sshconfig
PubkeyAuthentication yes
PasswordAuthentication no
PermitEmptyPasswords no
AllowUsers <SERVER_USER>

# 可选：改端口后，须同步防火墙、客户端 SSH_PORT 与 config。
# Port <SSH_PORT>
```

### Windows：验证并重启服务

以管理员身份编辑 `C:\ProgramData\ssh\sshd_config`，确认上述配置位于任何 `Match` 块之前。验证通过后重启服务：

```powershell
$SshdExe = "$env:WINDIR\System32\OpenSSH\sshd.exe"
& $SshdExe -t
Restart-Service sshd
Get-WinEvent -FilterHashtable @{ LogName = 'OpenSSH/Operational' } -MaxEvents 30 |
  Select-Object TimeCreated, Id, LevelDisplayName, Message
```

若改为非 `22` 端口，更新或新建匹配端口的 Windows 防火墙入站规则；不要留下无用的宽泛放行规则。

### Ubuntu / Debian：检查并重载服务

编辑 `/etc/ssh/sshd_config` 后，先检查语法，再重载服务：

```bash
sudoedit /etc/ssh/sshd_config
sudo sshd -t
sudo systemctl reload ssh
sudo systemctl status ssh --no-pager
```

若 UFW 已启用且改了端口，先放行新端口、重新测试连接，最后才删除旧端口规则：

```bash
sudo ufw allow "$SSH_PORT/tcp"
```

### macOS：检查并重启 Remote Login

编辑 `/etc/ssh/sshd_config` 后先检查语法。Remote Login 由系统服务管理；从服务端本地控制台执行重启，避免中断唯一远程会话：

```bash
sudoedit /etc/ssh/sshd_config
sudo sshd -t
sudo launchctl kickstart -k system/com.openssh.sshd
sudo lsof -nP -iTCP:"$SSH_PORT" -sTCP:LISTEN
```

## 9. 排障

先判断问题处于哪一层：变量或客户端配置、DNS/TCP 连通性、服务端服务与防火墙、再到公钥认证。`Permission denied (publickey)` 不是 DNS 或端口错误；反之，超时和“无法解析主机名”也与公钥是否已写入无关。

### 检查 DNS 与端口

```powershell
# Windows PowerShell
Resolve-DnsName "$SERVER_HOST"
Test-NetConnection -ComputerName "$SERVER_HOST" -Port $SSH_PORT
```

```bash
# Ubuntu / Debian：第一条有地址即 DNS 正常；第二条无报错即端口可达。
getent ahosts "$SERVER_HOST"
timeout 5 bash -c '>/dev/tcp/$0/$1' "$SERVER_HOST" "$SSH_PORT"

# macOS：第一条有地址即 DNS 正常；第二条显示 succeeded 即端口可达。
dscacheutil -q host -a name "$SERVER_HOST"
nc -G 5 -vz "$SERVER_HOST" "$SSH_PORT"
```

| 现象 | 优先检查 |
| --- | --- |
| `Could not resolve hostname` | `SERVER_HOST` 是否含空格或拼写错误、DNS 配置是否可用。 |
| 连接超时或 `Connection refused` | 服务端 `sshd` 是否运行、端口是否监听、防火墙或路由是否放行。 |
| `Permission denied (publickey)` | 公钥是否完整单行、目标账户是否正确、私钥是否对应、`ssh-add -l` 与 `ssh -vvv` 输出。 |
| Windows 管理员账户仍认证失败 | 是否命中 `Match Group administrators`，以及公钥是否已写入对应的全局授权文件。 |
| 配置改后服务无法启动 | 使用 `sshd -t` 检查语法；先从本地控制台恢复，不要盲目删除 `known_hosts`。 |

服务端日志可进一步定位认证与配置错误：

```powershell
# Windows PowerShell（管理员）
Get-WinEvent -FilterHashtable @{ LogName = 'OpenSSH/Operational' } -MaxEvents 50 |
  Select-Object TimeCreated, Id, LevelDisplayName, Message
```

```bash
# Ubuntu / Debian
sudo journalctl -u ssh -n 50 --no-pager

# macOS
sudo log show --last 10m --style compact --predicate 'process == "sshd"'
```

## 10. 推荐最终状态

- 使用普通用户作为 `SERVER_USER`，按最小权限授权。
- 每个客户端或账户使用独立、带 passphrase 的 ED25519 私钥。
- `authorized_keys` 中仅保留仍在使用的公钥，并定期核对注释。
- 已验证密钥登录后，按实际风险决定是否关闭 `PasswordAuthentication`、限制 `AllowUsers` 和修改端口。

## 参考资料

[1]: https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse
[2]: https://man.openbsd.org/sshd_config
[3]: https://support.apple.com/en-ph/guide/remote-desktop/apd95406b8d/mac
