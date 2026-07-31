import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "准备必要环境",
    description: "先完成 Git 与 Node.js 等基础环境，后面的安装命令才有稳定运行条件。",
    links: [["Git 指南", "/guides/others/git"], ["Node.js 指南", "/guides/programme-env/nodejs"]],
  },
  {
    number: "02",
    title: "选择 Agent",
    description: "Codex 与 Claude Code 任选一个即可，不需要同时安装。根据你已有的模型和工作方式选择。",
    links: [["Codex 指南", "/guides/agents/codex/codex"], ["Claude Code 指南", "/guides/agents/claude-code/claude-code"]],
  },
  {
    number: "03",
    title: "添加科研 Skills",
    description: "安装面向研究问题收敛、文献综述规划和论文自查的 Skills。",
    links: [["Skills 入门", "/guides/agents/skills/skills"], ["科研 Skills", "/guides/agents/tools/academic-research-skills"]],
  },
  {
    number: "04",
    title: "配置 Zotero",
    description: "连接你的文献库。任何批量写入先使用 dry-run 查看将要发生的变化。",
    links: [["Zotero 指南", "/guides/others/zotero"]],
  },
  {
    number: "05",
    title: "完成首次任务",
    description: "选择少量文献执行一次完整流程，并检查笔记是否保留证据、方法和不确定项。",
    links: [],
  },
];

export const metadata = { title: "新手路径" };

export default function StartPage() {
  return (
    <main className="page-shell content-page">
      <header className="page-intro">
        <p className="eyebrow">约 60–90 分钟</p>
        <h1>完成第一次科研 Agent 文献整理</h1>
        <p>一次只完成当前步骤。目标不是把工具装满，而是得到一篇可以继续核查和使用的研究笔记。</p>
      </header>

      <div className="learning-path">
        {steps.map((step) => (
          <section className="learning-step" key={step.number}>
            <div className="step-number">{step.number}</div>
            <div>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
              {step.links.length > 0 && (
                <div className="inline-links">
                  {step.links.map(([label, href]) => (
                    <Link href={href} key={href}>{label} →</Link>
                  ))}
                </div>
              )}
              {step.number === "05" && (
                <div className="prompt-card">
                  <span>可直接使用的任务提示</span>
                  <p>从当前 collection 选择 5 篇文献，先以 dry-run 展示整理计划。确认后生成一篇研究笔记，分别列出研究问题、采用的方法、主要结论、证据局限和待验证事项；不要补写文献中没有的信息。</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <section className="completion-card">
        <p className="eyebrow">完成标准</p>
        <h2>你已经得到一篇可核查的结构化文献笔记</h2>
        <p>如果笔记明确区分了文献事实、你的推断和待验证问题，这条新手路径就已经完成。</p>
        <Link className="button primary" href="/library">继续浏览知识库</Link>
      </section>
    </main>
  );
}
