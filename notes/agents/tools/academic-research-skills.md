# academic-research-skills 使用说明

Academic Research Skills（ARS）是一套面向学术研究与论文写作的技能集合。它不是单纯的“写作提示词包”，而是把研究选题、文献综述、论文结构、审稿模拟和修订等任务组织成更稳定的工作流。

这个项目目前有两个仓库，分别对应两类助手：

- 面向 Claude Code：<https://github.com/Imbad0202/academic-research-skills>
- 面向 Codex：<https://github.com/Imbad0202/academic-research-skills-codex>

可以直接理解为：**同一套 ARS 方法，分别为不同 Agent 做了不同包装。**

## 1. 它如何影响 Agent

ARS 的作用不是替你做决定，而是改变 Agent 处理学术任务的方式。装上之后，Agent 不再只是临时回答“帮我写一段”这类问题，而会更倾向于：

- 先帮你收敛研究问题，而不是直接生成正文
- 把任务分成研究、写作、审稿、修订几个阶段
- 更关注文献、结构、论证和引用的一致性
- 在长任务里维持一套相对稳定的研究流程

换句话说，它影响的是 Agent 的**工作方式**，不是只多加几个命令。

## 2. Claude Code 安装

对应仓库：
<https://github.com/Imbad0202/academic-research-skills>

官方推荐的快速安装方式是插件安装：

```text
/plugin marketplace add Imbad0202/academic-research-skills
/plugin install academic-research-skills
```

安装完成后，可以先试一个最常用的入口：

```text
/ars-plan
```

如果你只是想验证是否安装成功，这一步通常就够了。

## 3. Codex 安装

对应仓库：
<https://github.com/Imbad0202/academic-research-skills-codex>

Codex 版是单 skill 入口，官方 README 当前给出的安装方式是：

```bash
python3 "$HOME/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py" \
  --repo Imbad0202/academic-research-skills-codex \
  --ref main \
  --path skills/academic-research-suite \
  --method git
```

安装完成后，建议新开一个 Codex 对话，并先检查：

```text
/skills
```

正常情况下，你应看到一个 ARS 相关 skill，而不是一组分散的多个子 skill。

Codex 版的主要入口是：

```text
Use $academic-research-suite ...
```

也支持把部分 Claude 风格的命令意图写成普通文本，例如：

```text
ars-plan 我的论文主题是……
```

## 4. 通用使用方式

无论你使用 Claude Code 还是 Codex，最稳妥的方式都不是一上来就让 Agent “直接写论文”，而是明确说明当前阶段：

- 现在是在收敛研究问题
- 现在是在做文献综述
- 现在是在搭结构
- 现在是在修订初稿
- 现在是在模拟审稿

阶段说清楚，输出通常会稳定很多。

## 5. 通用提示词示例

下面这些提示词可以直接改主题后使用，数量不多，但覆盖了最常见的研究任务。

### 1. 收敛研究问题

```text
我想写一个关于“高校质量保障中的 AI 应用”的研究，但目前研究问题还不够清晰。请先帮助我收敛研究问题、界定研究范围，并指出这个选题最容易失焦的地方。先不要写论文提纲。
```

### 2. 做文献综述规划

```text
我正在做“生成式 AI 在高等教育治理中的应用”文献综述。请先帮我设计综述结构，给出建议的主题分组、比较维度，以及哪些证据类型必须补齐。不要直接生成完整正文。
```

### 3. 把资料整理成论文结构

```text
我已经有文献笔记、若干核心观点和初步发现。请帮我把这些材料整理成一篇论文的结构草案，输出应包括：章节安排、每章核心论点、现阶段证据缺口，以及下一步优先补什么。
```

### 4. 审稿前自查

```text
请把这篇稿子当作准备投稿的论文来做一次严格自查，重点看研究问题是否清楚、论证链条是否完整、引用是否支撑论点，以及最可能被审稿人质疑的地方。
```

### 5. 回复审稿意见

```text
下面是论文初稿和审稿意见。请先区分哪些意见是必须实质修改、哪些是表述层面可回应的问题，再帮我生成一个可执行的修订清单和回复思路。先不要直接代写整封回复信。
```

## 6. 最后建议

ARS 最适合的用法，不是“让 Agent 一次把所有事做完”，而是：

1. 先明确当前阶段
2. 再要求当前阶段的输出
3. 做完一个阶段，再进入下一个阶段

这样比一次性要求“从选题到成稿再到审稿模拟全部完成”要稳得多。
