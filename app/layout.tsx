import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const title = "科研 Agent 新手知识站";
const description = "从零搭建科研 Agent 工具链，完成第一篇结构化文献笔记。";

export const metadata: Metadata = {
  metadataBase: new URL("https://psiqaq.github.io/"),
  title: { default: title, template: `%s | ${title}` },
  description,
  openGraph: {
    type: "website",
    title,
    description,
    images: [{ url: "/og.png", width: 1728, height: 907, alt: description }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <div className="header-inner">
            <Link className="brand" href="/">
              <span className="brand-mark" aria-hidden="true">A</span>
              <span>Agent Lab Notes</span>
            </Link>
            <nav aria-label="主导航">
              <Link href="/start">新手路径</Link>
              <Link href="/library">知识库</Link>
              <Link href="/resources">资源</Link>
              <Link className="global-search" href="/search#site-search" aria-label="搜索文档">
                <span>搜索文档</span>
                <kbd>/</kbd>
              </Link>
              <a href="https://github.com/psiQAQ/psiQAQ.github.io" rel="noreferrer" target="_blank">
                GitHub
              </a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="page-shell footer-inner">
            <p>把重复配置变成路径，把时间留给研究问题。</p>
            <a href="https://github.com/psiQAQ/psiQAQ.github.io" rel="noreferrer" target="_blank">
              查看源仓库
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
