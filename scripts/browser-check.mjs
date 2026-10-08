import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const browserPath = process.env.BROWSER_EXECUTABLE;
if (!browserPath) throw new Error("Set BROWSER_EXECUTABLE to an existing Chrome/Chromium executable.");
const root = path.resolve("outputs/just-the-docs");
const baseline = JSON.parse(await readFile("tests/fixtures/site-baseline.json", "utf8"));
const resourceCount = baseline.entries.filter(entry => entry.icon !== "📄").length;
await mkdir(root, { recursive: true });
const child = spawn(browserPath, ["--headless=new", "--disable-gpu", "--disable-extensions", "--disable-background-networking", "--disable-component-update", "--disable-default-apps", "--remote-debugging-port=0", `--user-data-dir=${root}/browser-profile`, "--no-first-run", "--no-default-browser-check", "about:blank"], { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
console.log(`Isolated browser PID: ${child.pid}`);
let socket;
try {
  const endpoint = await new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => reject(new Error("Browser debugging endpoint did not start")), 15000);
    child.once("error", reject);
    child.once("exit", code => reject(new Error(`Browser exited before startup: ${code}`)));
    child.stderr.on("data", chunk => {
      output += chunk.toString();
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  const pending = new Map();
  let sequence = 0;
  const errors = [];
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const callback = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) callback?.reject(new Error(message.error.message)); else callback?.resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
    if (message.method === "Fetch.requestPaused") {
      send("Fetch.failRequest", { requestId: message.params.requestId, errorReason: "Failed" }, message.sessionId).catch(error => errors.push(error.message));
    }
  });
  function send(method, params = {}, sessionId) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 10000);
      pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const cdp = (method, params = {}) => send(method, params, sessionId);
  await cdp("Page.enable"); await cdp("Runtime.enable");
  async function evaluate(expression) {
    const result = await cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  }
  async function until(expression) {
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      if (await evaluate(expression)) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Browser condition failed: ${expression}`);
  }
  async function navigate(route) {
    await cdp("Page.navigate", { url: `http://127.0.0.1:3000${route}` });
    await until(`location.pathname === ${JSON.stringify(route.split(/[?#]/)[0])} && document.readyState === 'complete' && !!document.querySelector('#main-content')`);
  }
  await send("Browser.grantPermissions", { origin: "http://127.0.0.1:3000", permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] });
  const routes = ["/", "/resources", "/guides/agents/skills/agent-development-workflows-and-decisions", "/resources/agents/prompt/AGENTS.md", "/resources/others/git-pr-contributor-tutorial.md", "/library", "/guides/agents/MCP/blender"];
  const viewports = [390, 700, 768, 992, 1197, 1280, 1440];
  for (const width of viewports) {
    await cdp("Emulation.setDeviceMetricsOverride", { width, height: width === 700 || width === 992 ? 884 : 1000, deviceScaleFactor: 1, mobile: false });
    for (const theme of ["light", "dark"]) {
      for (const [index, route] of routes.entries()) {
        await navigate(route);
        await evaluate(`var picker=document.querySelector('[aria-label="颜色主题"]');picker.value=${JSON.stringify(theme)};picker.dispatchEvent(new Event('change',{bubbles:true}));`);
        await until(`document.documentElement.dataset.theme === ${JSON.stringify(theme)} && document.querySelector('[aria-label="颜色主题"]').value === ${JSON.stringify(theme)}`);
        const sizes = await evaluate(`({width:innerWidth, scroll:document.documentElement.scrollWidth, article:document.querySelector('article')?.scrollHeight || 0})`);
        assert.ok(sizes.scroll <= sizes.width + 1, `${route} ${width}px ${theme}: whole-page overflow ${sizes.scroll}`);
        const destinations = await evaluate(`Array.from(document.querySelectorAll('.site-destinations')).map(nav => Array.from(nav.querySelectorAll('a')).map(link => [link.getAttribute('href'), link.textContent]))`);
        assert.deepEqual(destinations, Array(2).fill([["/library", "知识库"], ["/resources", "资源导航"]]));
        if (route === "/" || route === "/library") {
          assert.equal(await evaluate(`document.querySelector('#main-content h1').textContent`), "知识库");
          assert.equal(await evaluate(`document.querySelectorAll('.library-list > a').length`), baseline.entries.filter(entry => entry.icon === "📄").length);
          assert.ok(await evaluate(`!document.querySelector('.library-index, .home-destinations')`));
          assert.equal(await evaluate(`document.querySelector('.site-destinations a[aria-current="page"]').textContent`), "知识库");
          const headings = await evaluate(`Array.from(document.querySelectorAll('.library-sections h2, .library-sections h3')).map(heading => heading.textContent)`);
          assert.deepEqual(headings, ["1. 基础环境", "2. 系统与运行环境", "3. 智能体", "3.1 Claude Code", "3.2 Codex", "3.3 通用全局指令", "4. 智能体扩展", "4.1 Skills", "4.2 MCP", "4.3 周边工具与扩展", "4.4 代码读取与生成"]);
          const navigation = await evaluate(`Array.from(document.querySelectorAll('.document-sidebar .navigation-category-link, .document-sidebar .navigation-group-link')).map(link => link.textContent)`);
          assert.deepEqual(navigation, headings);
          assert.ok(await evaluate(`!document.querySelector('.document-sidebar .navigation-category')`));
        }
        if (route === "/resources") {
          const rows = await evaluate(`Array.from(document.querySelectorAll('.resource-card')).map(card => ({width:card.getBoundingClientRect().width, parent:card.parentElement.getBoundingClientRect().width}))`);
          assert.equal(rows.length, resourceCount);
          assert.ok(rows.every(row => Math.abs(row.width - row.parent) < 1), `Full-width resource rows at ${width}px`);
          const headings = await evaluate(`Array.from(document.querySelectorAll('.resource-sections h2, .resource-sections h3')).map(heading => heading.textContent)`);
          assert.deepEqual(headings, ["1. Agent 安装与配置", "1.1 Claude Code", "1.2 通用全局指令", "2. Agent 学习资料", "2.1 Agent 入门与实践", "2.2 Agent 原理与优化", "2.3 MCP 市场", "3. LLM 参数汇总", "4. LLM 评测排行榜", "5. 开发与模型工具", "6. AI 新闻", "7. AI 行业观察"]);
          const resourceLinks = await evaluate(`Array.from(document.querySelectorAll('.document-sidebar .navigation-category-link, .document-sidebar .navigation-group-link')).map(link => link.textContent)`);
          assert.deepEqual(resourceLinks, headings);
        }
        const screenshot = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
        await writeFile(`${root}/${width}-${theme}-${index}.png`, Buffer.from(screenshot.data, "base64"));
      }
    }
  }
  await cdp("Emulation.setDeviceMetricsOverride", { width: 992, height: 884, deviceScaleFactor: 1, mobile: false });
  await navigate("/guides/agents/MCP/blender");
  assert.ok(await evaluate(`!!document.querySelector('.article-content a[href="https://notes.psiqaq.cn/blender_mcp-setup-guide/"]')`));
  await evaluate(`document.querySelector('.mobile-toc > summary').click()`);
  const blenderConfigurationId = await evaluate(`(() => { const link = Array.from(document.querySelectorAll('.mobile-toc a')).find(link => link.textContent==='配置 MCP 客户端'); const id=decodeURIComponent(link.getAttribute('href').slice(1)); link.click(); return id; })()`);
  await until(`(() => { const target = document.getElementById(${JSON.stringify(blenderConfigurationId)}); return decodeURIComponent(location.hash)===${JSON.stringify(`#${blenderConfigurationId}`)} && !!target && target.getBoundingClientRect().top >= 0 && target.getBoundingClientRect().top < 220; })()`);
  const blenderScreenshot = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(`${root}/992-blender-configuration.png`, Buffer.from(blenderScreenshot.data, "base64"));
  await navigate("/resources/");
  for (const category of ["Agent 学习资料", "LLM 参数汇总", "LLM 评测排行榜", "开发与模型工具", "AI 新闻", "AI 行业观察"]) {
    await evaluate(`document.querySelector('.document-sidebar .navigation-category-link[href="/resources#${encodeURIComponent(category)}"]').click()`);
    await until(`(() => { const target = document.getElementById(${JSON.stringify(category)}); return decodeURIComponent(location.hash)===${JSON.stringify(`#${category}`)} && !!target && target.getBoundingClientRect().top >= 0 && target.getBoundingClientRect().top < innerHeight; })()`);
  }
  for (const id of ["资源", "大模型选型与排行榜", "资源--Agent 入门与实践", "资源--Agent 原理与优化", "资源--MCP 市场", "资源--开发与模型工具", "资源--AI 新闻", "资源--AI 行业观察"]) {
    await navigate(`/resources/#${encodeURIComponent(id)}`);
    await until(`(() => { const target = document.getElementById(${JSON.stringify(id)}); return !!target && target.getBoundingClientRect().top >= 0 && target.getBoundingClientRect().top < innerHeight; })()`);
  }
  await navigate(`/resources/#${encodeURIComponent("LLM 参数汇总")}`);
  await evaluate(`document.querySelector('[aria-label="颜色主题"]').value='light'; document.querySelector('[aria-label="颜色主题"]').dispatchEvent(new Event('change',{bubbles:true}));`);
  await until(`document.documentElement.dataset.theme==='light'`);
  const topicsScreenshot = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(`${root}/992-light-resource-topics.png`, Buffer.from(topicsScreenshot.data, "base64"));
  await navigate("/library/");
  await evaluate(`document.querySelector('.document-sidebar .navigation-category-link[href="/library#${encodeURIComponent('智能体')}"]').click()`);
  await until(`(() => { const target = document.getElementById('智能体'); return decodeURIComponent(location.hash)==='#智能体' && !!target && target.getBoundingClientRect().top >= 0 && target.getBoundingClientRect().top < 220; })()`);
  await evaluate(`document.querySelector('.document-sidebar .navigation-group-link[href="/library#${encodeURIComponent('智能体--Claude Code')}"]').click()`);
  await until(`(() => { const target = document.getElementById('智能体--Claude Code'); return decodeURIComponent(location.hash)==='#智能体--Claude Code' && !!target && target.getBoundingClientRect().top >= 0 && target.getBoundingClientRect().top < 220; })()`);
  await cdp("Emulation.setDeviceMetricsOverride", { width: 700, height: 884, deviceScaleFactor: 1, mobile: false });
  await navigate("/library");
  await evaluate(`document.querySelector('[aria-label="颜色主题"]').value='light'; document.querySelector('[aria-label="颜色主题"]').dispatchEvent(new Event('change',{bubbles:true})); document.querySelector('.mobile-docs-nav > summary').click()`);
  await until(`document.querySelector('.mobile-docs-nav').open && document.documentElement.dataset.theme==='light'`);
  const navigationScreenshot = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(`${root}/700-light-library-navigation.png`, Buffer.from(navigationScreenshot.data, "base64"));
  await evaluate(`document.querySelector('.mobile-docs-nav .navigation-group-link[href="/library#${encodeURIComponent('智能体扩展--MCP')}"]').click()`);
  await until(`(() => { const target = document.getElementById('智能体扩展--MCP'); return decodeURIComponent(location.hash)==='#智能体扩展--MCP' && !!target && target.getBoundingClientRect().top >= 0 && target.getBoundingClientRect().top < 220; })()`);
  await cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate("/guides/agents/codex/codex");
  await evaluate(`document.querySelector('.mobile-docs-nav > summary').click()`);
  await until(`document.querySelector('.mobile-docs-nav').open`);
  for (const label of ["基础环境", "系统与运行环境", "智能体", "智能体扩展", "资源导航"]) {
    assert.ok(await evaluate(`document.querySelector('.mobile-docs-nav').textContent.includes(${JSON.stringify(label)})`), label);
  }
  await navigate("/resources/");
  await evaluate(`document.querySelector('.mobile-docs-nav > summary').click()`);
  assert.equal(await evaluate(`document.querySelector('.site-destinations a[aria-current="page"]').textContent`), "资源导航");
  const resourceNavigation = await evaluate(`document.querySelector('.mobile-docs-nav .docs-navigation').textContent`);
  for (const label of ["Agent 安装与配置", "Agent 学习资料", "LLM 参数汇总", "LLM 评测排行榜", "开发与模型工具", "AI 新闻", "AI 行业观察", "MCP 市场"]) assert.ok(resourceNavigation.includes(label));
  assert.ok(!resourceNavigation.includes("基础环境"));
  await evaluate(`document.querySelector('.mobile-docs-nav .navigation-group-link[href="/resources#${encodeURIComponent('Agent 学习资料--MCP 市场')}"]').click()`);
  await until(`(() => { const target = document.getElementById('Agent 学习资料--MCP 市场'); return decodeURIComponent(location.hash)==='#Agent 学习资料--MCP 市场' && !!target && target.getBoundingClientRect().top >= 0 && target.getBoundingClientRect().top < 220; })()`);
  await cdp("Emulation.setScriptExecutionDisabled", { value: true });
  await navigate(`/resources/#${encodeURIComponent("资源--开发与模型工具")}`);
  assert.equal(await evaluate(`document.getElementById('资源--开发与模型工具').closest('section').querySelector('h2').textContent`), "5. 开发与模型工具");
  await navigate("/guides/agents/tools/graphify");
  assert.ok(await evaluate(`document.querySelector('.article-content').textContent.includes('graphify')`));
  await evaluate(`document.querySelector('.mobile-docs-nav > summary').click()`);
  assert.ok(await evaluate(`document.querySelector('.mobile-docs-nav').open`));
  await navigate("/");
  assert.equal(await evaluate(`document.querySelector('#main-content h1').textContent`), "知识库");
  assert.ok(await evaluate(`document.querySelector('.library-list a').getAttribute('href').startsWith('/guides/')`));
  await evaluate(`document.querySelector('.mobile-docs-nav > summary').click(); document.querySelector('.mobile-docs-nav .navigation-group-link[href="/library#${encodeURIComponent('智能体--Claude Code')}"]').click()`);
  await until(`decodeURIComponent(location.hash)==='#智能体--Claude Code' && !!document.getElementById('智能体--Claude Code')`);
  await cdp("Emulation.setScriptExecutionDisabled", { value: false });
  await cdp("Network.setCacheDisabled", { cacheDisabled: true });
  await navigate("/");
  await cdp("Fetch.enable", { patterns: [{ urlPattern: "*/search-index.json" }] });
  await evaluate(`document.querySelector('#global-search').focus()`);
  await until(`document.querySelector('.search-popover [role="alert"]')?.textContent.includes('加载失败')`);
  await cdp("Fetch.disable");
  await evaluate(`document.querySelector('.search-popover button').click()`);
  await until(`document.querySelector('.search-popover')?.textContent.includes('输入关键词')`);
  await navigate("/search?q=AIHOT");
  await cdp("Fetch.enable", { patterns: [{ urlPattern: "*/search-index.json" }] });
  await cdp("Page.reload");
  await until(`document.querySelector('.search-experience [role="alert"]')?.textContent.includes('加载失败')`);
  assert.equal(await evaluate(`document.querySelector('#site-search').value`), "AIHOT");
  await cdp("Fetch.disable");
  await evaluate(`document.querySelector('.search-experience button').click()`);
  await until(`document.querySelector('.search-results')?.textContent.includes('AIHOT')`);
  assert.equal(await evaluate(`document.querySelectorAll('.search-results > a').length`), 1);
  await navigate("/");
  await evaluate(`document.querySelector('[aria-label="颜色主题"]').value='system'; document.querySelector('[aria-label="颜色主题"]').dispatchEvent(new Event('change',{bubbles:true}));`);
  await until(`localStorage.getItem('agent-lab-notes-theme') === 'system'`);
  for (const theme of ["light", "dark"]) {
    await cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: theme }] });
    await until(`getComputedStyle(document.documentElement).colorScheme === ${JSON.stringify(theme)}`);
  }
  await cdp("Emulation.setEmulatedMedia", { features: [] });
  await evaluate(`document.querySelector('[aria-label="颜色主题"]').value='dark'; document.querySelector('[aria-label="颜色主题"]').dispatchEvent(new Event('change',{bubbles:true}));`);
  await until(`localStorage.getItem('agent-lab-notes-theme') === 'dark'`);
  await cdp("Page.reload");
  await until(`document.readyState==='complete' && document.documentElement.dataset.theme==='dark' && document.querySelector('[aria-label="颜色主题"]').value==='dark'`);
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "/", code: "Slash" });
  await until(`document.activeElement?.id === 'global-search'`);
  await cdp("Input.insertText", { text: "中文元数据补全" });
  await until(`document.querySelector('#search-suggestions')?.textContent.includes('Zotero：文献管理')`);
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowDown", code: "ArrowDown" });
  assert.equal(await evaluate(`document.querySelector('#global-search').getAttribute('aria-activedescendant')`), "search-option-0");
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
  await until(`document.querySelector('#global-search').getAttribute('aria-expanded') === 'false'`);
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowDown", code: "ArrowDown" });
  await until(`document.querySelector('#global-search').getAttribute('aria-activedescendant') === 'search-option-0'`);
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter" });
  await until(`location.pathname === '/guides/agents/MCP/zotero'`);
  await navigate("/resources/agents/prompt/AGENTS.md#user-interaction");
  await until(`document.querySelector('#user-interaction')?.textContent.includes('## User Interaction')`);
  const expected = await evaluate(`document.querySelector('.source-resource pre code').textContent`);
  await evaluate(`document.querySelector('.source-resource button').click()`);
  await until(`document.querySelector('.source-resource button').textContent.includes('已复制')`);
  assert.equal((await evaluate(`navigator.clipboard.readText()`)).replace(/\r\n/g, "\n"), expected.replace(/\r\n/g, "\n"));
  await navigate("/guides/agents/MCP/context7");
  const expectedCode = await evaluate(`document.querySelector('.article-code-block pre code').textContent`);
  await evaluate(`document.querySelector('.article-code-copy').click()`);
  await until(`document.querySelector('.article-code-copy').textContent.includes('已复制')`);
  assert.equal((await evaluate(`navigator.clipboard.readText()`)).replace(/\r\n/g, "\n"), expectedCode.replace(/\r\n/g, "\n"));
  await cdp("Page.navigate", { url: "http://127.0.0.1:3000/guides/others/zotero?from=legacy#软件下载安装" });
  await until(`location.pathname==='/guides/agents/MCP/zotero' && location.search==='?from=legacy' && decodeURIComponent(location.hash)==='#软件下载安装'`);
  await cdp("Page.navigate", { url: "http://127.0.0.1:3000/guides/models/models-dev?from=legacy#网站页面怎么看" });
  await until(`location.pathname==='/resources/models/models-dev.md' && location.search==='?from=legacy' && decodeURIComponent(location.hash)==='#网站页面怎么看' && !!document.getElementById('网站页面怎么看')`);
  assert.ok(await evaluate(`!!document.querySelector('.article-content')`));
  await navigate("/search?q=Models.dev");
  await until(`document.querySelector('.search-results')?.textContent.includes('Models.dev')`);
  assert.equal(await evaluate(`document.querySelector('.search-results > a').getAttribute('href')`), "/resources/models/models-dev.md");
  await navigate("/search?q=AIHOT");
  await until(`document.querySelector('.search-results')?.textContent.includes('AIHOT')`);
  assert.equal(await evaluate(`document.querySelectorAll('.search-results > a').length`), 1);
  await evaluate(`document.querySelector('#site-search').focus()`);
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "/", code: "Slash" });
  assert.equal(await evaluate(`document.activeElement.id`), "site-search");
  await navigate("/missing-page");
  assert.ok(await evaluate(`document.querySelector('#main-content').textContent.includes('返回知识库')`));
  assert.equal((await fetch("http://127.0.0.1:3000/missing-page")).status, 404);
  assert.equal((await fetch("http://127.0.0.1:3000/start")).status, 404);
  assert.deepEqual(errors, [], "No uncaught browser exceptions");
  const screenshotCount = routes.length * viewports.length * 2;
  await writeFile(`${root}/browser-results.json`, JSON.stringify({ routes, viewports, themes: ["light", "dark"], screenshotCount, checks: ["overflow", "root knowledge base and library without jump bar", "two navigation destinations and header search", "numbered library navigation and desktop/mobile section links", "numbered resource headings and matching navigation", "full-width resource rows", "mobile whole-site navigation", "resource category navigation with trailing slash and Chinese anchors", "no-JavaScript reading and navigation", "global and standalone search failure and retry", "system theme and preference persistence", "keyboard search and editable-input guard", "template anchor", "source clipboard", "code clipboard", "legacy query/hash including Models.dev", "search page and relocated Models.dev", "static HTTP 404 recovery and removed start route"], errors }, null, 2));
  console.log(`Browser verification passed: ${screenshotCount} rendered samples and interactive checks.`);
  await send("Browser.close");
} finally {
  socket?.close();
  if (child.exitCode === null) child.kill();
}
