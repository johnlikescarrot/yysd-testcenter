import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI tư vấn du học · YYSD ",
  description: " Quy trình từng bước: chọn trường → bậc học → kỹ năng → đánh giá trúng tuyển ",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="min-h-screen antialiased">
        <header className="border-b border-sky-500/15 bg-slate-950/40 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="tech-title text-base tracking-wide">
              AI tư vấn du học
            </Link>
            <nav className="flex gap-4 text-sm text-slate-400">
              <Link href="/" className="hover:text-sky-300">
                 Bắt đầu đánh giá
              </Link>
              <a href="/rankings" className="hover:text-sky-300">
                 đại học bài danh
              </a>
              <a href="/" className="hover:text-sky-300">
                 Quay lại chủ đứng
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">{children}</main>
      </body>
    </html>
  );
}
