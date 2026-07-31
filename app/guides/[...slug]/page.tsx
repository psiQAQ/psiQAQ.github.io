import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { documents, findDocument } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

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

  return (
    <main>
      <article
        className="article-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(document) }}
      />
    </main>
  );
}
