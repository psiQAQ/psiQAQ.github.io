# Skills

Skills 是一套给 Agent 注入可复用能力和流程的机制，用于沉淀规则、模板和专用工作流。这篇文档先介绍 skills 工具本身，再分别列 Claude Code / Codex 推荐项，最后整理 skills 的常用管理命令。

## skills 管理工具

<https://github.com/vercel-labs/skills>

### 安装目录

- 全局安装默认 skills 的位置在 `~/.agent/skills/` 文件夹下
- `~/.agents/.skill-lock.json` 为记录了全局安装的 skills 信息

## skills introduction

- <https://support.claude.com/en/articles/12512198-how-to-create-custom-skills>
- <https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/>
- <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices>

## Claude Code 推荐 Skills

```bash
npx skills add https://github.com/anthropics/Skills.git -g --skill docx --skill pdf --skill pptx --skill xlsx --skill theme-factory --skill doc-coauthoring --skill mcp-builder --skill skill-creator -y
npx skills add https://github.com/vercel-labs/skills.git -g --skill find-skills -y
npx skills add https://github.com/op7418/Humanizer-zh -g -y
npx skills add https://github.com/github/awesome-copilot.git -g --skill refactor -y
npx skills add https://github.com/useai-pro/openclaw-skills-security.git -g --skill skill-vetter -y
```

## Codex 推荐 Skills

`Codex` 自带部分常用 Skills，以下 Skills 为额外推荐的 Skills

```bash
npx skills add https://github.com/anthropics/Skills.git -g --skill theme-factory --skill mcp-builder -y
npx skills add https://github.com/vercel-labs/skills.git -g --skill find-skills -y
npx skills add op7418/Humanizer-zh -g -y
npx skills add https://github.com/github/awesome-copilot.git -g --skill refactor -y
npx skills add https://github.com/useai-pro/openclaw-skills-security.git -g --skill skill-vetter -y
```

## Skills 管理

```bash
# 列出全局安装的 skills，不加 -g 则列出当前目录下的 skills
npx skills list -g

# 启动 skills 搜索器，可以搜索 skills 名称和描述
npx skills search

# 查找 skills，[query] 替换为你要查找的 skills 名称
npx skills find [query]

# 删除安装 skills，[skills] 替换为 skills 名称
npx skills remove [skills]

# 更新安装 skills，[skills] 替换为 skills 名称，不添加 [skills] 则更新所有 skills
npx skills update [skills]

# 初始化一个 skills 项目，默认会创建一个 SKILL.md 文件，[name] 替换为你的 skills 名称
npx skills init [name]
```

更多命令请参考 <https://github.com/vercel-labs/skills>
也可让 Agent 帮你管理

## 利用镜像站安装 skills

### Github 镜像站

<https://gh-proxy.com/>

```bash
# 例如安装 Humanizer-zh
git clone https://gh-proxy.org/https://github.com/op7418/Humanizer-zh.git
npx skills add ./Humanizer-zh -g -a claude-code -y

git clone https://gh-proxy.org/https://github.com/anthropics/Skills.git
npx skills add ./Skills -g --skill docx --skill pdf --skill pptx --skill xlsx --skill theme-factory --skill doc-coauthoring --skill mcp-builder --skill skill-creator -y
```
