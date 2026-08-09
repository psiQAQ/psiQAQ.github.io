# Article Code Copy Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a top-right copy button to every Markdown article code block, with “点我复制~” → “已复制！” → 3-second reset behavior.

**Architecture:** Extend the shared Marked renderer so both guide articles and Markdown resource articles receive identical code-block markup. Mount one client controller in the root layout for delegated click handling, while a small pure helper owns clipboard feedback and timer behavior.

**Tech Stack:** TypeScript, React 19, Vinext, Marked 18, native Clipboard API, CSS, Node test runner.

## Global Constraints

- Cover both `/guides/*` and Markdown articles under `/resources/*`.
- Keep the existing source-resource “复制源码” button unchanged.
- Initial and restored label must be `点我复制~`; success label must be `已复制！` for exactly 3000ms.
- Copy only `<code>.textContent`; do not add dependencies.
- Preserve Marked escaping, trailing newline behavior, and language classes.

---

### Task 1: Render accessible copy controls for Markdown code blocks

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `lib/markdown.ts`

**Interfaces:**
- Consumes: Marked `Renderer.code(token)` output.
- Produces: `.article-code-block` containing `.article-code-copy`, a live status span, and the unchanged `<pre><code>` markup.

- [ ] **Step 1: Write the failing rendering test**

Extend the Markdown structure test with literal assertions for the rendered behavior:

```js
assert.match(context7, /class="article-code-block"/);
assert.match(context7, /class="article-code-copy"[^>]*aria-label="复制代码"/);
assert.match(context7, />点我复制~<\/span>/);
assert.match(context7, /<code class="language-[^"]+">/);
assert.match(markdownResource, /class="article-code-copy"/);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npm run build
node --test --test-name-pattern="renders Markdown structure" tests/site.test.mjs
```

Expected: FAIL because `.article-code-block` and `.article-code-copy` are absent.

- [ ] **Step 3: Wrap the default Marked code output**

Import `Renderer`, create one default renderer, and add this renderer method inside `marked.use`:

```ts
code(token) {
  return `<div class="article-code-block"><button aria-label="复制代码" class="article-code-copy" type="button"><span aria-live="polite">点我复制~</span></button>${defaultRenderer.code(token)}</div>`;
},
```

- [ ] **Step 4: Rebuild and verify GREEN**

Run the two commands from Step 2. Expected: PASS, with escaped code and language classes still present.

### Task 2: Implement clipboard feedback and code-block styling

**Files:**
- Create: `lib/code-copy.ts`
- Create: `components/code-copy-controller.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Produces: `copyCode(text, previousTimer, environment): Promise<number | undefined>`.
- Consumes: `.article-code-copy`, its live `<span>`, and sibling `pre code` from Task 1.

- [ ] **Step 1: Write failing behavior tests**

Import `copyCode` dynamically and test a literal code string with a fake clipboard and timer environment. Assert that it writes only the code string, clears a previous timer, reports `已复制！`, schedules 3000ms, and that the scheduled callback restores `点我复制~`. Add a second test where clipboard rejection reports `复制失败` without scheduling a reset.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```powershell
node --test --test-name-pattern="copies article code|reports clipboard failure" tests/site.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `lib/code-copy.ts`.

- [ ] **Step 3: Implement the minimal helper**

`copyCode` must clear `previousTimer`, call `clipboard.writeText(text)`, set the success label, and return the timer ID from a 3000ms reset. On rejection it sets `复制失败` and returns `undefined`.

- [ ] **Step 4: Add the delegated client controller**

Create a client component that registers one document click listener, locates the closest `.article-code-copy`, reads only its container's `pre code.textContent`, calls `copyCode`, and tracks timer IDs in a `Map<HTMLButtonElement, number>`. Remove the listener and clear timers on unmount. Mount the component once in `app/layout.tsx`.

- [ ] **Step 5: Add the visual treatment**

Style `.article-code-block` as a positioned container. Move existing code-block margin to the container, keep `<pre>` horizontally scrollable, and position `.article-code-copy` at the internal top-right with a light background, dark text, visible focus state, and touch-friendly padding. Add top padding to the code block so the button never covers code.

- [ ] **Step 6: Run focused and full verification**

Run:

```powershell
node --test --test-name-pattern="copies article code|reports clipboard failure" tests/site.test.mjs
npm test
npm run lint
git diff --check
```

Expected: all commands exit 0; 3000ms and both labels are covered by behavior tests.

### Task 3: Commit, publish, and verify GitHub Pages

**Files:**
- Modify: `docs/superpowers/specs/2026-08-09-article-code-copy-design.md`
- Create: `docs/superpowers/plans/2026-08-09-article-code-copy.md`
- Commit all implementation and test files from Tasks 1-2.

**Interfaces:**
- Consumes: verified working tree from Tasks 1-2.
- Produces: deployed `main` commit and successful Pages workflow.

- [ ] **Step 1: Review and commit the exact scope**

Check `git status`, staged filenames, `git diff --cached --check`, then commit only the design adjustment, plan, implementation, CSS, layout, and tests.

- [ ] **Step 2: Push and monitor deployment**

Run:

```powershell
git push origin main
$runId = gh run list --repo psiQAQ/psiQAQ.github.io --commit (git rev-parse HEAD) --limit 1 --json databaseId --jq '.[0].databaseId'
gh run watch $runId --repo psiQAQ/psiQAQ.github.io --exit-status
```

- [ ] **Step 3: Verify the live custom domain**

Confirm the guide HTML, Markdown resource HTML, and hashed client controller asset return HTTP 200 and contain the new copy-button markup/behavior. Confirm `HEAD` equals `origin/main` and the working tree is clean.
