import { SearchClient } from "@/components/search-client";
import { DocumentShell } from "@/components/document-shell";
export const metadata = { title: "搜索" };
export default function SearchPage() {
  return <DocumentShell currentHref="/search"><header className="page-intro compact"><p className="eyebrow">本地全文检索</p><h1>搜索</h1>
    <p>搜索指南正文、资源信息与学习文章；选择关键词查看命中位置。</p></header><SearchClient /></DocumentShell>;
}
