import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentShell } from "@/components/document-shell";
import { documents, findDocument } from "@/lib/content";
import { parseMarkdown } from "@/lib/markdown";

type GuidePageProps = { params: Promise<{ slug: string[] }> };
export function generateStaticParams() { return documents.map((document) => ({ slug: document.slug.split("/") })); }
export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const document = findDocument((await params).slug.join("/"));
  return document ? { title: document.title } : {};
}
export default async function GuidePage({ params }: GuidePageProps) {
  const document = findDocument((await params).slug.join("/"));
  if (!document) notFound();
  const { html, headings } = parseMarkdown(document);
  return (
    <DocumentShell currentHref={`/guides/${document.slug}`} headings={headings}>
      <nav className="breadcrumbs" aria-label="面包屑">
        <Link href="/library">知识库</Link><span aria-hidden="true">/</span>
        <Link href={`/library#${encodeURIComponent(document.category)}`}>{document.category}</Link>
        {document.group !== document.category && <><span aria-hidden="true">/</span><span>{document.group}</span></>}
        <span aria-hidden="true">/</span><span aria-current="page">{document.title}</span>
      </nav>
      <article className="article-content" dangerouslySetInnerHTML={{ __html: html }} />
    </DocumentShell>
  );
}
