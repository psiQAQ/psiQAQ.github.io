import Link from "next/link";
import { categories, documents } from "@/lib/content";

export default function Home() {
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
            <Link className="button primary" href="/start">新手路径</Link>
            <Link className="button secondary" href="/library">知识库</Link>
            <Link className="button secondary" href="/resources">资源</Link>
          </div>
        </div>
        <aside className="knowledge-overview" aria-label="知识库索引">
          <div className="knowledge-stats">
            <div><strong>{documents.length}</strong><span>篇公开指南</span></div>
            <div><strong>{categories.length}</strong><span>个主题</span></div>
          </div>
          <nav aria-label="全部主题">
            {categories.map((category) => (
              <Link href={`/library#${encodeURIComponent(category)}`} key={category}>
                <span>主题</span>
                <strong>{category}</strong>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>
        </aside>
      </section>
    </main>
  );
}
