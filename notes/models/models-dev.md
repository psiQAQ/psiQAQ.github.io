# Models.dev｜AI 模型规格、价格与能力查询

Models.dev 是一个开源的 AI 模型信息数据库，用来查询不同大模型的规格、价格、上下文长度、多模态能力、工具调用能力和供应商接入信息。它更像“模型参数表”和“模型价格表”，不是单纯的排行榜；适合在选模型、估算 API 成本、比较多模态支持、给 Agent 配置模型时使用。

官网：<https://models.dev/>
仓库：<https://github.com/anomalyco/models.dev>

## 适合解决什么问题

1. 选模型时，不用分别打开 OpenAI、Anthropic、Google、DeepSeek、Qwen、Mistral 等多个官网查价格。
2. 写代码或配置 Agent 时，可以快速确认模型 ID、供应商、API 地址和文档入口。
3. 做成本估算时，可以统一查看输入、输出、推理、缓存读取、缓存写入等 token 单价。
4. 做多模态任务前，可以确认模型是否支持图片、音频、视频、PDF、文件附件等输入。
5. 做工具调用或结构化输出任务前，可以确认模型是否支持 tool call、structured output、temperature 等能力。
6. 对比同一个模型在不同供应商上的价格、上下文长度、输出长度和功能差异。

## 它和排行榜网站的区别

Models.dev 不是主要用来判断“哪个模型最强”，而是用来判断“某个模型能不能用、怎么接、多少钱、支持什么能力”。

| 工具类型 | 主要用途 | 适合回答的问题 |
| ------------------- | ------------------ | ---------------------------- |
| Models.dev | 模型规格、价格、能力、供应商信息查询 | 这个模型多少钱？支持图片吗？上下文多长？哪个供应商能用？ |
| Artificial Analysis | 模型性能、速度、价格、质量综合分析 | 哪些模型速度更快？价格/性能比如何？ |
| Arena 类排行榜 | 人类偏好或竞技场排名 | 用户主观更喜欢哪个模型的回答？ |

因此，Models.dev 更适合放在“大模型选型与排行榜”一类目录下，作为排行榜网站的补充工具。

## 网站页面怎么看

打开官网后，页面顶部主要有三个入口：

* `Models`：按模型本身查看信息。
* `Providers`：按供应商查看信息。
* `Labs`：按模型开发机构查看信息。

页面也支持搜索，普通用户最常用的是直接按模型名或厂商名搜索，例如：

```text
gpt-4o
claude
gemini
deepseek
qwen
kimi
openrouter
siliconflow
```

## Models 页面能查什么

`Models` 页面是最常用的入口。每一行对应一个模型，适合快速比较模型核心参数。

| 字段 | 含义 | 选型时怎么看 |
| ----------- | ------------ | ----------------------------------------- |
| Model | 模型名称和模型 ID | 配置 API 或 Agent 时优先看模型 ID |
| Lab | 模型开发机构 | 判断模型来源，例如 OpenAI、Anthropic、Google、Alibaba |
| Providers | 有多少供应商提供该模型 | 数量越多，通常越容易找到可用 API 或中转服务 |
| Context | 最大上下文窗口 | 长文档、代码仓库、论文分析优先看这个字段 |
| Output | 最大输出 token 数 | 长报告、长代码生成、批量摘要需要关注 |
| Input | 最大输入 token 数 | 大文件、大上下文任务需要关注 |
| Reasoning | 是否支持推理能力 | 数学、代码、规划任务建议关注 |
| Tool Call | 是否支持工具调用 | Agent、MCP、函数调用场景需要关注 |
| Structured | 是否支持结构化输出 | JSON 输出、自动化流水线、数据抽取需要关注 |
| Temperature | 是否支持温度参数 | 需要控制随机性时关注 |
| Weights | 权重是否开放 | 本地部署、二次训练、私有化部署需要关注 |
| Price | 输入/输出价格 | 成本估算最重要字段之一 |
| Release | 发布时间 | 判断模型新旧 |
| Updated | 数据更新时间 | 判断该条信息是否近期更新 |

## 模型详情页怎么看

点击某个模型后，会进入模型详情页。这个页面最适合回答两个问题：

1. 这个模型本身有什么能力？
2. 哪些供应商提供这个模型，价格和限制有什么不同？

模型详情页通常会展示：

* 模型 ID
* 所属 Lab
* 模型 family
* provider 数量
* context 长度
* output limit
* knowledge cutoff
* release date
* last updated
* weights 是否开放
* input / output modalities
* capabilities
* provider 对比表

其中 `Providers` 表格很关键。即使是同一个模型，不同供应商也可能有不同的价格、上下文长度、输出限制、工具调用支持和结构化输出支持。实际使用前，建议点进对应供应商文档再确认额度、地区、账号权限和调用方式。

## Providers 页面能查什么

`Providers` 页面按供应商组织信息，适合回答“我准备使用某个平台，它支持哪些模型”。

| 字段 | 含义 |
| -------- | --------------------------------- |
| Provider | 供应商名称 |
| Models | 该供应商收录的模型数量 |
| Package | 对应 AI SDK 包或 OpenAI-compatible 类型 |
| API | API base URL |
| Docs | 官方文档入口 |

这个页面适合配置 Agent 或代码项目时使用。例如你准备使用 OpenRouter、SiliconFlow、阿里云、Google、Azure、OpenAI、Anthropic、Ollama、LM Studio 等供应商，可以先在这里确认：

* 是否有该供应商；
* 支持多少模型；
* 是否是 OpenAI-compatible；
* API base URL 是什么；
* 官方文档在哪里。

## Labs 页面能查什么

`Labs` 页面按模型开发机构归类，适合看某个机构目前有哪些模型，以及这些模型被多少供应商提供。

| 字段 | 含义 |
| ------------ | ------------ |
| Lab | 模型开发机构 |
| Models | 该机构收录的模型数量 |
| Providers | 有多少供应商提供这些模型 |
| Last Updated | 最近更新时间 |

例如你只想看 OpenAI、Anthropic、Google、DeepSeek、Alibaba、Moonshot AI、Mistral、xAI 等机构的模型，可以从 `Labs` 进入。

## 普通用户的使用流程

### 1. 查某个模型是否适合当前任务

假设你要选择一个模型做论文总结、代码分析或图片理解，可以按下面流程查：

1. 打开 [models.dev](https://models.dev/)。
2. 搜索模型名，例如 `gpt-4o`、`claude`、`gemini`、`qwen`。
3. 先看 `Context` 和 `Output`，判断是否能放下你的任务输入和输出。
4. 再看 `Reasoning`、`Tool Call`、`Structured`，判断是否适合 Agent 或自动化任务。
5. 如果涉及图片、PDF、音频、视频，再进入详情页看 `modalities`。
6. 最后看 `Price` 和 `Providers`，选择合适供应商。

### 2. 查模型价格

价格字段通常按“每百万 token 美元”展示，重点看：

* input：输入 token 价格；
* output：输出 token 价格；
* reasoning：推理 token 价格；
* cache_read：缓存读取价格；
* cache_write：缓存写入价格；
* input_audio / output_audio：音频输入或输出价格。

注意：看到 `$0.00` 不一定代表无限免费，可能是本地模型、开源权重、特殊计划、预览额度或数据缺失。涉及实际付费时，仍需要打开供应商官方文档确认。

### 3. 查多模态支持

如果任务包含图片、语音、视频或 PDF，需要重点查：

* `modalities.input`
* `modalities.output`
* `attachment`
* `Input`
* `Output types`

| 任务 | 需要重点确认 |
| ------ | --------------------- |
| 图片问答 | input 是否包含 image |
| PDF 阅读 | 是否支持 PDF 或 attachment |
| 语音输入 | input 是否包含 audio |
| 视频理解 | input 是否包含 video |
| 图片生成 | output 是否包含 image |
| 语音输出 | output 是否包含 audio |

### 4. 查 Agent 能力

如果模型要用于 Claude Code、Codex、OpenCode、MCP Agent 或自定义自动化系统，需要重点确认：

| 能力 | 用处 |
| ----------------- | ------------------ |
| Tool Call | 模型能否稳定调用工具 |
| Structured Output | 能否输出严格 JSON 或结构化结果 |
| Reasoning | 是否适合复杂规划、代码修复、数学推理 |
| Context | 能否放下项目文件、日志、长文档 |
| Output | 能否输出完整代码或长报告 |
| Temperature | 是否能控制随机性 |
| Provider API | 是否方便接入当前工具链 |

## 适合让 Agent 阅读使用的提示词

如果你使用 Claude Code、Codex 或其他 Agent，可以直接让它读取 models.dev 和仓库，然后帮你完成模型选型。

```text
请阅读 https://models.dev/ 和 https://github.com/anomalyco/models.dev ，帮我比较以下模型或供应商：

1. 模型/供应商：
   - 模型 A
   - 模型 B
   - 模型 C

2. 我的任务：
   - 代码修改 / 长文档阅读 / 图片理解 / 论文总结 / Agent 工具调用 / JSON 数据抽取

3. 重点提取：
   - model id
   - provider
   - input price
   - output price
   - reasoning/cache/audio price（如果有）
   - context limit
   - output limit
   - input/output modalities
   - reasoning
   - tool_call
   - structured_output
   - open_weights
   - release_date
   - last_updated
   - 官方文档链接

4. 最后请给出：
   - 推荐模型
   - 推荐供应商
   - 成本风险
   - 能力风险
   - 是否需要回到供应商官网二次确认
```

## API 查询方式

Models.dev 提供 JSON API，适合让 Agent、脚本或自己的项目读取。

```bash
# 查询供应商与模型数据
curl https://models.dev/api.json

# 查询 provider-agnostic 的模型元数据
curl https://models.dev/models.json

# 查询合并后的完整目录
curl https://models.dev/catalog.json

# 查询供应商 logo
curl https://models.dev/logos/anthropic.svg
```

| API | 用途 |
| ----------------------- | ------------- |
| `api.json` | 查询供应商维度的数据 |
| `models.json` | 查询模型本身的元数据 |
| `catalog.json` | 查询合并后的模型目录 |
| `/logos/{provider}.svg` | 获取供应商 logo |
| `/logos/labs/{lab}.svg` | 获取模型开发机构 logo |

普通用户不一定需要直接调用 API；更推荐把这些链接交给 Agent，让它读取后生成对比表。

## 仓库结构和贡献方式

Models.dev 的数据在 GitHub 仓库中以 TOML 文件组织。大体结构可以理解为：

```text
models/
providers/
labs/
packages/
```

其中：

* `models/`：存放模型本身的通用元数据；
* `providers/`：存放不同供应商提供模型时的价格、限制、API 和覆盖信息；
* `labs/`：存放模型开发机构信息；
* `packages/`：存放网页和数据处理相关代码。

如果发现价格、上下文、模型 ID 或多模态能力已经过期，可以到仓库提交 issue 或 PR。对于经常变化的模型价格，优先以供应商官方文档为准，再同步到 Models.dev。

## 使用时的注意事项

1. Models.dev 是开源社区维护的数据源，更新速度快，但不能替代供应商官方计费页面。
2. 同一个模型在不同供应商处可能有不同价格、上下文限制、输出限制和能力开关。
3. `$0.00` 需要谨慎理解，不要直接当作永久免费。
4. 多模态能力要同时看 input/output modalities、attachment 和供应商文档。
5. Agent 工具调用场景不要只看模型质量，还要看 tool call、structured output 和上下文长度。
6. 对科研或商业项目，建议把 Models.dev 作为第一轮筛选工具，把供应商官方文档作为最终确认来源。

## 推荐用法总结

* 想知道“哪个模型最强”：看排行榜和评测网站。
* 想知道“这个模型多少钱”：看 Models.dev。
* 想知道“这个模型支持什么输入输出”：看 Models.dev。
* 想知道“哪个供应商能用这个模型”：看 Models.dev 的模型详情页。
* 想知道“能不能接到 Agent 或代码里”：看 provider、API、tool call、structured output。
* 想做最终采购或生产环境接入：Models.dev 初筛，供应商官网复核。
