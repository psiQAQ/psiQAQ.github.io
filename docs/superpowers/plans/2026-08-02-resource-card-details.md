# Resource Cards and Source Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/resources` into a README-ordered card index with separate local source detail pages, add all three Claude Code platform scripts, and simplify the homepage to one complete topic index plus the beginner path.

**Architecture:** Continue deriving documents and resources from the marked README catalog. Give source resources stable slugs equal to their logical file paths, statically export a catch-all detail route, and group the resource index by the existing category/group fields. Replace homepage hard-coded guide selections with the existing `categories` array and delete duplicate sections.

**Tech Stack:** Next.js 16, vinext static export, React 19, TypeScript, Vite raw imports, Node.js test runner, existing CSS.

## Global Constraints

- Do not add dependencies or introduce a second catalog/configuration file.
- Preserve every existing `/guides/...` URL and keep search Markdown-only.
- README `##` category, `###` group, and entry order remain authoritative.
- Only README-listed text sources receive detail routes.
- External resources open in a new tab; download resources download directly.
- Do not push or deploy until the merged local result passes the full verification suite.

---

### Task 1: Publish platform scripts through static source detail pages

**Files:**
- Modify: `README.md`
- Modify: `lib/content.ts`
- Create: `app/resources/[...slug]/page.tsx`
- Modify: `tests/site.test.mjs`

**Interfaces:**
- `ResourceRecord` source variant gains `slug: string`, equal to `sourcePath`.
- Export `sourceResources: Extract<ResourceRecord, { kind: "source" }>[]`.
- Export `findSourceResource(slug: string): Extract<ResourceRecord, { kind: "source" }> | undefined`.
- `/resources/[...slug]` consumes these exports through `generateStaticParams()` and `findSourceResource()`.

- [ ] **Step 1: Write failing detail-page tests**

Update the resource integration test to require README-backed cards for:

```text
/resources/agents/claude-code/cc.bat
/resources/agents/claude-code/ccmac.sh
/resources/agents/claude-code/cclinux.sh
```

Assert the `/resources` HTML does not contain `@echo off`, while each detail response returns `200`, uses its filename as `<h1>`, contains a known literal from that file, and exposes the matching copy-button `aria-label`. Assert `/resources/agents/claude-code/not-listed.sh` returns `404`.

- [ ] **Step 2: Run the focused test and verify RED**

```powershell
node --test --test-name-pattern="source detail pages" tests/site.test.mjs
```

Expected: FAIL because macOS/Linux are absent from README and the catch-all resource route does not exist.

- [ ] **Step 3: Add both missing scripts to README**

Under `智能体 → Claude Code`, immediately after `cc.bat`, add:

```markdown
- [Claude Code macOS 快捷启动脚本](notes/agents/claude-code/ccmac.sh) — macOS 启动脚本源码。
- [Claude Code Linux/WSL 快捷启动脚本](notes/agents/claude-code/cclinux.sh) — Linux/WSL 启动脚本源码。
```

- [ ] **Step 4: Add source slugs and lookup**

Extend only the `source` branch in `ResourceRecord`:

```ts
| { kind: "source"; sourcePath: string; slug: string; source: string }
```

When classifying a source, set `slug: sourcePath`. After `resources` is built, add:

```ts
export const sourceResources = resources.filter(
  (resource): resource is Extract<ResourceRecord, { kind: "source" }> =>
    resource.kind === "source",
);

const sourceResourcesBySlug = new Map(
  sourceResources.map((resource) => [resource.slug, resource]),
);

export function findSourceResource(slug: string) {
  return sourceResourcesBySlug.get(decodePath(slug).replace(/^\/+|\/+$/g, ""));
}
```

- [ ] **Step 5: Create the static detail route**

Create `app/resources/[...slug]/page.tsx` following the existing guide route’s parameter shape:

```tsx
type SourcePageProps = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return sourceResources.map((resource) => ({ slug: resource.slug.split("/") }));
}
```

Resolve the resource with `findSourceResource()`, call `notFound()` when absent, and render breadcrumb, category/group, filename H1, description, uppercase extension, `CopySourceButton`, and `<pre><code>{resource.source}</code></pre>`.

- [ ] **Step 6: Build and verify GREEN**

```powershell
npm run build
node --test --test-name-pattern="source detail pages|main knowledge routes" tests/site.test.mjs
```

Expected: all three detail pages render and the unknown source returns 404.

- [ ] **Step 7: Commit the detail-page stage**

```powershell
git add -- README.md lib/content.ts app/resources/[...slug]/page.tsx tests/site.test.mjs
git commit -m "feat: add source resource detail pages"
```

---

### Task 2: Make resources a README-ordered categorized card index

**Files:**
- Modify: `app/resources/page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/site.test.mjs`

**Interfaces:**
- `/resources` consumes the existing `resources` array only.
- Source cards link to `/resources/${resource.slug}`.
- Category and group arrays preserve first appearance with `new Set(...)`.

- [ ] **Step 1: Write the failing index hierarchy test**

Assert `/resources` contains category heading `智能体`, group heading `Claude Code`, and the three script cards in README order. Assert source cards are anchors to their detail routes, not `<article class="source-resource">`, and no full source literal appears on the index.

- [ ] **Step 2: Run the focused test and verify RED**

```powershell
node --test --test-name-pattern="categorized resource card index" tests/site.test.mjs
```

Expected: FAIL because groups are currently labels inside cards and source code is expanded inline.

- [ ] **Step 3: Render category and group sections**

For each category, derive its groups in first-seen order. Render each group as:

```tsx
<section className="resource-group" key={group}>
  {group !== category && <h3>{group}</h3>}
  <div className="resource-list">...</div>
</section>
```

Render source resources with `<Link className="resource-card" href={`/resources/${resource.slug}`}>`. Keep external anchors and download anchors unchanged. Use card headings at `<h4>` inside grouped sections so the page hierarchy remains valid.

- [ ] **Step 4: Remove index-only source expansion CSS**

Delete `.source-resource` index rules. Add `.resource-group + .resource-group`, `.resource-group > h3`, and shared `.source-detail`/`.source-code` rules used by the detail page. Keep the two-column card grid and its mobile one-column breakpoint.

- [ ] **Step 5: Build and verify GREEN**

```powershell
npm run build
node --test --test-name-pattern="categorized resource card index|source detail pages" tests/site.test.mjs
```

Expected: index hierarchy and detail pages both pass.

- [ ] **Step 6: Commit the index stage**

```powershell
git add -- app/resources/page.tsx app/globals.css tests/site.test.mjs
git commit -m "refactor: present resources as categorized cards"
```

---

### Task 3: Simplify the homepage to the complete topic index

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Homepage consumes `categories` and `documents.length` from `lib/content.ts`.
- Every topic links to `/library#${encodeURIComponent(category)}`.

- [ ] **Step 1: Write the failing homepage test**

Assert the knowledge overview contains `<nav aria-label="全部主题">`, links every `categories` value to its encoded library anchor, and does not contain `精选指南`, `新手最常用的四个入口`, `完整知识库`, or `按需查阅`.

- [ ] **Step 2: Run the focused test and verify RED**

```powershell
node --test --test-name-pattern="complete homepage topic index" tests/site.test.mjs
```

Expected: FAIL because the overview still renders four featured guides and both duplicate sections exist.

- [ ] **Step 3: Replace featured guides with categories**

Delete `featuredSlugs`, the `featured` lookup, and both duplicate `<section>` blocks. Change the overview heading to `浏览全部主题`, set `aria-label="全部主题"`, and map `categories` to library anchors with the category as the visible strong label.

- [ ] **Step 4: Remove dead homepage CSS**

Delete `.guide-card-grid`, `.guide-card`, `.category-row`, and their responsive declarations after confirming no remaining callers with `rg`.

- [ ] **Step 5: Build and verify GREEN**

```powershell
npm run build
node --test --test-name-pattern="complete homepage topic index|beginner home page|complete five-step path" tests/site.test.mjs
```

Expected: homepage keeps its hero and beginner path while showing all topics once.

- [ ] **Step 6: Commit the homepage stage**

```powershell
git add -- app/page.tsx app/globals.css tests/site.test.mjs
git commit -m "refactor: simplify the homepage topic navigation"
```

---

### Task 4: Full verification and local handoff

**Files:**
- Verify only unless a task-scoped regression is found.

- [ ] **Step 1: Run full automated verification**

```powershell
npm test
npm run lint
git diff --check e03485d..HEAD
```

Expected: static export and all tests pass, lint reports no errors, and the committed diff has no whitespace errors.

- [ ] **Step 2: Verify static outputs and repository state**

```powershell
Get-Item dist/client/index.html, dist/client/resources.html
git status --short --branch
git log --oneline -6
```

Expected: both entry points exist and the worktree is clean. Stop before push/deployment unless separately authorized.
