import { marked } from "marked";

export function plainSearchText(markdown) {
  const parts = [];
  marked.walkTokens(marked.lexer(markdown), (token) => {
    if (token.type === "text" || token.type === "codespan") parts.push(token.text);
  });
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
