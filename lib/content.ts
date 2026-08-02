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

type CatalogType =
  | "document"
  | "video"
  | "launcher"
  | "template"
  | "analysis"
  | "ranking"
  | "news"
  | "learning"
  | "website";

type ResourceType = Exclude<CatalogType, "document">;

export type ResourceRecord = {
  category: string;
  group: string;
  icon: string;
  type: ResourceType;
  typeLabel: string;
  title: string;
} & (
  | { kind: "external"; href: string }
  | { kind: "source"; sourcePath: string; slug: string; filename: string; source: string }
  | { kind: "page"; sourcePath: string; filename: string; href: string }
  | { kind: "download"; sourcePath: string; filename: string; href: string }
);

type CatalogEntry = {
  category: string;
  group: string;
  icon: string;
  type: CatalogType;
  typeLabel: string;
  label: string;
  target: string;
};

const catalogTypes: Record<string, { type: CatalogType; label: string }> = {
  "📄": { type: "document", label: "文档" },
  "📺": { type: "video", label: "视频" },
  "🚀": { type: "launcher", label: "启动工具" },
  "🧾": { type: "template", label: "源码与模板" },
  "📊": { type: "analysis", label: "数据分析" },
  "⚔️": { type: "ranking", label: "排行榜" },
  "📰": { type: "news", label: "新闻" },
  "📚": { type: "learning", label: "学习资料" },
  "🌐": { type: "website", label: "网站" },
};

const markdownModules = import.meta.glob("../notes/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const sourceModules = import.meta.glob(
  "../notes/**/*.{bat,sh,py,ps1,js,mjs,cjs,ts,tsx,json,toml,yaml,yml,xml,ini,cfg,conf,txt,css}",
  { eager: true, import: "default", query: "?raw" },
) as Record<string, string>;

const pageModules = import.meta.glob("../notes/**/*.html", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

const assetModules = import.meta.glob(
  "../notes/**/*.{png,jpg,jpeg,gif,webp,svg,avif}",
  { eager: true, import: "default", query: "?url" },
) as Record<string, string>;

const downloadModules = import.meta.glob(
  "../notes/**/*.{pdf,doc,docx,xls,xlsx,ppt,pptx,zip,7z,rar,tar,gz,mp3,wav,mp4,mov,avi,bin,exe,msi,dmg,pkg,apk,blend}",
  { eager: true, import: "default", query: "?url" },
) as Record<string, string>;

const fileModules = { ...assetModules, ...downloadModules } as Record<string, string>;

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

    const linkMatch = line.match(/^\s*-\s+(\S+)\[([^\]]+)]\(([^)]+)\)\s*$/);
    if (!linkMatch) {
      if (/^\s*-\s+.*\[[^\]]+]\([^)]+\)/.test(line)) {
        throw new Error(`README catalog entry must use a supported icon: ${line.trim()}`);
      }
      continue;
    }
    if (!category) throw new Error("README catalog entry has no category");

    const catalogType = catalogTypes[linkMatch[1]];
    if (!catalogType) {
      throw new Error(`README catalog entry uses unknown icon: ${linkMatch[1]}`);
    }

    entries.push({
      category,
      group: group || category,
      icon: linkMatch[1],
      type: catalogType.type,
      typeLabel: catalogType.label,
      label: linkMatch[2].trim(),
      target: linkMatch[3].trim(),
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

const sourceByPath = new Map(
  Object.entries(sourceModules).map(([path, source]) => [
    normalizeModulePath(path),
    source,
  ]),
);

const pageByPath = new Map(
  Object.entries(pageModules).map(([path, url]) => [normalizeModulePath(path), url]),
);

const fileByPath = new Map(
  Object.entries(fileModules).map(([path, url]) => [normalizeModulePath(path), url]),
);

const catalog = catalogEntries(readme);
for (const entry of catalog) {
  if (!/^https?:\/\//i.test(entry.target)) localCatalogPath(entry.target);
  if (entry.type === "document") {
    if (/^https?:\/\//i.test(entry.target) || !entry.target.split(/[?#]/, 1)[0].toLowerCase().endsWith(".md")) {
      throw new Error(`README document entry must target local Markdown: ${entry.target}`);
    }
  }
}

const seenPaths = new Set<string>();

export const documents: DocumentRecord[] = catalog.flatMap((entry) => {
  if (entry.type !== "document") return [];

  const physicalPath = localCatalogPath(entry.target);

  const sourcePath = physicalPath.slice("notes/".length);
  if (seenPaths.has(sourcePath)) return [];
  seenPaths.add(sourcePath);

  const markdown = markdownByPath.get(sourcePath);
  if (!markdown) throw new Error(`README publishes missing Markdown: ${physicalPath}`);

  return [
    {
      sourcePath,
      slug: sourcePath.replace(/\.md$/i, ""),
      title: entry.label,
      category: entry.category,
      group: entry.group,
      markdown,
      searchText: plainText(markdown),
    },
  ];
});

export const resources: ResourceRecord[] = catalog.flatMap((entry) => {
  if (entry.type === "document") return [];

  if (/^https?:\/\//i.test(entry.target)) {
    return [
      {
        kind: "external",
        category: entry.category,
        group: entry.group,
        icon: entry.icon,
        type: entry.type,
        typeLabel: entry.typeLabel,
        title: entry.label,
        href: entry.target,
      },
    ];
  }

  const physicalPath = localCatalogPath(entry.target);
  const sourcePath = physicalPath.slice("notes/".length);
  const filename = sourcePath.split("/").at(-1) ?? sourcePath;
  const common = {
    category: entry.category,
    group: entry.group,
    icon: entry.icon,
    type: entry.type,
    typeLabel: entry.typeLabel,
    title: entry.label,
    sourcePath,
    filename,
  };
  const pageHref = pageByPath.get(sourcePath);
  if (pageHref) return [{ ...common, kind: "page", href: pageHref }];

  const source = sourceByPath.get(sourcePath) ?? markdownByPath.get(sourcePath);
  if (source !== undefined) {
    return [{ ...common, kind: "source", slug: sourcePath, source }];
  }

  const href = fileByPath.get(sourcePath);
  if (href) return [{ ...common, kind: "download", href }];

  throw new Error(`README publishes missing local file: ${physicalPath}`);
});

export const sourceResources = resources.filter(
  (resource): resource is Extract<ResourceRecord, { kind: "source" }> =>
    resource.kind === "source",
);

const sourceResourcesBySlug = new Map(
  sourceResources.map((resource) => [resource.slug, resource]),
);

export type LocalResourceRecord =
  | Extract<ResourceRecord, { kind: "source" }>
  | Extract<ResourceRecord, { kind: "page" }>
  | Extract<ResourceRecord, { kind: "download" }>;

const localResourcesByPath = new Map(
  resources
    .filter((resource): resource is LocalResourceRecord => resource.kind !== "external")
    .map((resource) => [resource.sourcePath, resource]),
);

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

export function findResourceByPath(path: string): LocalResourceRecord | undefined {
  return localResourcesByPath.get(path);
}

export function findSourceResource(
  slug: string,
): Extract<ResourceRecord, { kind: "source" }> | undefined {
  return sourceResourcesBySlug.get(decodePath(slug).replace(/^\/+|\/+$/g, ""));
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
  return fileByPath.get(resolveRepositoryPath(sourcePath, href));
}

export const categories = [...new Set(documents.map((document) => document.category))];
