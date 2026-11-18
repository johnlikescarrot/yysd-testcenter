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
  category?: " chạy nước rút " | " xứng đôi " | " giữ gốc ";
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
  const [gpa, setGpa] = useState(initial?.gpa?? "3.42");
  const [toefl, setToefl] = useState(initial?.toefl?? "100");
  const [ielts, setIelts] = useState(initial?.ielts?? "");
  const [gre, setGre] = useState(initial?.gre?? "");
  const [undergradSchool, setUndergradSchool] = useState(
    initial?.undergradSchool?? "THE PENNSYLVANIA STATE UNIVERSITY"
  );
  const [undergradMajor, setUndergradMajor] = useState(
    initial?.undergradMajor?? "Social Data Analytics"
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

      // basePath=/admission — absolute /api/* would hit the static site (HTML 404)
      const res = await fetch("/admission/api/evaluate", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || " ước định thất bại ");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error? err.message: " ước định thất bại ");
    } finally {
      setLoading(false);
    }
  }

  const dropCls = tech
    ? `mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-sm text-slate-400 ${
        dragOver? "border-sky-400 bg-sky-500/10": "border-sky-500/30"
      }`
    : `mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-8 text-sm text-stone-600 ${
        dragOver? "border-stone-800 bg-stone-50": "border-stone-300"
      }`;

  return (
    <div className="space-y-8">
      <Panel tech={tech}>
        <PanelHead
          tech={tech}
          title=" điền bối cảnh cũng ước định "
          desc={` mục tiêu: ${schoolName}${useMock? " · Mock": " · hiệu chỉnh động cơ tập trung xác suất "}`}
        />
        <FormBody tech={tech}>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            {tech? (
              <>
                <TechField label="GPA (4.0)">
                  <input className="tech-input" type="number" step="0.01" min="0" max="4.5" required value={gpa} onChange={(e) => setGpa(e.target.value)} />
                </TechField>
                <TechField label="TOEFL (có thể chọn) ">
                  <input className="tech-input" type="number" min="0" max="120" value={toefl} onChange={(e) => setToefl(e.target.value)} />
                </TechField>
                <TechField label="IELTS (có thể chọn) ">
                  <input className="tech-input" type="number" step="0.5" min="0" max="9" value={ielts} onChange={(e) => setIelts(e.target.value)} />
                </TechField>
                <TechField label="GRE (có thể chọn) ">
                  <input className="tech-input" type="number" min="260" max="340" value={gre} onChange={(e) => setGre(e.target.value)} />
                </TechField>
                <TechField label=" Đại học viện giáo ">
                  <input className="tech-input" required value={undergradSchool} onChange={(e) => setUndergradSchool(e.target.value)} />
                </TechField>
                <TechField label=" Đại học chuyên nghiệp ">
                  <input className="tech-input" required value={undergradMajor} onChange={(e) => setUndergradMajor(e.target.value)} />
                </TechField>
              </>
            ): (
              <>
                <Field label="GPA (4.0)">
                  <Input type="number" step="0.01" min="0" max="4.5" required value={gpa} onChange={(e) => setGpa(e.target.value)} />
                </Field>
                <Field label="TOEFL (có thể chọn) ">
                  <Input type="number" min="0" max="120" value={toefl} onChange={(e) => setToefl(e.target.value)} />
                </Field>
                <Field label="IELTS (có thể chọn) ">
                  <Input type="number" step="0.5" min="0" max="9" value={ielts} onChange={(e) => setIelts(e.target.value)} />
                </Field>
                <Field label="GRE (có thể chọn) ">
                  <Input type="number" min="260" max="340" value={gre} onChange={(e) => setGre(e.target.value)} />
                </Field>
                <Field label=" Đại học viện giáo ">
                  <Input required value={undergradSchool} onChange={(e) => setUndergradSchool(e.target.value)} />
                </Field>
                <Field label=" Đại học chuyên nghiệp ">
                  <Input required value={undergradMajor} onChange={(e) => setUndergradMajor(e.target.value)} />
                </Field>
              </>
            )}
            <div className="sm:col-span-2">
              {tech? (
                <label className="text-sm text-slate-400"> lý lịch sơ lược PDF / Word (Giải thích đáp án sau khó giữ được lưu Bài gốc kiện) </label>
              ): (
                <Label> lý lịch sơ lược PDF / Word (Giải thích đáp án sau khó giữ được lưu Bài gốc kiện) </Label>
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
                {resumeFile? resumeFile.name: " kéo PDF / DOC / DOCX, hoặc nhấn vào lựa chọn "}
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
              {tech? (
                <button type="submit" disabled={loading} className="tech-btn w-full sm:w-auto">
                  {loading? " ước định Vừa …": " Bắt đầu ước định "}
                </button>
              ): (
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading? " ước định Vừa …": " Bắt đầu ước định "}
                </Button>
              )}
            </div>
          </form>
          {error && (
            <p className={`mt-4 text-sm ${tech? "text-rose-300": "text-red-600"}`}>
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
              title=" trúng tuyển xác xuất thành công tính ra "
              desc={` cố vấn đường kính tính ra · không phải viện giáo chính thức tỷ số trúng tuyển ${result.calibrated? " · đã hiệu chỉnh ": ""}`}
            />
            <div className={`flex justify-center py-6 ${tech? "px-5": ""}`}>
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
            <h3 className={`mb-3 text-lg font-semibold ${tech? "text-slate-50": ""}`}>
               tương tự án lệ
            </h3>
            <p className={`mb-3 text-xs ${tech? "text-slate-500": "text-stone-500"}`}>
               chỉ biểu hiện ra trường chúng ta GradCafe chân thật tự báo; trước mắt hạng mục chưa đủ lúc lui trở về cùng trường gần hạng mục. không biểu hiện ra hợp thành hàng mẫu cùng với khác đại học án lệ.
              {result.similar_scope === "field" || result.similar_scope === "school"
                ? " (dưới đây hàm cùng trường Khác tương quan hạng mục) "
                : ""}
            </p>
            <div className="grid gap-3">
              {result.similar_cases.length === 0 && (
                <p className={`text-sm ${tech? "text-slate-500": "text-stone-500"}`}>
                   cai giáo tạm thời chưa có đầy đủ GradCafe công khai chân thật án lệ, cố không biểu hiện ra tương tự án lệ (tránh cho hợp thành / vượt qua so mẫu bản).
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
                    {tech? (
                      <>
                        <div className="space-y-1 text-sm">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[11px] font-medium text-cyan-200">
                               chân thật án lệ · GradCafe
                            </span>
                            {c.sameProgram === false && (
                              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-medium text-amber-200">
                                 cùng trường gần hạng mục
                                {c.caseProgram? ` · ${c.caseProgram}`: ""}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-200">{c.description}</p>
                          <p className="text-slate-500">
                            GPA {c.gpa} · {c.year} · tương tự độ {Math.round(c.similarity * 100)}%
                            {c.peerBand === false? " · vượt qua đương tham khảo ": ""}
                            {c.peerBand === true? " · cùng đương ": ""}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded px-2 py-1 text-xs font-medium text-white ${
                            c.admissionResult? "bg-cyan-700": "bg-slate-600"
                          }`}
                        >
                          {c.admissionResult? " trúng tuyển ": " cự tuyệt "}
                        </span>
                      </>
                    ): (
                      <Card>
                        <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1 text-sm">
                            <div className="flex flex-wrap gap-1.5">
                              {real? (
                                <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[11px] font-medium text-teal-800">
                                   chân thật án lệ · GradCafe
                                </span>
                              ): null}
                              {c.sameProgram === false && (
                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
                                   cùng trường gần hạng mục
                                  {c.caseProgram? ` · ${c.caseProgram}`: ""}
                                </span>
                              )}
                            </div>
                            <p className="text-stone-800">{c.description}</p>
                            <p className="text-stone-500">
                              GPA {c.gpa} · {c.year} · tương tự độ {" "}
                              {Math.round(c.similarity * 100)}%
                              {c.peerBand === false? " · vượt qua đương tham khảo ": ""}
                              {c.peerBand === true? " · cùng đương ": ""}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded px-2 py-1 text-xs font-medium text-white ${
                              c.admissionResult? "bg-teal-700": "bg-stone-500"
                            }`}
                          >
                            {c.admissionResult? " trúng tuyển ": " cự tuyệt "}
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

          {tech? (
            <Link href="/" className="tech-btn-ghost inline-flex">
               lựa chọn lần nữa trường học
            </Link>
          ): (
            <Button asChild variant="outline">
              <Link href="/schools"> đối lập trường học khác </Link>
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
          className={`border-b pb-3 last:border-0 ${tech? "border-sky-500/15": "border-stone-100"}`}
        >
          <p className={`font-medium ${tech? "text-slate-100": "text-stone-800"}`}>
            {e.title}
            {e.weight? (
              <span className={`ml-2 text-xs font-normal ${tech? "text-slate-500": "text-stone-500"}`}>
                [{e.weight}]
              </span>
            ): null}
          </p>
          <p className={`mt-1 whitespace-pre-wrap ${tech? "text-slate-400": "text-stone-600"}`}>
            {e.detail}
          </p>
        </div>
      ))}
    </div>
  );
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Panel tech={!!tech}>
        <div className={`flex items-center justify-between ${tech? "p-5 pb-2": ""}`}>
          {tech? (
            <div>
              <h3 className="text-lg font-semibold text-slate-50"> căn cứ và nơi phát ra </h3>
              <p className="text-sm text-slate-400"> có thể ngược dòng tìm hiểu ước định căn cứ </p>
            </div>
          ): (
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
              <div>
                <CardTitle> căn cứ và nơi phát ra </CardTitle>
                <CardDescription> có thể ngược dòng tìm hiểu ước định căn cứ (nhấn vào triển khai) </CardDescription>
              </div>
            </CardHeader>
          )}
          <CollapsibleTrigger asChild>
            <button type="button" className={tech? "tech-btn-ghost px-2 py-1": undefined}>
              {tech? (
                <ChevronDown className={`h-4 w-4 transition ${open? "rotate-180": ""}`} />
              ): (
                <Button variant="ghost" size="sm">
                  <ChevronDown className={`h-4 w-4 transition ${open? "rotate-180": ""}`} />
                </Button>
              )}
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>{tech? body: <CardContent className="space-y-3 text-sm">{body}</CardContent>}</CollapsibleContent>
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
        <div className={`flex items-center justify-between ${tech? "p-5 pb-2": ""}`}>
          {tech? (
            <div>
              <h3 className="text-lg font-semibold text-slate-50"> cố vấn phân tích </h3>
              <p className="text-sm text-slate-400"> ưu thế / hoàn cảnh xấu / đề nghị </p>
            </div>
          ): (
            <CardHeader className="p-0">
              <CardTitle> cố vấn phân tích </CardTitle>
              <CardDescription> ưu thế / hoàn cảnh xấu / đề nghị (không thay đổi di chuyển xác suất) </CardDescription>
            </CardHeader>
          )}
          <CollapsibleTrigger asChild>
            <button type="button" className={tech? "rounded-lg p-2 text-slate-400 hover:bg-white/5": undefined}>
              <ChevronDown className={`h-4 w-4 transition ${open? "rotate-180": ""}`} />
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className={`space-y-4 text-sm ${tech? "p-5 pt-0": "p-6 pt-0"}`}>
            <Section title=" ưu thế " items={a.strengths} tech={tech} />
            <Section title=" hoàn cảnh xấu " items={a.weaknesses} tech={tech} />
            <Section title=" tăng lên đề nghị " items={a.suggestions} tech={tech} />
            {result.comparison && (
              <div>
                <p className={`mb-1 font-medium ${tech? "text-slate-100": "text-stone-800"}`}>
                   và tương tự án lệ đối lập
                </p>
                <p className={tech? "text-slate-400": "text-stone-600"}>{result.comparison}</p>
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
      <p className={`mb-1 font-medium ${tech? "text-slate-100": "text-stone-800"}`}>{title}</p>
      <ul className={`list-disc space-y-1 pl-5 ${tech? "text-slate-400": "text-stone-600"}`}>
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
