# Remove Codex Backup Resource Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the redundant Codex GitHub backup card from the README-backed public resources page and publish the already approved homepage refinements with it.

**Architecture:** Keep `README.md` as the single public catalog source. Delete only the redundant catalog entry so the existing parser and resource page stop rendering it without component changes.

**Tech Stack:** Markdown catalog, vinext/React static export, Node test runner, GitHub Pages.

## Global Constraints

- Preserve the local Codex guide and every other resource.
- Add no dependency or new rendering abstraction.
- Publish only after build, tests, lint, and diff checks pass.

---

### Task 1: Remove and publish the redundant resource

**Files:**
- Modify: `README.md:49-52`
- Test: `tests/site.test.mjs`
- Include already approved changes: `app/page.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: the marked README public catalog parsed by `lib/content.ts`
- Produces: `/resources` without the redundant Codex backup card

- [ ] **Step 1: Write the failing rendered-page assertion**

```js
assert.doesNotMatch(html, /Codex 指南 GitHub 备用地址|GitHub 原始内容入口/);
```

- [ ] **Step 2: Run the test and verify it fails on the existing card**

Run: `npm test`

Expected: FAIL because `/resources` still contains `Codex 指南 GitHub 备用地址`.

- [ ] **Step 3: Delete only the redundant README catalog entry**

Delete:

```markdown
- [Codex 指南 GitHub 备用地址](https://github.com/psiQAQ/psiQAQ.github.io/blob/main/notes/agents/codex/codex.md) — GitHub 原始内容入口。
```

- [ ] **Step 4: Verify the exact source and generated site**

Run: `npm test`, `npm run lint`, and `git diff --check`.

Expected: all 19 tests pass, lint exits successfully, and the diff check reports no errors.

- [ ] **Step 5: Commit, push, and verify Pages**

Commit the plan, README deletion, approved homepage changes, and regression test; push `main`; wait for the exact-head Pages workflow; verify `/` and `/resources` over HTTP.
