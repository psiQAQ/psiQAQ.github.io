"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { searchEntries, searchSnippet } from "@/lib/search.mjs";
import { loadSearchIndex, type SearchEntry } from "@/lib/search-index-client";

export function SearchBox() {
  const input = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const results: SearchEntry[] = useMemo(() => query.trim() ? searchEntries(entries, query).slice(0, 8) : [], [entries, query]);
  function load() {
    if (status === "loading" || status === "ready") return;
    setStatus("loading");
    loadSearchIndex().then((data) => { setEntries(data); setStatus("ready"); }).catch(() => setStatus("error"));
  }
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      const target = event.target;
      if (event.key !== "/" || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      if (target instanceof HTMLElement && (target.closest("input, textarea, select") || target.isContentEditable)) return;
      event.preventDefault(); input.current?.focus();
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);
  return (
    <div className="global-search" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <label className="sr-only" htmlFor="global-search">搜索文档与资源</label>
      <input ref={input} id="global-search" type="search" role="combobox" aria-expanded={open} aria-controls="search-suggestions"
        aria-autocomplete="list" aria-activedescendant={active >= 0 && results[active] ? `search-option-${active}` : undefined}
        autoComplete="off" placeholder="搜索文档与资源" value={query}
        onFocus={() => { setOpen(true); load(); }} onChange={(event) => { setQuery(event.target.value); setActive(-1); setOpen(true); }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "Escape") { event.preventDefault(); setOpen(false); setActive(-1); }
          if ((event.key === "ArrowDown" || event.key === "ArrowUp") && results.length) {
            event.preventDefault(); setOpen(true);
            setActive((index) => event.key === "ArrowDown" ? (index + 1) % results.length : (index <= 0 ? results.length - 1 : index - 1));
          }
          if (event.key === "Enter") {
            event.preventDefault();
            const result = open && active >= 0 ? results[active] : undefined;
            if (result?.external) window.open(result.href, "_blank", "noopener,noreferrer");
            else window.location.assign(result?.href || `/search?q=${encodeURIComponent(query)}`);
            setOpen(false);
          }
        }} />
      <kbd aria-hidden="true">/</kbd>
      {open && <div className="search-popover">
        {status === "loading" && <p role="status">正在加载搜索索引…</p>}
        {status === "error" && <p role="alert">搜索索引加载失败。<button type="button" onClick={load}>重试</button></p>}
        {status === "ready" && !query.trim() && <p>输入关键词搜索公开指南与资源。</p>}
        <div id="search-suggestions" role="listbox" aria-label="搜索建议">
          {results.map((entry, index) => <a href={entry.href} id={`search-option-${index}`} key={entry.id} role="option" aria-selected={active === index}
            target={entry.external ? "_blank" : undefined} rel={entry.external ? "noreferrer" : undefined} tabIndex={-1}>
            <small>{entry.category} · {entry.typeLabel}</small><strong>{entry.title}</strong><p>{searchSnippet(entry.searchText, query)}</p>
          </a>)}
        </div>
        {status === "ready" && query.trim() && !results.length && <p role="status">没有匹配结果，请换一个更短的关键词。</p>}
        <a className="all-search-results" href={`/search?q=${encodeURIComponent(query)}`}>查看完整搜索结果 →</a>
      </div>}
    </div>
  );
}
