# Blender 指南

Blender 是开源 3D 建模与渲染工具。通过 MCP，Agent 可以读取场景、检查对象、调用 `bpy` 执行操作，并结合截图与渲染结果检查工作成果。

[Blender MCP Integrated 下载页（GitHub Pages）](https://notes.psiqaq.cn/blender_mcp-setup-guide/) 提供按 Blender 版本和系统选择的集成安装包。这是 psiQAQ 基于 [Blender Lab 官方 MCP](https://projects.blender.org/lab/blender_mcp) 维护的社区集成项目，同时提供安装教程和 `blender-mcp-skills` 开发技能。

完整说明见[集成 Extension 中文教程](https://github.com/psiQAQ/blender_mcp-setup-guide/blob/main/docs/blender_mcp-setup_zh.md)、[项目仓库](https://github.com/psiQAQ/blender_mcp-setup-guide)；图文演示可参考[原教程](https://www.bilibili.com/opus/1200110164274839557)。

## 选择安装方式

| 方式 | 安装内容 | 服务由谁启动 | Agent 如何连接 |
| --- | --- | --- | --- |
| 集成 Extension | 一个匹配平台的 ZIP，包含桥接、MCP 工具和运行依赖 | Blender 管理随包服务 | 本机 HTTP 地址与 Bearer token |
| 官方 Extension + stdio | 官方 Extension、Git、uv 和外部 MCP 工具分别安装 | MCP 客户端启动外部进程 | 客户端配置启动命令，通过 stdio 通信 |

集成方式适合原生 Windows x64、Linux x64、macOS Apple Silicon，客户端与 Blender 在同一台电脑的同一系统中运行，用户无需另外安装 uv 或 Python。需要由客户端管理外部工具进程时，使用[官方 stdio 教程](https://github.com/psiQAQ/blender_mcp-setup-guide/blob/main/docs/blender_mcp-stdio-setup_zh.md)。同一 Blender 实例选择一种方式；切换时先停止旧服务，再替换客户端的 `blender` 配置条目。

## 安装集成 Extension

先核对 Blender 版本和电脑架构。当前集成包要求 Blender 配套的 CPython 3.13；Blender 5.0 不在当前支持范围，macOS 安装包只支持 Apple Silicon。

| Blender 版本 | 发布线 | 2026-10-08 核对的包版本 | Extensions 更新索引 |
| --- | --- | --- | --- |
| 5.1.0 ≤ 版本 < 5.2.0 | 稳定版 | `1.0.3+integration.1` | [5.1 稳定索引](https://notes.psiqaq.cn/blender_mcp-setup-guide/index.json) |
| 5.2.0 ≤ 版本 < 5.3.0 | 预发布版 | `1.0.2-dev.1+integration.1` | [5.2 预发布索引](https://notes.psiqaq.cn/blender_mcp-setup-guide/blender-5.2/preview/index.json) |

安装时以[下载页](https://notes.psiqaq.cn/blender_mcp-setup-guide/)和对应发布线的兼容范围为准。

1. 下载与系统匹配的 `blender_mcp_integration-<version>-<platform>.zip`。`<platform>` 分别为 `windows-x64`、`linux-x64`、`macos-arm64`；保留 ZIP，无需解压。安装时选择平台包，Release 中的证据 ZIP 用于审计。
2. 在 Blender 打开 **Edit → Preferences → Add-ons → 右上角菜单 → Install from Disk**，选择 ZIP，安装并启用 **Blender MCP Integrated**。
3. 展开插件偏好。如果装过官方原版 **MCP** Extension，先停止并禁用原版，避免两个桥接服务争用端口。
4. 插件默认启用 **Start MCP When Enabled**。等待状态变为 **MCP: Running**；未自动启动时点击 **Start MCP**，再点击 **Check Connection**。
5. 在 **Agent** 中选择所用客户端，点击 **Copy Connection Configuration**，将复制的配置合并到客户端并重新加载。插件也会把配置保存为用户目录中的 `client-config.txt`。

需要通过 Blender 管理后续更新时，在 **Extensions → Repositories → Add Remote Repository** 添加对应索引。在线安装或更新需启用 **Preferences → System → Network → Allow Online Access**。若 5.1 和 5.2 共用扩展目录，为预发布线使用独立仓库，避免覆盖稳定版安装。

## 配置 MCP 客户端

优先使用插件复制的配置，它包含本机实际生成的凭据。已有配置时只合并或替换 `blender` 条目，保留其他服务器和设置。同名服务器已有 stdio 配置时，切换到 HTTP 需要替换该条目。

| 客户端 | 常用配置位置 | 合并的条目 |
| --- | --- | --- |
| Codex | 用户目录的 `.codex/config.toml`；也可使用受信任项目的 `.codex/config.toml` | `[mcp_servers.blender]` |
| Claude Code | 所用项目根目录的 `.mcp.json` | `mcpServers.blender` |
| OpenCode | 用户目录的 `.config/opencode/opencode.json`，或项目的 `opencode.json` | `mcp.blender` |

这里的用户目录是 Windows 的 `%USERPROFILE%`、Linux/macOS 的 `~`。保存后重新加载客户端；项目配置按客户端要求完成信任或服务器授权。OpenCode 使用 HTTP 服务时，配置类型为 `remote`，本机地址同样适用。各客户端的完整示例见[配置章节](https://github.com/psiQAQ/blender_mcp-setup-guide/blob/main/docs/blender_mcp-setup_zh.md#3-配置所用客户端)。

| 项目 | 默认值 | 用途 |
| --- | --- | --- |
| HTTP Port | `8000` | Agent 连接 `http://127.0.0.1:8000/` |
| Bridge Port | `9876` | 随包服务与 Blender 桥接通信 |
| Authorization | `Bearer <本机生成的 token>` | HTTP 请求鉴权 |

客户端连接 HTTP 根路径 `/`；端口 `9876` 用于桥接。修改 HTTP 端口后重新复制配置。配置、token 和 `client-config.txt` 含凭据，不应提交到 Git 或发到公开讨论中。

## 验证实际场景连接

保持 Blender 打开且服务为 **Running**。先让 Agent 完成只读检查：

> 请通过 blender MCP 读取 Blender 版本和当前场景对象列表，报告工具实际返回的结果。

返回的对象应与当前打开的场景一致。客户端加载了配置、HTTP 健康检查通过、真实场景调用成功是三项不同检查；**Check Connection** 之后仍需完成这次场景读取。

如果使用 `execute_blender_code`，可以要求 Agent 在 Blender 中执行下面的只读代码。结果赋给可 JSON 序列化的 `result` 字典，供 MCP 返回：

```python
import bpy

result = {
    "version": bpy.app.version_string,
    "objects": [obj.name for obj in bpy.context.scene.objects],
}
```

需要验证修改能力时，先保存当前文件，并在测试场景中操作：

> 创建名为 MCP_Test_Cube 的立方体，回读它的位置，再删除这个测试对象，确认对象数量恢复。

## 常用工具与任务

以下名称来自项目配套的 Blender Lab MCP 工具；连接后以客户端实际列出的工具为准。

| 工具 | 用途 | 使用条件 |
| --- | --- | --- |
| `get_objects_summary` | 查看对象、集合、选择和可见状态 | 已连接当前场景 |
| `get_object_detail_summary` | 检查指定对象的变换、修改器、材质与约束 | 使用真实对象名称 |
| `get_screenshot_of_window_as_image` | 获取 Blender 窗口图像 | Blender 图形窗口可用 |
| `get_python_api_docs` | 查询 `bpy` 类、属性或函数文档 | 按目标 Blender 版本查阅 |
| `execute_blender_code` | 在 Blender 中执行 Python/`bpy` 代码 | 改动前明确对象和操作范围 |
| `render_viewport_to_path` | 按当前场景设置渲染并返回文件位置 | 使用工具返回的实际 `filepath` |

开始任务时先收敛范围，再读取或修改场景。例如：

> 请检查当前场景的集合层级、相机和灯光，列出影响渲染结果的问题，并给出按优先级排列的修改建议。

> 请按当前场景设置渲染 scene.png，报告工具返回的文件路径，再检查画面中的构图与光照。

需要开发 Blender Extension 时，可选用项目的 `blender-mcp-skills`。它提供 Blender 4.2+ Extension 脚手架、注册与清理、依赖打包和验证流程；这个模板范围与集成 MCP 安装包的 Blender 5.1/5.2 兼容范围分别适用。安装和模板说明见[项目 Skills 章节](https://github.com/psiQAQ/blender_mcp-setup-guide#install-the-local-skill)。

## 常见排障

插件偏好面板显示日志与配置所在的用户目录。排查时先查看错误和 `service.log`，再按对应阶段处理。

| 现象 | 检查与处理 |
| --- | --- |
| 服务没有进入 Running | 核对 Blender 版本、CPython 3.13、系统架构和 ZIP 平台后缀，查看日志 |
| 端口被占用 | 停止已确认的旧服务，或停止集成服务后改为空闲端口；重启并重新复制配置 |
| HTTP 401 | 重新复制配置，核对实际 token 及 `Authorization` 中的 `Bearer ` 前缀 |
| HTTP 403 | 使用 `http://127.0.0.1:<HTTP Port>/`，检查请求的 Host/Origin |
| 客户端找不到 blender | 检查配置文件、用户/项目作用域和信任要求，重新加载客户端 |
| MCP 可连接，但读取场景失败 | 检查 Blender 桥接是否运行、原版 Extension 是否仍启用，以及调用返回的错误 |
| WSL、SSH 或容器中的客户端无法连接 | 先确认客户端实际运行在哪个系统；其中的 `127.0.0.1` 指向其自身环境，需要另行核对可达性 |
| 服务异常退出 | 查看 `service.log`，点击 **Stop MCP** 后再启动，重新执行场景读取 |

## 切换方式与卸载

切换到官方 stdio 方案前，点击 **Stop MCP**，禁用集成 Extension，再移除客户端中的 HTTP `blender` 条目，按[官方 stdio 教程](https://github.com/psiQAQ/blender_mcp-setup-guide/blob/main/docs/blender_mcp-stdio-setup_zh.md)重新配置。

完全卸载时，停止服务、禁用并卸载 **Blender MCP Integrated**，只删除客户端中对应的 `blender` 条目。日志、凭据和导出配置位于独立用户目录中，确认不再需要后再处理；升级安装包时保留这些用户数据。

## 资源网址

参考视频：<https://www.bilibili.com/video/BV1h1Ev6PEY7>

省流版：这个排名更适合按使用场景看。

1. Poly Haven：<https://polyhaven.com/>
适合长期收藏，强在无版权、高质量 HDRI、PBR 材质和模型，属于通用型基础资源库。
2. Blender布的：<https://blenderco.cn/>
更适合国内新手、学生党和个人创作者，优势是免费资源多、上手成本低。
3. 模之屋：<https://www.aplaybox.com/>
不是综合资源站，而是二次元、MMD、Q 版、卡通模型的细分赛道，受众窄但定位很准。
4. BlenderKit：<https://www.blenderkit.com/>
最大价值是可以直接在 Blender 里调用资源，适合快速搭场景，提高创作效率。
5. Blender GO：<https://www.blendergo.net/>
偏新手入门和日常练习，适合快速找中文资源、做轻量项目。
6. CGTrader：<https://www.cgtrader.com/>
资源体量大、品类全，但筛选成本高，更适合有经验的人慢慢淘资产。
7. Sketchfab：<https://sketchfab.com/>
适合找灵感和小众创意模型，但版权比较乱，商用前必须仔细看授权。
8. Poliigon：<https://www.poliigon.com/>
更像高质量写实材质专项站，不适合和综合模型站硬比，适合写实渲染和高精度材质需求。

对新手来说，Poly Haven + BlenderKit + Blender GO 基本够起步；进阶后再去 CGTrader 和 Sketchfab 淘特殊资产，商用前重点检查版权。

## 参考与更新说明

本页于 2026-10-08 核对项目安装教程、本机源码及公开发布索引。安装包版本和下载地址以[项目下载页](https://notes.psiqaq.cn/blender_mcp-setup-guide/)为准；完整安装、客户端配置、构建与验证资料保存在[项目仓库](https://github.com/psiQAQ/blender_mcp-setup-guide)。
