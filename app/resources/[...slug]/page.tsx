import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentShell } from "@/components/document-shell";
import { CopySourceButton } from "@/components/copy-source-button";
import { findSourceResource, sourceResources } from "@/lib/content";
import { parseMarkdown } from "@/lib/markdown";
import { sourceHeadings } from "@/lib/source-headings.mjs";
import { resourceCategoryLabel, catalogGroupId } from "@/lib/catalog.mjs";

type SourcePageProps = { params: Promise<{ slug: string[] }> };
export function generateStaticParams() { return sourceResources.map((resource) => ({ slug: resource.slug.split("/") })); }
export async function generateMetadata({ params }: SourcePageProps): Promise<Metadata> {
  const resource = findSourceResource((await params).slug.join("/"));
  return resource ? { title: resource.title } : {};
}
export default async function SourcePage({ params }: SourcePageProps) {
  const resource = findSourceResource((await params).slug.join("/"));
  if (!resource) notFound();
  const language = resource.filename.split(".").at(-1)?.toUpperCase();
  const reading = resource.type === "learning" && language === "MD";
  const parsed = reading ? parseMarkdown({ ...resource, markdown: resource.source, searchText: resource.source }) : undefined;
  const headings = language === "MD" && !reading ? sourceHeadings(resource.source) : [];
  const lineIds = new Map(headings.map((heading) => [heading.line, heading.id]));
  return (
    <DocumentShell currentHref={`/resources/${resource.slug}`} headings={parsed?.headings || headings}>
      <nav className="breadcrumbs" aria-label="面包屑">
        <Link href="/resources">资源导航</Link>
        <span aria-hidden="true">/</span><Link href={`/resources#${encodeURIComponent(resource.category)}`}>{resourceCategoryLabel(resource.category)}</Link>
        {resource.group !== resource.category && <><span aria-hidden="true">/</span><Link href={`/resources#${encodeURIComponent(catalogGroupId(resource.category, resource.group))}`}>{resource.group}</Link></>}
        <span aria-hidden="true">/</span><span aria-current="page">{resource.title}</span>
      </nav>
      {parsed ? <section className="resource-markdown">
        <p className="eyebrow">{resource.icon} {resource.typeLabel}</p>
        <article className="article-content" dangerouslySetInnerHTML={{ __html: parsed.html }} />
      </section> : <>
        <header className="page-intro compact"><p className="eyebrow">{resource.icon} {resource.typeLabel} · {language} 源码</p><h1>{resource.title}</h1></header>
        <article className="source-resource"><header>
          <span>{resourceCategoryLabel(resource.category)} · {resource.group}</span><CopySourceButton filename={resource.filename} source={resource.source} />
        </header><pre><code>{resource.source.split(/(?<=\n)/).map((line, index) => <span className="source-line" id={lineIds.get(index + 1)} key={index}>{line}</span>)}</code></pre></article>
      </>}
    </DocumentShell>
  );
}
