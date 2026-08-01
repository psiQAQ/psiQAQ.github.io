# 制作 pptx 相关 skills

Anthropic 官方 `pptx`、MiniMax `pptx-generator`、`color-expert`、`frontend-slides`、`scientific-schematics`、`beautiful_deck` 等均能查到对应 skill 信息或 `SKILL.md`。([GitHub][1])

## 0. 通用型：所有 PPT 主题都适合安装

```cmd
# PPTX 文件底座：创建、读取、编辑、拆分、合并 PowerPoint，适合所有 .pptx 工作流
npx skills add https://github.com/anthropics/skills/tree/main/skills/pptx -a claude-code -y

# PPTX 生成增强：适合版式、字体、颜色、slide types、design system、PptxGenJS、XML 编辑
npx skills add https://github.com/MiniMax-AI/skills/tree/main/skills/pptx-generator -a claude-code -y

# 颜色审美：配色、调色板、渐变、色彩空间、可访问性、对比度
npx skills add meodai/skill.color-expert -a claude-code -y

# 通用网页/界面设计审查：用于检查布局、间距、层级、可读性、界面审美，可作为 PPT/HTML slides 视觉参考
npx skills add https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines -a claude-code -y

# 高审美 HTML slides：适合动画、转场、科技感、网页式演示，也可用于 PPT 视觉参考
npx skills add zarazhangrui/frontend-slides -a claude-code -y

# Reveal.js 演示：适合画面切换、代码块、演讲备注、网页幻灯片、教程型 presentation
npx skills add https://github.com/ryanbbrown/revealjs-skill/tree/main/skills/revealjs -a claude-code -y
```

通用型覆盖关系：

| 需求 | 对应 skill |
| ---------- | ----------- |
| 颜色审美 | `color-expert` |
| 排版布置 | `pptx-generator`、`web-design-guidelines`、`frontend-slides` |
| 画面切换 | `frontend-slides`、`revealjs` |
| 图文处理 | `pptx`、`pptx-generator` |
| 表格处理 | `pptx`、`pptx-generator` |
| PPTX 文件编辑 | `pptx` |
| HTML/网页式演示 | `frontend-slides`、`revealjs` |

## 1. 技术 / 调研汇报（图文）补充

这类只补充**科学图示、科研图表、技术汇报结构**相关 skills。K-Dense 的 scientific skills 面向 research、science、engineering、analysis 场景；`scientific-schematics` 用于 scientific diagrams、system diagrams、flowcharts 等；`publication-chart-skill` 用于 publication-quality scientific figure/table。([GitHub][2])

```cmd
# 科学示意图：技术路线图、系统架构图、算法流程图、实验流程图、光学/成像流程图
npx skills add https://github.com/K-Dense-AI/scientific-agent-skills/tree/main/scientific-skills/scientific-schematics -a claude-code -y

# 科研图表/论文级图表：实验曲线、benchmark、ablation、heatmap、scatter、line、bar、论文表格
npx skills add https://github.com/Galaxy-Dawn/claude-scholar/tree/main/skills/publication-chart-skill -a claude-code -y

# 专业 PPT 全流程生成：适合技术调研、产品介绍、路演、方案汇报、结构化专业 PPT
npx skills add sunbigfly/ppt-agent-skills -a claude-code -y

# 学术/技术 deck 审美：适合研究汇报、技术课程、图表、代码块、叙事弧和视觉审查
npx skills add https://github.com/scunning1975/MixtapeTools/tree/main/.claude/skills/beautiful_deck -a claude-code -y
```

适合页面类型：

| 页面类型 | 推荐补充 skill |
| --------- | ------------------------- |
| 技术路线图 | `scientific-schematics` |
| 系统架构图 | `scientific-schematics` |
| 实验数据图 | `publication-chart-skill` |
| 调研结论页 | `ppt-agent-skills` |
| 学术报告 deck | `beautiful_deck` |

## 2. 工作总结汇报（图文）补充

这类只补充**总结汇报结构、成果展示、管理层叙事**相关 skills。`beautiful_deck` 明确覆盖主题设计、叙事弧、figures/tables、graphics audit；`ppt-agent-skills` 适合专业 PPT 全流程生成。([GitHub][3])

```cmd
# 专业 PPT 全流程生成：适合年度总结、季度总结、项目复盘、老板汇报、成果展示
npx skills add sunbigfly/ppt-agent-skills -a claude-code -y

# 高审美 deck：适合统一主题、叙事弧、图文风格、管理层汇报观感
npx skills add https://github.com/scunning1975/MixtapeTools/tree/main/.claude/skills/beautiful_deck -a claude-code -y
```

适合页面类型：

| 页面类型 | 推荐补充 skill |
| ------- | ------------------------ |
| 年度/季度总结 | `ppt-agent-skills` |
| 项目复盘 | `ppt-agent-skills` |
| 高层汇报 | `beautiful_deck` |
| 成果展示页 | `beautiful_deck` |
| 里程碑/路线图 | 通用 `frontend-slides` 已覆盖 |

## 3. 工具使用分享教程（文字居多）补充

这类通用型已经基本覆盖，尤其是 `revealjs` 和 `frontend-slides`。如果必须补充，建议只加一个偏“教程/讲义生成”的 skill；但这次我没有把之前未能确认 `SKILL.md` 的 `pamelafox/presentation-skills/...` 放进来。

```cmd
# 工具教程一般不额外补充；优先使用通用型中的 revealjs、frontend-slides、pptx、pptx-generator
```

适合页面类型：

| 页面类型 | 推荐 skill |
| ----- | ------------------------------- |
| 安装流程 | 通用 `revealjs`、`pptx-generator` |
| 命令行教程 | 通用 `revealjs`、`frontend-slides` |
| 步骤卡片 | 通用 `frontend-slides` |
| 错误排查页 | 通用 `pptx-generator`、`revealjs` |
| FAQ 页 | 通用 `frontend-slides` |

## 4. ppt 风格

## guizang-ppt-skill

<https://github.com/op7418/guizang-ppt-skill>

一个适配 Claude Code / Codex 等 Agent 环境的网页 PPT 技能,用于生成单文件 HTML 横向翻页 PPT、PPT 配图和多平台封面。

内置两套视觉系统:

Style A: 电子杂志 × 电子墨水。像 Monocle 贴上了代码,适合叙事、观点、分享、个人风格表达。
Style B: 瑞士国际主义。网格至上、单一高饱和锚点色、直角、发丝线、极致字号对比,适合事实、产品、分析、方法论表达。

安装

```bash
npx skills add https://github.com/op7418/guizang-ppt-skill --skill guizang-ppt-skill
```

[1]: https://github.com/anthropics/skills/blob/main/skills/pptx/SKILL.md?utm_source=chatgpt.com "skills/skills/pptx/SKILL.md at main · anthropics/skills"
[2]: https://github.com/K-Dense-AI/scientific-agent-skills?utm_source=chatgpt.com "K-Dense-AI/scientific-agent-skills: A set of ready to use ..."
[3]: https://github.com/scunning1975/MixtapeTools/blob/main/.claude/skills/beautiful_deck/SKILL.md?utm_source=chatgpt.com "MixtapeTools/.claude/skills/beautiful_deck/SKILL.md at ..."
