# Notes Catalog and Resources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all public note content under `notes/`, make the marked section of root `README.md` the single public catalog, preserve every existing guide URL, and publish README-linked external links and local non-Markdown files on `/resources`.

**Architecture:** Keep the existing vinext static site and its eager Vite content imports. Replace the broad README link regex and hard-coded category mapping with one small line-oriented catalog parser scoped to explicit markers. Physical paths keep the `notes/` prefix, while guide slugs and repository-relative asset resolution use logical paths without that prefix. Reuse the same catalog records to derive Markdown guides and three resource kinds: external link, copyable text source, and downloadable file.

**Tech Stack:** Next.js 16, vinext, React 19, TypeScript, Vite `import.meta.glob`, Node.js test runner, existing CSS.

## Global Constraints

- Preserve current public guide URLs such as `/guides/others/zotero` and `/guides/agents/codex/codex`.
- Move only the five note trees: `agents`, `models`, `operating-system`, `others`, and `programme-env`; keep `docs`, `AGENTS.md`, application code, and project files at the repository root.
- Delete `20260614.md` and update repository-relative links after the move.
- Parse only content between `<!-- site-catalog:start -->` and `<!-- site-catalog:end -->`; content outside the markers remains GitHub-only prose.
- Treat Markdown image syntax as guide imagery, not a resource entry.
- Do not add dependencies, redesign unrelated pages, modify the remote, push, or deploy during local implementation.
- Fail the build for a missing local catalog target, missing guide H1, or duplicate guide slug.

---

### Task 1: Move notes and make README the catalog contract

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `README.md`
- Modify: `lib/content.ts`
- Modify: note-internal links affected by repository source URLs
- Move: `agents/` to `notes/agents/`
- Move: `models/` to `notes/models/`
- Move: `operating-system/` to `notes/operating-system/`
- Move: `others/` to `notes/others/`
- Move: `programme-env/` to `notes/programme-env/`
- Delete: `20260614.md`

**Interfaces:**
- `README.md` catalog entries use `- [title](target) — optional description` under `##` category and optional `###` group headings.
- `DocumentRecord.sourcePath` remains a logical path such as `others/zotero.md`; physical imports live at `notes/others/zotero.md`.
- `DocumentRecord.category` comes from the README `##` heading, preserving catalog order.

- [ ] **Step 1: Extend the site contract tests and verify RED**

Update the README publication test to require the two marker comments, collect only local `.md` targets within the marked block, require every target to start with `notes/`, strip that prefix when building `/guides/...`, and assert more than 20 guides still render.

Add a filesystem contract that verifies the five `notes/*` directories exist, the five old root directories and `20260614.md` do not exist, and root `README.md` plus `AGENTS.md` remain.

Add assertions that `/guides/others/zotero` and the Unicode route `/guides/agents/claude-code/tutorial/常用命令` still return `200` after the physical move.

Run:

```powershell
node --test --test-name-pattern="notes directory|README catalog" tests/site.test.mjs
```

Expected: FAIL because the notes still live at the repository root and README has no catalog markers.

- [ ] **Step 2: Move the five content trees and delete the obsolete note**

Use `git mv` for each directory so history remains traceable, then delete `20260614.md`. Because every tree moves together under one shared prefix, existing relative links and image references inside those trees remain valid unless they point to a root project file.

- [ ] **Step 3: Rewrite README as the dual-purpose landing page and public catalog**

Keep the concise repository introduction and maintenance guidance outside the catalog. Between the marker comments, preserve all current useful local and external links while changing local targets to `notes/...`. Use `##` headings as website categories and `###` headings as optional groups. Keep image links out of ordinary catalog list items.

Add a maintenance note outside the markers that states:

1. Add note files below `notes/`.
2. Add one matching entry inside the marked catalog.
3. Commit and push; GitHub Pages rebuilds automatically.
4. Root prose outside the markers does not publish site content.

Update the stale absolute repository URL to `https://github.com/psiQAQ/psiQAQ.github.io` and point its file path through `notes/`.

- [ ] **Step 4: Replace content globs and preserve logical guide paths**

In `lib/content.ts`:

- replace the five Markdown globs with `../notes/**/*.md`;
- replace the five image globs with `../notes/**/*.{png,jpg,jpeg,gif,webp,svg}`;
- normalize module paths by removing `../notes/`;
- parse only the marked README block;
- track the current `##` category and `###` group while reading list entries;
- ignore lines that do not match an ordinary Markdown link, including `![image](...)`;
- remove the hard-coded `categoryFor()` function;
- derive `documents` from local `.md` catalog entries, using the README category and logical path without `notes/`.

The parser stays line-oriented because README now has a deliberately fixed, human-editable format; no new Markdown parser abstraction or dependency is needed.

- [ ] **Step 5: Build and verify guide migration GREEN**

Run:

```powershell
npm run build
node --test --test-name-pattern="notes directory|README catalog|every Markdown guide|repository images|main knowledge routes" tests/site.test.mjs
```

Expected: build succeeds, all README-listed Markdown renders at the unchanged guide URL, images still resolve, and old root paths are absent.

- [ ] **Step 6: Commit the catalog and migration stage**

```powershell
git add -- README.md lib/content.ts tests/site.test.mjs notes agents models operating-system others programme-env 20260614.md
git commit -m "refactor: organize published notes under one catalog"
```

---

### Task 2: Derive and render README resources

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `lib/content.ts`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `app/resources/page.tsx`
- Create: `components/copy-source-button.tsx`

**Interfaces:**

Add one exported discriminated union in `lib/content.ts`:

```ts
export type ResourceRecord = {
  category: string;
  group: string;
  title: string;
  description: string;
} & (
  | { kind: "external"; href: string }
  | { kind: "source"; sourcePath: string; source: string }
  | { kind: "download"; sourcePath: string; href: string }
);
```

Export `resources` in README order. Local resource titles use `basename(sourcePath)` so displayed source/download titles are filenames, as requested.

- [ ] **Step 1: Add failing resource-page integration tests**

Extend the route test to include `/resources`. Add one focused test that verifies:

- the page has a `资源` heading;
- an existing external catalog link is present with `target="_blank"` and `rel="noreferrer"`;
- `cc.bat` and `codex-reset-remaining.py` are shown by filename;
- their escaped source content is present in `<pre><code>`;
- each source block has an accessible copy button;
- guide images are not listed as resource cards;
- `/search` still contains Markdown guides but not resource source text.

Run:

```powershell
node --test --test-name-pattern="resources" tests/site.test.mjs
```

Expected: FAIL because `/resources` does not exist.

- [ ] **Step 2: Add the minimal resource imports and classification**

In `lib/content.ts`, reuse the parsed catalog entries and add:

```ts
const sourceModules = import.meta.glob(
  "../notes/**/*.{bat,sh,py,ps1,js,mjs,cjs,ts,tsx,json,toml,yaml,yml,xml,ini,cfg,conf,txt,css,html}",
  { eager: true, import: "default", query: "?raw" },
) as Record<string, string>;

const fileModules = import.meta.glob("../notes/**/*", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;
```

Classification rules, in order:

1. `http://` or `https://` becomes `external`.
2. Local `.md` is already a guide and is excluded from `resources`.
3. Local files found in `sourceModules` become `source` with raw text.
4. Any other local file found in `fileModules` becomes `download`.
5. A local target missing from both maps throws `README publishes missing local file: ...` during build.

Normalize local targets by removing leading `./`, requiring the physical `notes/` prefix, then deriving the logical `sourcePath` without it. Do not issue network checks for external URLs.

- [ ] **Step 3: Build the server-rendered resources page**

Create `app/resources/page.tsx` as a server component that groups `resources` by README category, then:

- renders external links as compact cards with description and `target="_blank"`;
- renders source items with filename heading, optional description, escaped `<pre><code>{source}</code></pre>`, and the client copy button;
- renders download items as filename cards with the `download` attribute;
- displays an empty state if the catalog currently contains no item of a resource kind.

Create `components/copy-source-button.tsx` with `"use client"`, `navigator.clipboard.writeText(source)`, and status text switching from `复制源码` to `已复制`; reset the status after a short timeout and expose failures as `复制失败`. This is the only client-side code required.

- [ ] **Step 4: Add navigation and focused styling**

Add `资源` to the global navigation in `app/layout.tsx`. Extend `app/globals.css` only with resource list/card/source/copy-button rules, reusing existing variables, borders, typography, and mobile breakpoints.

- [ ] **Step 5: Build and verify resources GREEN**

Run:

```powershell
npm run build
node --test --test-name-pattern="resources|main knowledge routes|local search" tests/site.test.mjs
```

Expected: `/resources` exports successfully, external/source resources render, copy controls are present, and search remains Markdown-only.

- [ ] **Step 6: Commit the resources stage**

```powershell
git add -- lib/content.ts app/resources/page.tsx components/copy-source-button.tsx app/layout.tsx app/globals.css tests/site.test.mjs
git commit -m "feat: publish README resources on the site"
```

---

### Task 3: Full validation and deployment handoff

**Files:**
- Verify only unless validation finds a task-scoped defect.

**Interfaces:**
- Consumes the committed README catalog, note tree, content loader, resource page, and existing Pages workflow.
- Produces a clean, locally verified branch ready for user-approved push.

- [ ] **Step 1: Check repository references after the move**

Search tracked text for stale root content paths and the old repository name:

```powershell
rg -n "psiQAQ/agent-lab-notes|\]\((?:agents|models|operating-system|others|programme-env)/" --glob "*.md"
```

Expected: no stale catalog/source links. Fix only references made incorrect by this migration.

- [ ] **Step 2: Run all automated verification**

```powershell
npm test
npm run lint
git diff --check 2f37e12..HEAD
```

Expected: build and all site tests pass, ESLint reports no errors, and no whitespace errors exist.

- [ ] **Step 3: Verify exported files and Git state**

```powershell
Get-Item dist/client/library.html, dist/client/resources.html, dist/client/guides/others/zotero.html
git status --short --branch
git log --oneline -5
```

Expected: the exported library, resources page, and an unchanged guide URL exist; the worktree is clean and commits are scoped to the approved work.

- [ ] **Step 4: Stop at the external-write boundary**

Report the local commit(s), tests, lint, static export evidence, and maintenance workflow. Do not push or wait for deployment until the user explicitly approves the external write.
