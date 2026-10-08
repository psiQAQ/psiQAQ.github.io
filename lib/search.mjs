export function searchEntries(entries, query) {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");
  if (!normalized) return entries;
  const matches = [];
  for (const entry of entries) {
    const title = entry.title.toLocaleLowerCase("zh-CN");
    const metadata = `${entry.category} ${entry.group} ${entry.typeLabel}`.toLocaleLowerCase("zh-CN");
    const body = entry.searchText.toLocaleLowerCase("zh-CN");
    const score = title === normalized ? 4 : title.includes(normalized) ? 3 : metadata.includes(normalized) ? 2 : body.includes(normalized) ? 1 : 0;
    if (score) matches.push({ entry, score });
  }
  return matches.sort((a, b) => b.score - a.score || a.entry.order - b.entry.order).map(({ entry }) => entry);
}

export function searchSnippet(text, query) {
  const match = text.toLocaleLowerCase("zh-CN").indexOf(query.trim().toLocaleLowerCase("zh-CN"));
  const start = Math.max(0, match - 36);
  const end = Math.min(text.length, start + 128);
  return `${start ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}
