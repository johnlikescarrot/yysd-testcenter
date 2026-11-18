import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI lên lớp hoặc trường cấp trên cố vấn · YYSD ",
  description: " khoa học và công nghệ màu xanh hóa đơn đầu một bước tiến lên: chọn kiểm tra → nền tảng giáo dục → Môn học → chấp nhận ứng viên vượt kỳ thi đầu vào đánh giá ",
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
              AI lên lớp hoặc trường cấp trên cố vấn
            </Link>
            <nav className="flex gap-4 text-sm text-slate-400">
              <Link href="/" className="hover:text-sky-300">
                bắt đầu đánh giá
              </Link>
              <a href="/rankings" className="hover:text-sky-300">
                Đại học xếp hạng
              </a>
              <a href="/" className="hover:text-sky-300">
                trở về chủ trạm
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">{children}</main>
      </body>
    </html>
  );
}
