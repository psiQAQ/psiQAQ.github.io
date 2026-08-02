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

## 配置用户信息

在进行 `commit` 操作前，需要配置用户信息，包括用户名和邮箱，仅用于标识提交者，可任意填写。
```bash
git config --global user.name "Your Name"
git config --global user.email "youremail@domain.com"
```

## 参考学习资料

- 📺[Git+Github核心概念大串讲，从零到一全攻略，详细实战教程](https://www.bilibili.com/video/BV1ySLc6QEcB)

## （可选）代理配置（HTTP vs SOCKS5 / SOCKS5h）

- **Git 使用 HTTPS 协议** → `http` 和 `socks5/socks5h` 都可以
- **Git 使用 SSH 协议** → 必须使用 `socks5/socks5h`（HTTP 代理不支持）

### 三种代理的本质区别

| 类型 | 层级 | 支持协议 | DNS 解析方式 | 典型用途 |
| ------ | ------ | ---------- | -------------- | ---------- |
| HTTP | 应用层 | 仅 HTTP/HTTPS | 本地解析 | 最通用、兼容性最好 |
| SOCKS5 | 传输层 | 任意 TCP/UDP | 本地解析 | 通用隧道，可代理 SSH / Git / 数据库等任意 TCP |
| SOCKS5h | 传输层 | 任意 TCP/UDP | 远端代理解析 | DNS 也走代理，避免 DNS 污染，国内访问 GitHub 更稳定（推荐） |

| 场景 | 推荐 |
| -------------- | ------- |
| 企业网络 / 仅 HTTPS clone | HTTP |
| 需要 SSH / 国内访问 GitHub / 使用 Clash/V2Ray | SOCKS5h |

### 配置命令

```bash
# 如果使用 GitHub 的 HTTPS 地址模式
git config --global http.proxy http://127.0.0.1:10809
git config --global https.proxy http://127.0.0.1:10809

# 如果你有本地 SOCKS 代理端口（如 10808），推荐使用 SOCKS5 / SOCKS5h
git config --global https.proxy socks5h://127.0.0.1:10808
git config --global http.proxy socks5h://127.0.0.1:10808
```

```bash
# 查看是否生效
git config --global --get http.proxy
git config --global --get https.proxy
# 配置信息可查阅 %USERPROFILE%\.gitconfig 或者 ~/.gitconfig 文件

# 测试连接
git ls-remote https://github.com/git/git
# - `ls-remote` 仅测试远程连接，不会下载代码
# - 若成功返回分支列表，说明代理正常

# 清除代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## 附录

- [Git PR 教程文档（普通贡献者视角）](./git-pr-contributor-tutorial.md)
- [Git PR 流程图（普通贡献者视角）](./git-pr-flowchart.html)
