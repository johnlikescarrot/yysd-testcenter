"use client";

import { useMemo, useState } from "react";
import { Search, Send, X, ExternalLink, ArrowLeft } from "lucide-react";
import type { InstitutionCard } from "@/lib/aggregate-schools";
import { AdmissionEval } from "@/components/AdmissionEval";
import { COUNTRIES, COUNTRY_LABELS, type Country } from "@/lib/catalog-labels";
import type { AdvisorBackground } from "@/lib/advisor-bg";

type Step = 1 | 2 | 3;

type ChatMsg = { role: "user" | "assistant"; text: string };

type ProgramHit = {
  id: string;
  program: string;
  programZh: string | null;
  degree: string;
  fieldLabel: string;
  blurb: string | null;
  duration: string | null;
  isStem: boolean | null;
  why: string;
  fitNotes?: string[];
};

type ProgramDetail = {
  id: string;
  name: string;
  schoolNameZh: string;
  program: string;
  programZh: string | null;
  degree: string;
  fieldLabel: string;
  duration: string | null;
  officialUrl: string | null;
  website: string | null;
  minGpa: number;
  avgGpa: number;
  minToefl: number | null;
  minIelts: number | null;
  applicationDeadline: string | null;
  blurb: string | null;
  summaryOfficial: string | null;
  tuitionNote: string | null;
  isStem: boolean | null;
  greRequired: boolean | null;
  admissionRequirements: string;
  verified: boolean;
};

type BgDraft = {
  gpa: string;
  toefl: string;
  ielts: string;
  gre: string;
  undergradSchool: string;
  undergradMajor: string;
};

const emptyBg: BgDraft = {
  gpa: "",
  toefl: "",
  ielts: "",
  gre: "",
  undergradSchool: "",
  undergradMajor: "",
};

export function AdvisorWizard({ institutions }: { institutions: InstitutionCard[] }) {
  const [step, setStep] = useState<Step>(1);
  const [country, setCountry] = useState<Country | "">("");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<InstitutionCard | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [undergradSoon, setUndergradSoon] = useState(false);

  const [bgDraft, setBgDraft] = useState<BgDraft>(emptyBg);
  const [background, setBackground] = useState<AdvisorBackground | null>(null);
  const [editingBg, setEditingBg] = useState(true);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [hits, setHits] = useState<ProgramHit[]>([]);
  const [detail, setDetail] = useState<ProgramDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [evalProgramId, setEvalProgramId] = useState<string | null>(null);
  const [evalLabel, setEvalLabel] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return institutions.filter((i) => {
      if (country && i.country !== country) return false;
      if (!qq) return true;
      return (
        i.nameZh.toLowerCase().includes(qq) ||
        i.nameEn.toLowerCase().includes(qq) ||
        i.countryLabel.includes(q.trim())
      );
    });
  }, [institutions, country, q]);

  function openSchool(school: InstitutionCard) {
    setPicked(school);
    setUndergradSoon(false);
    setModalOpen(true);
  }

  function chooseGraduate() {
    setModalOpen(false);
    setUndergradSoon(false);
    setMessages([]);
    setHits([]);
    setDetail(null);
    setInput("");
    setEditingBg(true);
    // keep prior background draft if user switches school mid-flow
    setStep(2);
  }

  function saveBackground(e: React.FormEvent) {
    e.preventDefault();
    const gpa = Number(bgDraft.gpa);
    if (!Number.isFinite(gpa) || gpa <= 0 || gpa > 4.5) return;
    if (!bgDraft.undergradSchool.trim() || !bgDraft.undergradMajor.trim()) return;
    const bg: AdvisorBackground = {
      gpa,
      toefl: bgDraft.toefl ? Number(bgDraft.toefl) : null,
      ielts: bgDraft.ielts ? Number(bgDraft.ielts) : null,
      gre: bgDraft.gre ? Number(bgDraft.gre) : null,
      undergradSchool: bgDraft.undergradSchool.trim(),
      undergradMajor: bgDraft.undergradMajor.trim(),
    };
    setBackground(bg);
    setEditingBg(false);
    setMessages([
      {
        role: "assistant",
        text: `đã ghi chép bạn của bối cảnh: GPA ${bg.gpa} · ${bg.undergradSchool} / ${bg.undergradMajor}${
          bg.toefl != null ? ` · TOEFL ${bg.toefl}` : ""
        }${bg.ielts != null ? ` · IELTS ${bg.ielts}` : ""} ${
          picked?.verified ? " nên kiểm tra mục nhà kho đã hạt nhân biến thể của | " : " nên kiểm tra hiện tại làm tham khảo mục lục "
        }mời sử dụng nói một lời mô tả cảm thấy hứng thú của học viên cao học hướng, ví dụ«dữ liệu khoa học»«trí tuệ nhân tạo nghiêng định lượng» tôi có thể kết hợp bạn của bối cảnh phối hoặc kết hôn chuyên môn và cho ra ngoài lan can sự thích nghi chỉ ra `,
      },
    ]);
  }

  function goStep(n: Step) {
    if (n === 1) {
      setStep(1);
      setDetail(null);
      setEvalProgramId(null);
      return;
    }
    if (n === 2 && picked) {
      setStep(2);
      setEvalProgramId(null);
      return;
    }
    if (n === 3 && evalProgramId) setStep(3);
  }

  async function sendChat(e?: React.FormEvent) {
    e?.preventDefault();
    if (!picked || !background || !input.trim() || chatLoading) return;
    const msg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setChatLoading(true);
    setDetail(null);
    try {
      const res = await fetch("/admission/api/advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: picked.name,
          message: msg,
          background,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || " cố vấn trả lời bị đánh bại ");
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
      setHits(data.programs || []);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: err instanceof Error ? err.message : " cố vấn tạm thời không thể sử dụng, mời một lát nữa thử lại ",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  async function openDetail(id: string) {
    setDetailLoading(true);
    try {
      const res = await fetch(`/admission/api/programs/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || " Tải không thành công ");
      setDetail(data);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: err instanceof Error ? err.message : " chuyên môn chi tiết tải bị đánh bại ",
        },
      ]);
    } finally {
      setDetailLoading(false);
    }
  }

  function startEval() {
    if (!detail) return;
    const label = `${detail.schoolNameZh} · ${detail.programZh || detail.program}(${detail.degree})`;
    setEvalProgramId(detail.id);
    setEvalLabel(label);
    setStep(3);
  }

  return (
    <div className="advisor-skin space-y-8">
      <header className="space-y-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-sky-300/80">YYSD · AI Advisor</p>
          <h1 className="tech-title mt-1 text-3xl sm:text-4xl">AI lên lớp hoặc trường cấp trên cố vấn</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            chọn trường học → điền vào biểu mẫu bối cảnh → nói chuyện phối hoặc kết hôn chuyên môn → nộp đơn xin đánh giá 
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-3 sm:gap-5" aria-label=" đánh giá quy trình ">
          <StepItem n={1} label=" chọn trường học " active={step === 1} done={step > 1} onClick={() => goStep(1)} />
          <span className="text-slate-600">›</span>
          <StepItem
            n={2}
            label="AI cố vấn "
            active={step === 2}
            done={step > 2}
            onClick={() => goStep(2)}
            disabled={!picked}
          />
          <span className="text-slate-600">›</span>
          <StepItem
            n={3}
            label=" đánh giá "
            active={step === 3}
            done={false}
            onClick={() => goStep(3)}
            disabled={!evalProgramId}
          />
        </nav>

        {picked && (
          <p className="text-sm text-slate-400">
            đã chọn: 
            <span className="text-sky-200">
              {picked.nameZh}
              {step >= 2 ? " · học viên cao học " : ""}
              {background && step >= 2
                ? ` · GPA ${background.gpa}${background.toefl != null ? ` · TOEFL ${background.toefl}` : ""}`
                : ""}
              {evalLabel && step === 3 ? ` · ${evalLabel.split(" · ").slice(1).join(" · ")}` : ""}
            </span>
            {step > 1 && (
              <button
                type="button"
                className="ml-3 text-sky-400 underline-offset-2 hover:underline"
                onClick={() => goStep(1)}
              >
                thay đổi trường học
              </button>
            )}
          </p>
        )}
      </header>

      {step === 1 && (
        <section className="space-y-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className="tech-input pl-10"
              placeholder=" tìm kiếm Đại học ngôn ngữ Trung Quốc tên có thể tiếng Anh tên..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`tech-chip ${country === "" ? "is-active" : ""}`}
              onClick={() => setCountry("")}
            >
              Tất cả
            </button>
            {COUNTRIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`tech-chip ${country === c ? "is-active" : ""}`}
                onClick={() => setCountry(c)}
              >
                {flag(c)} {COUNTRY_LABELS[c]}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">{filtered.length} thực ra trường cao đẳng</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <button
                key={s.name}
                type="button"
                className="tech-card flex items-center gap-3 p-4 text-left"
                onClick={() => openSchool(s)}
              >
                <SchoolLogo mark={s.mark} logoUrl={s.logoUrl} nameZh={s.nameZh} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-50">{s.nameZh}</span>
                  <span className="mt-0.5 block truncate text-sm text-slate-400">{s.nameEn}</span>
                  <span className="mt-1 block text-xs text-sky-300/80">
                    {flag(s.country as Country)} {s.countryLabel} · {s.programCount} dùng trong | học viên cao học mục
                    {s.verified ? " · đã hạt nhân biến thể của | " : ""}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && picked && (
        <section className="space-y-4">
          {editingBg || !background ? (
            <form onSubmit={saveBackground} className="tech-card-static space-y-4 p-5">
              <div>
                <p className="font-semibold text-slate-50">trước điền vào biểu mẫu nộp đơn xin bối cảnh</p>
                <p className="mt-1 text-xs text-slate-500">
                  cố vấn sẽ sử dụng những... này thông tin so sánh mục bậc cửa; đi vào đánh giá biến thể cũ của | có thể tự động dải đi vào, không cần thiết lặp lại lấp hoặc nhồi 
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs text-slate-400">
                  GPA (4.0)
                  <input
                    className="tech-input"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.5"
                    required
                    value={bgDraft.gpa}
                    onChange={(e) => setBgDraft((d) => ({ ...d, gpa: e.target.value }))}
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-400">
                  TOEFL(có sẵn)
                  <input
                    className="tech-input"
                    type="number"
                    min="0"
                    max="120"
                    value={bgDraft.toefl}
                    onChange={(e) => setBgDraft((d) => ({ ...d, toefl: e.target.value }))}
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-400">
                  IELTS(có sẵn)
                  <input
                    className="tech-input"
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    value={bgDraft.ielts}
                    onChange={(e) => setBgDraft((d) => ({ ...d, ielts: e.target.value }))}
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-400">
                  GRE(có sẵn)
                  <input
                    className="tech-input"
                    type="number"
                    min="260"
                    max="340"
                    value={bgDraft.gre}
                    onChange={(e) => setBgDraft((d) => ({ ...d, gre: e.target.value }))}
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-400 sm:col-span-1">
                  khóa học đại học trường cao đẳng
                  <input
                    className="tech-input"
                    required
                    value={bgDraft.undergradSchool}
                    onChange={(e) =>
                      setBgDraft((d) => ({ ...d, undergradSchool: e.target.value }))
                    }
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-400">
                  khóa học đại học chuyên môn
                  <input
                    className="tech-input"
                    required
                    value={bgDraft.undergradMajor}
                    onChange={(e) =>
                      setBgDraft((d) => ({ ...d, undergradMajor: e.target.value }))
                    }
                  />
                </label>
              </div>
              <button type="submit" className="tech-btn">
                bảo tồn và bắt đầu nói chuyện
              </button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/50 px-4 py-3 text-sm ring-1 ring-sky-500/20">
              <p className="text-slate-300">
                bối cảnh: GPA {background.gpa} · {background.undergradSchool} /{" "}
                {background.undergradMajor}
                {background.toefl != null ? ` · TOEFL ${background.toefl}` : ""}
                {background.ielts != null ? ` · IELTS ${background.ielts}` : ""}
              </p>
              <button
                type="button"
                className="text-sky-400 underline-offset-2 hover:underline"
                onClick={() => setEditingBg(true)}
              >
                sửa đổi
              </button>
            </div>
          )}

          {background && !editingBg && (
            <div className="grid gap-4 lg:grid-cols-5">
              <div className="tech-card-static flex min-h-[420px] flex-col lg:col-span-3">
                <div className="border-b border-sky-500/15 px-4 py-3">
                  <p className="font-semibold text-slate-50">AI Advisor · {picked.nameZh}</p>
                  <p className="text-xs text-slate-500">
                    mô tả hứng thú, phối hoặc kết hôn nên kiểm tra học viên cao học chuyên môn; kết hợp bạn của bối cảnh cho ra ngoài lan can sự thích nghi chỉ ra 
                  </p>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "ml-auto bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                          : "bg-slate-900/70 text-slate-200 ring-1 ring-sky-500/20"
                      }`}
                    >
                      {m.text}
                    </div>
                  ))}
                  {chatLoading && (
                    <p className="text-xs text-sky-300/80">cố vấn đang ở truy xuất mục nhà kho...</p>
                  )}
                </div>
                <form onSubmit={sendChat} className="flex gap-2 border-t border-sky-500/15 p-3">
                  <input
                    className="tech-input flex-1"
                    placeholder=" ví dụ: logarit biến thể của | khoa học biến thể cũ của AI cảm thấy hứng thú, nghiêng đưa vào sử dụng..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    className="tech-btn px-3"
                    disabled={chatLoading || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>

              <div className="space-y-3 lg:col-span-2">
                <p className="text-sm font-medium text-slate-300">phối hoặc kết hôn chuyên môn</p>
                {!hits.length && !detail && (
                  <p className="text-sm text-slate-500">truyền đi hứng thú mô tả hoàng hậu, liên quan chuyên môn sẽ hiển thị tồn tại biến thể của | </p>
                )}
                {hits.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className="tech-card w-full p-3 text-left"
                    onClick={() => openDetail(h.id)}
                  >
                    <span className="text-[11px] font-medium uppercase tracking-wide text-sky-300/90">
                      {h.fieldLabel}
                      {h.isStem ? " · STEM" : ""}
                    </span>
                    <span className="mt-0.5 block font-semibold text-slate-50">
                      {h.programZh || h.program}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {h.program} · {h.degree}
                      {h.duration ? ` · ${h.duration}` : ""}
                    </span>
                    {h.why && (
                      <span className="mt-1 block text-xs text-amber-200/80">{h.why}</span>
                    )}
                  </button>
                ))}

                {(detail || detailLoading) && (
                  <div className="tech-card-static p-4">
                    {detailLoading && <p className="text-sm text-slate-400">tải chuyên môn chi tiết...</p>}
                    {detail && !detailLoading && (
                      <ProgramDetailPanel
                        detail={detail}
                        onBack={() => setDetail(null)}
                        onEval={startEval}
                      />
                    )}
                  </div>
                )}

                <button type="button" className="tech-btn-ghost text-sm" onClick={() => goStep(1)}>
                  ← trở về chọn trường học
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {step === 3 && evalProgramId && (
        <section className="space-y-4">
          <AdmissionEval
            key={evalProgramId + (background?.gpa ?? "")}
            schoolId={evalProgramId}
            schoolName={evalLabel}
            variant="tech"
            initial={
              background
                ? {
                    gpa: String(background.gpa),
                    toefl: background.toefl != null ? String(background.toefl) : "",
                    ielts: background.ielts != null ? String(background.ielts) : "",
                    gre: background.gre != null ? String(background.gre) : "",
                    undergradSchool: background.undergradSchool,
                    undergradMajor: background.undergradMajor,
                  }
                : undefined
            }
          />
        </section>
      )}

      {modalOpen && picked && (
        <div
          className="tech-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModalOpen(false);
              setUndergradSoon(false);
            }
          }}
        >
          <div className="tech-card-static w-full max-w-md p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <SchoolLogo mark={picked.mark} logoUrl={picked.logoUrl} nameZh={picked.nameZh} />
                <div>
                  <h2 className="text-lg font-semibold text-slate-50">{picked.nameZh}</h2>
                  <p className="text-sm text-slate-400">{picked.nameEn}</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-1 text-slate-400 hover:bg-white/5"
                onClick={() => {
                  setModalOpen(false);
                  setUndergradSoon(false);
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {!undergradSoon ? (
              <>
                <p className="mb-4 text-sm text-slate-400">mời chọn nộp đơn xin nền tảng giáo dục</p>
                <div className="grid gap-3">
                  <button type="button" className="tech-btn w-full" onClick={chooseGraduate}>
                    nộp đơn xin học viên cao học
                  </button>
                  <button
                    type="button"
                    className="tech-btn-ghost w-full"
                    onClick={() => setUndergradSoon(true)}
                  >
                    nộp đơn xin khóa học đại học
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4 py-2 text-center">
                <p className="text-base font-medium text-sky-200">khóa học đại học đánh giá sắp nở hoa</p>
                <p className="text-sm text-slate-400">thời điểm hiện tại phiên bản hầu như tán thành học viên cao học nộp đơn xin cố vấn biến thể của | đánh giá </p>
                <button type="button" className="tech-btn" onClick={chooseGraduate}>
                  thay đổi thành nộp đơn xin học viên cao học
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProgramDetailPanel({
  detail,
  onBack,
  onEval,
}: {
  detail: ProgramDetail;
  onBack: () => void;
  onEval: () => void;
}) {
  const url = detail.officialUrl || detail.website;
  const gre =
    detail.greRequired === true
      ? " cần GRE"
      : detail.greRequired === false
        ? " không cần GRE"
        : "GRE có sẵn / biến thể cũ của trang web chính thức làm chuẩn ";
  return (
    <div className="space-y-3 text-sm">
      <button type="button" className="inline-flex items-center gap-1 text-sky-400" onClick={onBack}>
        <ArrowLeft className="h-3.5 w-3.5" /> trở về danh sách
      </button>
      <div>
        <p className="text-xs uppercase tracking-wide text-sky-300/80">
          {detail.fieldLabel}
          {detail.verified ? (
            <span className="ml-2 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-emerald-300">
              đã hạt nhân biến thể của |
            </span>
          ) : (
            <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-amber-200/90">
              tham khảo
            </span>
          )}
        </p>
        <h3 className="text-lg font-semibold text-slate-50">
          {detail.programZh || detail.program}
        </h3>
        <p className="text-slate-400">
          {detail.program} · {detail.degree}
          {detail.duration ? ` · hệ thống giáo dục ${detail.duration}` : ""}
        </p>
      </div>
      {detail.blurb && <p className="text-slate-300">{detail.blurb}</p>}
      {detail.summaryOfficial && (
        <p className="rounded-xl bg-slate-950/50 p-3 text-xs leading-relaxed text-slate-400">
          {detail.summaryOfficial}
        </p>
      )}
      <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
        <KV k="GPA bậc cửa " v={`biến thể của thấp cân trong cân đĩa hoặc trên cân ${detail.minGpa.toFixed(1)} · chia tham khảo ${detail.avgGpa.toFixed(2)}`} />
        <KV
          k=" ngôn ngữ "
          v={
            detail.minToefl != null
              ? `TOEFL ≥ ${detail.minToefl}${detail.minIelts != null ? ` / IELTS ≥ ${detail.minIelts}` : ""}`
              : detail.minIelts != null
                ? `IELTS ≥ ${detail.minIelts}`
                : " biến thể cũ của trang web chính thức làm chuẩn "
          }
        />
        <KV k=" nộp đơn xin đóng " v={detail.applicationDeadline || " biến thể cũ của trang web chính thức làm chuẩn "} />
        <KV k=" học phí " v={detail.tuitionNote || " biến thể cũ của trang web chính thức làm chuẩn "} />
        <KV k="STEM" v={detail.isStem == null ? " chưa đánh dấu " : detail.isStem ? " là " : " phủ định "} />
        <KV k="GRE" v={gre} />
      </dl>
      <p className="text-xs text-slate-500">{detail.admissionRequirements}</p>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sky-400 hover:underline"
        >
          chính phủ mục / trường học trang <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
      <button type="button" className="tech-btn w-full" onClick={onEval}>
        nộp đơn xin đánh giá
      </button>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-white/5 px-2.5 py-2">
      <dt className="text-slate-500">{k}</dt>
      <dd className="mt-0.5 text-slate-200">{v}</dd>
    </div>
  );
}

function StepItem({
  n,
  label,
  active,
  done,
  onClick,
  disabled,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`tech-step ${active ? "is-active" : ""} ${done ? "is-done" : ""} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <span className="dot" />
      <span>
        {n}. {label}
      </span>
    </button>
  );
}

function flag(c: Country | string) {
  return ({ US: "🇺🇸", UK: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺" } as Record<string, string>)[c] || "";
}

function SchoolLogo({
  mark,
  logoUrl,
  nameZh,
}: {
  mark: string;
  logoUrl?: string;
  nameZh: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!logoUrl || failed) return <span className="tech-mark">{mark}</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={`${nameZh} huy hiệu trường`}
      className="h-[52px] w-[52px] shrink-0 rounded-[14px] bg-white object-contain p-1 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]"
      onError={() => setFailed(true)}
    />
  );
}
