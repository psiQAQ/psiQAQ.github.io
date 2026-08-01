# Git 指南

Git 是分布式版本控制工具，用于记录代码历史、协作开发和回滚变更。这篇文档按下载安装、环境变量配置和安装验证的顺序整理。

## Windows Git 下载和安装

git 下载地址，国内用户推荐使用清华源：

<https://mirrors.tuna.tsinghua.edu.cn/github-release/git-for-windows/git/LatestRelease/>

点击目前最新版本，例如 `Git-2.54.0-64-bit.exe`

备用镜像地址：

<https://mirrors.ustc.edu.cn/github-release/git-for-windows/git/LatestRelease/>
<https://mirror.nju.edu.cn/github-release/git-for-windows/git/LatestRelease/>
<https://mirrors.huaweicloud.com/git-for-windows/>

安装时选择默认选项即可。

## 配置环境变量

```bash
setx PATH "%PATH%;C:\Program Files\Git\cmd"

# 测试安装成功
git --version
```

## linux/wsl 安装

```bash
sudo apt-get install git

# 测试安装成功
git --version
```

## 参考学习资料

- 📺[Git+Github核心概念大串讲，从零到一全攻略，详细实战教程](https://www.bilibili.com/video/BV1ySLc6QEcB)
