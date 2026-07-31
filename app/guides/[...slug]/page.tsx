import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, documents, findDocument } from "@/lib/content";
import { extractHeadings, renderMarkdown } from "@/lib/markdown";

type GuidePageProps = {
  params: Promise<{ slug: string[] }>;
};

export function generateStaticParams() {
  return documents.map((document) => ({ slug: document.slug.split("/") }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const document = findDocument((await params).slug.join("/"));
  return document ? { title: document.title } : {};
}

export default async function GuidePage({ params }: GuidePageProps) {
  const document = findDocument((await params).slug.join("/"));
  if (!document) notFound();
  const headings = extractHeadings(document.markdown);

  return (
    <div className="guide-layout page-shell">
      <aside className="guide-sidebar">
        <p className="eyebrow">知识库</p>
        <DocumentNavigation currentSlug={document.slug} visibleCategories={categories} />
      </aside>

      <main className="guide-main">
        <div className="breadcrumbs">
          <Link href="/library">知识库</Link>
          <span aria-hidden="true">/</span>
          <span>{document.category}</span>
        </div>
        <details className="mobile-guide-nav mobile-docs-nav">
          <summary>浏览文档与本页目录</summary>
          <div className="mobile-docs-panel">
            <DocumentNavigation
              currentSlug={document.slug}
              visibleCategories={[document.category]}
            />
            {headings.length > 0 && (
              <div className="mobile-toc">
                <p>本页目录</p>
                <TableOfContents headings={headings} />
              </div>
            )}
          </div>
        </details>
        <article
          className="article-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(document) }}
        />
      </main>

      <aside className="guide-toc" aria-label="本页目录">
        <p>本页目录</p>
        <TableOfContents headings={headings} />
      </aside>
    </div>
  );
}

function DocumentNavigation({
  currentSlug,
  visibleCategories,
}: {
  currentSlug: string;
  visibleCategories: string[];
}) {
  return (
    <nav className="docs-navigation" aria-label="文档导航">
      {visibleCategories.map((category) => {
        const items = documents.filter((item) => item.category === category);
        return (
          <div className="docs-navigation-group" aria-label={category} key={category} role="group">
            <p aria-hidden="true">{category}</p>
            {items.map((item) => (
              <Link
                aria-current={item.slug === currentSlug ? "page" : undefined}
                className={item.slug === currentSlug ? "is-current" : undefined}
                href={`/guides/${item.slug}`}
                key={item.slug}
              >
                {item.title}
              </Link>
            ))}
          </div>
        );
      })}
    </nav>
  );
}

function TableOfContents({
  headings,
}: {
  headings: ReturnType<typeof extractHeadings>;
}) {
  if (!headings.length) return <span className="muted">暂无小节</span>;
  return (
    <nav>
      {headings.map((heading) => (
        <a
          className={heading.depth === 3 ? "toc-subitem" : undefined}
          href={`#${heading.id}`}
          key={heading.id}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}
