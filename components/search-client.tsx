"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SearchDocument = {
  slug: string;
  title: string;
  category: string;
  searchText: string;
};

export function SearchClient({ documents }: { documents: SearchDocument[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    if (!normalized) return documents;
    return documents.filter((document) =>
      `${document.title} ${document.category} ${document.searchText}`
        .toLocaleLowerCase("zh-CN")
        .includes(normalized),
    );
  }, [documents, query]);

  return (
    <div className="search-experience">
      <label htmlFor="site-search">搜索全部公开指南</label>
      <input
        autoComplete="off"
        id="site-search"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="例如：Zotero、Codex、WSL"
        type="search"
        value={query}
      />
      <p className="search-count" aria-live="polite">找到 {results.length} 篇指南</p>
      <div className="search-results">
        {results.map((document) => (
          <Link href={`/guides/${document.slug}`} key={document.slug}>
            <span>{document.category}</span>
            <strong>{document.title}</strong>
            <p>{document.searchText.slice(0, 108)}…</p>
          </Link>
        ))}
        {!results.length && <p className="empty-state">没有匹配结果，请换一个更短的关键词。</p>}
      </div>
    </div>
  );
}
