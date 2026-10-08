import type { Metadata } from "next";
import Link from "next/link";
import { CodeCopyController } from "@/components/code-copy-controller";
import { SearchBox } from "@/components/search-box";
import { ThemePicker } from "@/components/theme-picker";
import { themeBootstrap } from "@/lib/theme";
import "./globals.css";

const title = "Agent Lab Notes";
const description = "环境配置、工具选型与工作流笔记。通过知识库、资源导航和搜索查阅。";

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
    <html lang="zh-CN" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
      <body>
        <a className="skip-link" href="#main-content">跳转到正文</a>
        <CodeCopyController />
        <header className="site-header">
          <div className="header-inner">
            <Link className="brand" href="/">
              <span className="brand-mark" aria-hidden="true">A</span>
              <span>Agent Lab Notes</span>
            </Link>
            <nav aria-label="主导航">
              <SearchBox />
              <ThemePicker />
              <noscript><Link href="/search">搜索</Link></noscript>
              <a href="https://github.com/psiQAQ/psiQAQ.github.io" rel="noreferrer" target="_blank">
                GitHub
              </a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="page-shell footer-inner">
            <p>环境配置、工具选型与工作流笔记。</p>
            <a href="https://github.com/psiQAQ/psiQAQ.github.io" rel="noreferrer" target="_blank">
              查看源仓库
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
