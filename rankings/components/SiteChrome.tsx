import Link from "next/link";

const LINKS = [
  { href: "/", label: " giá thị trường " },
  { href: "/systems", label: " hệ thống " },
  { href: "/universities", label: " viện giáo " },
  { href: "/compare", label: " đối lập " },
  { href: "/subjects", label: " ngành học " },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line-strong)] bg-[var(--panel-deep)] text-[var(--panel-deep-ink)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-sm font-bold tracking-wide text-white"> YYSD </span>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">Rank Desk</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-[13px]">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-2.5 py-1 text-[rgba(232,237,242,0.72)] hover:bg-white/10 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="/admission"
            className="ml-1 border border-[var(--gold)] px-2.5 py-1 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--ink)]"
          >
             đánh giá trúng tuyển
          </a>
          <a href="/" className="px-2.5 py-1 text-[rgba(232,237,242,0.45)] hover:text-white">
             chủ đứng
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-[var(--line)] py-8 text-center text-[11px] leading-relaxed text-[var(--muted)]">
      <p>
        QS tổng hợp bảng và ưu tiên ngành học bảng lấy từ TopUniversities công khai liệt biểu List (tất cả bảng trước 500, chỉ cung chọn trường học tham khảo) · không phải QS / THE / mềm khoa / U.S. News
         chính thức sản phẩm hoặc hợp tác phương
      </p>
      <p className="mono mt-2 text-[10px] tracking-wider">YYSD RANK DESK · {new Date().getFullYear()}</p>
    </footer>
  );
}
