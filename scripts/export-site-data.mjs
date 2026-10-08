import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { catalogEntries, resourceCategoryLabel } from "../lib/catalog.mjs";
import { plainSearchText } from "../lib/search-content.mjs";

const entries = catalogEntries(await readFile("README.md", "utf8"));
const assets = await readdir("dist/client/assets");
const sourceExtensions = new Set([".md", ".bat", ".sh", ".py", ".ps1", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".json", ".toml", ".yaml", ".yml", ".xml", ".ini", ".cfg", ".conf", ".txt", ".css"]);
const index = [];
for (const [order, entry] of entries.entries()) {
  let href = entry.target, searchText = "", external = /^https?:\/\//i.test(href);
  if (!external) {
    if (!href.startsWith("notes/") || href.split("/").includes("..")) throw new Error(`Invalid local catalog target: ${href}`);
    const source = await readFile(href);
    const extension = path.extname(href).toLowerCase();
    const slug = href.slice(6);
    if (entry.type === "document") {
      href = `/guides/${slug.replace(/\.md$/i, "")}`;
      searchText = plainSearchText(source.toString("utf8"));
    } else if (sourceExtensions.has(extension)) {
      href = `/resources/${slug}`;
      if (entry.type === "learning" && extension === ".md") searchText = plainSearchText(source.toString("utf8"));
    } else {
      const stem = path.basename(href, extension);
      const matches = assets.filter((name) => name.startsWith(`${stem}-`) && name.endsWith(extension));
      if (matches.length !== 1) throw new Error(`Expected one emitted asset for ${href}, found ${matches.length}`);
      href = `/assets/${matches[0]}`;
      external = extension === ".html";
    }
  }
  const category = entry.type === "document" ? entry.category : resourceCategoryLabel(entry.category);
  index.push({ id: `${entry.type}:${entry.target}:${entry.label}`, title: entry.label, category, group: entry.group === entry.category ? category : entry.group,
    typeLabel: entry.typeLabel, href, searchText, order, external });
}
await writeFile("dist/client/search-index.json", JSON.stringify(index));
const aliases = [
  ["/guides/others/zotero", "/guides/agents/MCP/zotero"],
  ["/guides/others/blender", "/guides/agents/MCP/blender"],
  ["/guides/models/models-dev", "/resources/models/models-dev.md"],
];
for (const [route, target] of aliases) {
  await mkdir(path.dirname(`dist/client${route}.html`), { recursive: true });
  await writeFile(`dist/client${route}.html`, `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>文档已迁移</title><link rel="canonical" href="${target}"><script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script></head><body><h1>文档已迁移</h1><p>请访问<a href="${target}">当前文档地址</a>。</p></body></html>`);
}
console.log(`[site-data] Exported ${index.length} search entries and ${aliases.length} compatibility pages.`);
