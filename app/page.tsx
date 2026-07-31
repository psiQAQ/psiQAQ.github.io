import Link from "next/link";
import { categories, documents } from "@/lib/content";

const steps = [
  ["01", "准备环境", "安装完成任务所需的 Git、Node.js 与运行环境。"],
  ["02", "选择 Agent", "在 Codex 与 Claude Code 中选择一个开始使用。"],
  ["03", "添加 Skills", "让 Agent 获得文献分析与研究规划能力。"],
  ["04", "配置 Zotero", "建立可预览、可确认的文献整理流程。"],
  ["05", "完成笔记", "生成研究问题、方法、结论与待验证事项。"],
];

const featuredSlugs = [
  "agents/codex/codex",
  "agents/claude-code/claude-code",
  "agents/tools/academic-research-skills",
  "others/zotero",
];

export default function Home() {
  const featured = featuredSlugs.flatMap((slug) => {
    const document = documents.find((item) => item.slug === slug);
    return document ? [document] : [];
  });

  return (
    <main>
      <section className="hero page-shell">
        <div className="hero-copy">
          <p className="eyebrow">面向科研新手的实践指南</p>
          <h1>从零搭建科研 Agent 工具链，完成第一篇结构化文献笔记。</h1>
          <p className="hero-summary">
            不需要先掌握所有工具。沿着一条可验证的路径完成第一次任务，再按需要查阅完整知识库。
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/start">开始新手路径</Link>
            <Link className="button secondary" href="/library">浏览知识库</Link>
          </div>
        </div>
        <div className="path-preview" aria-label="五步入门路径">
          <div className="path-preview-header">
            <span>第一次任务</span>
            <strong>5 个步骤</strong>
          </div>
          <ol>
            {steps.map(([number, title]) => (
              <li key={number}>
                <span>{number}</span>
                <strong>{title}</strong>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section page-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">一条路径先跑通</p>
            <h2>从安装到第一篇笔记</h2>
          </div>
          <Link href="/start">查看完整路径 →</Link>
        </div>
        <div className="step-grid">
          {steps.map(([number, title, description]) => (
            <article className="step-card" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-tinted">
        <div className="page-shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">精选指南</p>
              <h2>新手最常用的四个入口</h2>
            </div>
          </div>
          <div className="guide-card-grid">
            {featured.map((document) => (
              <Link className="guide-card" href={`/guides/${document.slug}`} key={document.slug}>
                <span>{document.category}</span>
                <h3>{document.title}</h3>
                <p>打开指南 →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section page-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">完整知识库</p>
            <h2>{documents.length} 篇公开指南，按需查阅</h2>
          </div>
          <Link href="/search">搜索全部内容 →</Link>
        </div>
        <div className="category-row">
          {categories.map((category) => (
            <Link href={`/library#${encodeURIComponent(category)}`} key={category}>{category}</Link>
          ))}
        </div>
      </section>
    </main>
  );
}
