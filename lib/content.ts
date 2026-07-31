import readme from "../README.md?raw";

export type DocumentRecord = {
  sourcePath: string;
  slug: string;
  title: string;
  category: string;
  markdown: string;
  searchText: string;
};

const markdownModules = {
  ...import.meta.glob("../agents/**/*.md", {
    eager: true,
    import: "default",
    query: "?raw",
  }),
  ...import.meta.glob("../models/**/*.md", {
    eager: true,
    import: "default",
    query: "?raw",
  }),
  ...import.meta.glob("../operating-system/**/*.md", {
    eager: true,
    import: "default",
    query: "?raw",
  }),
  ...import.meta.glob("../others/**/*.md", {
    eager: true,
    import: "default",
    query: "?raw",
  }),
  ...import.meta.glob("../programme-env/**/*.md", {
    eager: true,
    import: "default",
    query: "?raw",
  }),
} as Record<string, string>;

const assetModules = {
  ...import.meta.glob("../agents/**/*.{png,jpg,jpeg,gif,webp}", {
    eager: true,
    import: "default",
    query: "?url",
  }),
  ...import.meta.glob("../models/**/*.{png,jpg,jpeg,gif,webp}", {
    eager: true,
    import: "default",
    query: "?url",
  }),
  ...import.meta.glob("../operating-system/**/*.{png,jpg,jpeg,gif,webp}", {
    eager: true,
    import: "default",
    query: "?url",
  }),
  ...import.meta.glob("../others/**/*.{png,jpg,jpeg,gif,webp}", {
    eager: true,
    import: "default",
    query: "?url",
  }),
  ...import.meta.glob("../programme-env/**/*.{png,jpg,jpeg,gif,webp}", {
    eager: true,
    import: "default",
    query: "?url",
  }),
} as Record<string, string>;

function normalizeModulePath(path: string): string {
  return path.replace(/^\.\.\//, "").replace(/\\/g, "/");
}

function decodePath(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

function categoryFor(path: string): string {
  if (path.startsWith("programme-env/")) return "基础环境";
  if (path.startsWith("operating-system/")) return "系统与运行环境";
  if (path.startsWith("agents/codex/")) return "Codex";
  if (path.startsWith("agents/claude-code/")) return "Claude Code";
  if (path.startsWith("agents/skills/")) return "Skills";
  if (path.startsWith("agents/MCP/")) return "MCP";
  if (path.startsWith("agents/tools/")) return "工具与扩展";
  if (path.startsWith("models/")) return "模型选型";
  return "科研与通用工具";
}

function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_|~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const markdownByPath = new Map(
  Object.entries(markdownModules).map(([path, markdown]) => [
    normalizeModulePath(path),
    markdown,
  ]),
);

const assetByPath = new Map(
  Object.entries(assetModules).map(([path, url]) => [
    normalizeModulePath(path),
    url,
  ]),
);

const publishedPaths = [
  ...readme.matchAll(/\]\((?!https?:\/\/)([^)#?]+\.md)(?:#[^)]*)?\)/g),
].map((match) => decodePath(match[1]).replace(/^\.\//, "").replace(/\\/g, "/"));

const seenPaths = new Set<string>();

export const documents: DocumentRecord[] = publishedPaths.flatMap((sourcePath) => {
  if (seenPaths.has(sourcePath)) return [];
  seenPaths.add(sourcePath);

  const markdown = markdownByPath.get(sourcePath);
  if (!markdown) {
    throw new Error(`README publishes missing Markdown: ${sourcePath}`);
  }

  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (!title) {
    throw new Error(`Published Markdown has no level-one title: ${sourcePath}`);
  }

  return [
    {
      sourcePath,
      slug: sourcePath.replace(/\.md$/i, ""),
      title,
      category: categoryFor(sourcePath),
      markdown,
      searchText: plainText(markdown),
    },
  ];
});

const documentsBySlug = new Map(documents.map((document) => [document.slug, document]));
const documentsByPath = new Map(
  documents.map((document) => [document.sourcePath, document]),
);

if (documentsBySlug.size !== documents.length) {
  throw new Error("Published Markdown produces duplicate guide slugs");
}

export function findDocument(slug: string): DocumentRecord | undefined {
  return documentsBySlug.get(decodePath(slug).replace(/^\/+|\/+$/g, ""));
}

export function findDocumentByPath(path: string): DocumentRecord | undefined {
  return documentsByPath.get(path);
}

export function resolveRepositoryPath(sourcePath: string, href: string): string {
  const cleanHref = decodePath(href.split(/[?#]/, 1)[0]).replace(/\\/g, "/");
  const base = sourcePath.split("/").slice(0, -1);

  for (const part of cleanHref.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") base.pop();
    else base.push(part);
  }

  return base.join("/");
}

export function assetUrlFor(sourcePath: string, href: string): string | undefined {
  return assetByPath.get(resolveRepositoryPath(sourcePath, href));
}

export const categories = [...new Set(documents.map((document) => document.category))];
