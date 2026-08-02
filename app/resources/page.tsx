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
        <p>汇集 Agent 学习资料、实用脚本、开发工具、大模型评测、AI 新闻与行业观察。</p>
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
                        const cardClassName = `resource-card resource-card-${resource.type}`;
                        const content = (
                          <>
                            <span className={`resource-type resource-type-${resource.type}`}>
                              {resource.icon} {resource.typeLabel}
                            </span>
                            <h4>{resource.title}</h4>
                          </>
                        );

                        if (resource.kind === "source") {
                          return (
                            <Link
                              className={cardClassName}
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
                              className={cardClassName}
                              download={resource.filename}
                              href={resource.href}
                              key={resource.sourcePath}
                            >
                              {content}
                            </a>
                          );
                        }

                        return (
                          <a
                            className={cardClassName}
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
