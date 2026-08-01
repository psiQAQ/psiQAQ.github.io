# GitHub Pages 静态站点改造设计

## 目标

将现有 Fumadocs 风格知识站改造成可由 GitHub Pages 托管的纯静态网站。最终仓库计划命名为 `psiQAQ.github.io`，公开访问地址为 `https://psiqaq.github.io/`，无需购买或配置自定义域名。

本次保留现有 Next 16、vinext、React、Markdown 内容索引和页面视觉体系，不复制参考仓库的手写 HTML 结构，也不新增静态站点框架。

## 已选方案

采用 vinext 原生 `output: "export"` 静态导出，并通过 GitHub Actions 将 `dist/client` 发布到 GitHub Pages。

与直接提交生成后 HTML 相比，Actions 构建可以继续以仓库 Markdown 为唯一内容来源，避免手工同步构建产物。与保留 `agent-lab-notes` 仓库名的项目站点方案相比，`psiQAQ.github.io` 根站点不需要 `basePath`，现有以 `/` 开头的页面、资源和站内链接可以保持不变。

## 架构与数据流

1. `main` 分支保存 Markdown、React 页面和构建配置。
2. GitHub Actions 在 Node.js 22 环境执行 `npm ci` 和 `npm run build`。
3. vinext 在构建时读取 README 公布的 Markdown，生成首页、知识库、搜索、新手路径、404 和所有 `generateStaticParams()` 指定的指南页面。
4. 静态导出写入 `dist/client`；Pages 工作流只上传这一目录，不上传 Worker 服务端产物。
5. GitHub Pages 将该构建产物发布到 `https://psiqaq.github.io/`。

浏览器端搜索继续使用构建时嵌入的公开文档数据，不需要 API、数据库或服务端运行时。

## 代码改动

### 静态导出配置

`next.config.ts` 设置：

- `output: "export"`，启用 vinext 静态导出。
- `trailingSlash: false`，避开 vinext 0.0.50 对中文路径尾斜杠重定向的构建缺陷；各路由生成 `route.html`，由 GitHub Pages 提供无扩展名访问。

不设置 `basePath` 或 `assetPrefix`，因为目标是用户根站点，而不是 `/agent-lab-notes/` 子路径。

### 静态 Metadata

`app/layout.tsx` 移除 `next/headers` 和运行时请求头读取，改为静态 `metadata`：

- `metadataBase` 固定为 `https://psiqaq.github.io/`。
- Open Graph 与 X 图片继续使用现有 `/og.png`。
- 标题、描述和图片尺寸保持不变。

站点内“查看源仓库”链接更新为最终仓库地址 `https://github.com/psiQAQ/psiQAQ.github.io`。

### GitHub Pages 工作流

新增 `.github/workflows/pages.yml`，仅在 `main` 推送和手动触发时执行。工作流包含：

- 使用 GitHub 官方 Pages 模板要求的 `contents: read`、`pages: write` 与 `id-token: write` 权限。
- 使用 npm 缓存并执行锁文件一致的 `npm ci`。
- 构建后验证 `dist/client/index.html` 存在。
- 使用 GitHub 官方 Pages actions 上传 `dist/client` 并部署到 `github-pages` environment。
- 通过 concurrency 取消同一 Pages 组中尚未开始的旧部署，但不取消正在发布的部署。

## 双部署边界

保留 `.openai/hosting.json`、Sites Vite 插件和 Cloudflare Worker 构建能力，不删除现有 Sites 项目。GitHub Pages 只消费 `dist/client`，Sites 仍可消费完整 `dist`。

切换期间现有私有 Sites 地址继续作为回退。只有 GitHub Pages 线上验证完成后，才决定是否停用 Sites；本次不自动删除或修改现有 Sites 项目。

## 验证

自动验证包括：

- 测试静态导出配置、静态 Metadata、目标仓库链接和 Pages 工作流关键字段。
- 执行完整 `npm test`，确认构建和现有页面行为测试全部通过。
- 执行 `npm run lint` 和 `git diff --check`。
- 检查 `dist/client/index.html`、`dist/client/404.html`、一个指南路由的 `.html` 文件和静态资源目录。
- 确认静态产物中不依赖 `chatgpt.site` 或请求时生成的域名。

仓库重命名、推送、Pages 设置和首次公开部署属于外部写入。完成本地验证后单独征得确认，再执行并验证 `https://psiqaq.github.io/` 首页和至少一篇指南。

## 异常处理

- 任一路由无法静态导出时，构建必须失败，不回退为仅 Worker 可访问的混合产物。
- 如果 GitHub Actions 构建失败，保留现有 Sites 部署，不修改其访问策略。
- 如果 `psiQAQ.github.io` 名称被占用或无权重命名，停止外部操作并报告；不自动改用项目子路径。

## 不在本次范围

不购买域名，不配置 DNS，不迁移到 Jekyll、Hugo、Fumadocs 或其他框架；不提交生成后的静态文件；不新增评论、分析、登录、服务端搜索或缓存服务；未经确认不重命名仓库、不修改 Pages 设置、不推送 GitHub。
