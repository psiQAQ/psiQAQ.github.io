import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopySourceButton } from "@/components/copy-source-button";
import { findSourceResource, sourceResources } from "@/lib/content";

type SourcePageProps = {
  params: Promise<{ slug: string[] }>;
};

export function generateStaticParams() {
  return sourceResources.map((resource) => ({ slug: resource.slug.split("/") }));
}

export async function generateMetadata({ params }: SourcePageProps): Promise<Metadata> {
  const resource = findSourceResource((await params).slug.join("/"));
  return resource ? { title: resource.title } : {};
}

export default async function SourcePage({ params }: SourcePageProps) {
  const resource = findSourceResource((await params).slug.join("/"));
  if (!resource) notFound();

  const language = resource.filename.split(".").at(-1)?.toUpperCase();

  return (
    <main className="page-shell content-page source-detail">
      <div className="breadcrumbs">
        <Link href="/resources">资源</Link>
        <span aria-hidden="true">/</span>
        <span>{resource.category}</span>
        <span aria-hidden="true">/</span>
        <span>{resource.group}</span>
      </div>
      <header className="page-intro compact">
        <p className="eyebrow">{resource.icon} {resource.typeLabel} · {language} 源码</p>
        <h1>{resource.title}</h1>
      </header>
      <article className="source-resource">
        <header>
          <span>{resource.category} · {resource.group}</span>
          <CopySourceButton filename={resource.filename} source={resource.source} />
        </header>
        <pre><code>{resource.source}</code></pre>
      </article>
    </main>
  );
}
