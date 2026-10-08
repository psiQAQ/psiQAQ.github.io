"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadSearchIndex, type SearchEntry } from "@/lib/search-index-client";
import { searchEntries, searchSnippet } from "@/lib/search.mjs";

export function SearchClient() {
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading");
  function load() {
    setStatus("loading");
    loadSearchIndex().then((data) => { setEntries(data); setStatus("ready"); }).catch(() => setStatus("error"));
  }
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q") || "";
    loadSearchIndex().then((data) => { setEntries(data); setQuery(initial); setStatus("ready"); }).catch(() => { setQuery(initial); setStatus("error"); });
  }, []);
  const results: SearchEntry[] = useMemo(() => searchEntries(entries, query), [entries, query]);
  return <div className="search-experience">
    <label htmlFor="site-search">搜索公开指南与资源</label>
    <input id="site-search" type="search" autoFocus autoComplete="off" placeholder="例如：Zotero、Codex、WSL" value={query} onChange={(event) => setQuery(event.target.value)} />
    {status === "loading" && <p role="status">正在加载搜索索引…</p>}
    {status === "error" && <p role="alert">搜索索引加载失败。<button type="button" onClick={load}>重试</button></p>}
    {status === "ready" && <><p className="search-count" aria-live="polite">找到 {results.length} 项内容</p>
      <div className="search-results">{results.map((entry) => <a href={entry.href} key={entry.id} target={entry.external ? "_blank" : undefined} rel={entry.external ? "noreferrer" : undefined}>
        <span>{entry.category} · {entry.group} · {entry.typeLabel}</span><strong>{entry.title}</strong><p>{searchSnippet(entry.searchText, query)}</p>
      </a>)}{!results.length && <p className="empty-state">没有匹配结果，请换一个更短的关键词。</p>}</div></>}
    <noscript>搜索需要 JavaScript。可通过<Link href="/library">知识库</Link>或<Link href="/resources">资源导航</Link>浏览全部公开内容。</noscript>
  </div>;
}
