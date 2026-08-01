import Link from "next/link";
import { resources } from "@/lib/content";

export const metadata = { title: "资源" };

const categories = [...new Set(resources.map((resource) => resource.category))];

export default function ResourcesPage() {
  return (
    <main className="page-shell content-page">
      <header className="page-intro compact">
        <p className="eyebrow">{resources.length} 项公开资源</p>
        <h1>资源</h1>
        <p>README 清单中的外部参考、可复制脚本和下载文件。</p>
      </header>

      <div className="resource-sections">
        {categories.map((category) => {
          const items = resources.filter((resource) => resource.category === category);
          const groups = [...new Set(items.map((resource) => resource.group))];

          return (
            <section key={category}>
              <h2>{category}</h2>
              {groups.map((group) => (
                <div className="resource-group" key={group}>
                  {group !== category && <h3>{group}</h3>}
                  <div className="resource-list">
                    {items
                      .filter((resource) => resource.group === group)
                      .map((resource) => {
                        const content = (
                          <>
                            <span>
                              {resource.kind === "source"
                                ? resource.title.split(".").at(-1)?.toUpperCase()
                                : resource.kind === "download" ? "下载" : "外部资源"}
                            </span>
                            <h4>{resource.title}</h4>
                            {resource.description && <p>{resource.description}</p>}
                          </>
                        );

                        if (resource.kind === "source") {
                          return (
                            <Link
                              className="resource-card"
                              href={`/resources/${resource.slug}`}
                              key={resource.sourcePath}
                            >
                              {content}
                            </Link>
                          );
                        }

                        if (resource.kind === "download") {
                          return (
                            <a
                              className="resource-card"
                              download={resource.title}
                              href={resource.href}
                              key={resource.sourcePath}
                            >
                              {content}
                            </a>
                          );
                        }

                        return (
                          <a
                            className="resource-card"
                            href={resource.href}
                            key={`${resource.href}-${resource.title}`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {content}
                          </a>
                        );
                      })}
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </main>
  );
}
