import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
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
