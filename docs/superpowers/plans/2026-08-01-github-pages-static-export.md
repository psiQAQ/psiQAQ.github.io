# GitHub Pages Static Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export the existing knowledge site as static files and prepare an official GitHub Pages deployment workflow for `https://psiqaq.github.io/`.

**Architecture:** Keep the current Next 16/vinext application and Markdown content pipeline. Enable vinext's native static export, replace request-derived metadata with a fixed user-site origin, and upload only `dist/client` to GitHub Pages while retaining the current Sites/Cloudflare build configuration.

**Tech Stack:** Next.js 16, vinext 0.0.50, React 19, Node.js 22, Node test runner, GitHub Actions, GitHub Pages.

## Global Constraints

- Preserve `.openai/hosting.json`, `build/sites-vite-plugin.ts`, the Cloudflare Vite plugin, existing routes, Markdown allowlist, and Fumadocs-style UI.
- Do not add dependencies or commit generated files under `dist/`.
- Target the user site `https://psiqaq.github.io/`; do not add `basePath` or `assetPrefix`.
- Do not rename the GitHub repository, modify Pages settings, push, or publish without separate approval after local verification.

---

### Task 1: Static export and fixed site metadata

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `next.config.ts`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: existing `npm run build`, `generateStaticParams()`, Markdown content modules, and `public/og.png`.
- Produces: static route files under `dist/client`, fixed metadata for `https://psiqaq.github.io/`, and source links targeting `psiQAQ/psiQAQ.github.io`.

- [ ] **Step 1: Write the failing static-export test**

Add `access` to the `node:fs/promises` import and add this test:

```js
test("exports the site for the psiQAQ GitHub Pages root", async () => {
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(config, /output:\s*["']export["']/);
  assert.match(config, /trailingSlash:\s*false/);
  assert.doesNotMatch(layout, /next\/headers|\bheaders\s*\(/);
  assert.match(layout, /metadataBase:\s*new URL\(["']https:\/\/psiqaq\.github\.io\/["']\)/);
  assert.match(layout, /https:\/\/github\.com\/psiQAQ\/psiQAQ\.github\.io/);

  for (const path of [
    "../dist/client/index.html",
    "../dist/client/404.html",
    "../dist/client/guides/others/zotero.html",
  ]) {
    await access(new URL(path, import.meta.url));
  }

  const home = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  assert.match(home, /https:\/\/psiqaq\.github\.io\/og\.png/);
  assert.doesNotMatch(home, /chatgpt\.site/);
});
```

Also update the existing home-page assertion from `http://localhost/og.png` to `https://psiqaq.github.io/og.png`, because the metadata origin becomes build-time static.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test --test-name-pattern="GitHub Pages root" tests/site.test.mjs
```

Expected: FAIL because `next.config.ts` does not enable export and `layout.tsx` still imports `next/headers`.

- [ ] **Step 3: Enable static export**

Replace the configuration body in `next.config.ts` with:

```ts
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
};
```

- [ ] **Step 4: Replace request-derived metadata with static metadata**

In `app/layout.tsx`, remove the `next/headers` import and `generateMetadata()`. Export this constant instead:

```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://psiqaq.github.io/"),
  title: { default: title, template: `%s | ${title}` },
  description,
  openGraph: {
    type: "website",
    title,
    description,
    images: [{ url: "/og.png", width: 1728, height: 907, alt: description }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};
```

Update both repository links to `https://github.com/psiQAQ/psiQAQ.github.io`.

- [ ] **Step 5: Build and verify GREEN**

Run:

```powershell
npm test
```

Expected: the vinext static export completes, the focused contract passes, and all existing route/content tests pass.

- [ ] **Step 6: Commit the static-export task**

```powershell
git add -- tests/site.test.mjs next.config.ts app/layout.tsx
git commit -m "feat: export the site for GitHub Pages"
```

---

### Task 2: GitHub Pages workflow

**Files:**
- Modify: `tests/site.test.mjs`
- Create: `.github/workflows/pages.yml`

**Interfaces:**
- Consumes: `package-lock.json`, `npm run build`, and Task 1's `dist/client` static export.
- Produces: one GitHub Actions workflow that uploads `dist/client` and deploys the `github-pages` artifact from `main`.

- [ ] **Step 1: Write the failing workflow contract**

Add this test:

```js
test("defines the GitHub Pages build and deployment workflow", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/pages.yml", import.meta.url),
    "utf8",
  );

  assert.match(workflow, /branches:\s*\[main\]/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /actions\/checkout@v6/);
  assert.match(workflow, /actions\/setup-node@v6/);
  assert.match(workflow, /node-version:\s*["']22["']/);
  assert.match(workflow, /run:\s*npm ci/);
  assert.match(workflow, /run:\s*npm run build/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /path:\s*\.\/dist\/client/);
  assert.match(workflow, /actions\/deploy-pages@v5/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /environment:\s*\n\s+name:\s*github-pages/);
  assert.match(workflow, /cancel-in-progress:\s*false/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test --test-name-pattern="GitHub Pages build" tests/site.test.mjs
```

Expected: FAIL with `ENOENT` because `.github/workflows/pages.yml` does not exist.

- [ ] **Step 3: Add the minimal official Pages workflow**

Create `.github/workflows/pages.yml` with:

```yaml
name: Deploy site to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6
      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: "22"
          cache: npm
      - name: Configure Pages
        uses: actions/configure-pages@v5
      - name: Install dependencies
        run: npm ci
      - name: Build static site
        run: npm run build
      - name: Verify static entry point
        run: test -f dist/client/index.html
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: ./dist/client

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 4: Run the focused workflow test**

Run:

```powershell
node --test --test-name-pattern="GitHub Pages build" tests/site.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Run final local verification**

Run:

```powershell
npm test
npm run lint
git diff --check
git status --short
```

Expected: all tests pass, ESLint reports no errors, the diff has no whitespace errors, and only the intended task files are modified before commit.

- [ ] **Step 6: Commit the workflow task**

```powershell
git add -- tests/site.test.mjs .github/workflows/pages.yml
git commit -m "ci: deploy the static site to GitHub Pages"
```

---

### Task 3: Final verification and handoff

**Files:**
- Verify only: no new files.

**Interfaces:**
- Consumes: committed static-export configuration and Pages workflow.
- Produces: evidence for repository rename, push, Pages enablement, and live verification approval.

- [ ] **Step 1: Re-run all verification from committed HEAD**

```powershell
npm test
npm run lint
git diff --check 3d1456a..HEAD
git status --short
```

Expected: all commands succeed and the worktree is clean.

- [ ] **Step 2: Inspect the deployment boundary**

```powershell
git log --oneline -4
git diff --stat 3d1456a..HEAD
```

Expected: only the static-export code, tests, workflow, and this implementation plan differ from the approved design commit.

- [ ] **Step 3: Stop before external writes**

Report the verified local result and request approval for these external actions as one group: rename `psiQAQ/agent-lab-notes` to `psiQAQ/psiQAQ.github.io`, push the prepared branch, make it the published source through merge/default-branch handling, select GitHub Actions in Pages settings, and verify the public URL. Do not execute any of them without that approval.
