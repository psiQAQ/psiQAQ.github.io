import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import "./globals.css";

const title = "科研 Agent 新手知识站";
const description = "从零搭建科研 Agent 工具链，完成第一篇结构化文献笔记。";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host")?.split(",")[0].trim() ??
    requestHeaders.get("host") ??
    "localhost";
  const protocol =
    requestHeaders.get("x-forwarded-proto")?.split(",")[0].trim() ??
    (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;

  return {
    title: { default: title, template: `%s | ${title}` },
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: image, width: 1728, height: 907, alt: description }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

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
              <Link className="global-search" href="/search#site-search" aria-label="搜索文档">
                <span>搜索文档</span>
                <kbd>/</kbd>
              </Link>
              <a href="https://github.com/psiQAQ/agent-lab-notes" rel="noreferrer" target="_blank">
                GitHub
              </a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="page-shell footer-inner">
            <p>把重复配置变成路径，把时间留给研究问题。</p>
            <a href="https://github.com/psiQAQ/agent-lab-notes" rel="noreferrer" target="_blank">
              查看源仓库
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
