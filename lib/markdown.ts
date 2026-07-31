import { Marked } from "marked";
import {
  assetUrlFor,
  findDocumentByPath,
  resolveRepositoryPath,
  type DocumentRecord,
} from "./content";

const repositoryUrl = "https://github.com/psiQAQ/agent-lab-notes/blob/main";

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

function rewriteLink(document: DocumentRecord, href: string): string {
  if (/^(?:[a-z]+:|#|\/)/i.test(href)) return href;

  const [path, suffix] = splitSuffix(href);
  const resolved = resolveRepositoryPath(document.sourcePath, path);

  if (/\.md$/i.test(resolved)) {
    const target = findDocumentByPath(resolved);
    if (target) return `/guides/${target.slug}${suffix}`;
  }

  return `${repositoryUrl}/${resolved}${suffix}`;
}

export function renderMarkdown(document: DocumentRecord): string {
  const marked = new Marked({ gfm: true });

  marked.use({
    renderer: {
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

  return marked.parse(document.markdown, { async: false }) as string;
}
