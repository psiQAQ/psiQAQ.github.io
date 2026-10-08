import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const gitRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
if (path.relative(gitRoot, process.cwd())) throw new Error("Run baseline capture from the repository root.");
const fixture = "tests/fixtures/site-baseline.json";
const exists = await access(fixture).then(() => true).catch(error => {
  if (error.code === "ENOENT") return false;
  throw error;
});
if (exists && !process.argv.includes("--update")) throw new Error("Review intentional content changes, build the site, then pass --update to replace the content baseline.");
const readme = await readFile("README.md", "utf8");
const block = readme.split("<!-- site-catalog:start -->")[1].split("<!-- site-catalog:end -->")[0];
let category = "", group = "";
const entries = [];
for (const line of block.split(/\r?\n/)) {
  if (line.startsWith("## ")) { category = line.slice(3); group = category; }
  else if (line.startsWith("### ")) group = line.slice(4);
  else {
    const match = line.match(/^\s*-\s+(\S+)\[([^\]]+)\]\(([^)]+)\)\s*$/);
    if (match) entries.push({ icon: match[1], title: match[2], category, group, target: match[3] });
  }
}
const files = {};
const commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const paths = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z", "notes"], { encoding: "utf8" }).split("\0").filter(Boolean).sort();
if (!paths.length) throw new Error("No notes files found; a content baseline cannot be empty.");
for (const file of paths) {
  const bytes = await readFile(file);
  const gitBlobId = execFileSync("git", ["hash-object", file], { encoding: "utf8" }).trim();
  files[file] = { bytes: bytes.length, sha256: hash(bytes), gitBlobId };
}
const assets = await readdir("dist/client/assets");
const textAssets = entries.filter(entry => entry.target.startsWith("notes/") && entry.target.endsWith(".html")).map(entry => {
  const extension = path.extname(entry.target), stem = path.basename(entry.target, extension);
  const matches = assets.filter(name => name.startsWith(`${stem}-`) && name.endsWith(extension));
  if (matches.length !== 1) throw new Error(`Expected one emitted asset for ${entry.target}`);
  return { source: entry.target, href: `/assets/${matches[0]}` };
});
function portableArticle(article) {
  for (const asset of textAssets) article = article.replaceAll(asset.href, `/${asset.source}`);
  return article;
}
const pages = {};
for (const entry of entries) {
  if (!entry.target.startsWith("notes/") || !entry.target.endsWith(".md")) continue;
  const guide = entry.icon === "📄";
  const slug = entry.target.slice(6).replace(guide ? /\.md$/ : /$^/, "");
  const url = `/${guide ? "guides" : "resources"}/${slug}`;
  const html = await readFile(`dist/client${url}.html`, "utf8");
  const article = html.match(/<article class="article-content">([\s\S]*?)<\/article>/)?.[1];
  pages[url] = {
    articleHash: article ? hash(article) : null,
    contentHash: article ? hash(portableArticle(article)) : null,
    headingIds: article ? [...article.matchAll(/<h[1-6] id="([^"]+)"/g)].map(match => match[1]) : [],
    images: article ? [...article.matchAll(/<img src="([^"]+)"/g)].map(match => match[1]) : [],
  };
}
const baseline = { commit, files, entries, pages, textAssets };
baseline.interfaceText = {};
for (const [file, route] of [["app/library/page.tsx", "/"], ["app/layout.tsx", "shared"]]) {
  const source = await readFile(file, "utf8");
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const fragments = new Set();
  function visit(node) {
    if (ts.isJsxText(node)) { const text = node.text.replace(/\s+/g, " ").trim(); if (text) fragments.add(text); }
    if (ts.isPropertyAssignment(node) && ["title", "description"].includes(node.name.getText(tree)) && ts.isStringLiteral(node.initializer)) fragments.add(node.initializer.text);
    ts.forEachChild(node, visit);
  }
  visit(tree);
  baseline.interfaceText[route] = [...fragments];
}
await mkdir("tests/fixtures", { recursive: true });
await writeFile(fixture, JSON.stringify(baseline, null, 2) + "\n");
console.log(`Captured ${paths.length} files, ${entries.length} entries and ${Object.keys(pages).length} Markdown pages.`);
