# linux 之 Ubuntu 常用命令与配置

这篇笔记聚焦 Ubuntu 常用环境配置和基础命令，适合作为 WSL 或 Linux 新环境的速查表。结构上先处理软件源配置，再按文件管理、用户管理、系统管理和软件管理分类整理命令。

## 配置 Ubuntu 镜像

> 在 `Ubuntu 24.04` 之前，Ubuntu 的软件源配置文件使用传统的 `One-Line-Style`，路径为 `/etc/apt/sources.list`；从 `Ubuntu 24.04` 开始，Ubuntu 的软件源配置文件变更为 `DEB822` 格式，路径为 `/etc/apt/sources.list.d/ubuntu.sources`。具体参考 [Ubuntu 软件仓库](<https://mirrors.tuna.tsinghua.edu.cn/help/ubuntu/>) 。

例如对于 `ubuntu 24.04` 版本，`wsl` 命令行中，执行以下命令：

```bash
mkdir -p /etc/apt/sources.list.d
sudo nano /etc/apt/sources.list.d/ubuntu.sources
```

添加以下内容：

```conf
Types: deb
## URIs: http://archive.ubuntu.com/ubuntu/
URIs: https://mirrors.tuna.tsinghua.edu.cn/ubuntu
Suites: noble noble-updates noble-backports
Components: main universe restricted multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg

## Ubuntu security updates. Aside from URIs and Suites,
## this should mirror your choices in the previous section.
Types: deb
## URIs: http://security.ubuntu.com/ubuntu/
URIs: https://mirrors.tuna.tsinghua.edu.cn/ubuntu
Suites: noble-security
Components: main universe restricted multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
```

`Ctrl + X`，输入 `Y`，输入 `Enter` 进行保存退出，然后执行以下命令：

```bash
sudo apt update
```

## 基础命令

### 文件管理

```bash
# 创建目录
mkdir <目录名>

# 删除目录
rmdir <目录名>

# 删除文件
rm <文件名>

# 复制文件
cp <源文件> <目标文件>

# 移动文件
mv <源文件> <目标文件>

# 查看文件内容
cat <文件名>

# 查看文件内容，并显示行号
cat -n <文件名>

# 查看文件内容，并显示行号，并显示文件名
cat -n <文件名> | less
```

### 用户管理

```bash
# 查看当前用户
whoami

# 添加用户
sudo adduser <用户名>

# 设置密码
sudo passwd <用户名>

# 切换到root账户
sudo -i

# 切换用户
su - <用户名>

# 将用户添加到sudo用户组
usermod -aG sudo <用户名> 

# 查看用户所属的组
groups <用户名>
```

### 系统管理

```bash
# 查看磁盘空间
df -h

# 查看内存使用情况
free -h

# 查看系统信息
uname -a

# 查看系统版本
lsb_release -a

# 查看系统时间
date

# 查看系统日志
tail -f /var/log/syslog

# 查看系统日志
journalctl -f
```

### 软件管理

```bash
# 更新软件源
sudo apt update

# 安装软件
sudo apt install <软件名>

# 卸载软件
sudo apt remove <软件名>

# 升级软件
```
