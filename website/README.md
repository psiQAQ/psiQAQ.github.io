# Agent 使用笔记部署说明

正式站使用 [notes.psiqaq.cn](https://notes.psiqaq.cn/)。在 Obsidian 编辑后，用 Knowledge Base Manager 向本库的 `main` 提交并推送。打开 GitHub Actions 的 **Publish knowledge garden** 查看构建和部署结果。构建失败时，线上继续提供上一次成功发布的版本。

## 增加或撤回文章

读者首页为库内 `content/index.md`。在所属主题目录保存文章，再把相对 Markdown 链接加到对应的主题首页。Git 须跟踪笔记和随文附件。

- 指南填写 `type: garden-note`、`visibility: public`、`publish_ready: true`。资源笔记使用 `type: garden-reference` 和 `visibility: public`。目录页使用 `index.md` 和 `visibility: public`。
- 从网站撤回指南时，清除指向它的公开链接，再将 `publish_ready` 设为 `false`。生成的站点、搜索和图谱会随下次成功部署更新。已推送的 Git 源码及历史仍然公开。
- 真实私稿在已忽略的位置编辑。首次提交前查看 Knowledge Base Manager 的待提交文件。现有的模板示例和原来已经跟踪的草稿在 GitHub 源码中可读。
- 发布边界见 `publish.config.json`。图片和 PDF 由公开内容引用后进入产物。可执行脚本、HTML 和无属性的原文模板逐文件授权。优先使用相对路径，引用其他库、未公开笔记或本机文件会令构建失败。

迁移前已分享的指南、模板、启动脚本与流程图地址由 `website/legacy-routes.mjs` 映射到当前公开内容。撤回目标后，构建也会移除对应的兼容页。旧脚本页先显示源码，读者可自行点击下载。

## 本地构建和预览

使用 Node.js 24.19.0、npm 11.17.0、Python 3.10 或更新版本及 Git。在知识库根目录运行：

```sh
node website/setup.mjs
node website/build.mjs
python website/verify.py
python website/preview.py
```

打开 [本地预览](http://127.0.0.1:8849/)。修改笔记后重新运行构建和检查，刷新浏览器。Ctrl+C 结束服务。构建只读取已跟踪的公开源文件；文件内容取自当前工作区。工具、临时输入及输出均在被 Git 忽略的 `website/.build/` 内。

## 配置、兼容与升级

`quartz.config.yaml` 在上游默认配置上覆盖中文标题、布局和主题设置。站点使用原生目录树、搜索、图谱、反向链接、悬浮预览、深浅主题及移动布局。正式域名取自发布配置，可用环境变量 `SITE_URL` 测试部署子路径。

GFM、代码高亮、双链、标题与块引用、笔记与 PDF 嵌入、Callout、公式、Mermaid、脚注、标签和别名由 Quartz 处理。模板的 Garden Base 保留在 Obsidian，网站首页列出十个主题，侧栏按四个目录浏览。当前公开源未使用 Canvas、Dataview 或 Excalidraw。若未来要分享动态查询、画布或绘图，先导出为公开 Markdown 或图片，再链接该静态版本。网站无需启动 Obsidian。

Quartz v5.3.1 由 `setup.mjs` 固定到完整 Git 提交，依赖使用该提交的 npm 锁文件。构建器保留上游 MIT LICENSE。升级时核对正式标签与提交，更新固定版本，在独立分支分别运行项目子路径样例和正式构建，验证通过后再合入。不要提交下载的引擎或生成站点。[Quartz 源码与许可](https://github.com/jackyzha0/quartz/tree/5a740b3ae06569c5d67a911fcd58cb1353db8110)

## 部署与排错

PR 只构建和验证。向 `main` 推送或在 Actions 手动运行工作流，会把通过检查的站点作为 Pages artifact 部署。使用仓库自带的短期工作流权限。Pages 的 Source 使用 GitHub Actions，生产域名位于仓库 Settings → Pages。

检查失败时先看首个报错中的源笔记、链接或产物路径。未发布文件应在公开笔记中移除引用，或经确认后赋予公开属性。线上异常可在 Actions 查看部署对应提交；回退用新的 revert 提交，修复后重新部署。暂时停止更新可在 Actions 禁用该工作流；若要连同现有页面下线，另在 Settings → Pages 执行 Unpublish site。
