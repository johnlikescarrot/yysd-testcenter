import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: " chọn kiểm tra giá thị trường Đài Loan · YYSD ",
    template: "%s · xuất sắc lợi ích suy nghĩ đạt tới giá thị trường Đài Loan ",
  },
  description: " xuất sắc lợi ích suy nghĩ đạt tới chọn kiểm tra giá thị trường Đài Loan: QS / THE / ARWU / US News bốn nguyên tố: đất thông báo hoặc thông tri đối chiếu, trường cao đẳng truy xuất biến thể của | bước qua hệ thống so sánh ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
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
