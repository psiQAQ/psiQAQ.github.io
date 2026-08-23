# Git 远程仓库 SSH 配置（Windows / Linux / macOS）

这篇文档用于在本机生成 SSH 密钥、添加到 GitHub、GitLab 或自建 GitLab，并通过 SSH 克隆、拉取和推送 Git 仓库。适合同时使用命令行和 VS Code 的开发环境；VS Code 使用本机 Git，因此终端中的 SSH 连接正常后，编辑器中的 Git 操作通常也会正常。([VS Code][4])

以下示例使用 `ED25519` 密钥。请先替换下列占位符；同一台电脑连接多个平台或账户时，应为每个账户/平台使用不同的密钥文件名。

```text
YOUR_EMAIL              Git 托管平台账户邮箱，例如 name@example.com
KEY_NAME                私钥文件名（不含 .pub），例如 id_ed25519_github
HOST                    Git 托管平台域名，例如 github.com 或 gitlab.example.com
NAMESPACE/REPOSITORY    仓库 SSH 路径，例如 owner/project 或 group/project
```

需要在终端中保存这些值时，可按系统执行以下命令。变量只在当前终端会话有效；重新打开终端后需要重新设置。后文仍使用上面的占位符，以便直接看出每个位置应替换什么。

### Windows PowerShell

```powershell
$GitEmail = "name@example.com"
$KeyName = "id_ed25519_github"
$GitHost = "github.com"
$RepositoryPath = "owner/project"
```

### Linux / macOS shell

```bash
export GIT_EMAIL="name@example.com"
export KEY_NAME="id_ed25519_github"
export GIT_HOST="github.com"
export REPOSITORY_PATH="owner/project"
```

私钥是无 `.pub` 后缀的文件，只能保留在本机；可以上传或分享的是同名 `.pub` 公钥文件。不要把私钥贴到网页、聊天记录、仓库或密码管理器以外的地方。

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

先检查已有密钥。已有可用的同平台密钥可以继续使用；不要为了重新配置而覆盖私钥。

### Windows 生成专用密钥

```powershell
Get-ChildItem "$env:USERPROFILE\.ssh" -ErrorAction SilentlyContinue
```

若目录不存在，先创建目录并生成 GitHub 专用密钥；GitLab 或自建平台只需将文件名改为例如 `id_ed25519_gitlab`。

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.ssh"
ssh-keygen -t ed25519 -C "YOUR_EMAIL" -f "$env:USERPROFILE\.ssh\id_ed25519_github"
```

### Linux 与 macOS 生成专用密钥

```bash
ls -lah ~/.ssh 2>/dev/null
mkdir -p ~/.ssh
chmod 700 ~/.ssh
ssh-keygen -t ed25519 -C "YOUR_EMAIL" -f ~/.ssh/id_ed25519_github
chmod 600 ~/.ssh/id_ed25519_github
chmod 644 ~/.ssh/id_ed25519_github.pub
```

`ssh-keygen` 会询问 passphrase。建议为私钥设置 passphrase；之后通过 `ssh-agent` 保存或管理它。若目标 Git 服务明确不支持 ED25519，再改用 RSA 4096：

```bash
ssh-keygen -t rsa -b 4096 -C "YOUR_EMAIL" -f ~/.ssh/id_rsa_github
```

Windows 使用 RSA 时，将上面的 `~/.ssh/...` 路径换成 `$env:USERPROFILE\.ssh\id_rsa_github`。

## 3. 启动 ssh-agent 并加载私钥

### Windows

先在**管理员 PowerShell** 中将 Windows OpenSSH agent 设为自动启动并启动服务：

```powershell
Get-Service -Name ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent
```

关闭管理员终端，改在普通 PowerShell 中加载密钥并确认：

```powershell
ssh-add "$env:USERPROFILE\.ssh\id_ed25519_github"
ssh-add -l
```

Windows 同时可能存在系统 OpenSSH 和 Git for Windows 自带的 `ssh.exe`。若 `ssh-add -l` 能看到密钥，但 `git push` 仍重复询问 passphrase，可让 Git 明确使用系统 OpenSSH：

```powershell
git config --global core.sshCommand "C:/Windows/System32/OpenSSH/ssh.exe"
```

### Linux

当前 shell 没有 agent 时启动它，再加载密钥：

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_github
ssh-add -l
```

桌面环境或发行版的密钥环可能会自动启动 agent；若重开终端后 `ssh-add -l` 显示没有身份，再执行上述命令即可。

### macOS

启动 agent 后，使用 macOS 自带的 `ssh-add` 将带 passphrase 的密钥存入 Keychain：

```bash
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_github
ssh-add -l
```

如果密钥没有设置 passphrase，请省略 `--apple-use-keychain`。GitHub 的 macOS 配置说明还要求在 SSH 配置中启用 `AddKeysToAgent` 和 `UseKeychain`，下一节会给出完整配置。([GitHub][1])

## 4. 配置 `~/.ssh/config`

此配置让 SSH 在访问指定主机时固定使用对应私钥。Windows 文件位置是 `$env:USERPROFILE\.ssh\config`，Linux 与 macOS 是 `~/.ssh/config`；配置内容相同。

Windows 可用 `notepad "$env:USERPROFILE\.ssh\config"` 打开或创建文件；Linux / macOS 可使用任意文本编辑器创建 `~/.ssh/config`。以 GitHub 为例，写入：

```sshconfig
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
    IdentitiesOnly yes
```

GitLab 或自建 GitLab 将 `github.com` 替换成实际 `HOST`。如果服务的 SSH 端口不是 22，再增加 `Port`，例如：

```sshconfig
Host gitlab.example.com
    HostName gitlab.example.com
    User git
    Port 2222
    IdentityFile ~/.ssh/id_ed25519_gitlab
    IdentitiesOnly yes
```

macOS 使用带 passphrase 的密钥时，在对应 `Host` 块中额外加入：

```sshconfig
    AddKeysToAgent yes
    UseKeychain yes
```

Linux 与 macOS 应限制配置文件权限：

```bash
chmod 600 ~/.ssh/config
```

## 5. 将公钥添加到 Git 托管平台

先复制公钥内容；必须复制完整的一行、且只复制 `.pub` 文件。

### Windows

```powershell
Get-Content "$env:USERPROFILE\.ssh\id_ed25519_github.pub" | Set-Clipboard
```

### macOS

```bash
pbcopy < ~/.ssh/id_ed25519_github.pub
```

### Linux

```bash
cat ~/.ssh/id_ed25519_github.pub
```

Linux 直接复制终端中输出的完整一行即可。若已安装 `xclip`，也可用 `xclip -selection clipboard < ~/.ssh/id_ed25519_github.pub` 复制到剪贴板。

GitHub 进入头像 → `Settings` → `SSH and GPG keys` → `New SSH key`；GitLab 进入头像 → `Preferences` 或 `Edit profile` → `SSH Keys`。为密钥填写能识别设备的标题，例如 `MacBook`、`Windows-PC`，粘贴公钥后保存。个人账户 SSH Key 与仓库的 Deploy Key 不同：前者可访问该账户已获授权的多个仓库。GitLab 推荐使用 ED25519，若使用 RSA 则至少为 4096 位。([GitLab][2])

## 6. 测试 SSH 身份认证

使用目标平台的 `HOST` 测试；SSH 登录用户名通常固定为 `git`，不是网站登录用户名。

```bash
ssh -T git@HOST
```

第一次连接会询问是否信任主机。先核对 Git 托管平台公布的 SSH 指纹，再确认保存；不要在未核验主机身份时直接输入 `yes`。GitHub 成功时会提示已认证但不提供 shell；GitLab 通常会显示欢迎信息。

失败时使用详细日志，并确认实际使用的私钥：

```bash
ssh -vT git@HOST
ssh -G HOST
```

若出现 `Permission denied (publickey)`，依次检查公钥是否添加到正确账户、`ssh-add -l` 是否列出私钥、`~/.ssh/config` 中的 `Host` 与 `IdentityFile` 是否匹配。GitLab 官方也将这些列为主要排查方向。([GitLab SSH 排查][3])

### GitHub 的 SSH over 443

若 `ssh -T git@github.com` 因公司网络或防火墙无法连接 22 端口，可先测试 GitHub 的 443 端口：

```bash
ssh -T -p 443 git@ssh.github.com
```

认证成功后，将 GitHub 的 `Host` 块改为下面的形式；`IdentityFile` 保持为自己的实际文件名：

```sshconfig
Host github.com
    HostName ssh.github.com
    Port 443
    User git
    IdentityFile ~/.ssh/id_ed25519_github
    IdentitiesOnly yes
```

这只适用于 GitHub.com；自建 GitLab、GitHub Enterprise 或其他服务应使用管理员提供的 SSH 主机与端口。([GitHub SSH over 443][5])

## 7. 用 SSH 克隆或切换仓库远程地址

在仓库网页的 `Code` / `Clone` 菜单中复制 SSH 地址。常规 22 端口地址格式为：

```bash
git@HOST:NAMESPACE/REPOSITORY.git
```

克隆新仓库：

```bash
git clone git@HOST:NAMESPACE/REPOSITORY.git
cd REPOSITORY
git remote -v
```

已有仓库从 HTTPS 切换到 SSH：

```bash
git remote -v
git remote set-url origin git@HOST:NAMESPACE/REPOSITORY.git
git remote -v
```

若服务使用非 22 端口，remote 地址必须使用完整 URI：

```bash
git remote set-url origin ssh://git@HOST:PORT/NAMESPACE/REPOSITORY.git
```

上述 Git 命令在 Windows PowerShell、Linux shell 和 macOS Terminal 中相同；只有本地目录路径写法不同。

## 8. 验证仓库读取和写入权限

先读取远端；成功表示 SSH 认证和该仓库的读取权限均正常。

```bash
git fetch origin
```

首次提交前，若 Git 尚未设置身份信息，先配置自己的显示名称和邮箱：

```bash
git config --global user.name "Your Name"
git config --global user.email "YOUR_EMAIL"
```

只有在允许创建测试提交的仓库中，才使用临时分支验证写入权限：

```bash
git switch -c ssh-test
git commit --allow-empty -m "test: verify SSH push"
git push -u origin ssh-test
```

测试完成后，删除远端和本地测试分支，再切回原分支名称：

```bash
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

```bash
git clone git@github-personal:YOUR_USERNAME/REPOSITORY.git
git clone git@gitlab-work:GROUP/REPOSITORY.git
```

macOS 的每个带 passphrase 的 `Host` 块还应包含 `AddKeysToAgent yes` 和 `UseKeychain yes`。Windows、Linux 与 macOS 都可以使用上述别名机制。

## 10. 常见问题

| 现象 | 常见原因 | 处理 |
| --- | --- | --- |
| `Permission denied (publickey)` | 公钥未添加、加载了错误私钥或 SSH 配置不匹配 | 运行 `ssh-add -l`、`ssh -vT git@HOST`，核对公钥与 `IdentityFile` |
| 提示输入 `git@HOST` 的密码 | SSH Key 未生效，正在回退到密码认证 | 检查 `User git`、agent 与 `IdentitiesOnly yes` |
| `Could not resolve hostname` | 域名、VPN 或公司 DNS 有误 | 核对 `HOST`，连接所需网络或 VPN |
| `Repository not found` | SSH 已认证，但仓库路径错误或账户无权限 | 重新从网页复制 SSH 地址，确认仓库授权 |
| Windows 中 `ssh-add` 有密钥但 Git 仍要密码 | Git for Windows 使用了另一套 `ssh.exe` | 设置 `core.sshCommand` 使用系统 OpenSSH，见第 3 节 |
| macOS 提示 `Bad configuration option: UseKeychain` | 当前并非 Apple 自带 OpenSSH，或版本不支持该选项 | 删除 `UseKeychain`，或按 GitHub 文档添加兼容设置 |
| VS Code 能提交但不能推送 | 本地提交不需要远端认证 | 在终端运行 `git push` 查看完整错误；VS Code 使用本机 Git 配置 |

## 11. 日常检查命令

以下命令可在三种系统的对应终端中执行；路径检查命令按系统选择。

```bash
git --version
ssh -V
ssh-add -l
ssh -T git@HOST
git remote -v
git fetch origin
git push
```

Windows 查看密钥文件：

```powershell
Get-ChildItem "$env:USERPROFILE\.ssh"
```

Linux / macOS 查看密钥文件：

```bash
ls -lah ~/.ssh
```

完成的最小判据是 `ssh -T git@HOST` 能认证、`git fetch origin` 能读取，以及在有写入权限的仓库中 `git push` 能推送。

---

[1]: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent?apiVersion=2022-11-28&platform=mac "Generating a new SSH key and adding it to the ssh-agent - GitHub Docs"
[2]: https://docs.gitlab.com/user/ssh/ "Use SSH keys with GitLab - GitLab Docs"
[3]: https://docs.gitlab.com/user/ssh_troubleshooting/ "Troubleshooting SSH - GitLab Docs"
[4]: https://code.visualstudio.com/docs/sourcecontrol/overview "Source Control in VS Code"
[5]: https://docs.github.com/en/authentication/troubleshooting-ssh/using-ssh-over-the-https-port "Using SSH over the HTTPS port - GitHub Docs"
