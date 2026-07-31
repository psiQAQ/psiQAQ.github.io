import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "科研 Agent 新手知识站",
    template: "%s | 科研 Agent 新手知识站",
  },
  description: "从零搭建科研 Agent 工具链，完成第一篇结构化文献笔记。",
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
              <Link href="/search">搜索</Link>
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
