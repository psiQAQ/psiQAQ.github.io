import { Marked, Renderer } from "marked";
import { cleanHeadingText, headingId, type DocumentHeading } from "./headings";
import {
  assetUrlFor,
  findDocumentByPath,
  findResourceByPath,
  resolveRepositoryPath,
  type DocumentRecord,
} from "./content";

const defaultRenderer = new Renderer();

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function splitSuffix(href: string): [string, string] {
  const index = href.search(/[?#]/);
  return index < 0 ? [href, ""] : [href.slice(0, index), href.slice(index)];
}

export type { DocumentHeading } from "./headings";

function rewriteLink(document: DocumentRecord, href: string): string {
  if (/^(?:[a-z]+:|#|\/)/i.test(href)) return href;

  const [path, suffix] = splitSuffix(href);
  const resolved = resolveRepositoryPath(document.sourcePath, path);

  if (/\.md$/i.test(resolved)) {
    const target = findDocumentByPath(resolved);
    if (target) return `/guides/${target.slug}${suffix}`;
  }

  const resource = findResourceByPath(resolved);
  if (resource?.kind === "source") return `/resources/${resource.slug}${suffix}`;
  if (resource?.kind === "page") return `${resource.href}${suffix}`;
  if (resource?.kind === "download") return `${resource.href}${suffix}`;

  throw new Error(
    `Published Markdown references unpublished local resource: ${document.sourcePath} -> ${href}`,
  );
}

export function parseMarkdown(document: DocumentRecord): { html: string; headings: DocumentHeading[] } {
  const marked = new Marked({ gfm: true });
  const headingCounts = new Map<string, number>();
  const headings: DocumentHeading[] = [];

  marked.use({
    renderer: {
      code(token) {
        return `<div class="article-code-block"><button aria-label="复制代码" class="article-code-copy" type="button"><span aria-live="polite">点我复制~</span></button>${defaultRenderer.code(token)}</div>`;
      },
      heading(token) {
        const id = headingId(token.text, headingCounts);
        if (token.depth === 2 || token.depth === 3) {
          headings.push({ depth: token.depth, id, text: cleanHeadingText(token.text) });
        }
        return `<h${token.depth} id="${escapeAttribute(id)}">${this.parser.parseInline(token.tokens)}</h${token.depth}>`;
      },
      link(token) {
        const href = rewriteLink(document, token.href);
        const title = token.title
          ? ` title="${escapeAttribute(token.title)}"`
          : "";
        const external = /^https?:\/\//i.test(href)
          ? ' target="_blank" rel="noreferrer"'
          : "";
        return `<a href="${escapeAttribute(href)}"${title}${external}>${this.parser.parseInline(token.tokens)}</a>`;
      },
      image(token) {
        const url = assetUrlFor(document.sourcePath, token.href);
        if (!url) {
          throw new Error(
            `Published Markdown references missing image: ${document.sourcePath} -> ${token.href}`,
          );
        }
        const title = token.title
          ? ` title="${escapeAttribute(token.title)}"`
          : "";
        return `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(token.text)}"${title} loading="lazy">`;
      },
    },
  });

  const html = marked.parse(document.markdown, { async: false }) as string;
  return { html, headings };
}

export function renderMarkdown(document: DocumentRecord): string {
  return parseMarkdown(document).html;
}
