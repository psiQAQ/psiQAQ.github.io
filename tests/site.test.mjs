import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(encodeURI(pathname), "http://localhost"), {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the beginner home page without starter metadata", async () => {
  const response = await render("/");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /完成第一篇结构化文献笔记/);
  assert.match(html, /开始新手路径/);
  assert.match(html, /浏览知识库/);
  assert.match(html, /<title>科研 Agent 新手知识站/);
  assert.match(html, /property="og:image" content="https:\/\/psiqaq\.github\.io\/og\.png"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("exports the site for the psiQAQ GitHub Pages root", async () => {
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(config, /output:\s*["']export["']/);
  assert.match(config, /trailingSlash:\s*false/);
  assert.doesNotMatch(layout, /next\/headers|\bheaders\s*\(/);
  assert.match(
    layout,
    /metadataBase:\s*new URL\(["']https:\/\/psiqaq\.github\.io\/["']\)/,
  );
  assert.match(layout, /https:\/\/github\.com\/psiQAQ\/psiQAQ\.github\.io/);

  for (const path of [
    "../dist/client/index.html",
    "../dist/client/404.html",
    "../dist/client/guides/others/zotero.html",
  ]) {
    await access(new URL(path, import.meta.url));
  }

  const home = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  assert.match(home, /https:\/\/psiqaq\.github\.io\/og\.png/);
  assert.doesNotMatch(home, /chatgpt\.site/);
});

test("defines the GitHub Pages build and deployment workflow", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/pages.yml", import.meta.url),
    "utf8",
  );

  assert.match(workflow, /branches:\s*\[main\]/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /actions\/checkout@v6/);
  assert.match(workflow, /actions\/setup-node@v6/);
  assert.match(workflow, /node-version:\s*["']22["']/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /path:\s*\.\/dist\/client/);
  assert.match(workflow, /actions\/deploy-pages@v5/);
  assert.match(workflow, /name:\s*github-pages/);
});

test("uses a documentation-first global shell", async () => {
  const home = await (await render("/")).text();
  const guide = await (await render("/guides/others/zotero")).text();
  const guideSource = await readFile(
    new URL("../app/guides/[...slug]/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(home, /href="\/search#site-search"/);
  assert.match(home, /aria-label="搜索文档"/);
  assert.match(guide, /aria-label="文档导航"/);
  assert.match(guide, /href="\/guides\/agents\/codex\/codex"/);
  assert.match(
    guide,
    /<a(?=[^>]*aria-current="page")(?=[^>]*href="\/guides\/others\/zotero")[^>]*>/,
  );
  assert.match(guide, /浏览文档与本页目录/);
  assert.match(
    guideSource,
    /headings\.length > 0 && \(\s*<aside className="guide-toc"/,
  );
});

test("presents the knowledge base as a focused documentation product", async () => {
  const home = await (await render("/")).text();
  const search = await (await render("/search")).text();

  assert.match(home, /知识库索引/);
  assert.match(home, /篇公开指南/);
  assert.match(home, /个主题/);
  assert.match(search, /<input(?=[^>]*id="site-search")(?=[^>]*autofocus)[^>]*>/);
});

test("ships the documentation visual system", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  for (const selector of [
    ".global-search",
    ".docs-navigation",
    ".mobile-docs-nav",
    ".knowledge-overview",
  ]) {
    assert.match(css, new RegExp(selector.replace(".", "\\.")));
  }
  assert.match(css, /--surface-raised:/);
  for (const selector of [
    ".global-search kbd",
    ".docs-navigation-group > p",
    ".guide-toc > p",
  ]) {
    const pattern = `${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{[^}]*color:\\s*var\\(--muted\\);`;
    assert.match(css, new RegExp(pattern, "s"));
  }
});

test("serves the main knowledge routes", async () => {
  for (const pathname of ["/start", "/library", "/search"]) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
  }
});

test("presents the complete five-step path", async () => {
  const html = await (await render("/start")).text();

  for (const text of [
    "准备必要环境",
    "选择 Agent",
    "添加科研 Skills",
    "配置 Zotero",
    "完成首次任务",
  ]) {
    assert.match(html, new RegExp(text));
  }
});

test("renders every Markdown guide published by README", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
  const paths = [...readme.matchAll(/\]\(([^)]+\.md)(?:#[^)]+)?\)/g)]
    .map((match) => match[1])
    .filter((path) => !path.includes("://"));

  assert.ok(paths.length > 20);

  for (const path of paths) {
    const slug = path.replace(/\\/g, "/").replace(/\.md$/i, "");
    const response = await render(`/guides/${slug}`);
    assert.equal(response.status, 200, path);
  }
});

test("renders Markdown structure and repository images", async () => {
  const zotero = await (await render("/guides/others/zotero")).text();
  const context7 = await (
    await render("/guides/agents/MCP/context7")
  ).text();
  const hyperV = await (
    await render("/guides/operating-system/Hyper-V")
  ).text();

  assert.match(zotero, /<h1[^>]*>Zotero 指南<\/h1>/);
  assert.match(context7, /<pre><code/);
  assert.match(hyperV, /<img[^>]+Hyper-V/);
});

test("links article headings from the document table of contents", async () => {
  const html = await (await render("/guides/others/zotero")).text();

  assert.match(html, /本页目录/);
  assert.match(html, /href="#软件下载安装"/);
  assert.match(html, /id="软件下载安装"/);
});

test("does not publish internal root files", async () => {
  assert.equal((await render("/guides/AGENTS")).status, 404);
  assert.equal((await render("/guides/20260614")).status, 404);
});

test("includes published guides in local search data", async () => {
  const html = await (await render("/search")).text();

  assert.match(html, /Zotero 指南/);
  assert.match(html, /Codex 指南/);
  assert.match(html, /搜索全部公开指南/);
});

test("offers recovery for unknown routes", async () => {
  const response = await render("/missing-page");
  const html = await response.text();

  assert.equal(response.status, 404);
  assert.match(html, /返回知识库/);
});
