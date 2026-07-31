# Fumadocs Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing agent-lab-notes site to a Fumadocs-inspired documentation interface without replacing Sites/vinext or the Markdown content pipeline.

**Architecture:** Keep the existing routes, server-rendered pages, `lib/content` index, and `marked` renderer. Add documentation-first navigation semantics in the existing React pages, then replace the visual layer in `app/globals.css`; the only client behavior remains local search.

**Tech Stack:** TypeScript, React 19, Next.js-compatible App Router, vinext, Vite, CSS, Node.js test runner, Sites.

## Global Constraints

- Do not install `fumadocs-*` or copy Fumadocs component source.
- Preserve the existing Sites/vinext architecture, Markdown source, public document scope, routes, search data, and teal brand color.
- Do not add dark mode, authentication, comments, CMS, AI search, analytics, multilingual support, or progress tracking.
- Do not push GitHub.
- Use existing components and native HTML before adding files or dependencies.

---

### Task 1: Documentation-first shell and navigation

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `app/layout.tsx`
- Modify: `app/guides/[...slug]/page.tsx`

**Interfaces:**
- Consumes: `categories` and `documents` from `@/lib/content`; existing `TableOfContents` heading data.
- Produces: global `/search#site-search` entry, `aria-label="文档导航"` grouped sidebar, and native mobile document/TOC disclosure.

- [ ] **Step 1: Write the failing shell test**

Add this test to `tests/site.test.mjs`:

```js
test("uses a documentation-first global shell", async () => {
  const home = await (await render("/")).text();
  const guide = await (await render("/guides/others/zotero")).text();

  assert.match(home, /href="\/search#site-search"/);
  assert.match(home, /aria-label="搜索文档"/);
  assert.match(guide, /aria-label="文档导航"/);
  assert.match(guide, /Codex/);
  assert.match(guide, /科研与通用工具/);
  assert.match(guide, /浏览文档与本页目录/);
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `npm run build`

Run: `node --test --test-name-pattern="documentation-first" tests/site.test.mjs`

Expected: FAIL because the global search entry and grouped document navigation do not exist.

- [ ] **Step 3: Implement the minimal shell changes**

In `app/layout.tsx`, replace the plain search navigation link with:

```tsx
<Link className="global-search" href="/search#site-search" aria-label="搜索文档">
  <span>搜索文档</span>
  <kbd>/</kbd>
</Link>
```

In `app/guides/[...slug]/page.tsx`, import `categories`, render every category as a labelled group inside an `aria-label="文档导航"` sidebar, and mark only the current document with `aria-current="page"`. Replace the mobile TOC-only disclosure with one `<details>` whose summary is `浏览文档与本页目录` and whose body contains links to the current category plus `TableOfContents`.

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run: `npm run build`

Run: `node --test --test-name-pattern="documentation-first" tests/site.test.mjs`

Expected: PASS.

- [ ] **Step 5: Run all existing behavior tests**

Run: `npm test`

Expected: all tests pass, including all published Markdown routes and internal-file exclusions.

- [ ] **Step 6: Commit**

```bash
git add tests/site.test.mjs app/layout.tsx 'app/guides/[...slug]/page.tsx'
git commit -m "feat: add documentation-first navigation"
```

### Task 2: Fumadocs-inspired home and search entry

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `app/page.tsx`
- Modify: `components/search-client.tsx`

**Interfaces:**
- Consumes: existing `documents`, `categories`, and featured document slugs.
- Produces: home-page `知识库索引` overview with real document counts and an automatically focused `#site-search` input.

- [ ] **Step 1: Write the failing product test**

Add this test to `tests/site.test.mjs`:

```js
test("presents the knowledge base as a focused documentation product", async () => {
  const home = await (await render("/")).text();
  const search = await (await render("/search#site-search")).text();

  assert.match(home, /知识库索引/);
  assert.match(home, /篇公开指南/);
  assert.match(home, /个主题/);
  assert.match(search, /<input(?=[^>]*id="site-search")(?=[^>]*autofocus)[^>]*>/);
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `npm run build`

Run: `node --test --test-name-pattern="focused documentation product" tests/site.test.mjs`

Expected: FAIL because the knowledge-base overview and autofocus attribute are absent.

- [ ] **Step 3: Implement the home overview and search focus**

In `app/page.tsx`, replace the decorative five-row `path-preview` with a `knowledge-overview` panel containing `知识库索引`, `documents.length` published guides, `categories.length` topics, and links to the four existing featured guides. Keep both primary hero actions and all lower sections.

In `components/search-client.tsx`, add `autoFocus` to the existing `#site-search` input. Do not add shortcut listeners or new client state.

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run: `npm run build`

Run: `node --test --test-name-pattern="focused documentation product" tests/site.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/site.test.mjs app/page.tsx components/search-client.tsx
git commit -m "feat: focus the knowledge site experience"
```

### Task 3: Apply the visual system

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: class names emitted by Tasks 1 and 2.
- Produces: responsive Fumadocs-inspired shell using `.global-search`, `.docs-navigation`, `.mobile-docs-nav`, and `.knowledge-overview` with no runtime dependency.

- [ ] **Step 1: Write the failing stylesheet contract test**

Add this test to `tests/site.test.mjs`:

```js
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
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test --test-name-pattern="documentation visual system" tests/site.test.mjs`

Expected: FAIL because the new selectors and surface token are absent.

- [ ] **Step 3: Replace the visual layer**

Update `app/globals.css` to:

- define neutral canvas, raised surface, border, text, muted, teal accent, radius, and shadow tokens;
- style a compact sticky header and pill-shaped `.global-search` entry;
- style `.knowledge-overview` as a restrained documentation index rather than a decorative card;
- style grouped `.docs-navigation` with category labels and an obvious current-page state;
- preserve readable code, table, image, blockquote, focus, and reduced-motion behavior;
- show the desktop three-column guide layout at widths above `1050px` and `.mobile-docs-nav` below it;
- keep all pages usable at `760px` and below without horizontal page overflow.

Do not add images, fonts, icon packages, JavaScript animation, or theme state.

- [ ] **Step 4: Run the stylesheet contract test and confirm GREEN**

Run: `node --test --test-name-pattern="documentation visual system" tests/site.test.mjs`

Expected: PASS.

- [ ] **Step 5: Run full validation**

Run: `npm test`

Expected: production build succeeds and every test passes.

Run: `npm run lint`

Expected: zero lint errors.

Run: `git diff --check HEAD~2`

Expected: no whitespace errors.

- [ ] **Step 6: Commit**

```bash
git add tests/site.test.mjs app/globals.css
git commit -m "style: apply Fumadocs-inspired visual system"
```

### Task 4: Package, deploy, and verify the private site

**Files:**
- Preserve: `.openai/hosting.json`
- Generate outside the repository: deployment archive produced by the Sites packaging helper.

**Interfaces:**
- Consumes: successful `npm test` and `npm run lint` results; existing Sites `project_id`.
- Produces: a new private Sites version and successful deployment status for the existing project URL.

- [ ] **Step 1: Re-run final evidence commands**

Run: `npm test`

Expected: exit code 0 and all tests pass.

Run: `npm run lint`

Expected: exit code 0.

Run: `git status --short`

Expected: no uncommitted source changes.

- [ ] **Step 2: Package the validated output**

Use the Sites plugin `scripts/package-site.sh` helper with the worktree as project directory and a temporary archive outside the repository. Confirm the archive contains `dist/server/index.js` and `dist/.openai/hosting.json`.

- [ ] **Step 3: Save and privately deploy one version**

Reuse the project ID from `.openai/hosting.json`, obtain a fresh source write credential only if needed, save one version using the current branch-head SHA, and deploy it with private access.

- [ ] **Step 4: Verify actual deployment state**

Poll deployment status until `succeeded`. Fetch the deployed home page and `/guides/others/zotero`; require HTTP 200 and the expected `知识库索引` and `Zotero 指南` content before reporting completion.

- [ ] **Step 5: Finish the goal**

Mark the active goal complete only after the source, build, tests, lint, private deployment status, and two live routes all provide current evidence.
