import Link from "next/link";
import { categories, documents, resources } from "@/lib/content";
import { resourceCategoryLabel, catalogGroupId } from "@/lib/catalog.mjs";
import type { DocumentHeading } from "@/lib/headings";
import { TableOfContentsLink } from "@/app/guides/[...slug]/table-of-contents-link";

function CatalogNavigation({ currentHref }: { currentHref: string }) {
  const resourcePage = currentHref.startsWith("/resources");
  const entries = resourcePage ? resources : documents;
  const baseHref = resourcePage ? "/resources" : "/library";
  const current = resources.find(resource => resource.kind === "source" && `/resources/${resource.slug}` === currentHref);
  const categories = [...new Set(entries.map(entry => entry.category))];
  return categories.map((category, categoryIndex) => {
    const groups = [...new Set(entries.filter(entry => entry.category === category).map(entry => entry.group))];
    return <div className="navigation-section" key={category}>
      <a className="navigation-category-link" href={`${baseHref}#${encodeURIComponent(category)}`} aria-current={current?.category === category ? "location" : undefined}>{`${categoryIndex + 1}. ${resourcePage ? resourceCategoryLabel(category) : category}`}</a>
      {groups.filter(group => group !== category).map((group, groupIndex) => (
        <a className="navigation-group-link" href={`${baseHref}#${encodeURIComponent(catalogGroupId(category, group))}`} key={group} aria-current={current?.category === category && current.group === group ? "location" : undefined}>{`${categoryIndex + 1}.${groupIndex + 1} ${group}`}</a>
      ))}
    </div>;
  });
}

function DocumentNavigation({ currentHref }: { currentHref: string }) {
  const resourcePage = currentHref.startsWith("/resources");
  const libraryPage = currentHref === "/library";
  return (
    <nav className="docs-navigation" aria-label={resourcePage ? "资源分类导航" : libraryPage ? "知识库分类导航" : "文档导航"}>
      <div className="site-destinations">
        {[["/library", "知识库"], ["/resources", "资源导航"]].map(([href, label]) => (
          <Link href={href} key={href} aria-current={currentHref === href ? "page" : href === "/resources" && resourcePage ? "location" : undefined}>{label}</Link>
        ))}
      </div>
      {resourcePage || libraryPage ? <CatalogNavigation currentHref={currentHref} /> : categories.map((category) => {
        const items = documents.filter((item) => item.category === category);
        const groups = [...new Set(items.map((item) => item.group))];
        const active = items.some((item) => `/guides/${item.slug}` === currentHref);
        return (
          <details className="navigation-category" key={category} open={active}>
            <summary>{category}</summary>
            {groups.map((group) => {
              const children = items.filter((item) => item.group === group);
              const links = children.map((item) => (
                <Link href={`/guides/${item.slug}`} key={item.slug} aria-current={`/guides/${item.slug}` === currentHref ? "page" : undefined}>
                  {item.title}
                </Link>
              ));
              return group === category ? <div key={group}>{links}</div> : (
                <details className="navigation-group" key={group} open={children.some((item) => `/guides/${item.slug}` === currentHref)}>
                  <summary>{group}</summary>{links}
                </details>
              );
            })}
          </details>
        );
      })}
    </nav>
  );
}

function TableOfContents({ headings }: { headings: DocumentHeading[] }) {
  return <nav>{headings.map((heading) => (
    <TableOfContentsLink id={heading.id} key={heading.id} className={heading.depth === 3 ? "toc-subitem" : undefined}>{heading.text}</TableOfContentsLink>
  ))}</nav>;
}

export function DocumentShell({ currentHref, headings = [], children }: {
  currentHref: string; headings?: DocumentHeading[]; children: React.ReactNode;
}) {
  return (
    <div className={`document-shell${headings.length ? " has-toc" : ""}`}>
      <aside className="document-sidebar"><DocumentNavigation currentHref={currentHref} /></aside>
      <main id="main-content" className="document-main">
        <details className="mobile-docs-nav"><summary>{currentHref.startsWith("/resources") ? "浏览资源分类" : currentHref === "/library" ? "浏览知识库分类" : "浏览全站文档"}</summary><DocumentNavigation currentHref={currentHref} /></details>
        {headings.length > 0 && <details className="mobile-toc"><summary>本页目录</summary><TableOfContents headings={headings} /></details>}
        {children}
      </main>
      {headings.length > 0 && <aside className="guide-toc" aria-label="本页目录"><p>本页目录</p><TableOfContents headings={headings} /></aside>}
    </div>
  );
}
