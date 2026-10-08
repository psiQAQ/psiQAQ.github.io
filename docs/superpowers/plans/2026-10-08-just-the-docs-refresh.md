# Agent Lab Notes 网页改造计划

目标仓库：https://github.com/psiQAQ/psiQAQ.github.io\
参考项目：https://github.com/just-the-docs/just-the-docs\
计划日期：2026-10-08（北京时间）\
建议放置位置：docs/superpowers/plans/2026-10-08-just-the-docs-refresh.md\
状态：调查和计划已完成，改造尚未执行；D01—D12 均待本地确认。

## 1. 目标与执行边界

将 Agent Lab Notes 改造成接近 Just the Docs 阅读体验的中文文档站：全站一致的分类导航、清晰的文档层级、容易找到的搜索入口、适合长文和代码的正文排版，以及完整的资源访问入口。

本次以“内容不减少、现有有效入口不失效”为硬约束。允许调整页面布局、信息层级和展示形式。涉及技术栈、内容编排方式、首页形态等实质选择，先由本地 Codex 向用户确认，再实施对应阶段。

**推荐路线 A：保留现有 React / vinext / Vite 静态导出架构，重做文档展示层。** 现有内容读取、Markdown 渲染、中文 URL、源码资源和 GitHub Pages 发布可以继续使用，工作集中在界面及导航。路线 B 为完整迁移到 Jekyll + Just the Docs；如果用户更重视今后直接跟随该主题维护，可以选择 B。推荐不等于已经批准。

本地执行规则：

1. 先读最新 AGENTS.md、当前默认分支和本地工作区状态，再使用本计划。保护本地未提交修改。
2. 先完成 P0 的基线核查。对 Dxx 分批提问，每轮最多三个独立问题，并记录答案、日期及影响范围。
3. 用户尚未回答的实质分叉保持“待确认”；可以继续独立的调查或验证，不执行依赖该分叉的改动。
4. 建议的组件名、样式数值、工期是实施参考，可在不改变已确认行为的前提下调整。
5. 发现新分叉时追加编号，说明影响和推荐，不暗中扩大改造范围。
6. 当前交付是计划。本地形成可审查的代码、预览和验证结果后，再按用户届时授权处理推送、合并及发布；已有明确授权的动作不重复询问。

## 2. 已核实的仓库基线

### 2.1 采用最新目录整理结果

最终核对的主分支提交是：

5d0c234ea6955db2369b59eeaca17995357d6e01

提交时间：2026-10-08 15:55:47，北京时间。提交内容为 MCP 文档目录整理及网站入口同步。本次审阅开始于旧提交 1d27ad83，发现新增提交后已比较并更新基线。[R1]

新提交已经：

- 将 Blender、Zotero 文档移到 notes/agents/MCP/，文件正文没有增删。
- 将 ARS 的公开目录位置调整到 Skills，实际源文件仍在 notes/agents/tools/。
- 删除原来的“科研助力”分类标题，把对应文章归入现有分类。
- 新增“资源 → MCP 市场 → Model Context Protocol Observatory”。
- 更新新手路径中的 Zotero 链接及对应测试。

本地开始实施时如出现更新提交，应保留新变更并重建清单，不能为匹配本计划恢复旧目录。历史文档中的 Sites 发布步骤、旧首页区块以及旧阶段的范围限制，只作为设计背景；当前实现和当前用户选择优先。

### 2.2 内容数量

以下数字来自当前 Git 树和 README 两个 site-catalog 标记之间的条目，属于本次基线，不应写成永远不变的测试常量。[R2][R3]

| 基线对象 | 数量 | 含义 |
| --- | ---: | --- |
| 仓库受版本管理的文件 | 122 | 包含站点代码、笔记、资源及开发记录 |
| notes/ 下的文件 | 67 | 需要完整保留的笔记与附件 |
| notes/ 下的 Markdown | 37 | 33 篇指南、3 个 Markdown 资源、1 篇未列入公开清单的笔记 |
| notes/ 下的非 Markdown | 30 | 25 张 PNG、2 个 BAT、2 个 SH、1 个 HTML |
| README 公开条目 | 64 | 33 篇指南 + 31 项资源 |
| 指南 | 33 | 进入 /guides/ 的公开 Markdown |
| 外链资源 | 23 | 保留每条入口及其语义，不能仅按 URL 去重 |
| 本地 source 类资源 | 7 | 4 个脚本、2 个指令模板、1 篇学习文章 |
| 本地 page 类资源 | 1 | Git PR HTML 流程图 |
| 当前 download 类资源 | 0 | 现有代码支持该类型，应保留处理能力 |
| 实际按 Markdown 正文展示的公开内容 | 34 | 33 篇指南 + 1 篇资源中的 Git PR 教程 |

特别注意：

- README 有六个一级分类；代码中的 documents/categories 只包含五个有指南的分类。“资源”不能因为不在 documents/categories 中而从全站导航消失。
- source 是数据类型，不等于必须显示为代码。Git PR 教程属于学习型 Markdown，当前作为文章渲染。
- 25 张 PNG 中有 20 张被当前 Markdown 引用，另外 5 张仍需保留。未被引用不是删除依据。
- 唯一未进入公开清单的 Markdown 是 notes/agents/codex/codex-sqlite-bug-fix.md。它应继续保存在仓库；是否新增公开入口属于 D11。
- notes/agents/prompt/AGENTS.md 和 notes/agents/claude-code/CLAUDE.md 是已公开的模板资源。不能用“排除所有 AGENTS.md / CLAUDE.md”的规则误伤它们。根目录 AGENTS.md 和开发计划仍遵循现有公开清单边界。

### 2.3 技术与发布事实

当前构建采用 vinext，使用 Next API、React 和 Vite，并非直接运行 next build；Markdown 使用 marked。Node 要求不低于 22.13.0。构建执行 vinext build 后，再运行中文静态路径解码脚本，产物在 dist/client。[R4][R5]

next.config.ts 设置静态导出及 trailingSlash: false；scripts/decode-static-paths.mjs 处理百分号编码文件名，历史设计明确记录了中文路径相关原因。采用路线 A 时优先保留这些行为。[R5]

现有 Pages 工作流会在 push main 或手动触发时构建并发布 dist/client。当前只额外检查 index.html 是否存在，没有执行现有测试或 lint。现有 22 个测试中，页面渲染主要通过 dist/server/index.js 的 worker.fetch 完成，只抽查部分静态文件。因此“现有测试通过”不能替代对静态发布产物的完整验证。[R6][R7]

对应新提交的 Pages run 37746573880 已于 2026-10-08 15:57:29 更新为成功。[R8] 本次网页读取未能获得线上站点页面，界面判断来自固定提交源码；本计划不包含已经完成的浏览器视觉验收或本地构建结果。

## 3. 本次最值得解决的问题

| 当前情况 | 对读者的影响 | 建议改造 |
| --- | --- | --- |
| 顶栏负责全局入口，文档侧栏只在指南页出现 | 在知识库、资源和文章之间切换时布局不一致 | 为主要页面使用共同文档外壳 |
| README 和知识库已有 category/group，文章侧栏仅按 category 平铺 | Skills、MCP 等子分类在阅读时丢失层级 | 从同一清单生成可折叠的分类树 |
| 移动端文档导航只列当前分类 | 跨分类查找需要先离开文章 | 移动端保留全站目录入口，当前分类默认展开 |
| 搜索只匹配指南标题、分类和正文字符串 | 资源找不到，摘要也未展示实际命中位置 | 按 D07/D08 改搜索入口、范围及命中摘要 |
| 顶栏显示“/”快捷键提示，但没有对应监听 | 用户按提示操作没有效果 | 实现快捷键并处理输入框冲突，或移除提示 |
| 正文目录由正则提取，渲染标题由另一过程生成 | 代码中的井号注释可能变成无效目录 | 使用同一次 Markdown 解析结果生成正文标题和目录 |
| 资源中既有文章，又有完整源码 | 简单套文档模板会改变资源使用方式 | 分别保留文章阅读和源码查看、复制行为 |
| 发布只确认首页文件存在 | 深层页面、中文路径和附件可能漏检 | 发布前检查实际静态产物及页面资源 |

上述依据来自当前布局、指南页、内容解析器、搜索组件和测试实现。[R3][R6][R7][R9][R10][R11]

### 3.1 已确认的具体兼容问题

以下作为基线缺陷记录，不把它们误报成改版造成的回归：

1. notes/agents/tools/graphify.md 中代码围栏内的“## graphify”和“### 调用规则”会被 extractHeadings 误读，共产生四条不对应真实章节的目录条目。
2. notes/operating-system/linux.md 中 conf 代码块的四行“##”注释同样会进入目录。
3. notes/agents/codex/codex.md 有指向 ../prompt/AGENTS.md#user-interaction 的链接；目标模板页当前只输出源码，没有对应的 heading id。应在保留源码和复制能力的前提下，按 D12 选择源码定位或新增阅读视图，建立明确的兼容定位。
4. ponytail 文档的重复 Codex 标题当前产生 codex-2。更换目录提取或 slug 生成方式时，必须保留已有有效锚点。
5. 最近目录移动产生的旧 /guides/others/zotero 和 /guides/others/blender 没有在本次提交中补兼容入口。是否恢复作为 D10；新路径必须保持。

修复策略：从 Markdown token/AST 读取真正的标题，共享同一套标题 ID 分配结果；跳过 fenced code 等非标题内容。先记录旧的有效 ID，再处理重名与中文标点，避免修目录时破坏已被引用的锚点。不能通过删除代码里的注释或重写教程正文来消除误识别。

## 4. 推荐的网页形态

### 4.1 全局布局

保留 Agent Lab Notes 的知识站定位，采用文档站的结构：

- 桌面：左侧全站导航；中间正文；长文可在右侧保留本页目录。
- 顶部：持续可见的搜索入口，以及 GitHub 等少量辅助链接。
- 移动端：紧凑标题栏、可展开的全站目录、正文内可折叠的本页目录。
- 当前文章自动定位到所属分类和分组；读者可以展开其他分类。
- 面包屑从同一内容数据生成，目录项、知识库和搜索不各自维护一套顺序。
- 未启用 JavaScript 时，正文、普通链接及基本目录仍然可达；搜索与复制作为增强功能。

Just the Docs 原生提供侧栏、当前页高亮、面包屑和搜索；它的正文目录与子页面列表是不同功能。右侧固定目录、完整中文交互、跟随系统且记忆偏好的主题按钮等，需要独立实现，不能视为安装主题就自动获得。[R12][R13][R14]

### 4.2 建议保留的分类

先映射最新 README 的信息结构，不通过改版重新排列用户刚整理的领域归属。[R2]

| 一级分类 | 现有下级内容 | 指南 | 资源 |
| --- | --- | ---: | ---: |
| 基础环境 | Git、Node.js、UV、Miniforge | 4 | 0 |
| 系统与运行环境 | WSL、Ubuntu、双系统、Docker、Hyper-V、PowerShell、SSH | 8 | 0 |
| 智能体 | Claude Code、Codex、通用全局指令 | 6 | 10 |
| 智能体扩展 | Skills、MCP、周边工具与扩展、代码读取与生成 | 14 | 0 |
| 大模型选型与排行榜 | Models.dev、评测和排行榜入口 | 1 | 2 |
| 资源 | 入门与实践、原理与优化、MCP 市场、开发与模型工具、AI 新闻、AI 行业观察 | 0 | 19 |
| 合计 | 同一 README 清单驱动全部视图 | 33 | 31 |

首页、新手路径、知识库总览是视图入口，不要把它们混入上述笔记分类数量。

### 4.3 页面职责

| 现有入口 | 改造后职责 | 必须保留的信息或能力 |
| --- | --- | --- |
| / | 紧凑的文档首页，解释站点用途并引导阅读 | 原有站点介绍、知识库/新手路径/资源入口；如移动文案，应记录去向 |
| /start | 新手学习路径 | 五个步骤、每步说明与链接、完整任务提示词及完成标准 |
| /library | 全部指南索引 | 全部指南及分类/分组，列表顺序来自 README |
| /guides/... | 正文阅读 | 原文、代码、表格、图片、目录、锚点和交叉链接 |
| /resources | 资源总览 | 31 项资源及其分类语义，不只保留外链 |
| /resources/... | 本地资源详情 | 学习文档的正文阅读；脚本和模板的完整源码与复制 |
| /search | 可直接访问的搜索入口 | 即使增加顶部即时面板，仍保留该地址 |
| /404.html | 未找到页面提示 | 可回到首页、目录或搜索，避免静默返回首页冒充正确页面 |

### 4.4 视觉参考

建议先做首页、典型长文、资源详情三种页面的桌面/手机样例，再批量落地：

- 使用浅色正文区域、弱分割线、清晰的当前页状态和适量留白。
- 将大面积入口卡片压缩为目录式入口，保留长标题完整可读。
- 正文宽度以约 760—860 px 为设计起点；左栏约 240—280 px；右侧目录约 180—220 px，按实际视口收起。
- 中文正文建议约 16 px、行高约 1.7；代码和表格只在自身容器中横向滚动。
- 不限制文章正文高度，不用截断、只显示摘要或“加载更多”隐藏长篇证据。
- 色彩、品牌和深浅色范围按 D05 确认；这些数值是设计建议，不是当前主题的官方固定规格。

## 5. 待本地 Codex 确认的分叉

所有状态均为“待确认”。推荐项只为降低用户决策成本，不能直接写成已批准。能够继续独立基线工作的阶段无需等待全部问题回答。

| 编号 | 需要确认的问题 | 推荐候选 | 其他候选与主要代价 | 阻塞范围 |
| --- | --- | --- | --- | --- |
| D01 | 保留现有栈借鉴展示，还是实际使用 Just the Docs？ | A：现有栈重做展示 | B：迁移 Jekyll + 主题；需要重建内容编译、资源页及路由兼容 | 架构和构建实现 |
| D02 | 哪份文件继续决定公开内容及顺序？ | README site-catalog 继续为唯一手工入口 | 结构化目录或 front matter 成为唯一来源，并单向生成 README；不能长期手改两份目录 | 内容模型和导航 |
| D03 | 资源如何进入全站侧栏？ | 文档分类树 + 独立资源入口，主题页可附相关资源 | 同分类中混排文档和资源；需要清晰的类型标识，避免目录过长 | 侧栏和资源导航 |
| D04 | 首页是否也采用文档外壳？ | 紧凑文档首页，保留原内容和三个主要目的地 | 独立入口首页，其他页面使用文档外壳；多维护一种页面结构 | 首页 |
| D05 | 品牌和配色希望保留多少？ | 沿用 Agent Lab Notes 和现有青绿色识别，借鉴参考站排版 | 更接近 Just the Docs 紫色风格；同时确认站点中文标题及是否加入深色切换 | 视觉样例和元数据 |
| D06 | 正文目录放在哪里？ | 桌面右侧，移动端正文内折叠 | 完全采用参考站的正文内目录；布局简单但长文随读定位较弱 | 正文布局 |
| D07 | 搜索交互采用哪种形式？ | 顶部即时结果 + 保留 /search 完整入口 | 仅改进现有独立搜索页；实现较少 | 搜索界面 |
| D08 | 搜索增加哪些内容？ | 指南叙述正文 + 资源标题/类型/分组 + 学习文章正文 | 仅维持指南范围；或增加围栏代码、模板/脚本全文，需要确认并评估噪声和加载大小 | 搜索索引 |
| D09 | 长篇文章是否拆成多页？ | 本轮保持源文件和正文完整，只改善导航与阅读 | 拆正文和附录；需逐块迁移映射、旧 URL/锚点兼容及明确审核 | 内容移动或拆分 |
| D10 | 是否恢复更早的 Zotero/Blender 旧网址？ | 在新路径外补静态兼容入口，保留 query/hash | 仅保证此次基线中已有的新路径；记录历史断链 | 两个历史别名 |
| D11 | 未列出的 Codex SQLite 排障笔记是否新增公开入口？ | 保留源文件，维持当前未列入网页的状态 | 纳入清单、分类和搜索；先核对文章是否适合公开展示 | 仅该新增公开条目 |
| D12 | 指令模板如何支持章节定位？ | 原文视图为主，增加源码章节/行定位 | 增加阅读视图，同时保留完整原文查看与复制，旧章节链接进入阅读视图 | 模板详情和旧章节链接 |

D08 中的“叙述正文”沿用现有搜索去除围栏代码的边界。是否加入命令代码、模板全文和脚本全文应分别记录；内容完整保留与搜索索引范围是两项不同要求。

提问顺序建议：

1. 第一轮：D01、D02、D04，确定架构、维护入口及首页形态。
2. 第二轮：D03、D06、D05，结合三种页面样例决定导航和样式。D05 内若涉及品牌、配色、深色模式的独立选择，应拆成单独短问并分别记录；D12 在审阅模板样例时独立询问。
3. 第三轮：D07、D08，确认搜索。
4. 第四轮：D09、D10、D11，仅在相关工作开始前确认。

如果用户选择路线 B，还需在 B1 试验之后确认“源文最小 front matter”和“构建临时生成元数据”二选一，以及中文搜索采用哪种适配。不要为追求一次问完，把多个独立决定捆成一个同意按钮。

## 6. 分阶段实施计划

下列工时仅为在依赖可安装、仓库没有额外本地变更情况下的初步工作量估计，用于安排工作，不是已验证的完成承诺。以阶段交付物和验收结果判定完成。

| 阶段 | 优先级 | 工作内容 | 可审查交付物 | 进入下一阶段的条件 | 估计主动工作量 |
| --- | --- | --- | --- | --- | --- |
| P0 | P0 | 最新基线、内容与链接清单、现状构建 | 固定 SHA、manifest、已知缺陷清单、原站本地快照 | 清单完整，原有构建结果已记录 | 1—2 小时 |
| P1 | P0 | 确认主要分叉，形成三种页面样例 | 决策记录、首页/长文/资源页桌面和移动样例 | 用户已确认阻塞实现的选择 | 2—4 小时 |
| P2 | P1 | 统一文档外壳、分组导航、首页/资源适配 | 全部页面使用同一目录数据，主要入口可用 | 全部公开条目仍有入口 | 4—8 小时 |
| P3 | P1 | Markdown 目录修复、搜索、链接与资源兼容 | 同源标题/目录、搜索样例结果、资源行为保留 | 核心内容和交互验收通过 | 4—8 小时 |
| P4 | P0 发布前必做 | 静态产物验证、响应式检查、CI 约束 | 验证记录、预览、完整 diff、发布候选 | 所有硬性验收通过，残留项有明确状态 | 3—6 小时 |
| P5 | 发布 | 按届时授权合并/发布并回读 | 指定提交的 Actions 结果和线上抽样记录 | 部署与回读完成，或准确记录失败 | 0.5—1 小时 |

路线 A 的初步合计约 15—29 小时，不包括等待用户选择和外部环境修复。路线 B 在 P1 增加 B1 迁移试验，再根据实际差异重新估时，不直接套用路线 A 的估计。

### P0：建立不丢内容的基线

1. 读取当前默认分支、根 AGENTS.md、实际修改路径下适用的规则；查看 git status、现有分支和 worktree。
2. 使用本地已有仓库；没有时再克隆目标仓库。创建隔离工作分支，分支名可用 feat/just-the-docs-refresh。工作树路径采用本机约定，不假定某个磁盘路径已存在。
3. 从实际 README 清单建立 manifest，至少记录：
   - 基线 commit。
   - 条目序号、标题、分类、分组、图标/类型、原始链接。
   - 本地源路径、资源 kind、当前公开 URL、相关 query/hash。
   - 文件字节数和 hash；代码块、标题、图片和引用关系。
4. 对 notes/ 全量文件建立保留清单。公开页面清单和仓库文件保留清单分开记录，避免把“未发布”误当作“可以删除”。
5. 用锁文件安装依赖，完成一次原实现构建、现有测试及 lint，记录现有失败；不要将基线失败偷偷记为本次通过。
6. 从原构建的 dist/client 提取页面 URL、静态文件 URL、有效标题 ID 和资源映射。服务器响应正常不算已完成该步骤。
7. 保存首页、新手路径、长文、资源详情和搜索的本地截图。没有浏览器条件时记录缺口，不用源码断言替代视觉完成状态。

### P1：确认与样例

先确认 D01/D02/D04，再制作下列内容的样例：

- 首页：既有简介、三个主要入口、清晰主题目录。
- 长文：notes/agents/skills/agent-development-workflows-and-decisions.md，覆盖长目录、表格、代码和附录阅读。
- 资源详情：一份脚本或 AGENTS 模板，覆盖完整源码和复制；再检查学习型 Git PR 教程仍作为文章。

采用同一数据来源生成样例目录。用户确认样例后再扩大到全部页面，避免先批量改正文再讨论排版。

### P2：统一外壳与信息结构

1. 抽取实际需要复用的导航及目录组件，不按假设创建复杂框架。
2. 使用 category → group → document 生成折叠菜单；group 与 category 相同时不显示重复层。
3. 将资源入口和新手路径加入全站可达导航；无指南的资源分类不能被过滤掉。
4. 为首页、知识库、指南、资源、搜索使用一致的间距、字体、面包屑和移动入口。
5. 当前页应有明确状态；打开文章时所属父节点展开，侧栏滚动不使内容区域跳动。
6. 保留已有内容展示语义；D12 可以增加模板阅读视图，但必须同时保留完整原文查看和复制，不将模板改写为教程，也不把学习文章退化成源代码块。
7. 如果用户选择首页文案移位或文章拆分，建立逐段去向，包含原首页 JSX 文案和新手路径 JSX 文案，不能只检查 notes/。

### P3：内容解析、搜索与兼容

1. 使用同一次 Markdown 解析得到正文标题及目录数据，保留旧有效 ID，修复代码围栏误识别。
2. 检查源 Markdown 的链接、渲染后的 href/src 和目的地，而不是只匹配文本形式的 .md 链接。
3. 保留中文文件名、大小写以及带扩展名的资源路由，如 /resources/agents/claude-code/cc.bat 和 /resources/agents/prompt/AGENTS.md。
4. 实现已确认的搜索范围。先保持当前中文连续子串命中的能力，再加入标题优先、命中摘要等改进；不因换搜索库而回退中文可用性。P1 在确认 D08 后固定 20 条查询及目标页面、匹配字段和预期排名，不在测试失败后随意更改预期；未选资源或代码索引时，不要求命中该范围。
5. 搜索显示准确的内容类型和目标链接；空查询、无结果及键盘导航行为明确。
6. 若提示“/”或 Ctrl/Cmd+K，必须有实际行为；编辑输入框、文本区和组合输入时不能误触发。
7. 代码复制与完整源码复制分别检查：不要包含行号、按钮文字或隐藏的前后缀；保留换行和字符内容，失败时显示清晰反馈。
8. D10 选择恢复旧入口时生成真实静态兼容页，保留 query/hash，提供无 JavaScript 时可点击的目标链接。单纯前端路由 fallback 不能证明 Pages 上深链接可用。
9. 纯静态兼容页应如实标识为 HTML 跳转，不声称它实现了服务器 HTTP 301；优先保持现有 URL 本身。

### P4：验证、CI 和交付

1. 路线 A 在本地及 CI 运行现有内容/资源测试，更新确实受改版影响的旧布局断言；路线 B 按 B6 将原有行为覆盖迁移到新静态产物。
2. 不为通过测试删除内容保护，也不把全部断言改成“页面存在”。
3. 增加直接针对 dist/client 的检查，覆盖完整路由清单、资源文件和有效锚点。
4. 验证构建一次后的产物；避免在同一任务中先 npm run build 又通过 npm test 重复构建。可拆出验证已构建产物的脚本入口。
5. 增加只读 PR 检查；PR 构建不发布。Pages 部署仍限定授权的 main 提交或手动触发，验证失败不能上传部署。
6. 测试 390、768、1280、1440 px 的代表性视口；窄屏不得整页横向溢出，宽表格和长代码可局部滚动。
7. 形成完整 diff、内容保留报告、决策记录、截图、实际运行命令及结果，再进入发布。

### P5：发布与回退

发布前记录改造前可用提交及候选提交，确认部署的是已验证的那一份代码。

发布后检查首页、全部主要入口，以及中文指南路径、模板/脚本资源、Git PR HTML 和图片。若生产平台与本地静态服务器的路径解析有差别，以生产结果为准，修复后重验相关范围。

若需回退，优先回退本次合并提交并重新部署，保持之后用户提交的内容；不要使用会丢失其他工作的新旧分支强制覆盖。工作流显示成功和网页实际可用应分别记录。

## 7. 路线 A 的文件改动范围

以下是建议职责，不要求机械创建全部新文件。

| 文件或目录 | 建议变更 | 保留要求 |
| --- | --- | --- |
| app/layout.tsx | 统一全局布局、导航和搜索入口 | 站点链接、可访问性及元数据 |
| app/globals.css | 文档栅格、折叠导航、正文、移动端及打印样式 | 长代码/宽表格不截断，焦点可见 |
| app/page.tsx | D04 对应的首页 | 原有信息有明确保留位置 |
| app/start/page.tsx | 适配统一布局 | 五步骤、提示词和完成标准全文 |
| app/library/page.tsx | 总目录与导航共用数据 | 全部指南和现有顺序 |
| app/guides/[...slug]/page.tsx | 抽取共用导航、目录，完善面包屑 | 既有路由、正文与静态参数 |
| app/guides/[...slug]/table-of-contents-link.tsx | 需要时抽成通用目录链接组件 | 中文 hash 解码和滚动行为 |
| app/resources/page.tsx | 紧凑资源索引与分组 | 每种资源类型和点击语义 |
| app/resources/[...slug]/page.tsx | 共享阅读布局；改善源码定位 | 学习文章/脚本/模板语义不同 |
| app/search/page.tsx、components/search-client.tsx | D07/D08 对应搜索方案 | 既有 /search 入口和中文查询能力 |
| components/ 下现有复制组件 | 复用逻辑，适配样式和容器 | 复制纯文本及状态反馈 |
| lib/content.ts | 需要时暴露共用目录模型、资源搜索字段 | README 发布边界及类型校验 |
| lib/markdown.ts | 正文标题/目录共享解析，修复锚点问题 | 有效旧锚点、链接和图片映射 |
| tests/site.test.mjs | 保留内容验证并更新布局断言 | 不削弱原有功能保护 |
| scripts/ 下静态检查脚本 | 检查实际构建产物 | 与运行时服务器测试互补 |
| .github/workflows/pages.yml、可选 PR 检查文件 | 发布前验证、PR 只读验证 | main 发布边界及已验证产物 |
| docs/superpowers/specs/、docs/superpowers/plans/ | 新增此次设计/计划/验收记录 | 不把旧历史文档伪装成新状态 |
| README.md | 仅按 D02/D03 及实际维护流程更新说明 | 64 个当前公开条目及新用户变更 |
| notes/ | 推荐本轮只读，除明确批准的内容移动或定位修复 | 全量笔记和附件保留 |

路线 A 不必顺带更换构建器、升级全部依赖或清理 Sites/Cloudflare 集成。它们仍被当前构建引用；若日后要清理，先独立确认使用情况和等价发布方案。

## 8. 路线 B 的条件性迁移方案

仅在 D01 明确选择 Jekyll + Just the Docs 后执行。本节是完整的替代工作流，不与路线 A 同时全面开发。

### B1：先证明代表性内容可以无损迁移

从当前仓库保留所有源内容，在隔离分支搭建最小迁移样例：

- 普通短文。
- 最长类型的工作流/规划文档。
- 中文文件名的 Claude Code 教程。
- Docker 教程中的模板表达式。
- 含重复标题的 ponytail 和代码内标题的 graphify。
- AGENTS 模板、BAT/SH 脚本、Git PR Markdown 教程、独立 HTML 流程图。
- 包含图片和跨文件相对链接的文章。

试验通过后再扩展全站。试验未通过时报告具体差异和修复成本，不通过删段、删代码或改成外链规避内容损失。

### B2：依赖和主题集成

官方推荐从 just-the-docs-template 的必要文件接入 gem-based 构建，不需要 fork 整个主题。当前核实的正式版本是 Just the Docs 0.12.0，官方模板使用 Jekyll ~> 4.4.1；本地执行时再次核对发行版和实际 workflow 文件，并提交锁文件。[R15][R16]

建议集成的文件包括 Gemfile、Gemfile.lock、_config.yml、必要的自定义 include/style，以及 Actions 构建流程。只复制需要的模板文件，不用模板覆盖已有仓库。

官网文档展示 main 分支，可能包含固定 release 尚未具备的行为；按锁定版本验证扩展点。主题升级应独立提交并执行回归检查。

### B3：保持单一内容权威来源

如果 D02 保留 README：

- README 仍决定公开范围、分类、顺序、条目标题和资源类型。
- 构建时从清单生成主题导航元数据与必要页面；源 notes 保持作者熟悉的格式。
- 优先使用受控的临时生成目录，或最小适配器。生成文件明确标记，不让用户手动维护同一内容的第二份副本。
- Jekyll 的输入必须只包含明确允许发布的内容及必要资源，不能因为“扫描所有 Markdown”扩大公开范围。

如果 D02 改成元数据驱动：

- 确定每篇页面所需的 title、parent、nav_order、permalink 等信息；常见值使用 defaults。
- 由唯一来源生成 README 清单，保留 GitHub 阅读体验。
- 将生成前后 64 条清单逐项比较；新增公开条目仅按 D11 或用户后续明确授权处理。

Jekyll 默认对有 front matter 的文件执行页面转换；无 front matter 的 Markdown 可能只是静态复制，留在产物里不等于成为了可导航、可搜索的文章。[R17]

### B4：正文、链接与资源适配

- Jekyll 处理 Liquid 时可能解释代码块中的双花括号。当前 Docker 教程含 {{json .State}}，应对既有文章关闭 Liquid 处理，按需设置 render_with_liquid: false；只为确实需要模板处理的站点文件开启。[R18]
- 保留普通 Markdown 在 GitHub 中可阅读的相对链接；可以采用兼容插件或构建适配器，但必须验证中文路径、query/hash、资源页面和自定义 permalink。[R19]
- 用明确 permalink 或静态兼容页保留 /guides/...、/resources/...、/search 等地址。检查不带斜杠、中文百分号编码及 .md/.bat/.sh 后缀，不能只测默认英文样例。
- 原有附件/图片可能由 Vite 生成带 hash 的 URL。先从原静态产物获取真实映射，再决定保留物理输出路径或补兼容文件；不要凭源目录猜测旧公开 URL。
- 为源码型资源保留完整转义展示和复制；Git PR 教程继续为文章。新增原文件下载不是本次保留要求，若需要应另记为待确认功能，不与现有 download 类型支持混为一谈。
- 独立 Git PR HTML 含内联 SVG，按页面保留；不要把它转换成一张不可交互的截图。
- 排除内部开发记录要按公开清单和路径判断，不能一刀切排除所有 AGENTS.md 文件。

### B5：Just the Docs 原生能力与额外工作

| 需求 | 实际支持边界 | 迁移要求 |
| --- | --- | --- |
| 多层侧栏 | 当前主题支持任意层级；元数据决定父子关系 | 映射现有 category/group，不依赖文件夹自动推断 |
| 搜索 | 原生 Lunr，结果通常在搜索框下展示，没有独立结果页 | 保留 /search 旧入口并验证中文 |
| 中文搜索 | 默认分词规则不能保证连续中文词语召回 | 真实查询试验后选择中文适配或移植现有搜索逻辑 |
| 页内目录 | 基于正文内目录语法 | 右侧固定目录和滚动高亮需额外实现 |
| 复制代码 | 需启用配置并依赖浏览器 clipboard | 验证源码及普通代码两种复制 |
| 深浅色 | 有原生色板和切换接口 | 切换按钮、系统跟随和偏好保存按 D05 实现 |
| callouts | 需要定义并使用对应主题语法 | 不批量改写现有引用块来凑主题样式 |
| Mermaid | 需要显式启用并锁版本 | 当前公开 Markdown 未检出 Mermaid 围栏，不作为本轮迁移硬需求 |
| 完整中文界面 | 部分可通过 include 调整，部分需定制 | 检查搜索无结果、复制状态、aria-label 等 |
| 图片/附件 | 可作为静态文件发布 | 逐项核验源文件、目标 URL、字节和文件名 |

官方功能边界见导航、搜索、代码、定制及页内目录文档。[R12][R13][R14][R20][R21]

### B6：发布切换

使用 Actions 安装锁定依赖、生成允许发布的输入、构建 Jekyll、执行全量保留和链接检查，再上传构建目录。PR 只验证，main 才发布。

路线 B 需要迁移测试入口：保留原测试保护的内容、链接、资源、复制及公开边界，把依赖 worker.fetch、React 组件源码、Next/vinext 配置和 dist/client 的断言替换为 Jekyll 静态产物及必要浏览器交互检查，并记录覆盖对应关系。不要保留一套旧 Worker 来给新 Jekyll 页面取得“测试通过”，也不要直接删除全部旧测试。

现有 React/vinext、Worker、Sites/Cloudflare 文件是否下线，需要先证明新实现覆盖全部公开能力、确认当前是否仍有其他使用入口，再删除相关构建文件。不能把删除它们作为 B1 开始前的条件。

## 9. 硬性验收标准

| 编号 | 验收对象 | 可衡量的通过条件 |
| --- | --- | --- |
| AC01 | 源文件保留 | 67 个基线 notes 文件均有保留记录；未批准修改的文件 hash 不变，批准移动也保留内容对应关系 |
| AC02 | 公开条目 | 64 个当前条目逐项有目标，新增条目单独记录；不靠总数量相等代替逐项比较 |
| AC03 | 正文和代码 | 34 个基线渲染型 Markdown 内容完整，获准新增内容另列；段落/列表/表格/代码逐块映射，代码复制后与原文一致，仅允许规范化换行比较 |
| AC04 | JSX 中的内容 | 首页和 /start 的原有信息、五步骤、提示词、完成标准全部有去向 |
| AC05 | 源码资源 | 4 个脚本、2 个模板完整可查看和复制；文件名、编码、换行行为可验证 |
| AC06 | 图片与 HTML | 25 张 PNG 均保留；当前引用的 20 张可正常访问；Git PR HTML 页面及 SVG 可用 |
| AC07 | 当前公开 URL | 所有当前有效页面直接访问和刷新可用；中文、大小写及扩展名路径无新增断链 |
| AC08 | 锚点 | 基线有效锚点保留或明确映射；新增目录项全部对应真实元素；graphify/linux 误目录有修复证据，模板定位按 D12 验证 |
| AC09 | 导航 | 所有公开条目从首页通过目录/资源入口可达；当前分类展开，资源分类不遗漏 |
| AC10 | 搜索 | 按 D08 确认范围固定 20 条查询、目标及排名预期，覆盖中文词、句中词、混合术语和已选字段；约定目标进入前 5 项，未命中情况如实记录 |
| AC11 | 搜索边界 | 至少不低于既有指南搜索范围；仅在 D08 授权时扩展；不索引清单外内部内容 |
| AC12 | 移动与可访问性 | 390/768/1280/1440 px 代表页面可读；焦点可见、展开状态可识别、导航键盘可操作；无整页横向溢出 |
| AC13 | 静态发布 | 直接验证 dist/client 或 Jekyll 对应产物，不以 worker.fetch 成功替代；主要入口、资源及 404 行为正确 |
| AC14 | CI | 相关测试和 lint 通过；PR 验证不部署；发布上传的产物与通过验证的产物一致 |
| AC15 | 内容边界 | 除 D11 或后续明确批准条目外，未公开笔记保持既有网页范围；根 AGENTS 与内部设计/计划不新增公开入口，已公开模板保持可访问 |
| AC16 | 发布回读 | 已发布时记录 commit、工作流结果及线上抽样；未发布或未验证的项明确标记未完成 |

补充说明：

- 对新增/删除条目做集合差分，对原文件做 hash 对比，对渲染内容做块级比较，对网页做目标可达性检查。四种检查互相补充。
- 旧站已经存在的断链或无效锚点单独列“基线问题”；不能把它们从报告中隐藏，也不能将它们全部归因于改版。
- 外部网站暂时不可访问时保留原入口并记录，不以删除资源使链接检查“全绿”。
- 当前公开 Markdown 没有检出 Mermaid 围栏、真正脚注或 Markdown 原始 HTML token；代码示例中的相似文本不算正文语法。不要为未出现的语法扩展制造本轮必做工作。
- 上述语法扫描使用环境内 marked 17.0.5，仓库锁定的是 18.0.7；它是静态审计参考。最终语法基线和渲染验收应使用本地仓库锁定版本重新生成，不能将扫描结论当成生产构建结果。
- 新增深色模式、图表渲染、分词库等可选增强，应只在用户选定范围后验证对应能力。

## 10. 本地协作与提交建议

在同一实施分支内按依赖分批提交，建议顺序：

1. 记录基线、用户决策与内容保护检查。
2. 统一文档布局、分类树及页面接入。
3. 修复目录解析和资源定位。
4. 实现已确认的搜索改进。
5. 静态产物验证、CI、视觉调整及维护说明。

可以并行安排的工作：

| 工作 | 主要文件范围 | 与其他工作约定 |
| --- | --- | --- |
| 内容与验证 | manifest、tests、静态检查脚本 | 先与页面开发确认路由和数据接口 |
| 页面与导航 | layout、页面组件、共用导航 | globals.css 由单一负责人协调，避免同时覆盖 |
| 搜索 | search-client、搜索数据适配 | 只依赖已确认的目录模型和索引范围 |
| 最终复核 | diff、构建产物、用户决策记录 | 从用户操作和内容保留结果检查，不只看代码整洁度 |

由主 Codex 统一合并本地分支上的变更并完成最后验证；不要让多个代理各自重构全局布局或内容解析器。当前任务不指定某个模型或要求新装插件，遵循本机实际能力。

### 可直接交给本地 Codex 的任务说明

~~~text
请执行这份 Agent Lab Notes 网页改造计划。目标仓库仅为 psiQAQ/psiQAQ.github.io。

先读取最新默认分支的 AGENTS.md、README.md、当前网站实现和本地 git status，核对本计划基线之后的变更，保护用户现有工作。沿用仓库现有文档目录约定，把本次实施状态和决策写到独立计划中。

先完成 P0 的内容、路由和现状验证；第一轮向我确认 D01、D02、D04。后续分叉按计划在相关步骤前分批确认。推荐答案不代表我已经同意；未回答时不要直接选择。新增实质分叉继续记录，普通实现细节可自行判断。

确认后，在隔离工作分支/worktree 中完成选定路线。保留全部原文、代码、图片、脚本、模板、学习资源和外链，保持当前有效 URL。不得将未公开内容自动纳入网页，不得为完成改版清理未使用附件。保留最新 MCP 目录整理。

优先复用已有内容模型、复制逻辑与测试；修复代码块被误识别成目录等已确认问题。搜索、首页、颜色、TOC 和资源导航按我选择的方案实现。先给出三种代表页面的桌面/移动样例，再扩展到全站。

完成后执行内容差分、链接/锚点检查、实际静态产物验证、现有测试和必要视觉检查。提交完整改动、验证证据和未解决问题。推送、合并及发布按我在本轮的明确授权继续；缺少该授权时，先把可审查的候选结果准备完整再询问。
~~~

## 11. 参考资料

仓库事实采用固定提交链接；实施时重新读取最新默认分支。

[R1]: https://github.com/psiQAQ/psiQAQ.github.io/commit/5d0c234ea6955db2369b59eeaca17995357d6e01
[R2]: https://github.com/psiQAQ/psiQAQ.github.io/blob/5d0c234ea6955db2369b59eeaca17995357d6e01/README.md
[R3]: https://github.com/psiQAQ/psiQAQ.github.io/blob/5d0c234ea6955db2369b59eeaca17995357d6e01/lib/content.ts
[R4]: https://github.com/psiQAQ/psiQAQ.github.io/blob/5d0c234ea6955db2369b59eeaca17995357d6e01/package.json
[R5]: https://github.com/psiQAQ/psiQAQ.github.io/blob/5d0c234ea6955db2369b59eeaca17995357d6e01/docs/superpowers/specs/2026-08-01-github-pages-static-export-design.md
[R6]: https://github.com/psiQAQ/psiQAQ.github.io/blob/5d0c234ea6955db2369b59eeaca17995357d6e01/.github/workflows/pages.yml
[R7]: https://github.com/psiQAQ/psiQAQ.github.io/blob/5d0c234ea6955db2369b59eeaca17995357d6e01/tests/site.test.mjs
[R8]: https://github.com/psiQAQ/psiQAQ.github.io/actions/runs/37746573880
[R9]: https://github.com/psiQAQ/psiQAQ.github.io/blob/5d0c234ea6955db2369b59eeaca17995357d6e01/app/layout.tsx
[R10]: https://github.com/psiQAQ/psiQAQ.github.io/blob/5d0c234ea6955db2369b59eeaca17995357d6e01/components/search-client.tsx
[R11]: https://github.com/psiQAQ/psiQAQ.github.io/blob/5d0c234ea6955db2369b59eeaca17995357d6e01/lib/markdown.ts
[R12]: https://just-the-docs.com/docs/navigation/
[R13]: https://just-the-docs.com/docs/navigation/in-page/
[R14]: https://just-the-docs.com/docs/customization/
[R15]: https://github.com/just-the-docs/just-the-docs/releases/tag/v0.12.0
[R16]: https://github.com/just-the-docs/just-the-docs-template/blob/main/Gemfile
[R17]: https://jekyllrb.com/docs/front-matter/
[R18]: https://jekyllrb.com/docs/liquid/tags/
[R19]: https://github.com/benbalter/jekyll-relative-links
[R20]: https://just-the-docs.com/docs/search/
[R21]: https://just-the-docs.com/docs/ui-components/code/

- [仓库级 AGENTS.md](https://github.com/psiQAQ/psiQAQ.github.io/blob/5d0c234ea6955db2369b59eeaca17995357d6e01/AGENTS.md)
- [Just the Docs 官方主页](https://just-the-docs.com/)
- [Just the Docs 官方模板](https://github.com/just-the-docs/just-the-docs-template)
- [主题导航层级](https://just-the-docs.com/docs/navigation/main/levels/)
- [主题 callouts](https://just-the-docs.com/docs/ui-components/callouts/)
- [主题迁移说明](https://just-the-docs.com/migration/)
- [Jekyll 静态文件](https://jekyllrb.com/docs/static-files/)

## 附录 A：当前公开条目的完整迁移清单

下表保留 README 顺序和条目身份，作为 P0 重建 manifest 的核对起点。网站路径由当前 lib/content.ts 规则推导；标为“构建时解析”的 HTML 地址，需要从原静态产物提取，不能凭文件名补造。

| 序号 | 标题 | 分类 / 分组 | 源路径或外部网址 | 当前入口 / 行为 |
| --- | --- | --- | --- | --- |
| 1 | 📄 Git：版本控制基础 | 基础环境 | notes/others/git.md | /guides/others/git |
| 2 | 📄 Node.js：JavaScript 运行环境 | 基础环境 | notes/programme-env/nodejs.md | /guides/programme-env/nodejs |
| 3 | 📄 UV：Python 开发基础设施 | 基础环境 | notes/programme-env/uv.md | /guides/programme-env/uv |
| 4 | 📄 Miniforge：Python 开发基础设施 | 基础环境 | notes/programme-env/miniforge.md | /guides/programme-env/miniforge |
| 5 | 📄 WSL：Windows Linux 子系统 | 系统与运行环境 | notes/operating-system/wsl.md | /guides/operating-system/wsl |
| 6 | 📄 Ubuntu：Linux 常用命令与配置 | 系统与运行环境 | notes/operating-system/linux.md | /guides/operating-system/linux |
| 7 | 📄 Windows + Ubuntu 双系统安装 | 系统与运行环境 | notes/operating-system/linux-setup.md | /guides/operating-system/linux-setup |
| 8 | 📄 Docker：容器化部署实战 | 系统与运行环境 | notes/operating-system/docker.md | /guides/operating-system/docker |
| 9 | 📄 Hyper-V：Windows 虚拟化 | 系统与运行环境 | notes/operating-system/Hyper-V.md | /guides/operating-system/Hyper-V |
| 10 | 📄 PowerShell 7：Windows Agent 终端优化 | 系统与运行环境 | notes/operating-system/powershell.md | /guides/operating-system/powershell |
| 11 | 📄 Git 远程仓库 SSH 配置 | 系统与运行环境 | notes/operating-system/SSH-git.md | /guides/operating-system/SSH-git |
| 12 | 📄 跨系统远程 SSH 登录配置 | 系统与运行环境 | notes/operating-system/SSH-remote-login.md | /guides/operating-system/SSH-remote-login |
| 13 | 📄 Claude Code：终端编程智能体 | 智能体 / Claude Code | notes/agents/claude-code/claude-code.md | /guides/agents/claude-code/claude-code |
| 14 | 📺 Claude Code 国内安装视频 | 智能体 / Claude Code | https://www.bilibili.com/video/BV1AjGD6mEV4 | 外部链接 |
| 15 | 🚀 Claude Code Windows 启动脚本 | 智能体 / Claude Code | notes/agents/claude-code/cc.bat | /resources/agents/claude-code/cc.bat；源码查看/复制 |
| 16 | 🚀 Claude Code Windows 更新脚本 | 智能体 / Claude Code | notes/agents/claude-code/update-claude-code.bat | /resources/agents/claude-code/update-claude-code.bat；源码查看/复制 |
| 17 | 🚀 Claude Code macOS 快捷启动脚本 | 智能体 / Claude Code | notes/agents/claude-code/ccmac.sh | /resources/agents/claude-code/ccmac.sh；源码查看/复制 |
| 18 | 🚀 Claude Code Linux/WSL 启动脚本 | 智能体 / Claude Code | notes/agents/claude-code/cclinux.sh | /resources/agents/claude-code/cclinux.sh；源码查看/复制 |
| 19 | 🧾 Claude Code 全局指令模板 | 智能体 / Claude Code | notes/agents/claude-code/CLAUDE.md | /resources/agents/claude-code/CLAUDE.md；源码查看/复制 |
| 20 | 📄 Claude Code 命令速查 | 智能体 / Claude Code | notes/agents/claude-code/tutorial/常用命令.md | /guides/agents/claude-code/tutorial/常用命令 |
| 21 | 📺 Claude Code 命令使用视频 | 智能体 / Claude Code | https://www.bilibili.com/video/BV1caE86BEyQ/?p=1 | 外部链接 |
| 22 | 📄 Claude Code 交互模式指南 | 智能体 / Claude Code | notes/agents/claude-code/tutorial/交互模式.md | /guides/agents/claude-code/tutorial/交互模式 |
| 23 | 📺 Claude Code 交互模式视频 | 智能体 / Claude Code | https://www.bilibili.com/video/BV1caE86BEyQ/?p=2 | 外部链接 |
| 24 | 📄 Claude Code 使用最佳实践 | 智能体 / Claude Code | notes/agents/claude-code/tutorial/最佳实践.md | /guides/agents/claude-code/tutorial/最佳实践 |
| 25 | 📺 Claude Code 最佳实践视频 | 智能体 / Claude Code | https://www.bilibili.com/video/BV1caE86BEyQ/?p=3 | 外部链接 |
| 26 | 📄 Codex：OpenAI 编程智能体 | 智能体 / Codex | notes/agents/codex/codex.md | /guides/agents/codex/codex |
| 27 | 📄 Agent 全局指令演进记录 | 智能体 / 通用全局指令 | notes/agents/prompt/Global-Agent-Instructions-revolution.md | /guides/agents/prompt/Global-Agent-Instructions-revolution |
| 28 | 🧾 Agent 通用全局指令模板 | 智能体 / 通用全局指令 | notes/agents/prompt/AGENTS.md | /resources/agents/prompt/AGENTS.md；源码查看/复制 |
| 29 | 📄 Skills：智能体能力扩展 | 智能体扩展 / Skills | notes/agents/skills/skills.md | /guides/agents/skills/skills |
| 30 | 📄 ARS：学术研究工作流 | 智能体扩展 / Skills | notes/agents/tools/academic-research-skills.md | /guides/agents/tools/academic-research-skills |
| 31 | 📄 Agent 文档生命周期规划 | 智能体扩展 / Skills | notes/agents/skills/agent-document-lifecycle-planning.md | /guides/agents/skills/agent-document-lifecycle-planning |
| 32 | 📄 Agent 开发工作流与决策流 | 智能体扩展 / Skills | notes/agents/skills/agent-development-workflows-and-decisions.md | /guides/agents/skills/agent-development-workflows-and-decisions |
| 33 | 📄 PPT 制作相关 Skills | 智能体扩展 / Skills | notes/agents/skills/pptx-related-skills.md | /guides/agents/skills/pptx-related-skills |
| 34 | 📄 Zotero：文献管理 | 智能体扩展 / MCP | notes/agents/MCP/zotero.md | /guides/agents/MCP/zotero |
| 35 | 📄 Blender：开源三维建模 MCP 接入 | 智能体扩展 / MCP | notes/agents/MCP/blender.md | /guides/agents/MCP/blender |
| 36 | 📄 Context7 MCP：技术文档检索 | 智能体扩展 / MCP | notes/agents/MCP/context7.md | /guides/agents/MCP/context7 |
| 37 | 📄 Exa MCP：AI 联网搜索 | 智能体扩展 / MCP | notes/agents/MCP/Exa.md | /guides/agents/MCP/Exa |
| 38 | 📄 gh_grep MCP：GitHub 代码搜索 | 智能体扩展 / MCP | notes/agents/MCP/gh_grep.md | /guides/agents/MCP/gh_grep |
| 39 | 📄 claude-tap：Agent 会话拆解与可视化 | 智能体扩展 / 周边工具与扩展 | notes/agents/tools/claude-tap.md | /guides/agents/tools/claude-tap |
| 40 | 📄 Claude Code 会话状态栏工具 | 智能体扩展 / 周边工具与扩展 | notes/agents/tools/statusline.md | /guides/agents/tools/statusline |
| 41 | 📄 graphify：代码库知识图谱 | 智能体扩展 / 代码读取与生成 | notes/agents/tools/graphify.md | /guides/agents/tools/graphify |
| 42 | 📄 ponytail：防止过度设计插件 | 智能体扩展 / 代码读取与生成 | notes/agents/tools/ponytail.md | /guides/agents/tools/ponytail |
| 43 | 📄 Models.dev：AI 模型参数查询 | 大模型选型与排行榜 | notes/models/models-dev.md | /guides/models/models-dev |
| 44 | 📊 Artificial Analysis：大模型评测 | 大模型选型与排行榜 | https://artificialanalysis.ai/ | 外部链接 |
| 45 | ⚔️ Arena AI：大模型竞技排名 | 大模型选型与排行榜 | https://arena.ai/ | 外部链接 |
| 46 | 📚 Claude Code 入门学习指南 | 资源 / Agent 入门与实践 | https://coding.stormzhang.ai/ | 外部链接 |
| 47 | 📚 Codex 入门学习指南 | 资源 / Agent 入门与实践 | https://coding.stormzhang.ai/ | 外部链接 |
| 48 | 📚 CodexGuide：OpenAI Codex 中文教程与实战指南 | 资源 / Agent 入门与实践 | https://codexguide.ai/ | 外部链接 |
| 49 | 📺 Codex APP 入门实战 | 资源 / Agent 入门与实践 | https://www.bilibili.com/video/BV1Kk9kBAEJv | 外部链接 |
| 50 | 📺 Codex 科研效率实战 | 资源 / Agent 入门与实践 | https://www.bilibili.com/video/BV1NwEb6gEy1 | 外部链接 |
| 51 | 📺 Claude Code 后端通信原理 | 资源 / Agent 原理与优化 | https://www.bilibili.com/video/BV1G2o5BqELx | 外部链接 |
| 52 | 📺 Claude Code 缓存优化 | 资源 / Agent 原理与优化 | https://www.bilibili.com/video/BV1ZQ5u6bEJ7 | 外部链接 |
| 53 | 🌐 Model Context Protocol Observatory | 资源 / MCP 市场 | https://mcpobservatory.com/ | 外部链接 |
| 54 | 📺 Git 与 GitHub 核心概念 | 资源 / 开发与模型工具 | https://www.bilibili.com/video/BV1ySLc6QEcB | 外部链接 |
| 55 | 📺 Markdown 完全指南 | 资源 / 开发与模型工具 | https://www.bilibili.com/video/BV1tJXZBgEoC | 外部链接 |
| 56 | 🌐 Can I Run AI：本地模型检测 | 资源 / 开发与模型工具 | https://www.canirun.ai | 外部链接 |
| 57 | 📚 Git PR 教程文档（普通贡献者视角） | 资源 / 开发与模型工具 | notes/others/git-pr-contributor-tutorial.md | /resources/others/git-pr-contributor-tutorial.md；文章阅读 |
| 58 | 🌐 Git PR 流程图（普通贡献者视角） | 资源 / 开发与模型工具 | notes/others/git-pr-flowchart.html | 独立 HTML 页面；构建时解析 URL |
| 59 | 📰 24 小时更新雷达：AI 新闻聚合 | 资源 / AI 新闻 | https://learnprompt.github.io/ai-news-radar/ | 外部链接 |
| 60 | 📰 AIHOT：AI 热点聚合 | 资源 / AI 新闻 | https://aihot.virxact.com/ | 外部链接 |
| 61 | 📺 AI Agent 发展史 | 资源 / AI 行业观察 | https://www.bilibili.com/video/BV1NL9tBsELS | 外部链接 |
| 62 | 📺 姚顺宇 AI 访谈 | 资源 / AI 行业观察 | https://www.bilibili.com/video/BV1YR5E6EE9o | 外部链接 |
| 63 | 📺 中美大模型差距讨论 | 资源 / AI 行业观察 | https://www.bilibili.com/video/BV1HDVT6bE8x | 外部链接 |
| 64 | 📺 程序员视角下的 AI 叙事 | 资源 / AI 行业观察 | https://www.bilibili.com/video/BV1gyEd6xEyu | 外部链接 |
