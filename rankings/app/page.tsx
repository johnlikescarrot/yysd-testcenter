import Link from "next/link";
import { prisma } from "@/lib/db";
import { getLeaders, getTapeTops } from "@/lib/queries";
import { SYSTEM_ORDER, SYSTEMS, SYSTEM_TRACK, countryLabel, type SystemKey } from "@/lib/systems";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [leaders, tapes, uniCount, editionCount] = await Promise.all([
    getLeaders(),
    getTapeTops(8),
    prisma.university.count(),
    prisma.rankingEdition.count({ where: { isSubject: false } }),
  ]);

  const tickerItems = leaders.flatMap((l) => [
    { system: l.system, text: `${SYSTEMS[l.system].shortName} ${l.year} #1 ${l.nameZh}` },
  ]);

  return (
    <div className="space-y-8">
      {/* live ticker */}
      <div className="panel-deep overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/10 px-3 py-1.5">
          <span className="mono text-[10px] font-semibold tracking-[0.2em] text-[var(--gold)]">LIVE</span>
          <div className="ticker flex-1 py-1.5 text-[12px]">
            <div className="ticker-track">
              {[...tickerItems,...tickerItems].map((t, i) => (
                <span key={`${t.system}-${i}`} className="inline-flex items-center gap-2 text-[rgba(232,237,242,0.85)]">
                  <span className="track-dot" style={{ background: SYSTEM_TRACK[t.system] }} />
                  <span className="mono">{t.text}</span>
                </span>
              ))}
            </div>
          </div>
          <span className="mono hidden text-[10px] text-white/40 sm:inline">
            {uniCount} UNI · {editionCount} ED
          </span>
        </div>
      </div>

      {/* desk: search + rails */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)]">
        <div className="panel flex flex-col">
          <div className="panel-head">
            <span> chọn trường học kiểm tra </span>
            <span className="mono text-[var(--gold)]">DESK</span>
          </div>
          <div className="flex flex-1 flex-col justify-between gap-6 p-5">
            <div>
              <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2rem]">
                 trường này,
                <br />
                 tại tứ đại bảng đứng cái đó?
              </h1>
              <p className="mt-3 text-sm text-[var(--muted)]">
                 đem QS / THE / ARWU / US News trở thành bốn đầu giá thị trường quỹ. tra thứ tự, so với chênh lệch, rồi quyết định có muốn hay không đánh giá trúng tuyển.
              </p>
            </div>
            <form action="/rankings/universities" method="get" className="space-y-3">
              <input name="q" placeholder=" đưa vào trường học tên / biệt danh, quay về xe kiểm tra " className="input-desk" autoComplete="off" />
              <div className="flex flex-wrap gap-2">
                <button type="submit" className="btn-ink">
                   tra giá thị trường
                </button>
                <Link href="/compare" className="btn-ghost inline-flex items-center">
                   mở đối lập bàn
                </Link>
              </div>
            </form>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--muted)]">
              {leaders.slice(0, 3).map((l) => (
                <Link key={l.system} href={`/universities/${l.slug}`} className="hover:text-[var(--ink)]">
                  <span className="mono text-[var(--gold)]">#{1}</span> {l.nameZh}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="panel track-desk overflow-hidden">
          {tapes.map((tape, i) => (
            <input
              key={`radio-${tape.system}`}
              type="radio"
              name="home-track"
              id={`track-${tape.system}`}
              className="track-radio"
              defaultChecked={i === 0}
            />
          ))}
          <div className="track-tabs">
            {tapes.map((tape) => (
              <label key={tape.system} htmlFor={`track-${tape.system}`} className="track-tab">
                <span className="track-dot" style={{ background: SYSTEM_TRACK[tape.system] }} />
                <span>{SYSTEMS[tape.system].shortName}</span>
              </label>
            ))}
            <span className="mono ml-auto px-2 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
               giá thị trường quỹ
            </span>
          </div>
          {tapes.map((tape) => (
            <div key={tape.system} className={`track-pane track-pane-${tape.system}`}>
              <div className="track-pane-meta">
                <span className="mono">
                  {SYSTEMS[tape.system].shortName} · {tape.year} · TOP 8
                </span>
                <Link
                  href={`/${tape.system}/world/${tape.year}`}
                  className="mono text-[10px] hover:text-[var(--ink)]"
                >
                  FULL →
                </Link>
              </div>
              {tape.rows.map((r) => (
                <Link key={r.slug} href={`/universities/${r.slug}`} className="tape-row">
                  <span className="mono text-[var(--gold)]">{String(r.rank).padStart(2, "0")}</span>
                  <span className="truncate font-medium">{r.nameZh}</span>
                  <span className="mono text-[10px] text-[var(--muted)]">{countryLabel(r.country)}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* three asks as rail, not cards */}
      <section>
        <div className="mb-2 flex items-end justify-between">
          <h2 className="text-sm font-semibold tracking-wide"> bước tiếp theo </h2>
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Action rail</span>
        </div>
        <div className="ask-rail">
          <Link href="/compare">
            <p className="mono text-[10px] text-[var(--gold)]">01</p>
            <p className="mt-2 text-base font-semibold"> tứ đại bảng kém bao nhiêu? </p>
            <p className="mt-1 text-[12px] text-[var(--muted)]"> mở đối lập bàn, song song nhìn cùng một trường quỹ vị. </p>
          </Link>
          <a href="/admission">
            <p className="mono text-[10px] text-[var(--gold)]">02</p>
            <p className="mt-2 text-base font-semibold"> bối cảnh có đủ hay không? </p>
            <p className="mt-1 text-[12px] text-[var(--muted)]"> nhảy chuyển AI học lên cố vấn, đánh giá hạng mục trúng tuyển khu lúc giữa. </p>
          </a>
          <a href="/">
            <p className="mono text-[10px] text-[var(--gold)]">03</p>
            <p className="mt-2 text-base font-semibold"> ngôn ngữ điểm còn thiếu bao nhiêu? </p>
            <p className="mt-1 text-[12px] text-[var(--muted)]"> quay về chủ đứng luyện IELTS / Chương trình quốc tế. </p>
          </a>
        </div>
      </section>

      {/* destinations — large type cells */}
      <section>
        <div className="mb-2 flex items-end justify-between">
          <h2 className="text-sm font-semibold tracking-wide"> chỗ mục đích </h2>
          <Link href="/universities" className="mono text-[10px] text-[var(--muted)] hover:text-[var(--ink)]">
            ALL MARKETS →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["US", " Hoa Kỳ ", "US"],
            ["UK", " Vương quốc Anh ", "UK"],
            ["CA", " Canada ", "CA"],
            ["AU", " Úc ", "AU"],
            ["CN", " Châu Á ", "CN"],
            ["HK", " Hồng Kông ", "HK"],
          ].map(([code, label, tag]) => (
            <Link key={code} href={`/universities?country=${code}`} className="dest-cell">
              <span className="mono text-[10px] text-[var(--muted)]">{tag}</span>
              <span className="text-lg font-bold tracking-tight">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* track legend — one row, not essays */}
      <section className="panel">
        <div className="panel-head">
          <span> bốn đầu giá thị trường quỹ </span>
          <Link href="/systems" className="mono text-[10px] hover:text-[var(--ink)]">
             phương pháp luận →
          </Link>
        </div>
        <div className="grid sm:grid-cols-4">
          {SYSTEM_ORDER.map((key, i) => {
            const s = SYSTEMS[key as SystemKey];
            return (
              <Link
                key={key}
                href={`/systems/${key}`}
                className={`flex flex-col gap-2 p-4 transition hover:bg-white ${i < 3? "sm:border-r sm:border-[var(--line)]": ""}`}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="track-dot" style={{ background: SYSTEM_TRACK[key as SystemKey] }} />
                  <span className="font-semibold">{s.shortName}</span>
                </span>
                <span className="mono text-[11px] text-[var(--muted)]"> mới nhất {s.latestYear}</span>
                <span className="line-clamp-2 text-[12px] text-[var(--muted)]">{s.blurb}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
