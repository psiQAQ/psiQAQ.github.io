# Docker 实战指南

Docker 把应用及其运行依赖封装成镜像，再以容器的形式运行。这篇指南面向第一次接触 Docker 的读者，主线覆盖安装、镜像、容器、数据持久化、网络、镜像构建和 Docker Compose。示例以 Linux containers 为准，适合本地学习和单机开发，不替代生产环境的安全与运维方案。

> **参考来源**
>
> - [Docker 官方文档](https://docs.docker.com/)
> - [Docker Engine：Ubuntu 安装](https://docs.docker.com/engine/install/ubuntu/)
> - [Docker Desktop：Windows 安装](https://docs.docker.com/desktop/setup/install/windows-install/)
> - [Docker Desktop：macOS 安装](https://docs.docker.com/desktop/setup/install/mac-install/)
> - [Docker MCP Toolkit：快速开始](https://docs.docker.com/ai/mcp-catalog-and-toolkit/get-started/)
> - [OpenAI Codex：MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
> - [Claude Code：MCP](https://code.claude.com/docs/en/mcp)
> - [tech-shrimp/docker_installer](https://github.com/tech-shrimp/docker_installer)
> - [tech-shrimp/docker_image_pusher](https://github.com/tech-shrimp/docker_image_pusher)
>
> **视频资料**
>
> - 作者：技术爬爬虾
> - [40 分钟的 Docker 实战攻略，一期视频精通 Docker](https://www.bilibili.com/video/BV1THKyzBER6/)
> - [一个视频解决 Docker 安装、Pull、找镜像等难题](https://www.bilibili.com/video/BV1fS411A71Y/)
> - [Docker 镜像停服？使用镜像转存工具解决拉取问题](https://www.bilibili.com/video/BV1Zn4y19743/)

---

## 核心概念

Docker 最常见的四个概念如下。

| 概念 | 英文 | 说明 |
| --- | --- | --- |
| 镜像 | image | 只读模板，包含应用、运行时和默认配置，可以用来创建多个容器 |
| 容器 | container | 镜像的运行实例，本质上是受隔离和资源限制的进程 |
| 注册表 | registry | 存储和分发镜像的服务，例如 Docker Hub |
| 镜像库 | repository | 注册表中同一镜像的一组版本，例如 `library/nginx` |

镜像和容器不是同一个东西。镜像更像软件安装包，容器是使用这个安装包创建出来的运行实例。删除容器不会自动删除镜像；同一个镜像也可以同时运行多个容器。

### 容器与虚拟机的区别

| 对比项 | Docker 容器 | 虚拟机 |
| --- | --- | --- |
| 系统内核 | Linux 容器共享宿主环境提供的 Linux 内核 | 每台虚拟机运行自己的完整操作系统内核 |
| 启动速度 | 通常以秒甚至更短时间启动 | 通常需要完成操作系统启动 |
| 资源占用 | 主要包含应用和用户空间依赖 | 还包含完整操作系统 |
| 隔离方式 | namespaces、cgroups 等内核机制 | 虚拟硬件和虚拟机监控器 |

Windows 和 macOS 上的 Docker Desktop 会在后台提供 Linux 虚拟化环境，再运行 Linux containers。因此，“容器共享宿主机内核”这句话在原生 Linux 上最直观；在 Docker Desktop 上，容器共享的是其 Linux 虚拟机中的内核。

## 安装 Docker

安装后不能只检查 `docker --version`。这个命令只能证明客户端存在，不能证明 Docker daemon 可以工作。后面的安装步骤统一使用 `docker version` 和 `docker run --rm hello-world` 验证。

### Ubuntu 安装 Docker Engine

正式使用时，优先通过 Docker 官方 `apt` 仓库安装。开始前先阅读[当前支持的 Ubuntu 版本和冲突包说明](https://docs.docker.com/engine/install/ubuntu/)，不要在已有 Docker 或 containerd 环境中直接覆盖安装。

```bash
# 安装仓库配置所需工具
sudo apt update
sudo apt install ca-certificates curl

# 添加 Docker 官方 GPG key
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 添加 Docker 官方 apt 仓库
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

# 安装 Docker Engine、Buildx 和 Compose 插件
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

检查服务并运行测试容器：

```bash
sudo systemctl is-active docker
sudo docker version
sudo docker run --rm hello-world
```

默认情况下，普通用户需要在 Docker 命令前加 `sudo`。可以按照[官方 Linux 安装后配置](https://docs.docker.com/engine/install/linux-postinstall/)把用户加入 `docker` 组，但该组可以控制 Docker daemon，权限接近宿主机的 `root`，不要随意添加用户。

#### 便捷安装脚本

Docker 提供 `get.docker.com` 脚本，但官方只建议把它用于测试和开发环境。不要直接复制一条 `curl | sh` 命令运行。先下载、阅读并预览它会执行的操作：

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
less get-docker.sh
sudo sh get-docker.sh --dry-run
```

确认脚本内容和预览结果符合预期后，再决定是否执行：

```bash
sudo sh get-docker.sh
```

该脚本会以管理员权限修改软件源并安装软件包，也不适合用来升级已有 Docker。生产主机应使用发行版对应的官方仓库流程。

### Windows 安装 Docker Desktop

Docker Desktop 推荐使用 WSL 2 后端。先确认 BIOS/UEFI 已开启硬件虚拟化，并在管理员 PowerShell 或 CMD 中检查 WSL：

```powershell
wsl --version
wsl --update
wsl --set-default-version 2
```

如果还没有安装 WSL，可以执行：

```powershell
wsl --install
```

安装和故障排查可参考仓库内的 [WSL 指南](./wsl.md)。WSL 准备完成后：

1. 从 [Docker Desktop for Windows 官方页面](https://docs.docker.com/desktop/setup/install/windows-install/)下载安装程序。
2. 一般用户选择 per-user 安装和 WSL 2 后端即可。
3. 安装完成后手动启动 Docker Desktop，并等待 Docker Engine 就绪。
4. 阅读并确认 Docker Desktop 的订阅条款。个人、教育、非商业开源和符合条件的小型企业通常可以免费使用，较大企业和政府机构需要核对当前许可要求。

Docker Desktop 必须保持运行，终端里的 `docker` 命令才能连接到它提供的 Docker Engine。

### macOS 安装 Docker Desktop

从 [Docker Desktop for Mac 官方页面](https://docs.docker.com/desktop/setup/install/mac-install/)下载与芯片匹配的安装包：

- Apple silicon 选择 Apple chip 版本。
- Intel Mac 选择 Intel chip 版本。

打开 `Docker.dmg`，把 Docker 拖入 `Applications`，然后启动 `Docker.app`。首次运行时按提示完成权限和资源配置，并阅读 Docker Desktop 的订阅条款。

### 验证安装

Linux、Windows 和 macOS 都可以运行下面三条命令：

```bash
# 同时显示客户端和服务端信息
docker version

# 查看 daemon、存储驱动和运行环境
docker info

# 拉取并运行官方测试镜像，退出后自动删除容器
docker run --rm hello-world
```

如果 `docker version` 只有 Client 信息，或者提示无法连接 daemon，应先检查 Docker 服务或 Docker Desktop，而不是反复安装 CLI。

## 下载和管理镜像

一个完整镜像引用可以写成：

```text
[registry/][namespace/]repository[:tag]
```

例如：

```text
docker.io/library/nginx:alpine
```

其中 `docker.io` 是 registry，`library` 是 Docker Official Images 使用的 namespace，`nginx` 是 repository，`alpine` 是 tag。使用 Docker Hub 官方镜像时，前两部分通常可以省略，因此常写成 `nginx:alpine`。

```bash
# 拉取镜像
docker pull nginx:alpine

# 查看本地镜像
docker image ls

# 查看镜像的详细元数据
docker image inspect nginx:alpine

# 不再需要时删除本地镜像；后续示例仍会用到它
docker image rm nginx:alpine
```

如果准备继续完成本文示例，先不要执行最后一条删除命令。`docker run` 发现本地缺少镜像时会自动拉取，但这会产生一次没有必要的重复下载。

tag 是发布者维护的标签，不保证它一定等于软件版本。省略 tag 时默认使用 `latest`，但 `latest` 也不等于“自动更新”；已经创建的容器不会因为远端镜像变化而自行升级。

Docker 通常会按宿主环境选择合适的 CPU 架构。确实需要指定架构时，可以使用：

```bash
docker pull --platform linux/arm64 nginx:alpine
docker pull --platform linux/amd64 nginx:alpine
```

在 ARM 设备或 Apple silicon 上运行只提供 `linux/amd64` 的镜像，可能依赖指令集模拟，性能和兼容性都需要单独验证。镜像支持哪些架构，应查看 Docker Hub 的 tag 页面或镜像 manifest。

## 运行第一个容器

下面用 Nginx 启动一个后台容器：

```bash
docker run -d \
  --name docker-guide-nginx \
  -p 127.0.0.1:8080:80 \
  nginx:alpine
```

打开 <http://127.0.0.1:8080>，应能看到 Nginx 默认页面。

这条命令做了三件事：

- `-d` 让容器在后台运行，不占用当前终端。
- `--name` 设置固定名称，后续命令不必查找容器 ID。
- `-p 127.0.0.1:8080:80` 把宿主机的 `127.0.0.1:8080` 转发到容器的 `80` 端口。

端口顺序始终是“宿主机端口:容器端口”。如果写成 `-p 8080:80` 而不指定宿主机 IP，Docker 默认会在所有宿主机网络接口上发布端口。云服务器或局域网主机上不要忽略这个差异。

### 查看和管理容器

```bash
# 查看正在运行的容器
docker ps

# 查看所有容器，包括已停止的容器
docker ps -a

# 查看日志
docker logs docker-guide-nginx

# 查看底层配置
docker inspect docker-guide-nginx

# 停止和重新启动同一个容器
docker stop docker-guide-nginx
docker start docker-guide-nginx

# 删除容器；运行中的容器需要先停止
docker stop docker-guide-nginx
docker rm docker-guide-nginx
```

`docker run` 每执行一次都会创建新容器。对已有容器重新启停应使用 `docker start` 和 `docker stop`，原来的端口、挂载和环境变量配置会保留。

## 持久化数据

容器的可写层会随容器删除。需要长期保留的数据，应放在 bind mount 或 named volume 中。

| 方式 | 数据位置 | 适合场景 |
| --- | --- | --- |
| bind mount | 指定的宿主机目录 | 编辑源代码、配置文件或静态文件，宿主机需要直接访问内容 |
| named volume | Docker 管理的存储空间 | 数据库等持久数据，不希望依赖固定宿主机路径 |

`-v` 是常见简写，`--mount` 的参数更明确，也更容易读。Docker 官方在新示例中更推荐 `--mount`。

### bind mount

在当前目录创建 `site/index.html`：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>Docker bind mount</title>
  </head>
  <body>
    <h1>这个页面来自宿主机目录</h1>
  </body>
</html>
```

Linux、WSL 或 macOS 使用：

```bash
docker run -d \
  --name docker-guide-bind \
  -p 127.0.0.1:8080:80 \
  --mount type=bind,src="$(pwd)/site",dst=/usr/share/nginx/html,readonly \
  nginx:alpine
```

Windows PowerShell 使用：

```powershell
docker run -d `
  --name docker-guide-bind `
  -p 127.0.0.1:8080:80 `
  --mount "type=bind,src=$($PWD.Path)\site,dst=/usr/share/nginx/html,readonly" `
  nginx:alpine
```

修改宿主机的 `site/index.html` 后刷新浏览器，容器会直接读取新内容。这里加了 `readonly`，避免容器反向修改宿主机文件。

等价的 `-v` 形式如下，路径格式需要按当前 Shell 调整：

```bash
docker run -d -v "$(pwd)/site:/usr/share/nginx/html:ro" nginx:alpine
```

### named volume

```bash
# 创建卷
docker volume create docker-guide-html

# 使用卷启动容器
docker run -d \
  --name docker-guide-volume \
  -p 127.0.0.1:8081:80 \
  --mount type=volume,src=docker-guide-html,dst=/usr/share/nginx/html \
  nginx:alpine

# 查看卷列表和详细信息
docker volume ls
docker volume inspect docker-guide-html
```

首次把空 named volume 挂载到镜像中已有内容的目录时，Docker 会把该目录的初始内容复制到卷中。Docker Desktop 管理的卷不应依赖某个可见宿主机路径，日常操作通过容器和 Docker CLI 完成。

清理上面的示例：

```bash
docker rm -f docker-guide-bind docker-guide-volume
docker volume rm docker-guide-html
```

> **谨慎操作**
>
> `docker volume prune -a` 会删除当前没有被任何容器引用的 named volume 和 anonymous volume。卷中可能保存数据库或项目数据，执行前先用 `docker volume ls`、`docker volume inspect` 和备份确认范围。

## `docker run` 常用参数

| 参数 | 作用 | 示例 |
| --- | --- | --- |
| `-d` | 后台运行 | `docker run -d nginx:alpine` |
| `-p` | 发布端口，顺序为宿主机到容器 | `-p 127.0.0.1:8080:80` |
| `--mount` / `-v` | 挂载目录或卷 | `--mount type=volume,src=data,dst=/data` |
| `-e` | 设置容器环境变量 | `-e APP_MODE=development` |
| `--name` | 设置唯一容器名 | `--name web` |
| `-it` | 保持标准输入并分配终端 | `docker run --rm -it alpine sh` |
| `--rm` | 容器停止后自动删除 | `docker run --rm hello-world` |
| `--restart` | 设置 daemon 重启容器的策略 | `--restart unless-stopped` |
| `--network` | 连接指定网络 | `--network app-net` |

环境变量适合传递普通运行参数：

```bash
docker run --rm -e APP_MODE=development alpine env
```

密码、访问令牌和私钥会出现在 Shell 历史、容器配置或诊断输出中，不要直接写入 `docker run -e`、Compose 文件、公开文档或发送给 AI。实际项目应使用平台提供的 secrets 机制或受权限保护的外部配置。

常见重启策略中，`always` 会在容器停止后尝试重启；`unless-stopped` 会尊重手动停止状态，单机服务更常用。临时调试容器通常组合使用 `--rm -it`：

```bash
docker run --rm -it alpine sh
```

输入 `exit` 后容器停止，并被自动删除。

## 查看日志和进入容器

先重新启动一个 Nginx 容器：

```bash
docker run -d \
  --name docker-guide-debug \
  -p 127.0.0.1:8080:80 \
  nginx:alpine
```

### 日志与配置

```bash
# 持续跟踪日志，按 Ctrl+C 退出跟踪，不会停止容器
docker logs -f docker-guide-debug

# 查看完整底层配置
docker inspect docker-guide-debug

# 只取容器状态
docker inspect --format '{{json .State}}' docker-guide-debug
```

`docker inspect` 输出可能包含环境变量、挂载路径和网络信息。发给 AI 或贴到 Issue 前先删除密码、token、内网地址和业务数据。

### 在运行中的容器内执行命令

```bash
# 执行一次命令
docker exec docker-guide-debug cat /etc/os-release

# 进入交互式 Shell
docker exec -it docker-guide-debug sh
```

很多容器没有 `bash`、`vim`、`ps` 等完整系统工具，这是为了缩小镜像并减少攻击面。可以临时进入容器检查文件和进程，但不要把手工安装软件或修改文件当成正式部署方式：容器重新创建后，这些修改会丢失。需要长期保留的改动应写入 Dockerfile 或挂载的配置文件。

调试结束后删除示例容器：

```bash
docker rm -f docker-guide-debug
```

## 使用 Dockerfile 构建镜像

下面用 Python 标准库写一个最小 HTTP 服务，不需要安装第三方包。

新建 `server.py`：

```python
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = b"Hello from Docker\n"
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
```

在同一目录新建无扩展名的 `Dockerfile`。文件名区分大小写，通常写成大写 `D`：

```dockerfile
FROM python:3.13-slim

WORKDIR /app
COPY server.py .

EXPOSE 8000
CMD ["python", "server.py"]
```

各指令的作用：

| 指令 | 说明 |
| --- | --- |
| `FROM` | 选择基础镜像 |
| `WORKDIR` | 设置后续指令和默认运行目录 |
| `COPY` | 把构建上下文中的文件复制到镜像 |
| `EXPOSE` | 声明应用监听端口，供使用者阅读；不会自动发布端口 |
| `CMD` | 设置容器默认启动命令 |

构建并运行：

```bash
# 最后的点表示当前目录是构建上下文
docker build -t docker-guide:1.0 .

docker run --rm \
  -p 127.0.0.1:8000:8000 \
  docker-guide:1.0
```

打开 <http://127.0.0.1:8000>，页面应返回 `Hello from Docker`。按 `Ctrl+C` 停止前台容器。

构建上下文较大时，可以在同一目录创建 `.dockerignore`，排除不需要发送给构建器的文件：

```gitignore
.git
__pycache__
*.pyc
```

### 推送到 Docker Hub

推送前需要 Docker Hub 账号，镜像名必须带自己的 namespace：

```bash
docker login
docker tag docker-guide:1.0 <docker-hub-username>/docker-guide:1.0
docker push <docker-hub-username>/docker-guide:1.0
```

不要把 Docker Hub 密码或 access token 写进脚本、截图和文档。共享镜像前还应检查镜像层中是否误放了配置文件、密钥或数据。

## Docker 网络

容器默认连接到 Docker 的 `bridge` 网络。默认 bridge 可以提供基础通信，但用户自定义 bridge 还能通过容器名或网络别名进行 DNS 解析，多个相关容器应优先使用自定义网络。

### 自定义 bridge 与容器名 DNS

```bash
# 创建自定义 bridge 网络
docker network create docker-guide-net

# 启动名为 docker-guide-web 的容器并加入网络
docker run -d \
  --name docker-guide-web \
  --network docker-guide-net \
  nginx:alpine

# 临时启动 BusyBox，通过容器名访问 Nginx
docker run --rm \
  --network docker-guide-net \
  busybox:1.37 wget -qO- http://docker-guide-web
```

最后一条命令不需要知道 Nginx 容器的内部 IP。Docker 内置 DNS 会在 `docker-guide-net` 中把 `docker-guide-web` 解析到对应容器。

```bash
docker network ls
docker network inspect docker-guide-net

# 先删除网络中的容器，再删除网络
docker rm -f docker-guide-web
docker network rm docker-guide-net
```

### 常见网络模式

| 模式 | 行为 | 使用边界 |
| --- | --- | --- |
| `bridge` | 容器使用独立网络命名空间，通过 bridge 通信 | 默认选择；跨容器通信优先创建自定义 bridge |
| `host` | 容器共享宿主网络，`-p` 端口发布参数不再生效 | 原生支持 Linux；Docker Desktop 4.34+ 需在设置中主动启用，且仅支持 Linux containers |
| `none` | 只保留 loopback，不连接外部网络 | 适合明确不需要联网的隔离任务 |

`host` 模式会减少网络隔离，也容易与宿主机已有端口冲突。不要只因为省略了 `-p` 就把它作为默认方案。Docker Desktop 上的实现还有协议层级等限制，使用前应查阅[官方 host 网络说明](https://docs.docker.com/engine/network/drivers/host/)。

## Docker Compose

Docker Compose 用一个 YAML 文件定义多个服务、网络和卷。它适合单机多容器应用；集群级编排不在本文范围内。

下面使用 MongoDB 和 mongo-express 演示两个服务如何协同工作。这个示例没有配置数据库认证，只能用于本机学习，端口也只绑定到 `127.0.0.1`。

新建 `compose.yaml`：

```yaml
services:
  db:
    image: mongo:8
    restart: unless-stopped
    volumes:
      - mongo-data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s

  admin:
    image: mongo-express:1
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "127.0.0.1:8081:8081"
    environment:
      ME_CONFIG_MONGODB_URL: mongodb://db:27017

volumes:
  mongo-data:
```

Compose 会为当前项目创建默认网络，`admin` 服务可以直接用服务名 `db` 访问 MongoDB。普通的短格式 `depends_on` 只保证启动顺序，不保证依赖服务已经可以接受请求；这里为 `db` 配置了 healthcheck，并使用 `condition: service_healthy` 等待数据库健康。

先检查配置，再启动服务：

```bash
docker compose config
docker compose up -d
docker compose ps
```

打开 <http://127.0.0.1:8081> 查看 mongo-express。其他管理命令：

```bash
# 查看全部服务日志
docker compose logs

# 持续跟踪 admin 服务日志
docker compose logs -f admin

# 只停止，不删除容器
docker compose stop

# 重新启动已停止的容器
docker compose start

# 停止并删除 Compose 创建的容器和网络，保留 named volume
docker compose down
```

Compose 默认查找当前目录及其父目录中的 `compose.yaml` 或 `docker-compose.yaml`。使用其他文件名时，通过 `-f` 指定：

```bash
docker compose -f compose.dev.yaml up -d
```

> **谨慎操作**
>
> `docker compose down -v` 会连同 Compose 声明的 named volume 一起删除。本例中的 `mongo-data` 也会被删除，其中的数据库数据无法通过重新启动容器恢复。

## 用 AI 辅助排查 Docker

AI 适合解释冗长输出和转换配置，但它看不到真实运行状态，也可能生成已经过时或有破坏性的命令。给 AI 的材料先脱敏，执行建议前再查看 `--help` 和官方文档。

### 分析日志

```text
下面是 docker compose logs 的脱敏输出。请按“最可能原因、证据、只读检查命令、修复建议”整理。
不要建议删除 volume、重装 Docker 或关闭防火墙，除非日志中有直接证据。

<粘贴已删除密码、token、域名、IP 和业务数据的日志>
```

### 解释 `docker inspect`

```text
请解释下面这份已脱敏的 docker inspect 输出，重点列出：
1. 端口映射；
2. bind mount 与 named volume；
3. 环境变量名，但不要复述值；
4. 网络和重启策略。

<粘贴已脱敏的 inspect 输出>
```

### 把 `docker run` 转成 Compose

```text
请把下面的 docker run 命令转换为 compose.yaml。
保留镜像 tag、端口、挂载、环境变量名和 restart 策略；端口默认只绑定 127.0.0.1。
敏感值改成环境变量占位符，并说明哪些值应放入不提交版本库的 .env。

<粘贴不含真实凭证的 docker run 命令>
```

让 AI 分析前，至少删除以下内容：密码、access token、cookie、私有 registry 凭证、内网拓扑、真实域名和业务数据。AI 给出的 `rm`、`prune`、`down -v`、防火墙与权限修改命令需要逐条确认影响范围。

## 使用 Docker MCP Toolkit 连接 Codex 和 Claude Code

[Docker MCP Toolkit](https://docs.docker.com/ai/mcp-catalog-and-toolkit/toolkit/) 集成在 Docker Desktop 中，用来选择、配置和运行容器化的 MCP server，再通过 MCP Gateway 把这些工具提供给 Codex、Claude Code 等客户端。截至本文更新时，这项功能仍处于 Beta 阶段，下面的界面和命令以 Docker Desktop 4.62 或更高版本为准。

Toolkit 由几个部分组成：

| 组件 | 作用 |
| --- | --- |
| Catalog | 查找 Docker 收录的 MCP server |
| Profile | 保存一组 server 及其配置，便于按项目隔离工具 |
| Gateway | 启动 profile 中的 server，并以一个 MCP 连接提供给客户端 |
| Client | 使用 MCP 工具的应用，例如 Codex 或 Claude Code |

这里的容器主要是 MCP server 的运行环境，不是默认交给 Agent 管理的业务容器。Toolkit 负责部署和管理已有或自定义的 MCP server，不是编写 server 的开发框架，也不自带通用的 Docker 容器控制能力。只有加入能够访问 Docker API 的 MCP server 并显式授权后，Agent 才可能管理其他容器；它实际能做什么，仍由该 server 暴露的工具和账号权限决定。

### 在 Docker Desktop 中启用 Toolkit

1. 安装或升级到 Docker Desktop 4.62 或更高版本，并确保 Docker Desktop 正在运行。
2. 打开 **Settings > Beta features**，启用 **Docker MCP Toolkit**，然后选择 **Apply**。
3. 打开 **MCP Toolkit > Profiles**，创建一个 profile，例如 `docker-guide`。
4. 在 **Catalog** 中只添加当前项目需要的 MCP server，并按提示完成配置或 OAuth 授权。
5. 打开 **Clients**，找到 Codex 或 Claude Code，选择刚创建的 profile 后连接。

Docker Desktop 会为已连接客户端管理 Gateway。服务器默认在容器中运行，并受到资源和文件系统隔离；如果某个 server 确实需要访问本地目录，应只挂载完成任务所需的目录。

也可以通过命令行创建 profile。下面以 Catalog 中的 GitHub Official server 为例；使用前应先检查它当前提供的工具及权限要求：

```bash
docker mcp profile create --name docker-guide
docker mcp catalog server ls mcp/docker-mcp-catalog
docker mcp profile server add docker-guide --server catalog://mcp/docker-mcp-catalog/github-official
docker mcp profile server ls --filter profile=docker-guide
```

如果本机没有 Docker Desktop，Docker 也提供单独安装 MCP Gateway CLI plugin 的方式，但不同系统的安装路径不同。请直接参考 [MCP Gateway 官方说明](https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/)，不要把 Desktop 界面步骤套用到仅安装 Docker Engine 的主机。

### 连接 Codex

优先在 Docker Desktop 的 **Clients** 页面连接。若需要手动配置，可以把 Gateway 注册为本地 stdio MCP server：

```bash
codex mcp add MCP_DOCKER -- docker mcp gateway run --profile docker-guide
codex mcp list
codex mcp get MCP_DOCKER
```

等价的 Codex 配置写法如下。用户级配置位于 `~/.codex/config.toml`；受信任的项目也可以使用项目内的 `.codex/config.toml`：

```toml
[mcp_servers.MCP_DOCKER]
command = "docker"
args = ["mcp", "gateway", "run", "--profile", "docker-guide"]
```

Codex 桌面应用、CLI 和 IDE 扩展在同一台计算机上共用这套 MCP 配置。修改后重新打开 Codex 会话，可用 `/mcp` 查看已加载的 server。ChatGPT 网页端不会读取本机的 Codex 配置。

### 连接 Claude Code

在希望使用 Toolkit 的项目目录中执行：

```bash
claude mcp add --transport stdio --scope local MCP_DOCKER -- docker mcp gateway run --profile docker-guide
claude mcp list
claude mcp get MCP_DOCKER
```

`--scope local` 是默认选项，只在当前项目中使用这项配置。需要让本机所有项目都能使用时，可以改为 `--scope user`；团队共享配置可使用 `--scope project`，它会写入项目的 `.mcp.json`。提交 `.mcp.json` 前，应确认其中没有凭证、私有地址或不必要的高权限 server。进入 Claude Code 会话后，可以用 `/mcp` 查看连接状态。

### 验证连接

先确认 profile 和客户端都能识别配置：

```bash
docker mcp profile server ls --filter profile=docker-guide
codex mcp list
claude mcp list
```

然后用只读请求验证实际工具调用。例如，仅当 profile 中已经配置并授权 GitHub Official server 时，可以输入：

```text
使用 GitHub MCP server 列出分配给我的 open pull requests。
只读取并整理结果，不要创建、修改或关闭任何内容。
```

命令列出 server 只能证明配置已被发现；还要确认客户端显示 `MCP_DOCKER` 已连接，并观察一次真实的只读工具调用是否成功。常见问题可按下面的顺序检查：

1. 没有 `docker mcp` 命令：确认 Docker Desktop 版本、Beta feature 是否启用，或是否正确安装了 Gateway CLI plugin。
2. 客户端中没有 `MCP_DOCKER`：重新连接客户端或执行对应的 `mcp add` 命令，再重启会话。
3. server 存在但没有可用工具：检查 Catalog 页面中的必填配置和 OAuth 授权。
4. Gateway 无法启动：确认 Docker Desktop 正在运行，且 `docker-guide` profile 存在。

凭证应保存在 Toolkit 或客户端支持的凭证存储中，不要粘贴到提示词、命令历史或准备提交的配置文件。为不同项目建立独立 profile，并只启用任务需要的 server，能减少误调用和权限扩散。

## 附录 A：常用命令速查

| 类别 | 命令 | 用途 |
| --- | --- | --- |
| 镜像 | `docker pull IMAGE` | 拉取镜像 |
| 镜像 | `docker image ls` | 列出本地镜像 |
| 镜像 | `docker image inspect IMAGE` | 查看镜像元数据 |
| 镜像 | `docker image rm IMAGE` | 删除镜像 |
| 镜像 | `docker build -t NAME:TAG .` | 使用当前目录构建镜像 |
| 镜像 | `docker tag SOURCE TARGET` | 为镜像添加新名称或 tag |
| 镜像 | `docker push IMAGE` | 推送镜像到 registry |
| 容器 | `docker run [OPTIONS] IMAGE` | 创建并运行新容器 |
| 容器 | `docker ps` | 查看运行中的容器 |
| 容器 | `docker ps -a` | 查看所有容器 |
| 容器 | `docker start CONTAINER` | 启动已有容器 |
| 容器 | `docker stop CONTAINER` | 停止容器 |
| 容器 | `docker rm CONTAINER` | 删除已停止容器 |
| 容器 | `docker logs -f CONTAINER` | 持续查看容器日志 |
| 容器 | `docker inspect CONTAINER` | 查看容器底层配置 |
| 容器 | `docker exec -it CONTAINER sh` | 进入运行中的容器 |
| 卷 | `docker volume create NAME` | 创建 named volume |
| 卷 | `docker volume ls` | 列出卷 |
| 卷 | `docker volume inspect NAME` | 查看卷信息 |
| 卷 | `docker volume rm NAME` | 删除未使用的卷 |
| 网络 | `docker network create NAME` | 创建自定义网络 |
| 网络 | `docker network ls` | 列出网络 |
| 网络 | `docker network inspect NAME` | 查看网络和已连接容器 |
| 网络 | `docker network rm NAME` | 删除未使用的自定义网络 |
| Compose | `docker compose config` | 解析并检查 Compose 配置 |
| Compose | `docker compose up -d` | 创建并后台启动服务 |
| Compose | `docker compose ps` | 查看项目服务状态 |
| Compose | `docker compose logs -f` | 持续查看项目日志 |
| Compose | `docker compose stop` | 停止但保留容器 |
| Compose | `docker compose start` | 启动已停止的容器 |
| Compose | `docker compose down` | 停止并删除容器和项目网络 |
| MCP | `docker mcp profile list` | 列出 Toolkit profile |
| MCP | `docker mcp profile server ls --filter profile=NAME` | 查看 profile 中的 MCP server |
| MCP | `docker mcp gateway run --profile NAME` | 启动指定 profile 的 Gateway |
| MCP | `codex mcp list` | 查看 Codex 已配置的 MCP server |
| MCP | `claude mcp list` | 查看 Claude Code 已配置的 MCP server |

需要查完整参数时，使用 `docker COMMAND --help`，例如：

```bash
docker run --help
docker compose up --help
```

## 附录 B：国内网络环境下的安装与镜像拉取

Docker 安装包、软件仓库、Docker Hub 和第三方镜像站的可访问性会变化。正文不保存一组“长期可用”的镜像站地址，因为这种列表很容易失效，也无法替你判断镜像来源是否可信。

遇到下载失败时，先区分问题发生在哪一层：

1. `docker version` 无法连接服务端：优先检查 Docker daemon 或 Docker Desktop，这通常不是镜像站问题。
2. 官方安装仓库无法访问：核对系统时间、DNS、代理、防火墙和 Docker 官方状态，再考虑可信的替代下载渠道。
3. `docker pull` 超时或连接 registry 失败：检查 daemon 代理、registry 配置和目标镜像名称。
4. 只有某个 tag 拉取失败：到镜像发布页确认 tag 和 CPU 架构是否存在。

### `docker_installer`

[tech-shrimp/docker_installer](https://github.com/tech-shrimp/docker_installer) 定期同步 Docker 官方安装脚本或安装包，并整理国内网络下的拉取方案。它适合作为官方渠道不可访问时的备选资料，不是 Docker 官方仓库。

使用前应检查：

- GitHub 仓库和 Release 是否仍由预期作者维护，最近同步是否成功。
- 下载文件的来源、更新时间和校验信息。
- Linux 脚本的完整内容，以及它将修改的软件源、服务和软件包。
- README 中的镜像站是否仍然在线，背后的维护方是否可信。

即使仓库提供一键命令，也建议先下载脚本、阅读内容，再在可恢复的测试环境中运行。不要仅因为命令使用 HTTPS，就假设脚本内容和后续下载的软件始终安全。

### `docker_image_pusher`

[tech-shrimp/docker_image_pusher](https://github.com/tech-shrimp/docker_image_pusher) 使用 GitHub Actions 把指定镜像转存到用户自己的阿里云容器镜像服务。它可以绕开目标服务器直接访问境外 registry 的限制，但会引入 GitHub Actions、阿里云凭证和私有仓库权限配置。

采用这种方案前，需要确认：

- Fork 后的 workflow 内容没有把凭证打印到日志或上传到 artifact。
- 阿里云账号、密码或 token 只保存在 GitHub Actions Secrets，不写入 `images.txt`、提交记录或 Issue。
- 转存后的镜像名称、tag、digest 和 CPU 架构与原镜像相符。
- 私有仓库的公开性和拉取权限符合数据与许可证要求。

第三方镜像站、自建反向代理和镜像转存解决的是网络可达性，不会自动保证镜像可信。重要环境应固定明确 tag 或 digest，并在部署前进行来源核对和安全扫描。
