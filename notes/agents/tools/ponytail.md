# ponytail

`ponytail` 是一个给 AI 编码助手使用的“懒人工程师”规则集 / 插件，核心目标不是让 Agent 少说话，而是让它少写无必要的代码，优先删除、复用、走标准库和平台原生能力，尽量避免过度设计。

它更适合这些场景：

- Agent 容易把简单需求做复杂
- 明明能一行解决，却喜欢引入依赖、封装一层、加一堆配置
- 你更想要“最短可用解”，但又不想丢掉安全性、校验和基本质量

## 项目地址

<https://github.com/DietrichGebert/ponytail>

## 安装

官方 README 当前支持多个宿主，包括 Claude Code、Codex、Copilot CLI、OpenCode、Gemini CLI 等。

### Claude Code

```text
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

注意：官方 README 特别说明，这两个命令需要分两次发送。

### Codex

```bash
codex plugin marketplace add DietrichGebert/ponytail codex
```

然后：

1. 打开 `/plugins`
2. 选择 Ponytail marketplace
3. 安装 `Ponytail`
4. 打开 `/hooks`
5. 审查并信任它的两个 lifecycle hooks
6. 新开一个线程开始使用

官方说明里还提到：这套安装同时适用于 Codex desktop app；安装完成后重启应用即可生效。

### GitHub Copilot CLI

```bash
copilot plugin marketplace add DietrichGebert/ponytail
copilot plugin install ponytail@ponytail
```

### OpenCode

写入 `opencode.json`：

```json
{
  "plugin": ["@dietrichgebert/ponytail"]
}
```

### Gemini CLI

```bash
gemini extensions install https://github.com/DietrichGebert/ponytail
```

## 它会如何影响 Agent

`ponytail` 的核心不是“代码越少越好”，而是按一条固定顺序做取舍：

1. 这件事到底需不需要做
2. 代码库里有没有现成实现
3. 标准库能不能解决
4. 平台原生能力能不能解决
5. 已安装依赖能不能解决
6. 能不能一行解决
7. 只有前面都不行，才写最小必要代码

因此它会明显改变 Agent 的默认行为，例如：

- 少引入新依赖
- 少写为未来预留的抽象
- 更倾向于复用已有代码
- 更愿意删代码而不是加代码
- 对简单需求优先给出最短可用方案

官方 README 也特别强调：它不会把安全、输入校验、数据丢失防护、无障碍这些内容一起“省掉”。

## 常用命令

### Claude Code / 支持 slash command 的宿主

```text
/ponytail
/ponytail lite
/ponytail full
/ponytail ultra
/ponytail-review
/ponytail-audit
/ponytail-debt
/ponytail-gain
/ponytail-help
```

这些命令的含义大致是：

- `/ponytail [lite|full|ultra|off]`：设置强度
- `/ponytail-review`：检查当前 diff 是否过度工程化
- `/ponytail-audit`：审查整个仓库里哪些地方可以删、可以简化
- `/ponytail-debt`：汇总代码里标记的 `ponytail:` 延后事项
- `/ponytail-gain`：查看项目 README 中给出的效果统计
- `/ponytail-help`：查看命令帮助

### Codex

在 Codex 里，这些更像 skill 调用，README 给出的例子是：

```text
@ponytail-review
```

也就是说，在 Codex 中你更应该把它理解成“可调用 skill”，而不是普通 shell 命令。

## 使用建议

如果你只是想让 Agent 变得更克制，最常用的方式通常就两种：

### 1. 让它一直处于 `full`

适合日常开发。这样既能明显压制过度设计，又不会像 `ultra` 那样太激进。

### 2. 在改动前先跑一次 `review`

如果你已经感觉某个改动可能写复杂了，先让它做一次：

```text
/ponytail-review
```

或在 Codex 中：

```text
@ponytail-review
```

这样通常比事后再返工更省时间。

## 一个实用理解

可以把 `ponytail` 理解成：**给 Agent 装上一层“先怀疑这段代码需不需要存在”的习惯**。

它不是为了追求炫技式极简，也不是代码高尔夫，而是尽量把简单问题留在简单层面解决。
