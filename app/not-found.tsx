import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell not-found-page">
      <p className="eyebrow">404</p>
      <h1>这篇内容暂时不存在</h1>
      <p>链接可能已经调整，也可能不是公开指南。</p>
      <Link className="button primary" href="/library">返回知识库</Link>
    </main>
  );
}
