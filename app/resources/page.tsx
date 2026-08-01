import { CopySourceButton } from "@/components/copy-source-button";
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
        {categories.map((category) => (
          <section key={category}>
            <h2>{category}</h2>
            <div className="resource-list">
              {resources
                .filter((resource) => resource.category === category)
                .map((resource) => {
                  if (resource.kind === "external") {
                    return (
                      <a
                        className="resource-card"
                        href={resource.href}
                        key={`${resource.group}-${resource.href}-${resource.title}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <span>{resource.group}</span>
                        <h3>{resource.title}</h3>
                        {resource.description && <p>{resource.description}</p>}
                      </a>
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
                        <span>{resource.group} · 下载</span>
                        <h3>{resource.title}</h3>
                        {resource.description && <p>{resource.description}</p>}
                      </a>
                    );
                  }

                  const language = resource.title.split(".").at(-1)?.toUpperCase();
                  return (
                    <article className="source-resource" key={resource.sourcePath}>
                      <header>
                        <div>
                          <span>{resource.group} · {language}</span>
                          <h3>{resource.title}</h3>
                          {resource.description && <p>{resource.description}</p>}
                        </div>
                        <CopySourceButton filename={resource.title} source={resource.source} />
                      </header>
                      <pre><code>{resource.source}</code></pre>
                    </article>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
