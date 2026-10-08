import { marked } from "marked";
import { cleanHeadingText, headingId } from "./heading-ids.mjs";

/** @returns {Array<{depth: number, id: string, text: string, line: number}>} */
export function sourceHeadings(source) {
  const headings = [];
  const counts = new Map();
  let line = 1;
  for (const token of marked.lexer(source)) {
    if (token.type === "heading") {
      const id = headingId(token.text, counts);
      if (token.depth === 2 || token.depth === 3) headings.push({ depth: token.depth, id, text: cleanHeadingText(token.text), line });
    }
    line += (token.raw.match(/\n/g) || []).length;
  }
  return headings;
}
