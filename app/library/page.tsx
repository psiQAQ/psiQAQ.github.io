import Link from "next/link";
import { categories, documents } from "@/lib/content";

export const metadata = { title: "知识库" };

export default function LibraryPage() {
  return (
    <main className="page-shell content-page">
      <header className="page-intro compact">
        <p className="eyebrow">{documents.length} 篇公开指南</p>
        <h1>知识库</h1>
        <p>已经知道要解决什么问题时，直接按主题进入对应指南。</p>
      </header>

      <div className="library-layout">
        <aside className="library-index" aria-label="知识库分类">
          {categories.map((category) => (
            <a href={`#${encodeURIComponent(category)}`} key={category}>{category}</a>
          ))}
        </aside>
        <div className="library-sections">
          {categories.map((category) => {
            const items = documents.filter((document) => document.category === category);
            return (
              <section id={category} key={category}>
                <div className="library-section-title">
                  <h2>{category}</h2>
                  <span>{items.length} 篇</span>
                </div>
                <div className="library-list">
                  {items.map((document) => (
                    <Link href={`/guides/${document.slug}`} key={document.slug}>
                      <strong>{document.title}</strong>
                      <span>阅读指南 →</span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
