import readme from "../README.md?raw";

export type DocumentRecord = {
  sourcePath: string;
  slug: string;
  title: string;
  category: string;
  group: string;
  markdown: string;
  searchText: string;
};

type CatalogEntry = {
  category: string;
  group: string;
  label: string;
  target: string;
  description: string;
};

const markdownModules = import.meta.glob("../notes/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const assetModules = import.meta.glob(
  "../notes/**/*.{png,jpg,jpeg,gif,webp,svg}",
  { eager: true, import: "default", query: "?url" },
) as Record<string, string>;

function normalizeModulePath(path: string): string {
  return path.replace(/^\.\.\/notes\//, "").replace(/\\/g, "/");
}

function decodePath(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

function catalogEntries(markdown: string): CatalogEntry[] {
  const block = markdown.match(
    /<!-- site-catalog:start -->([\s\S]*?)<!-- site-catalog:end -->/,
  )?.[1];
  if (!block) throw new Error("README is missing the public catalog markers");

  const entries: CatalogEntry[] = [];
  let category = "";
  let group = "";

  for (const line of block.split(/\r?\n/)) {
    const categoryMatch = line.match(/^##\s+(.+?)\s*$/);
    if (categoryMatch) {
      category = categoryMatch[1];
      group = category;
      continue;
    }

    const groupMatch = line.match(/^###\s+(.+?)\s*$/);
    if (groupMatch) {
      group = groupMatch[1];
      continue;
    }

    const linkMatch = line.match(
      /^\s*-\s+(?!\!)(?:[^[]+\s*)?\[([^\]]+)]\(([^)]+)\)(?:\s+—\s+(.+))?\s*$/,
    );
    if (!linkMatch) continue;
    if (!category) throw new Error("README catalog entry has no category");

    entries.push({
      category,
      group: group || category,
      label: linkMatch[1].trim(),
      target: linkMatch[2].trim(),
      description: linkMatch[3]?.trim() ?? "",
    });
  }

  return entries;
}

function localCatalogPath(target: string): string {
  const path = decodePath(target.split(/[?#]/, 1)[0])
    .replace(/^\.\//, "")
    .replace(/\\/g, "/");
  if (!path.startsWith("notes/") || path.split("/").includes("..")) {
    throw new Error(`README local target must stay under notes/: ${target}`);
  }
  return path;
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
  Object.entries(assetModules).map(([path, url]) => [normalizeModulePath(path), url]),
);

const catalog = catalogEntries(readme);
for (const entry of catalog) {
  if (!/^https?:\/\//i.test(entry.target)) localCatalogPath(entry.target);
}

const seenPaths = new Set<string>();

export const documents: DocumentRecord[] = catalog.flatMap((entry) => {
  if (/^https?:\/\//i.test(entry.target)) return [];

  const physicalPath = localCatalogPath(entry.target);
  if (!physicalPath.toLowerCase().endsWith(".md")) return [];

  const sourcePath = physicalPath.slice("notes/".length);
  if (seenPaths.has(sourcePath)) return [];
  seenPaths.add(sourcePath);

  const markdown = markdownByPath.get(sourcePath);
  if (!markdown) throw new Error(`README publishes missing Markdown: ${physicalPath}`);

  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (!title) throw new Error(`Published Markdown has no level-one title: ${physicalPath}`);

  return [
    {
      sourcePath,
      slug: sourcePath.replace(/\.md$/i, ""),
      title,
      category: entry.category,
      group: entry.group,
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
