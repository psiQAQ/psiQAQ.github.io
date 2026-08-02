# README Icon Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make README icons the sole document/resource classifier and keep all published local resource links on the current site origin.

**Architecture:** Extend the existing README parser in `lib/content.ts` with a small icon registry and carry its metadata into document/resource records. Reuse the current static guide and resource routes; update the Markdown renderer to resolve catalog-published local resources before rendering links.

**Tech Stack:** TypeScript, Vinext/Next.js static export, React, marked, Node.js test runner, CSS.

## Global Constraints

- Base all work on commit `5e7fdcf963d1841c4668da4844acb2b14f621a30`.
- Only `📄` produces knowledge-base documents; every other supported icon produces resources.
- README catalog entries contain only icon, link text, and target; no `— description` suffix.
- Display titles come from README link text.
- Use root-relative site links instead of hard-coding a domain.
- Add no dependency and preserve the current GitHub Pages architecture.

---

### Task 1: Lock the catalog contract with failing tests

**Files:**
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Consumes: rendered `/library`, `/resources`, guide and resource detail routes.
- Produces: behavioral expectations for icon classification, README labels, colored resource badges and root-relative resource links.

- [ ] **Step 1: Replace the Markdown-suffix catalog expectation**

Read the marked README block and select only entries beginning with `📄`. Assert that every selected target is a local `.md` file and that non-document Markdown templates are not included.

- [ ] **Step 2: Add resource classification and label assertions**

Assert that `/resources` contains `CLAUDE.md 全局指令示范` and `AGENTS.md 全局指令示范`, renders `🧾 源码与模板`, `📺 视频`, and corresponding `resource-type-*` classes, while `/library` excludes both templates.

- [ ] **Step 3: Add root-relative link assertions**

Assert that the Claude Code guide contains:

```html
href="/resources/agents/claude-code/cc.bat"
href="/resources/agents/claude-code/CLAUDE.md"
```

and does not contain the previous GitHub blob URL.

- [ ] **Step 4: Run the tests and verify RED**

Run: `npm test`

Expected: failures show that `.md` templates are still documents, cards lack icon metadata, and guide resource links still use GitHub blob URLs.

### Task 2: Implement icon-driven parsing and README migration

**Files:**
- Modify: `README.md`
- Modify: `lib/content.ts`

**Interfaces:**
- Produces: `DocumentRecord.title` from the README label; resource records with `icon`, `type`, `typeLabel`, and local source `filename`; path lookup for catalog-published resources.

- [ ] **Step 1: Add the minimal icon registry**

Define the nine approved icons and their stable type keys/type labels in `lib/content.ts`. Parse exactly one registered icon before every catalog link and reject malformed catalog link lines.

- [ ] **Step 2: Classify only by icon**

Create documents only for `📄`. Create resources for every other icon. Reuse `markdownByPath` as source text when a non-document local resource ends in `.md`.

- [ ] **Step 3: Preserve display and file identities separately**

Set every document/resource display title to the README link label. For local resources, retain the basename as `filename` and the catalog-relative path as `sourcePath`.

- [ ] **Step 4: Migrate README**

Restore the approved icons from the pre-`e696a364` catalog, change `CLAUDE.md` and `AGENTS.md` to `🧾`, give all three launcher scripts `🚀`, and remove all `— description` suffixes. Update the maintenance instructions to describe the icon contract.

- [ ] **Step 5: Run the tests and inspect remaining failures**

Run: `npm test`

Expected: classification/title expectations pass; link and styling expectations remain red until Task 3.

### Task 3: Route resource links and render icon badges

**Files:**
- Modify: `lib/markdown.ts`
- Modify: `app/resources/page.tsx`
- Modify: `app/resources/[...slug]/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: resource lookup metadata from `lib/content.ts`.
- Produces: root-relative resource links, icon/type badges, and filename-aware source details.

- [ ] **Step 1: Resolve catalog resources in Markdown links**

After document lookup, resolve the same local path against catalog resources. Return `/resources/<slug>` for source text and the generated asset URL for downloads; throw a clear error for unpublished relative local links.

- [ ] **Step 2: Render icon badges**

Render `<span className="resource-type resource-type-<type>">` with the icon and type label, and keep the README label in the card heading.

- [ ] **Step 3: Keep source filename behavior**

Use `resource.filename` for language labels and copy-button filenames while using `resource.title` for visible headings.

- [ ] **Step 4: Add scoped badge colors**

Add one compact CSS rule per supported resource type. Change only the badge foreground/background; preserve existing cards and responsive layout.

- [ ] **Step 5: Run the targeted full test command and verify GREEN**

Run: `npm test`

Expected: all tests pass, including the new icon and resource-link behaviors.

### Task 4: Final verification and local commits

**Files:**
- Verify all modified files.

**Interfaces:**
- Produces: verified commits based on `5e7fdcf`; no remote push.

- [ ] **Step 1: Run lint**

Run: `npm run lint`

Expected: exit code 0 with no lint errors.

- [ ] **Step 2: Verify UTF-8 and diff hygiene**

Run: `git diff --check` and inspect `git diff --stat` plus the complete staged diff.

Expected: no whitespace errors, no unrelated changes, and Chinese Markdown remains readable UTF-8.

- [ ] **Step 3: Commit implementation**

Stage only the files listed by this plan and commit with:

```text
feat: classify site content by README icons
```

- [ ] **Step 4: Confirm local-only state**

Verify the branch is ahead of `origin/main` and report that publishing still requires an explicit push.
