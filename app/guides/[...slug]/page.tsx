import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { documents, findDocument } from "@/lib/content";
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
  const related = documents.filter((item) => item.category === document.category);
  const headings = extractHeadings(document.markdown);

  return (
    <div className="guide-layout page-shell">
      <aside className="guide-sidebar" aria-label="同类指南">
        <p className="eyebrow">{document.category}</p>
        <nav>
          {related.map((item) => (
            <Link
              className={item.slug === document.slug ? "is-current" : undefined}
              href={`/guides/${item.slug}`}
              key={item.slug}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="guide-main">
        <div className="breadcrumbs">
          <Link href="/library">知识库</Link>
          <span aria-hidden="true">/</span>
          <span>{document.category}</span>
        </div>
        <details className="mobile-guide-nav">
          <summary>查看本页目录</summary>
          <TableOfContents headings={headings} />
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
