"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ProbabilityRing } from "@/components/ProbabilityRing";
import { MOCK_EVAL } from "@/lib/mock";
import { ChevronDown, Upload } from "lucide-react";

type EvidenceItem = {
  type: string;
  title: string;
  detail: string;
  weight?: string;
};

type EvalResult = {
  probability: number;
  range?: { low: number; high: number };
  category?: " chạy nước rút " | " phối hoặc kết hôn " | " hòa vốn ";
  analysis: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  comparison: string;
  evidence?: EvidenceItem[];
  similar_cases: Array<{
    id: string;
    description: string;
    admissionResult: boolean;
    similarity: number;
    gpa: number;
    year: number;
    peerBand?: boolean;
    source?: string;
    caseProgram?: string;
    caseDegree?: string;
    sameProgram?: boolean;
  }>;
  similar_scope?: "program" | "field" | "school" | "none";
  rejected?: boolean;
  calibrated?: boolean;
  error?: string;
};

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "1";

export function AdmissionEval({
  schoolId,
  schoolName,
  variant = "default",
  initial,
}: {
  schoolId: string;
  schoolName: string;
  /** tech = blue futuristic skin for wizard */
  variant?: "default" | "tech";
  /** Prefill from advisor background step */
  initial?: {
    gpa?: string;
    toefl?: string;
    ielts?: string;
    gre?: string;
    undergradSchool?: string;
    undergradMajor?: string;
  };
}) {
  const tech = variant === "tech";
  const [gpa, setGpa] = useState(initial?.gpa ?? "3.42");
  const [toefl, setToefl] = useState(initial?.toefl ?? "100");
  const [ielts, setIelts] = useState(initial?.ielts ?? "");
  const [gre, setGre] = useState(initial?.gre ?? "");
  const [undergradSchool, setUndergradSchool] = useState(
    initial?.undergradSchool ?? "THE PENNSYLVANIA STATE UNIVERSITY"
  );
  const [undergradMajor, setUndergradMajor] = useState(
    initial?.undergradMajor ?? "Social Data Analytics"
  );
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setResumeFile(f);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      if (useMock) {
        await new Promise((r) => setTimeout(r, 600));
        setResult(MOCK_EVAL);
        return;
      }
      const fd = new FormData();
      fd.set("targetSchoolId", schoolId);
      fd.set("gpa", gpa);
      if (toefl) fd.set("toefl", toefl);
      if (ielts) fd.set("ielts", ielts);
      if (gre) fd.set("gre", gre);
      fd.set("undergradSchool", undergradSchool);
      fd.set("undergradMajor", undergradMajor);
      if (resumeFile) fd.set("resume", resumeFile);

      // basePath=/admission - absolute /api/* would hit the static site (HTML 404)
      const res = await fetch("/admission/api/evaluate", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || " đánh giá bị đánh bại ");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : " đánh giá bị đánh bại ");
    } finally {
      setLoading(false);
    }
  }

  const dropCls = tech
    ? `mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-sm text-slate-400 ${
        dragOver ? "border-sky-400 bg-sky-500/10" : "border-sky-500/30"
      }`
    : `mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-8 text-sm text-stone-600 ${
        dragOver ? "border-stone-800 bg-stone-50" : "border-stone-300"
      }`;

  return (
    <div className="space-y-8">
      <Panel tech={tech}>
        <PanelHead
          tech={tech}
          title=" điền vào biểu mẫu bối cảnh và đánh giá "
          desc={`mục tiêu: ${schoolName}${useMock ? " · Mock" : " · hiệu chuẩn động cơ khóa xác suất "}`}
        />
        <FormBody tech={tech}>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            {tech ? (
              <>
                <TechField label="GPA (4.0)">
                  <input className="tech-input" type="number" step="0.01" min="0" max="4.5" required value={gpa} onChange={(e) => setGpa(e.target.value)} />
                </TechField>
                <TechField label="TOEFL(có sẵn)">
                  <input className="tech-input" type="number" min="0" max="120" value={toefl} onChange={(e) => setToefl(e.target.value)} />
                </TechField>
                <TechField label="IELTS(có sẵn)">
                  <input className="tech-input" type="number" step="0.5" min="0" max="9" value={ielts} onChange={(e) => setIelts(e.target.value)} />
                </TechField>
                <TechField label="GRE(có sẵn)">
                  <input className="tech-input" type="number" min="260" max="340" value={gre} onChange={(e) => setGre(e.target.value)} />
                </TechField>
                <TechField label=" khóa học đại học trường cao đẳng ">
                  <input className="tech-input" required value={undergradSchool} onChange={(e) => setUndergradSchool(e.target.value)} />
                </TechField>
                <TechField label=" khóa học đại học chuyên môn ">
                  <input className="tech-input" required value={undergradMajor} onChange={(e) => setUndergradMajor(e.target.value)} />
                </TechField>
              </>
            ) : (
              <>
                <Field label="GPA (4.0)">
                  <Input type="number" step="0.01" min="0" max="4.5" required value={gpa} onChange={(e) => setGpa(e.target.value)} />
                </Field>
                <Field label="TOEFL(có sẵn)">
                  <Input type="number" min="0" max="120" value={toefl} onChange={(e) => setToefl(e.target.value)} />
                </Field>
                <Field label="IELTS(có sẵn)">
                  <Input type="number" step="0.5" min="0" max="9" value={ielts} onChange={(e) => setIelts(e.target.value)} />
                </Field>
                <Field label="GRE(có sẵn)">
                  <Input type="number" min="260" max="340" value={gre} onChange={(e) => setGre(e.target.value)} />
                </Field>
                <Field label=" khóa học đại học trường cao đẳng ">
                  <Input required value={undergradSchool} onChange={(e) => setUndergradSchool(e.target.value)} />
                </Field>
                <Field label=" khóa học đại học chuyên môn ">
                  <Input required value={undergradMajor} onChange={(e) => setUndergradMajor(e.target.value)} />
                </Field>
              </>
            )}
            <div className="sm:col-span-2">
              {tech ? (
                <label className="text-sm text-slate-400">sơ yếu lý lịch PDF / Word(phân tích hoàng hậu không giữ nguyên văn món)</label>
              ) : (
                <Label>sơ yếu lý lịch PDF / Word(phân tích hoàng hậu không giữ nguyên văn món)</Label>
              )}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={dropCls}
                onClick={() => document.getElementById("resume-input")?.click()}
              >
                <Upload className="h-5 w-5" />
                {resumeFile ? resumeFile.name : " kéo PDF / DOC / DOCX, có thể nhấn chọn "}
                <input
                  id="resume-input"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              {tech ? (
                <button type="submit" disabled={loading} className="tech-btn w-full sm:w-auto">
                  {loading ? " đánh giá Trung Quốc..." : " bắt đầu đánh giá "}
                </button>
              ) : (
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? " đánh giá Trung Quốc..." : " bắt đầu đánh giá "}
                </Button>
              )}
            </div>
          </form>
          {error && (
            <p className={`mt-4 text-sm ${tech ? "text-rose-300" : "text-red-600"}`}>
              {error}
            </p>
          )}
        </FormBody>
      </Panel>

      {result && (
        <div className="space-y-6">
          <Panel tech={tech}>
            <PanelHead
              tech={tech}
              title=" chấp nhận ứng viên vượt kỳ thi đầu vào Trấn Thành Công hoặc trấn Chengkung ở huyện Đài Đông | tỉ lệ sự đánh giá "
              desc={`cố vấn lỗ khoan sự đánh giá · viết tắt của trường cao đẳng chính phủ tỷ lệ chấp nhận${result.calibrated ? " · đã hiệu chuẩn " : ""}`}
            />
            <div className={`flex justify-center py-6 ${tech ? "px-5" : ""}`}>
              <ProbabilityRing
                probability={result.probability}
                category={result.category}
                range={result.range}
                variant={variant}
              />
            </div>
          </Panel>

          {result.evidence && result.evidence.length > 0 && (
            <EvidencePanel items={result.evidence} tech={tech} />
          )}

          <div>
            <h3 className={`mb-3 text-lg font-semibold ${tech ? "text-slate-50" : ""}`}>
              tương tự vụ việc
            </h3>
            <p className={`mb-3 text-xs ${tech ? "text-slate-500" : "text-stone-500"}`}>
              hầu như tiết lộ gốc kiểm tra GradCafe thật tự thông báo; thời điểm hiện tại mục không đủ biến thể cũ của | quay lại giống kiểm tra gần mục không tiết lộ tổng hợp mẫu thay vì anh ấy Đại học vụ việc 
              {result.similar_scope === "field" || result.similar_scope === "school"
                ? "(sau đây ngậm trong miệng giống kiểm tra khác liên quan mục)"
                : ""}
            </p>
            <div className="grid gap-3">
              {result.similar_cases.length === 0 && (
                <p className={`text-sm ${tech ? "text-slate-500" : "text-stone-500"}`}>
                  nên kiểm tra tạm thời không có đủ GradCafe mở thật vụ việc, sự việc không tiết lộ tương tự vụ việc(ngăn chặn tổng hợp/bước qua bản in thử gốc) 
                </p>
              )}
              {result.similar_cases.map((c) => {
                const real = c.source === "gradcafe" || c.source === "manual";
                return (
                  <div
                    key={c.id}
                    className={
                      tech
                        ? "tech-card-static flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between"
                        : undefined
                    }
                  >
                    {tech ? (
                      <>
                        <div className="space-y-1 text-sm">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[11px] font-medium text-cyan-200">
                              thật vụ việc · GradCafe
                            </span>
                            {c.sameProgram === false && (
                              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-medium text-amber-200">
                                giống kiểm tra gần mục
                                {c.caseProgram ? ` · ${c.caseProgram}` : ""}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-200">{c.description}</p>
                          <p className="text-slate-500">
                            GPA {c.gpa} · {c.year} · tương tự vượt qua {Math.round(c.similarity * 100)}%
                            {c.peerBand === false ? " · bước qua số tham khảo " : ""}
                            {c.peerBand === true ? " · giống số " : ""}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded px-2 py-1 text-xs font-medium text-white ${
                            c.admissionResult ? "bg-cyan-700" : "bg-slate-600"
                          }`}
                        >
                          {c.admissionResult ? " chấp nhận ứng viên vượt kỳ thi đầu vào " : " từ chối "}
                        </span>
                      </>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1 text-sm">
                            <div className="flex flex-wrap gap-1.5">
                              {real ? (
                                <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[11px] font-medium text-teal-800">
                                  thật vụ việc · GradCafe
                                </span>
                              ) : null}
                              {c.sameProgram === false && (
                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
                                  giống kiểm tra gần mục
                                  {c.caseProgram ? ` · ${c.caseProgram}` : ""}
                                </span>
                              )}
                            </div>
                            <p className="text-stone-800">{c.description}</p>
                            <p className="text-stone-500">
                              GPA {c.gpa} · {c.year} · tương tự vượt qua{" "}
                              {Math.round(c.similarity * 100)}%
                              {c.peerBand === false ? " · bước qua số tham khảo " : ""}
                              {c.peerBand === true ? " · giống số " : ""}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded px-2 py-1 text-xs font-medium text-white ${
                              c.admissionResult ? "bg-teal-700" : "bg-stone-500"
                            }`}
                          >
                            {c.admissionResult ? " chấp nhận ứng viên vượt kỳ thi đầu vào " : " từ chối "}
                          </span>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <AnalysisPanel result={result} tech={tech} />

          {tech ? (
            <Link href="/" className="tech-btn-ghost inline-flex">
              lại chọn trường học
            </Link>
          ) : (
            <Button asChild variant="outline">
              <Link href="/schools">so sánh khác trường học</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function Panel({
  tech,
  children,
}: {
  tech: boolean;
  children: React.ReactNode;
}) {
  if (tech) return <div className="tech-card-static overflow-hidden">{children}</div>;
  return <Card>{children}</Card>;
}

function PanelHead({
  tech,
  title,
  desc,
}: {
  tech: boolean;
  title: string;
  desc: string;
}) {
  if (tech) {
    return (
      <div className="space-y-1 p-5 pb-3">
        <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
        <p className="text-sm text-slate-400">{desc}</p>
      </div>
    );
  }
  return (
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{desc}</CardDescription>
    </CardHeader>
  );
}

function TechField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function FormBody({ tech, children }: { tech: boolean; children: React.ReactNode }) {
  if (tech) return <div className="p-5 pt-0">{children}</div>;
  return <CardContent>{children}</CardContent>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function EvidencePanel({ items, tech }: { items: EvidenceItem[]; tech?: boolean }) {
  const [open, setOpen] = useState(true);
  const body = (
    <div className="space-y-3 p-5 pt-0 text-sm">
      {items.map((e, i) => (
        <div
          key={i}
          className={`border-b pb-3 last:border-0 ${tech ? "border-sky-500/15" : "border-stone-100"}`}
        >
          <p className={`font-medium ${tech ? "text-slate-100" : "text-stone-800"}`}>
            {e.title}
            {e.weight ? (
              <span className={`ml-2 text-xs font-normal ${tech ? "text-slate-500" : "text-stone-500"}`}>
                [{e.weight}]
              </span>
            ) : null}
          </p>
          <p className={`mt-1 whitespace-pre-wrap ${tech ? "text-slate-400" : "text-stone-600"}`}>
            {e.detail}
          </p>
        </div>
      ))}
    </div>
  );
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Panel tech={!!tech}>
        <div className={`flex items-center justify-between ${tech ? "p-5 pb-2" : ""}`}>
          {tech ? (
            <div>
              <h3 className="text-lg font-semibold text-slate-50">dựa vào biến thể của | nguồn</h3>
              <p className="text-sm text-slate-400">có thể đi ngược dòng của đánh giá dựa vào</p>
            </div>
          ) : (
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
              <div>
                <CardTitle>dựa vào biến thể của | nguồn</CardTitle>
                <CardDescription>có thể đi ngược dòng của đánh giá dựa vào(nhấn mở ra)</CardDescription>
              </div>
            </CardHeader>
          )}
          <CollapsibleTrigger asChild>
            <button type="button" className={tech ? "tech-btn-ghost px-2 py-1" : undefined}>
              {tech ? (
                <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
              ) : (
                <Button variant="ghost" size="sm">
                  <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
                </Button>
              )}
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>{tech ? body : <CardContent className="space-y-3 text-sm">{body}</CardContent>}</CollapsibleContent>
      </Panel>
    </Collapsible>
  );
}

function AnalysisPanel({ result, tech }: { result: EvalResult; tech?: boolean }) {
  const [open, setOpen] = useState(true);
  const a = result.analysis;
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Panel tech={!!tech}>
        <div className={`flex items-center justify-between ${tech ? "p-5 pb-2" : ""}`}>
          {tech ? (
            <div>
              <h3 className="text-lg font-semibold text-slate-50">cố vấn phân tích</h3>
              <p className="text-sm text-slate-400">sự vượt trội / thua kém / Gợi ý</p>
            </div>
          ) : (
            <CardHeader className="p-0">
              <CardTitle>cố vấn phân tích</CardTitle>
              <CardDescription>sự vượt trội / thua kém / Gợi ý(không thay đổi xác suất)</CardDescription>
            </CardHeader>
          )}
          <CollapsibleTrigger asChild>
            <button type="button" className={tech ? "rounded-lg p-2 text-slate-400 hover:bg-white/5" : undefined}>
              <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className={`space-y-4 text-sm ${tech ? "p-5 pt-0" : "p-6 pt-0"}`}>
            <Section title=" sự vượt trội " items={a.strengths} tech={tech} />
            <Section title=" thua kém " items={a.weaknesses} tech={tech} />
            <Section title=" thăng chức đề xuất " items={a.suggestions} tech={tech} />
            {result.comparison && (
              <div>
                <p className={`mb-1 font-medium ${tech ? "text-slate-100" : "text-stone-800"}`}>
                  biến thể của | tương tự vụ việc so sánh
                </p>
                <p className={tech ? "text-slate-400" : "text-stone-600"}>{result.comparison}</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Panel>
    </Collapsible>
  );
}

function Section({
  title,
  items,
  tech,
}: {
  title: string;
  items: string[];
  tech?: boolean;
}) {
  if (!items?.length) return null;
  return (
    <div>
      <p className={`mb-1 font-medium ${tech ? "text-slate-100" : "text-stone-800"}`}>{title}</p>
      <ul className={`list-disc space-y-1 pl-5 ${tech ? "text-slate-400" : "text-stone-600"}`}>
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
