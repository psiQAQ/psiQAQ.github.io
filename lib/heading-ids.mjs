export function cleanHeadingText(text) {
  return text.replace(/<[^>]+>/g, "").replace(/[`*_~\[\]]/g, "").trim();
}

export function headingId(text, counts) {
  const base = cleanHeadingText(text).toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-") || "section";
  const count = counts.get(base) ?? 0;
  counts.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
}
