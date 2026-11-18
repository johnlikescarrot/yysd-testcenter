import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "chọn kiểm tragiá thị trườngĐài Loan viết tắt · YYSD",
    template: "%s · YYSDgiá thị trườngĐài Loan viết tắt",
  },
  description: "YYSDchọn kiểm tragiá thị trườngĐài Loan viết tắt:QS / THE / ARWU / US News bốn nguyên tố: đấtthông báo hoặc thông triĐối chiếu,trường cao đẳngtruy xuất dữ liệubước quahệ thốngso sánh.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
