import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
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

function catalogBlock(readme) {
  const match = readme.match(
    /<!-- site-catalog:start -->([\s\S]*?)<!-- site-catalog:end -->/,
  );
  assert.ok(match, "README must define the marked public catalog");
  return match[1];
}

test("renders the beginner home page without starter metadata", async () => {
  const response = await render("/");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /完成第一篇结构化文献笔记/);
  assert.match(html, /<a href="\/start" class="button primary">新手路径<\/a>/);
  assert.match(html, /<a href="\/library" class="button secondary">知识库<\/a>/);
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
    "../dist/client/guides/agents/claude-code/tutorial/常用命令.html",
  ]) {
    await access(new URL(path, import.meta.url));
  }

  await assert.rejects(
    access(
      new URL(
        "../dist/client/guides/agents/claude-code/tutorial/%25E5%25B8%25B8%25E7%2594%25A8%25E5%2591%25BD%25E4%25BB%25A4.html",
        import.meta.url,
      ),
    ),
    { code: "ENOENT" },
  );

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
  assert.match(home, /href="\/resources">资源<\/a>/);
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
  const library = await (await render("/library")).text();
  const search = await (await render("/search")).text();

  assert.match(home, /篇公开指南/);
  assert.match(home, /个主题/);
  assert.match(library, /<h3>Claude Code<\/h3>/);
  assert.doesNotMatch(library, /Claude Code 全局指令模板/);
  assert.doesNotMatch(library, /Codex 全局指令模板/);
  assert.match(search, /<input(?=[^>]*id="site-search")(?=[^>]*autofocus)[^>]*>/);
});

test("keeps the homepage focused on three primary destinations", async () => {
  const html = await (await render("/")).text();
  const heroActions = html.match(/<div class="hero-actions">([\s\S]*?)<\/div>/)?.[1];
  const topicNav = html.match(/<nav aria-label="全部主题">([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(heroActions, "homepage must expose its primary destinations");
  assert.ok(topicNav, "homepage must expose the complete topic navigation");

  for (const [href, label] of [
    ["/start", "新手路径"],
    ["/library", "知识库"],
    ["/resources", "资源"],
  ]) {
    assert.match(heroActions, new RegExp(`href="${href}"[^>]*>${label}<`));
  }

  const topics = [
    "基础环境",
    "系统与运行环境",
    "智能体",
    "智能体扩展",
    "科研助力",
    "大模型选型与排行榜",
  ];
  for (const topic of topics) {
    assert.match(topicNav, new RegExp(`href="/library#${encodeURIComponent(topic)}"`));
  }
  for (let index = 1; index < topics.length; index += 1) {
    assert.ok(topicNav.indexOf(topics[index - 1]) < topicNav.indexOf(topics[index]));
  }

  assert.doesNotMatch(
    html,
    /knowledge-overview-header|浏览全部主题|从安装到第一篇笔记|step-grid|精选指南|新手最常用的四个入口|<p class="eyebrow">完整知识库<\/p>|篇公开指南，按需查阅/,
  );
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
  assert.match(css, /\.resource-card-video\s*\{[^}]*background:\s*#fff8f8;/s);
  assert.match(css, /\.resource-card \.resource-type\s*\{[^}]*font-size:\s*1\.4rem;/s);
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
  for (const pathname of ["/start", "/library", "/resources", "/search"]) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
  }
});

test("publishes a categorized resource card index", async () => {
  const response = await render("/resources");
  const html = await response.text();
  const search = await (await render("/search")).text();

  assert.equal(response.status, 200);
  assert.match(html, /<h1>资源<\/h1>/);
  assert.match(
    html,
    /<a(?=[^>]*href="https:\/\/artificialanalysis\.ai\/")(?=[^>]*target="_blank")(?=[^>]*rel="noreferrer")[^>]*>/,
  );
  assert.match(html, /<h2>智能体<\/h2>/);
  assert.match(html, /<h3>Claude Code<\/h3>/);
  assert.match(html, /<h2>大模型选型与排行榜<\/h2>/);
  assert.match(html, /<h2>资源<\/h2>/);
  assert.match(
    html,
    /汇集 Agent 学习资料、实用脚本、开发工具、大模型评测、AI 新闻与行业观察。/,
  );
  assert.doesNotMatch(html, /README 清单/);
  const resourceGroups = [
    "Agent 入门与实践",
    "Agent 原理与优化",
    "开发与模型工具",
    "AI 新闻",
    "AI 行业观察",
  ];
  for (const group of resourceGroups) assert.match(html, new RegExp(`<h3>${group}</h3>`));
  for (let index = 1; index < resourceGroups.length; index += 1) {
    assert.ok(html.indexOf(`<h3>${resourceGroups[index - 1]}</h3>`) < html.indexOf(`<h3>${resourceGroups[index]}</h3>`));
  }
  assert.doesNotMatch(html, /外部 Agent 学习指南|bilibili：技术爬爬虾|bilibili：张司机在路上/);
  assert.match(
    html,
    /resource-type resource-type-template[^>]*>🧾(?:<!-- -->|\s)*源码与模板<\/span>/,
  );
  assert.match(
    html,
    /resource-type resource-type-video[^>]*>📺(?:<!-- -->|\s)*视频<\/span>/,
  );
  assert.match(html, /class="resource-card resource-card-video"/);
  assert.match(html, /class="resource-card resource-card-launcher"/);
  assert.match(html, /<h4>Claude Code 全局指令模板<\/h4>/);
  assert.match(html, /<h4>Codex 全局指令模板<\/h4>/);

  const sourceLinks = [
    "/resources/agents/claude-code/cc.bat",
    "/resources/agents/claude-code/ccmac.sh",
    "/resources/agents/claude-code/cclinux.sh",
    "/resources/agents/claude-code/CLAUDE.md",
    "/resources/agents/codex/AGENTS.md",
    "/resources/agents/codex/codex-reset-remaining.py",
  ];
  for (const href of sourceLinks) assert.match(html, new RegExp(`href="${href}"`));
  for (let index = 1; index < sourceLinks.length - 1; index += 1) {
    assert.ok(html.indexOf(sourceLinks[index - 1]) < html.indexOf(sourceLinks[index]));
  }

  assert.doesNotMatch(html, /@echo off|from datetime import datetime/);
  assert.doesNotMatch(html, /<article class="source-resource"/);
  assert.doesNotMatch(html, /Hyper-V-TPM\.png/);
  assert.doesNotMatch(html, /Codex 指南 GitHub 备用地址|GitHub 原始内容入口/);
  assert.doesNotMatch(search, /@echo off/);
  assert.match(html, /href="\/resources\/others\/git-pr-contributor-tutorial\.md"/);
  assert.match(html, /href="\/assets\/git-pr-flowchart-[^"]+\.html"/);
});

test("serves source detail pages and renders learning Markdown", async () => {
  const cases = [
    ["cc.bat", "Claude Code Windows 启动脚本", "@echo off"],
    ["ccmac.sh", "Claude Code macOS 快捷启动脚本", "Claude project launcher for macOS zsh"],
    ["cclinux.sh", "Claude Code Linux/WSL 启动脚本", "Claude project launcher"],
    ["CLAUDE.md", "Claude Code 全局指令模板", "# 全局指令"],
  ];

  for (const [filename, title, sourceLiteral] of cases) {
    const response = await render(`/resources/agents/claude-code/${filename}`);
    const html = await response.text();

    assert.equal(response.status, 200, filename);
    assert.match(html, new RegExp(`<h1>${title.replace(".", "\\.")}<\\/h1>`));
    assert.match(html, new RegExp(sourceLiteral));
    assert.match(html, new RegExp(`aria-label="复制 ${filename.replace(".", "\\.")} 源码"`));
  }

  for (const [filename, title, sourceLiteral] of [
    ["git-pr-contributor-tutorial.md", "Git PR 教程（普通贡献者视角）", "<article class=\"article-content\">"],
  ]) {
    const response = await render(`/resources/others/${filename}`);
    const html = await response.text();

    assert.equal(response.status, 200, filename);
    assert.match(html, new RegExp(`>${title}<\\/h1>`));
    assert.match(html, new RegExp(sourceLiteral));
    assert.doesNotMatch(html, /MD 源码|复制源码|source-resource/);
  }

  assert.equal((await render("/resources/others/git-pr-flowchart.html")).status, 404);

  assert.equal(
    (await render("/resources/agents/claude-code/not-listed.sh")).status,
    404,
  );
});

test("keeps local source files out of client asset bundles", async () => {
  const assets = await readdir(new URL("../dist/client/assets/", import.meta.url));

  assert.ok(!assets.some((name) => name.startsWith("ccmac-")));
  assert.ok(!assets.some((name) => name.startsWith("cclinux-")));
  assert.ok(assets.some((name) => /^git-pr-flowchart-.+\.html$/.test(name)));
});

test("organizes public notes under one catalog", async () => {
  const root = new URL("../", import.meta.url);

  for (const directory of [
    "agents",
    "models",
    "operating-system",
    "others",
    "programme-env",
  ]) {
    await access(new URL(`notes/${directory}/`, root));
    await assert.rejects(access(new URL(`${directory}/`, root)), { code: "ENOENT" });
  }

  await access(new URL("README.md", root));
  await access(new URL("AGENTS.md", root));
  await assert.rejects(access(new URL("20260614.md", root)), { code: "ENOENT" });

  assert.equal((await render("/guides/others/zotero")).status, 200);
  assert.equal(
    (await render("/guides/agents/claude-code/tutorial/常用命令")).status,
    200,
  );
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
  const paths = [...catalogBlock(readme).matchAll(/^\s*-\s+📄\[[^\]]+\]\(([^)]+)\)\s*$/gm)]
    .map((match) => match[1]);

  assert.ok(paths.length > 20);
  assert.ok(paths.every((path) => path.startsWith("notes/")));
  assert.ok(paths.every((path) => path.toLowerCase().endsWith(".md")));
  assert.ok(!paths.some((path) => /\/(?:CLAUDE|AGENTS)\.md$/.test(path)));

  for (const path of paths) {
    const slug = path
      .replace(/\\/g, "/")
      .replace(/^notes\//, "")
      .replace(/\.md$/i, "");
    const response = await render(`/guides/${slug}`);
    assert.equal(response.status, 200, path);
  }
});

test("renders Markdown structure and repository images", async () => {
  const claudeCode = await (
    await render("/guides/agents/claude-code/claude-code")
  ).text();
  const zotero = await (await render("/guides/others/zotero")).text();
  const context7 = await (
    await render("/guides/agents/MCP/context7")
  ).text();
  const hyperV = await (
    await render("/guides/operating-system/Hyper-V")
  ).text();
  const git = await (await render("/guides/others/git")).text();

  assert.match(zotero, /<h1[^>]*>Zotero 指南<\/h1>/);
  assert.match(context7, /<pre><code/);
  assert.match(hyperV, /<img[^>]+Hyper-V/);
  assert.match(
    claudeCode,
    /href="\/resources\/agents\/claude-code\/cc\.bat"/,
  );
  assert.match(claudeCode, /href="\/resources\/agents\/claude-code\/CLAUDE\.md"/);
  assert.match(git, /href="\/resources\/others\/git-pr-contributor-tutorial\.md"/);
  assert.match(git, /href="\/assets\/git-pr-flowchart-[^"]+\.html"/);
  assert.doesNotMatch(claudeCode, /github\.com\/psiQAQ\/psiQAQ\.github\.io\/blob\/main\/notes\/agents\/claude-code/);
});

test("links article headings from the document table of contents", async () => {
  const html = await (await render("/guides/others/zotero")).text();
  const guideSource = await readFile(
    new URL("../app/guides/[...slug]/page.tsx", import.meta.url),
    "utf8",
  );
  const tocSource = guideSource.slice(guideSource.indexOf("function TableOfContents"));

  assert.match(tocSource, /<Link\b/);
  assert.match(tocSource, /prefetch=\{false\}/);
  assert.doesNotMatch(tocSource, /<a\b/);

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

  assert.match(html, /Zotero：文献管理/);
  assert.match(html, /Codex：OpenAI 编程智能体/);
  assert.match(html, /搜索全部公开指南/);
});

test("offers recovery for unknown routes", async () => {
  const response = await render("/missing-page");
  const html = await response.text();

  assert.equal(response.status, 404);
  assert.match(html, /返回知识库/);
});
