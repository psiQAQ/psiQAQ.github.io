import { SearchClient } from "@/components/search-client";
import { documents } from "@/lib/content";

export const metadata = { title: "搜索" };

export default function SearchPage() {
  return (
    <main className="page-shell content-page search-page">
      <header className="page-intro compact">
        <p className="eyebrow">本地全文搜索</p>
        <h1>找到下一篇要读的指南</h1>
        <p>搜索在当前浏览器完成，不会上传你的查询内容。</p>
      </header>
      <SearchClient
        documents={documents.map(({ slug, title, category, searchText }) => ({
          slug,
          title,
          category,
          searchText,
        }))}
      />
    </main>
  );
}
