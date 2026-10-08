import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { catalogEntries } from "../lib/catalog.mjs";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const baseline = JSON.parse(await readFile("tests/fixtures/site-baseline.json", "utf8"));
const catalog = catalogEntries(await readFile("README.md", "utf8"));
assert.deepEqual(catalog.map(({ icon, label, category, group, target }) => ({ icon, title: label, category, group, target })), baseline.entries);
for (const [file, expected] of Object.entries(baseline.files)) {
  // Git applies the checkout's clean filters, allowing LF and CRLF checkouts
  // while still detecting changes to text, encoding and binary attachments.
  const blobId = execFileSync("git", ["hash-object", file], { encoding: "utf8" }).trim();
  assert.equal(blobId, expected.gitBlobId, file);
}
const assetReplacements = new Map();
const assets = await readdir("dist/client/assets");
for (const asset of baseline.textAssets) {
  const extension = path.extname(asset.source);
  const stem = path.basename(asset.source, extension);
  const matches = assets.filter(name => name.startsWith(`${stem}-`) && name.endsWith(extension));
  assert.equal(matches.length, 1, asset.source);
  const href = `/assets/${matches[0]}`;
  // Text asset fingerprints can change with checkout newlines. Verify their
  // complete normalized content before comparing articles by source identity.
  const source = await readFile(asset.source, "utf8");
  assert.equal((await readFile(`dist/client${href}`, "utf8")).replace(/\r\n/g, "\n"), source.replace(/\r\n/g, "\n"), href);
  assetReplacements.set(href, asset.source);
}
const portableArticle = article => {
  for (const [href, source] of assetReplacements) article = article.replaceAll(href, `/${source}`);
  return article;
};
const decode = (text) => text.replace(/&(?:amp|lt|gt|quot|#x27|#39);/g, (value) => ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'", "&#39;": "'" })[value]);
const mainPages = ["/", "/library", "/resources", "/search", "/404"];
const routes = [...mainPages, ...Object.keys(baseline.pages), "/resources/agents/claude-code/cc.bat", "/resources/agents/claude-code/update-claude-code.bat", "/resources/agents/claude-code/ccmac.sh", "/resources/agents/claude-code/cclinux.sh", "/guides/others/zotero", "/guides/others/blender", "/guides/models/models-dev"];
const pages = new Map();
for (const route of routes) pages.set(route, await readFile(`dist/client${route === "/" ? "/index" : route}.html`, "utf8"));
for (const [route, fragments] of Object.entries(baseline.interfaceText)) {
  const html = pages.get(route === "shared" ? "/" : route);
  const text = decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
  for (const fragment of fragments) assert.ok(text.includes(fragment), `${route}: preserved interface text ${fragment}`);
}
for (const [route, expected] of Object.entries(baseline.pages)) {
  const html = pages.get(route);
  if (!expected.articleHash) continue;
  const article = html.match(/<article class="article-content">([\s\S]*?)<\/article>/)?.[1];
  assert.ok(article, route);
  assert.equal(hash(portableArticle(article)), expected.contentHash, `Full rendered article preserved: ${route}`);
  const ids = new Set([...article.matchAll(/<h[1-6] id="([^"]+)"/g)].map(match => match[1]));
  for (const id of expected.headingIds) assert.ok(ids.has(id), `${route}#${id}`);
  for (const image of expected.images) await access(`dist/client${image}`);
}
let localLinks = 0;
for (const [route, html] of pages) {
  // React and marked emit quoted attributes; source examples are escaped, so this
  // inspects the actual emitted attributes without parsing arbitrary source HTML.
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const href = decode(match[1]);
    if (!href.startsWith("/") && !href.startsWith("#")) continue;
    const url = new URL(href, `https://site.invalid${route}`);
    const pathname = decodeURIComponent(url.pathname);
    const file = pathname.startsWith("/assets/") || pathname.endsWith(".json") || pathname === "/og.png" ? `dist/client${pathname}` : `dist/client${pathname === "/" ? "/index" : pathname}.html`;
    await access(file);
    if (url.hash) {
      const target = pages.get(pathname) || await readFile(file, "utf8");
      const id = decodeURIComponent(url.hash.slice(1));
      assert.ok([...target.matchAll(/\bid="([^"]+)"/g)].some((item) => decode(item[1]) === id), `${route} -> ${href}`);
    }
    localLinks++;
  }
}
for (const file of ["cc.bat", "update-claude-code.bat", "ccmac.sh", "cclinux.sh", "CLAUDE.md"]) {
  const route = `/resources/agents/claude-code/${file}`;
  const html = pages.get(route) || await readFile(`dist/client${route}.html`, "utf8");
  const code = html.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/)?.[1];
  assert.ok(code, route);
  assert.equal(decode(code.replace(/<span\b[^>]*>|<\/span>/g, "")).replace(/\r\n/g, "\n"), (await readFile(`notes/agents/claude-code/${file}`, "utf8")).replace(/\r\n/g, "\n"), route);
}
const agents = pages.get("/resources/agents/prompt/AGENTS.md");
assert.match(agents, /id="user-interaction"/);
const code = agents.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/)[1];
assert.equal(decode(code.replace(/<span\b[^>]*>|<\/span>/g, "")).replace(/\r\n/g, "\n"), (await readFile("notes/agents/prompt/AGENTS.md", "utf8")).replace(/\r\n/g, "\n"));
const index = JSON.parse(await readFile("dist/client/search-index.json", "utf8"));
assert.equal(index.length, baseline.entries.length);
assert.ok(!index.some(entry => entry.id.includes("codex-sqlite-bug-fix")));
for (const entry of index) {
  if (entry.href.startsWith("/assets/")) await access(`dist/client${entry.href}`);
  else if (entry.href.startsWith("/")) assert.ok(pages.has(entry.href), entry.href);
}
const flowchart = index.find(entry => entry.title.startsWith("Git PR 流程图"));
assert.match(await readFile(`dist/client${flowchart.href}`, "utf8"), /<svg\b/);
console.log(`Static verification passed: ${Object.keys(baseline.files).length} preserved files, ${index.length} catalog entries, ${pages.size} pages, ${localLinks} local links.`);
