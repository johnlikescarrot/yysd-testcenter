import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: " chọn trường học giá thị trường đài · YYSD ",
    template: "%s · YYSD giá thị trường đài ",
  },
  description: " YYSD chọn trường học giá thị trường đài: QS / THE / ARWU / US News tứ đại bảng so sánh, viện giáo kiểm tra và vượt qua hệ thống đối lập. ",
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
