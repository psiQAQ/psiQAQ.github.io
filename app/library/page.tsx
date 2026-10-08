import Link from "next/link";
import { DocumentShell } from "@/components/document-shell";
import { categories, documents } from "@/lib/content";
import { catalogGroupId } from "@/lib/catalog.mjs";

export const metadata = { title: "知识库" };

export default function LibraryPage() {
  return (
    <DocumentShell currentHref="/library">
      <header className="page-intro compact">
        <p className="eyebrow">{documents.length} 篇公开指南</p>
        <h1>知识库</h1>
        <p>已经知道要解决什么问题时，直接按主题进入对应指南。</p>
      </header>

      <div className="library-layout">
        <div className="library-sections">
          {categories.map((category, categoryIndex) => {
            const items = documents.filter((document) => document.category === category);
            const groups = [...new Set(items.map((document) => document.group))];
            const subgroups = groups.filter(group => group !== category);
            return (
              <section id={category} key={category}>
                <div className="library-section-title">
                  <h2>{`${categoryIndex + 1}. ${category}`}</h2>
                  <span>{items.length} 篇</span>
                </div>
                {groups.map((group) => (
                  <div className="library-group" id={group !== category ? catalogGroupId(category, group) : undefined} key={group}>
                    {group !== category && <h3>{`${categoryIndex + 1}.${subgroups.indexOf(group) + 1} ${group}`}</h3>}
                    <div className="library-list">
                      {items
                        .filter((document) => document.group === group)
                        .map((document) => (
                          <Link href={`/guides/${document.slug}`} key={document.slug}>
                            <strong>{document.title}</strong>
                            <span>阅读指南 →</span>
                          </Link>
                        ))}
                    </div>
                  </div>
                ))}
              </section>
            );
          })}
        </div>
      </div>
    </DocumentShell>
  );
}
