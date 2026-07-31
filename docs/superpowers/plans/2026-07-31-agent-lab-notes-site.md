# agent-lab-notes Beginner Knowledge Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and privately deploy a Chinese Sites knowledge site that guides a research beginner from environment setup to a first structured literature note while rendering the repository's existing public Markdown.

**Architecture:** Keep the Sites application at the repository root so Vite can bundle the existing Markdown and screenshot assets without copying source content. A build-time content module reads only Markdown links published by the root `README.md`, creates stable guide routes and a local search index, and passes trusted repository Markdown through one renderer.

**Tech Stack:** Vinext, React 19, TypeScript, Vite, Sites, `marked`, Node test runner, plain CSS.

## Global Constraints

- Existing tutorial Markdown remains the single content source and is not rewritten.
- Publish only Markdown files linked by root `README.md`; do not publish root `AGENTS.md`, dated notes, scripts, or internal files.
- Keep Codex and Claude Code visually equal.
- Do not add login, persisted progress, comments, CMS, AI chat, live rankings, or multilingual support.
- Use the generated Sites configuration as approved scaffolding; apply TDD to all custom behavior.
- Publish a private Sites deployment only after a clean test and build.

---

## File Structure

- `app/layout.tsx`: global metadata and shared header/footer shell.
- `app/page.tsx`: home page and primary new-user call to action.
- `app/start/page.tsx`: five-step beginner path.
- `app/library/page.tsx`: category-based guide library.
- `app/search/page.tsx`: server wrapper for the local search experience.
- `app/guides/[...slug]/page.tsx`: Markdown guide route.
- `app/not-found.tsx`: recovery page for unknown routes.
- `app/globals.css`: responsive visual system and article typography.
- `components/search-client.tsx`: local, keyboard-accessible search filtering.
- `lib/content.ts`: README allowlist, document metadata, route and asset lookup.
- `lib/markdown.ts`: trusted Markdown rendering and internal link/image rewriting.
- `tests/site.test.mjs`: rendered-route and content-contract checks.
- `.openai/hosting.json`: Sites project identifier and storage bindings only.

### Task 1: Create the Sites baseline and failing product checks

**Files:**
- Create: generated Sites configuration and runtime files at repository root
- Modify: `.gitignore`
- Replace: `tests/rendered-html.test.mjs`

**Interfaces:**
- Produces: `render(pathname: string): Promise<Response>` test helper and a buildable Vinext worker.

- [ ] **Step 1: Copy the bundled Vinext starter without overwriting repository docs**

Copy `.openai`, `app`, `build`, `public`, `tests`, `worker`, and required root configuration files from the bundled Sites starter. Merge its generated-file patterns into `.gitignore`; do not copy its `README.md`, database example, or nested Git metadata.

- [ ] **Step 2: Install the starter and minimal Markdown dependency**

```powershell
npm ci --ignore-scripts --prefer-offline --no-audit --no-fund
npm uninstall drizzle-orm drizzle-kit react-loading-skeleton tailwindcss '@tailwindcss/postcss'
npm install marked
```

- [ ] **Step 3: Replace the starter test with failing product assertions**

```javascript
test("renders the beginner home page", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(await response.text(), /完成第一篇结构化文献笔记/);
});

test("serves the main knowledge routes", async () => {
  for (const path of ["/start", "/library", "/search", "/guides/others/zotero"]) {
    assert.equal((await render(path)).status, 200, path);
  }
});
```

- [ ] **Step 4: Run the tests and verify the expected failure**

Run: `npm test`

Expected: the generated starter builds, then the new assertions fail because the beginner copy and routes do not exist.

- [ ] **Step 5: Commit the verified red baseline**

```powershell
git add .gitignore .openai app build public tests worker package.json package-lock.json *.ts *.mjs
git commit -m "test: define beginner site behavior"
```

### Task 2: Bundle public Markdown and render stable guide routes

**Files:**
- Create: `lib/content.ts`
- Create: `lib/markdown.ts`
- Create: `app/guides/[...slug]/page.tsx`
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Produces: `documents: DocumentRecord[]`, `findDocument(slug: string): DocumentRecord | undefined`, `renderMarkdown(document: DocumentRecord): string`.
- `DocumentRecord` fields: `sourcePath`, `slug`, `title`, `category`, `markdown`, `searchText`.

- [ ] **Step 1: Add failing assertions for allowlisting and Markdown behavior**

```javascript
test("renders a published Markdown guide", async () => {
  const html = await (await render("/guides/others/zotero")).text();
  assert.match(html, /Zotero 指南/);
  assert.match(html, /<h1/);
});

test("does not publish internal root files", async () => {
  assert.equal((await render("/guides/AGENTS")).status, 404);
  assert.equal((await render("/guides/20260614")).status, 404);
});
```

- [ ] **Step 2: Run the focused test and verify it fails for missing guide behavior**

Run: `npm test`

Expected: guide assertions fail while the allowlist behavior is not implemented.

- [ ] **Step 3: Implement the README allowlist and stable slugs**

Use literal `import.meta.glob` calls for the existing content directories and their image assets. Parse local `.md` links from imported root `README.md`, normalize separators to `/`, remove `.md`, and reject duplicate slugs or documents without a first-level heading.

- [ ] **Step 4: Implement trusted Markdown rendering**

Configure `marked` to render tables and fenced code blocks. Resolve relative Markdown links to `/guides/<slug>` and resolve relative images through the imported asset map. Unknown documents call `notFound()`.

- [ ] **Step 5: Run the tests and verify green**

Run: `npm test`

Expected: guide and exclusion assertions pass.

- [ ] **Step 6: Commit the content pipeline**

```powershell
git add lib app/guides tests package.json package-lock.json
git commit -m "feat: render published Markdown guides"
```

### Task 3: Build the beginner path, library, search, and responsive shell

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Create: `app/start/page.tsx`
- Create: `app/library/page.tsx`
- Create: `app/search/page.tsx`
- Create: `app/not-found.tsx`
- Create: `components/search-client.tsx`
- Modify: `tests/site.test.mjs`
- Delete: `app/_sites-preview/**`
- Delete: starter SVG files under `public/`

**Interfaces:**
- Consumes: `documents` and `DocumentRecord` from `lib/content.ts`.
- Produces: four public navigation destinations and client-local text filtering.

- [ ] **Step 1: Add failing assertions for navigation, the five steps, search data, metadata, and 404 recovery**

```javascript
test("presents the complete five-step path", async () => {
  const html = await (await render("/start")).text();
  for (const text of ["准备必要环境", "选择 Agent", "添加科研 Skills", "配置 Zotero", "完成首次任务"]) {
    assert.match(html, new RegExp(text));
  }
});

test("offers recovery for unknown routes", async () => {
  const response = await render("/missing-page");
  assert.equal(response.status, 404);
  assert.match(await response.text(), /返回知识库/);
});
```

- [ ] **Step 2: Run the tests and verify the new assertions fail**

Run: `npm test`

Expected: path, metadata, search, or recovery assertions fail against the incomplete pages.

- [ ] **Step 3: Implement the minimal page set**

Create the shared header, home hero, five static learning steps, category library, local search client, and 404 recovery. Use concrete Chinese copy from the approved design and no persisted state.

- [ ] **Step 4: Implement the responsive visual system**

Use plain CSS with a warm off-white background, dark ink text, teal accent, visible focus states, a maximum article width, desktop document columns, and collapsed mobile navigation. Respect `prefers-reduced-motion` and avoid decorative animation.

- [ ] **Step 5: Remove starter-only code and metadata**

Delete `_sites-preview`, starter SVGs, preview metadata, starter title, and unused starter dependencies. Set the site title and description to the finished product copy.

- [ ] **Step 6: Run test, lint, and build verification**

```powershell
npm test
npm run lint
npm run build
```

Expected: all commands exit `0`; tests report no failures; build emits `dist/server/index.js` and `dist/.openai/hosting.json`.

- [ ] **Step 7: Commit the complete site**

```powershell
git add app components lib public tests package.json package-lock.json
git commit -m "feat: add beginner research Agent knowledge site"
```

### Task 4: Add the social card and privately deploy the validated source

**Files:**
- Create: `public/og.png`
- Modify: `app/layout.tsx`
- Modify: `.openai/hosting.json`

**Interfaces:**
- Produces: a validated Sites archive, saved version, and private deployment URL.

- [ ] **Step 1: Generate and inspect one site-specific social card**

Generate a single landscape raster card using the approved teal, ink, and warm-white visual system and the exact headline “从零搭建科研 Agent 工具链”. Retry once only if text is missing or incorrect.

- [ ] **Step 2: Wire absolute request-host Open Graph and X metadata**

Reference `/og.png` with request-host-derived absolute metadata and retain the approved site title and description.

- [ ] **Step 3: Run fresh final verification**

```powershell
npm test
npm run lint
npm run build
git diff --check
git status --short
```

Expected: tests, lint, build, and diff checks succeed; only intended final changes remain.

- [ ] **Step 4: Commit the exact validated source**

```powershell
git add app/layout.tsx public/og.png .openai/hosting.json
git commit -m "chore: prepare site release"
```

- [ ] **Step 5: Create the Sites project once and push its exact source state**

Persist the returned opaque `project_id` in `.openai/hosting.json`. Push the current branch head using the returned temporary credential without changing Git remotes or exposing the credential.

- [ ] **Step 6: Package, save, and privately deploy**

Use the bundled Sites packager, save one version with the pushed commit SHA, deploy it privately, poll until terminal status, and open the returned URL in Codex.
