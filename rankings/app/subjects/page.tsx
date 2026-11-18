import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SYSTEMS, SYSTEM_TRACK, type SystemKey } from "@/lib/systems";

export const metadata: Metadata = { title: " môn học xếp hạng " };
export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const subjects = await prisma.rankingEdition.findMany({
    where: { isSubject: true },
    orderBy: [{ system: "asc" }, { categoryName: "asc" }, { year: "desc" }],
  });

  const seen = new Set<string>();
  const latest = subjects.filter((s) => {
    const k = `${s.system}:${s.categorySlug}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return (
    <div className="space-y-5">
      <div>
        <p className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Subject tapes</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">môn học xếp hạng</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">QS có ưu tiên môn học thông báo hoặc thông tri(mỗi thông báo hoặc thông tri trước 500, Nguồn TopUniversities mở bề mặt bên ngoài) </p>
      </div>

      {latest.length === 0 ? (
        <p className="text-[var(--muted)]">tạm thời không có môn học dữ liệu</p>
      ) : (
        <ul className="panel divide-y divide-[var(--line)]">
          {latest.map((s) => (
            <li key={`${s.system}-${s.categorySlug}`}>
              <Link href={`/${s.system}/${s.categorySlug}/${s.year}`} className="flex items-center justify-between gap-3 px-4 py-4 hover:bg-white">
                <div className="flex items-center gap-3">
                  <span className="track-dot" style={{ background: SYSTEM_TRACK[s.system as SystemKey] || "#64748b" }} />
                  <div>
                    <p className="font-semibold">{s.categoryName}</p>
                    <p className="mono text-[11px] text-[var(--muted)]">
                      {SYSTEMS[s.system as SystemKey]?.shortName || s.system} · {s.year}
                    </p>
                  </div>
                </div>
                <span className="mono text-[11px] text-[var(--muted)]">OPEN →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="panel p-4 text-sm text-[var(--muted)]">
        <p className="font-semibold text-[var(--ink)]">Hướng dẫn</p>
        <p className="mt-1">thời điểm hiện tại che phủ QS 12 dùng trong | có ưu tiên hẹp chuyên môn; THE / mềm khoa học ngành học thông báo hoặc thông tri theo sau theo nhu cầu mở rộng </p>
      </div>
    </div>
  );
}
