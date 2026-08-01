# WSL 指南

WSL 让 Windows 直接运行 Linux 用户空间，适合开发、命令行和容器相关工作流。这篇文档先讲 Windows 侧启用与发行版安装，再整理常用命令、迁移到 D 盘、镜像源/网络/VSCode 等可选配置，最后补故障排查。

## 配置 windows 环境

1、在任务管理器-->性能-->CPU中确认开启虚拟化

2、windows底部搜索栏搜索："启动或关闭windows功能"/"启用或关闭 windows 功能"

3、找到“适用于Linux的Windows子系统”和"虚拟机平台"，在前面勾选确定后，等待Windows安装，若提示重启，就重新启动。

## 安装不同发行版

```bash
# 列出可以在线安装的 Linux 发行版的命令
wsl --list --online

# wsl --install -d <发行版名称> 安装想要的 Linux 发行版
wsl --install -d Ubuntu-24.04

# 列出所有已安装的 WSL 发行版，如果显示Ubuntu，则安装成功。
wsl --list --verbose

# wsl -d <发行版名称> 启动指定的发行版
wsl -d Ubuntu-24.04
```

## 其他 WSL 命令

```bash
# 登录到指定的发行版，以 root 用户身份
wsl -u root <发行版名称> 

# 设置默认的wsl发行版为指定的发行版
wsl --set-default <发行版名称> 

# 设置默认的wsl版本为2
wsl --set-default-version 2 

# 设置某一发行版的wsl版本为2
wsl --set-version <发行版名称> 2 
```

## 可选配置

### 迁移 WSL 到 D 盘

默认情况下，WSL 2 的文件系统是存储在 C 盘的，如果 C 盘空间不足，可以考虑将 WSL 2 迁移到 D 盘。
按照以下步骤进行操作：

```bash
# 关闭所有正在运行的 WSL 2 实例
wsl --shutdown

# 可以通过使用 PowerShell 和以下命令来检查关闭 Linux 发行版 (shell) 后其是否仍在运行
wsl --list --running

mkdir D:\wsl

# export会打包ext4.vhdx文件
wsl --export Ubuntu-24.04 D:\wsl\ubuntu.tar

# unregister会删除之前在C盘的ext4.vhdx文件
wsl --unregister Ubuntu-24.04

# import会解压tar得到ext4.vhdx
wsl --import Ubuntu-24.04 D:\wsl D:\wsl\ubuntu.tar
```

成功启动ubuntu，迁移完成。

### 配置镜像源

参考 [linux 之 Ubuntu 常用命令与配置](./linux.md#配置-ubuntu-镜像)

### 新建用户

参考 [linux 之 Ubuntu 常用命令与配置](./linux.md#用户管理)

### 设置用户

将新建的用户添加到sudo组中

```bash
# 切换到root账户
sudo -i
# 添加用户到sudo组
usermod -aG sudo <你的用户>
```

默认启动账户改为你的用户
/etc/wsl.conf下加入

```bash
sudo tee -a /etc/wsl.conf << EOF
[user]
default=<你的用户>
EOF
```

### 配置网络镜像

与 windows 处于同一IP地址

```bash
# 编辑wsl配置文件
notepad %USERPROFILE%\.wslconfig
```

添加以下内容：

```plain
[wsl2]
networkingMode=mirrored
```

重启 `wsl` 服务后，输入 `ifconfig`，可以看到与windows处于同一IP地址。

### 配置VScode

1. 在windows下的VScode中安装WSL插件，安装完后，reload或者关闭vscode，再打开；
1. 单击在VScode左下角的Remote Explorer（即><符号），选择WSL，然后选择Ubuntu，就可以在VScode中打开wsl。
1. 在wsl中安装插件：python

### 推荐配置

systemd 是 Linux 系统中最常用的初始化系统（init system）和服务管理器，用来管理系统启动时的服务、后台进程、定时任务等。

```bash
sudo tee /etc/wsl.conf << EOF
[boot]
systemd=true
EOF
wsl --shutdown
```

参考 [WSL 中的高级设置配置](https://learn.microsoft.com/zh-cn/windows/wsl/wsl-config)

## Trouble shooting

1. 搜索栏：ubuntu打开后输入用户名和密码，如果报错：
    - WslRegisterDistribution failed with error: 0x800701bc[3]
    解决：在命令行输入 wsl --update
    - WslRegisterDistribution failed with error: 0x8004032d
    解决："虚拟机平台"没有开启
1. WslRegisterDistribution failed with error: 0x8007019e
    参考：<https://blog.csdn.net/qq_37109456/article/details/109669455>
    启用 powershell（管理员）

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
```
