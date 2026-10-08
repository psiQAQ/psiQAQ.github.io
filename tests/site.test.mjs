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

test("opens the knowledge base at the site root", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<h1>知识库<\/h1>/);
  assert.match(html, /<title>知识库/);
  assert.match(html, /href="\/guides\/agents\/codex\/codex"/);
  assert.match(html, /property="og:image" content="https:\/\/psiqaq\.github\.io\/og\.png"/);
  assert.doesNotMatch(html, /新手路径|结构化文献笔记|科研 Agent 新手知识站|codex-preview|Your site is taking shape/);
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
    "../dist/client/guides/agents/MCP/zotero.html",
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
  const guide = await (await render("/guides/agents/MCP/zotero")).text();
  const guideSource = await readFile(
    new URL("../components/document-shell.tsx", import.meta.url),
    "utf8",
  );

  assert.match(home, /href="\/search"/);
  assert.match(home, /href="\/resources">资源导航<\/a>/);
  assert.match(home, /搜索文档与资源/);
  assert.match(guide, /aria-label="文档导航"/);
  assert.match(guide, /href="\/guides\/agents\/codex\/codex"/);
  assert.match(
    guide,
    /<a(?=[^>]*aria-current="page")(?=[^>]*href="\/guides\/agents\/MCP\/zotero")[^>]*>/,
  );
  assert.match(guide, /浏览全站文档/);
  assert.match(
    guideSource,
    /headings\.length > 0 && <aside className="guide-toc"/,
  );
});

test("presents the knowledge base and independent search page", async () => {
  const library = await (await render("/library")).text();
  const search = await (await render("/search")).text();
  assert.match(library, /篇公开指南/);
  assert.match(library, /<h3>3\.1 Claude Code<\/h3>/);
  assert.doesNotMatch(library, /library-index/);
  assert.doesNotMatch(library, /Claude Code 全局指令模板|Codex 全局指令模板/);
  assert.match(search, /<input(?=[^>]*id="site-search")(?=[^>]*autofocus)[^>]*>/);
});

test("uses two site destinations and keeps search in the header", async () => {
  for (const route of ["/", "/library", "/resources", "/guides/agents/codex/codex"]) {
    const html = await (await render(route)).text();
    const destinations = [...html.matchAll(/<div class="site-destinations">([\s\S]*?)<\/div>/g)];
    assert.equal(destinations.length, 2, route);
    for (const [, navigation] of destinations) {
      const links = [...navigation.matchAll(/href="([^"]+)"[^>]*>([^<]+)</g)].map(match => [match[1], match[2]]);
      assert.deepEqual(links, [["/library", "知识库"], ["/resources", "资源导航"]], route);
    }
    assert.match(html, /id="global-search"/);
  }
  const root = await (await render("/")).text();
  const library = await (await render("/library")).text();
  assert.equal(root.match(/<div class="library-sections">[\s\S]*?<\/main>/)?.[0], library.match(/<div class="library-sections">[\s\S]*?<\/main>/)?.[0]);
  assert.doesNotMatch(root, /home-destinations|library-index|href="\/start"/);
});

test("ships accessible document layouts and both color themes", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  for (const selector of [".document-shell", ".document-sidebar", ".docs-navigation", ".mobile-docs-nav", ".search-popover", ".guide-toc"]) {
    assert.ok(css.includes(selector), selector);
  }
  assert.match(css, /html\[data-theme="dark"\]/);
  assert.match(css, /prefers-color-scheme: dark/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /overflow-x: auto/);
  assert.doesNotMatch(css, /body\s*\{[^}]*overflow-x:\s*hidden/s);
});

test("serves the main knowledge routes", async () => {
  for (const pathname of ["/library", "/resources", "/search"]) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
  }
});

test("publishes a categorized resource navigation index", async () => {
  const response = await render("/resources");
  const html = await response.text();
  const search = await (await render("/search")).text();

  assert.equal(response.status, 200);
  assert.match(html, /<h1>资源导航<\/h1>/);
  assert.match(
    html,
    /<a(?=[^>]*href="https:\/\/artificialanalysis\.ai\/")(?=[^>]*target="_blank")(?=[^>]*rel="noreferrer")[^>]*>/,
  );
  assert.match(html, /<h2>1\. Agent 安装与配置<\/h2>/);
  assert.match(html, /<h3>1\.1 Claude Code<\/h3>/);
  assert.match(html, /<h3>1\.2 通用全局指令<\/h3>/);
  assert.deepEqual([...html.matchAll(/<h2>([^<]+)<\/h2>/g)].map(match => match[1]), ["1. Agent 安装与配置", "2. Agent 学习资料", "3. LLM 参数汇总", "4. LLM 评测排行榜", "5. 开发与模型工具", "6. AI 新闻", "7. AI 行业观察"]);
  const parameters = html.match(/<section id="LLM 参数汇总">([\s\S]*?)<\/section>/)?.[1];
  const rankings = html.match(/<section id="LLM 评测排行榜">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(parameters && rankings);
  assert.match(parameters, /Models\.dev/);
  assert.doesNotMatch(parameters, /Artificial Analysis|Arena AI/);
  assert.match(rankings, /Artificial Analysis/);
  assert.match(rankings, /Arena AI/);
  assert.doesNotMatch(rankings, /Models\.dev/);
  for (const id of ["资源", "大模型选型与排行榜", "资源--Agent 入门与实践", "资源--Agent 原理与优化", "资源--MCP 市场", "资源--开发与模型工具", "资源--AI 新闻", "资源--AI 行业观察"]) assert.ok(html.includes(`id="${id}"`), `Compatible anchor: ${id}`);
  assert.match(
    html,
    /汇集 Agent 学习资料、实用脚本、开发工具、大模型评测、AI 新闻与行业观察。/,
  );
  assert.doesNotMatch(html, /README 清单/);
  const resourceGroups = [
    "Agent 入门与实践",
    "Agent 原理与优化",
    "MCP 市场",
  ];
  for (const [index, group] of resourceGroups.entries()) assert.match(html, new RegExp(`<h3>2\\.${index + 1} ${group}</h3>`));
  for (let index = 1; index < resourceGroups.length; index += 1) {
    assert.ok(html.indexOf(`<h3>2.${index} ${resourceGroups[index - 1]}</h3>`) < html.indexOf(`<h3>2.${index + 1} ${resourceGroups[index]}</h3>`));
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
  assert.match(html, /<h4>Agent 通用全局指令模板<\/h4>/);

  const sourceLinks = [
    "/resources/agents/claude-code/cc.bat",
    "/resources/agents/claude-code/ccmac.sh",
    "/resources/agents/claude-code/cclinux.sh",
    "/resources/agents/claude-code/CLAUDE.md",
    "/resources/agents/prompt/AGENTS.md",
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
    ["AGENTS.md", "Agent 通用全局指令模板", "# Global Agent Instructions"],
  ]) {
    const response = await render(`/resources/agents/prompt/${filename}`);
    const html = await response.text();

    assert.equal(response.status, 200, filename);
    assert.match(html, new RegExp("<h1>" + title.replace(".", "\\.") + "<\\/h1>"));
    assert.match(html, new RegExp(sourceLiteral));
    assert.match(html, new RegExp("aria-label=\"复制 " + filename.replace(".", "\\.") + " 源码\""));
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

  assert.equal((await render("/guides/agents/MCP/zotero")).status, 200);
  assert.equal(
    (await render("/guides/agents/claude-code/tutorial/常用命令")).status,
    200,
  );
});

test("resource pages use their own category and group navigation", async () => {
  for (const route of ["/resources", "/resources/agents/prompt/AGENTS.md"]) {
    const html = await (await render(route)).text();
    const sidebar = html.match(/<aside class="document-sidebar">([\s\S]*?)<\/aside>/)?.[1];
    assert.ok(sidebar);
    assert.match(sidebar, /aria-label="资源分类导航"/);
    for (const label of ["Agent 安装与配置", "Agent 学习资料", "LLM 参数汇总", "LLM 评测排行榜", "开发与模型工具", "MCP 市场", "AI 新闻", "AI 行业观察"]) assert.ok(sidebar.includes(label), label);
    assert.doesNotMatch(sidebar, /基础环境|系统与运行环境|href="\/guides\/|新手路径/);
    assert.match(html, /浏览资源分类/);
    assert.match(sidebar, new RegExp('href="/resources#' + encodeURIComponent("Agent 学习资料--MCP 市场") + '"'));
  }
  const resource = await (await render("/resources/agents/prompt/AGENTS.md")).text();
  assert.match(resource, /href="\/resources#[^"]+" aria-current="location"/);
});

test("knowledge indexes use numbered category and group links to their sections", async () => {
  for (const route of ["/", "/library"]) {
    const html = await (await render(route)).text();
    const sidebar = html.match(/<aside class="document-sidebar">([\s\S]*?)<\/aside>/)?.[1];
    assert.ok(sidebar);
    assert.match(sidebar, /aria-label="知识库分类导航"/);
    assert.match(html, /浏览知识库分类/);
    assert.doesNotMatch(sidebar, /<details|href="\/guides\//);
    const navigation = [...sidebar.matchAll(/class="navigation-(?:category|group)-link" href="([^"]+)"[^>]*>([^<]+)</g)];
    const headings = [...html.matchAll(/<h[23]>([^<]+)<\/h[23]>/g)].map(match => match[1]);
    assert.deepEqual(navigation.map(match => match[2]), headings);
    assert.deepEqual(headings, ["1. 基础环境", "2. 系统与运行环境", "3. 智能体", "3.1 Claude Code", "3.2 Codex", "3.3 通用全局指令", "4. 智能体扩展", "4.1 Skills", "4.2 MCP", "4.3 周边工具与扩展", "4.4 代码读取与生成"]);
    for (const [, href] of navigation) {
      assert.ok(href.startsWith("/library#"));
      const id = decodeURIComponent(href.split("#")[1]);
      assert.ok(html.includes(`id="${id}"`), `${route}: ${href}`);
    }
  }
});

test("Models.dev appears in resources with its complete article and old static entry", async () => {
  const library = await (await render("/library")).text();
  assert.doesNotMatch(library, /Models\.dev|大模型选型与排行榜/);
  const resources = await (await render("/resources")).text();
  assert.match(resources, /href="\/resources\/models\/models-dev\.md"/);
  const article = await (await render("/resources/models/models-dev.md")).text();
  assert.match(article, /<article class="article-content">/);
  assert.match(article, /LLM 参数汇总/);
  assert.doesNotMatch(article, /source-resource|复制源码/);
  const alias = await readFile("dist/client/guides/models/models-dev.html", "utf8");
  assert.match(alias, /\/resources\/models\/models-dev\.md/);
  assert.match(alias, /location\.search\+location\.hash/);
});

test("removes the beginner route and navigation", async () => {
  assert.equal((await render("/start")).status, 404);
  await assert.rejects(access("dist/client/start.html"), { code: "ENOENT" });
  for (const route of ["/", "/library", "/resources", "/search"]) assert.doesNotMatch(await (await render(route)).text(), /href="\/start"|新手路径/);
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
  const revolution = await (
    await render("/guides/agents/prompt/Global-Agent-Instructions-revolution")
  ).text();
  const zotero = await (await render("/guides/agents/MCP/zotero")).text();
  const context7 = await (
    await render("/guides/agents/MCP/context7")
  ).text();
  const markdownResource = await (
    await render("/resources/others/git-pr-contributor-tutorial.md")
  ).text();
  const hyperV = await (
    await render("/guides/operating-system/Hyper-V")
  ).text();
  const git = await (await render("/guides/others/git")).text();

  assert.match(zotero, /<h1[^>]*>Zotero 指南<\/h1>/);
  assert.match(context7, /class="article-code-block"/);
  assert.match(context7, /<button[^>]+class="article-code-copy"[^>]+type="button"/);
  assert.match(context7, /aria-label="复制代码"/);
  assert.match(context7, />点我复制~<\/span>/);
  assert.match(context7, /<pre><code class="language-[^"]+">/);
  assert.match(markdownResource, /class="article-code-copy"/);
  assert.match(hyperV, /<img[^>]+Hyper-V/);
  assert.match(
    claudeCode,
    /href="\/resources\/agents\/claude-code\/cc\.bat"/,
  );
  assert.match(claudeCode, /href="\/resources\/agents\/claude-code\/CLAUDE\.md"/);
  assert.match(revolution, /<h1[^>]*>Global-Agent-Instructions-revolution<\/h1>/);
  assert.match(revolution, /href="\/resources\/agents\/prompt\/AGENTS\.md"/);
  assert.match(git, /href="\/resources\/others\/git-pr-contributor-tutorial\.md"/);
  assert.match(git, /href="\/assets\/git-pr-flowchart-[^"]+\.html"/);
  assert.doesNotMatch(claudeCode, /github\.com\/psiQAQ\/psiQAQ\.github\.io\/blob\/main\/notes\/agents\/claude-code/);
});

test("links article headings from the document table of contents", async () => {
  const html = await (await render("/guides/agents/MCP/zotero")).text();

  assert.match(html, /本页目录/);
  assert.match(html, /href="#软件下载安装"/);
  assert.match(html, /id="软件下载安装"/);
});

test("navigates to a Chinese table-of-contents heading by its decoded id", async () => {
  const { handleTableOfContentsNavigation } = await import(
    "../lib/table-of-contents-navigation.ts"
  );
  let pushedUrl;
  let requestedId;
  let scrollOptions;
  let prevented = false;

  handleTableOfContentsNavigation(
    { preventDefault: () => (prevented = true) },
    "核心概念",
    {
      history: {
        pushState: (_data, _unused, url) => {
          pushedUrl = url;
        },
      },
      document: {
        getElementById: (id) => {
          requestedId = id;
          return {
            scrollIntoView: (options) => {
              scrollOptions = options;
            },
          };
        },
      },
    },
  );

  assert.equal(prevented, true);
  assert.equal(pushedUrl, "#核心概念");
  assert.equal(requestedId, "核心概念");
  assert.deepEqual(scrollOptions, { behavior: "auto" });
});

test("copies article code and restores its prompt after three seconds", async () => {
  const { copyCode } = await import("../lib/code-copy.ts");
  const writes = [];
  const clearedTimers = [];
  const labels = [];
  let scheduled;

  const timer = await copyCode("npm install\n", 7, {
    clipboard: {
      writeText: async (text) => writes.push(text),
    },
    clearTimeout: (id) => clearedTimers.push(id),
    setLabel: (label) => labels.push(label),
    setTimeout: (callback, delay) => {
      scheduled = { callback, delay };
      return 8;
    },
  });

  assert.deepEqual(writes, ["npm install\n"]);
  assert.deepEqual(clearedTimers, [7]);
  assert.deepEqual(labels, ["已复制！"]);
  assert.equal(scheduled.delay, 3000);
  assert.equal(timer, 8);

  scheduled.callback();
  assert.deepEqual(labels, ["已复制！", "点我复制~"]);
});

test("reports clipboard failure without scheduling false success", async () => {
  const { copyCode } = await import("../lib/code-copy.ts");
  const clearedTimers = [];
  const labels = [];
  let scheduled = false;

  const timer = await copyCode("secret", 12, {
    clipboard: {
      writeText: async () => {
        throw new Error("clipboard denied");
      },
    },
    clearTimeout: (id) => clearedTimers.push(id),
    setLabel: (label) => labels.push(label),
    setTimeout: () => {
      scheduled = true;
      return 13;
    },
  });

  assert.deepEqual(clearedTimers, [12]);
  assert.deepEqual(labels, ["复制失败"]);
  assert.equal(scheduled, false);
  assert.equal(timer, undefined);
});

test("does not publish internal root files", async () => {
  assert.equal((await render("/guides/AGENTS")).status, 404);
  assert.equal((await render("/guides/20260614")).status, 404);
});

test("includes published guides in local search data", async () => {
  const html = await (await render("/search")).text();

  assert.match(html, /Zotero：文献管理/);
  assert.match(html, /Codex：OpenAI 编程智能体/);
  assert.match(html, /搜索公开指南与资源/);
});

test("offers recovery for unknown routes", async () => {
  const response = await render("/missing-page");
  const html = await response.text();

  assert.equal(response.status, 404);
  assert.match(html, /返回知识库/);
});
