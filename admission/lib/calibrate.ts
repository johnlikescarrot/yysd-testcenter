import type { Case, School } from "@prisma/client";
import type { EvaluateInput } from "./validate";
import { classifyUndergrad, caseUndergradScore } from "./undergrad-tier";
import { majorFit, programDifficulty } from "./selectivity";

export type EvidenceItem = {
  type: string;
  title: string;
  detail: string;
  weight?: string;
};

export type CalibratedResult = {
  /** point estimate for ring display */
  probability: number;
  range: { low: number; high: number };
  category: " chạy nước rút " | " phối hoặc kết hôn " | " hòa vốn ";
  evidence: EvidenceItem[];
  undergrad: ReturnType<typeof classifyUndergrad>;
  difficulty: ReturnType<typeof programDifficulty>;
  major: ReturnType<typeof majorFit>;
  gap: number;
  peerCaseStats: { n: number; admitRate: number | null; source: string; realN: number };
};

type CaseLite = Pick<
  Case,
  "admissionResult" | "gpa" | "undergradSchool" | "source"
>;

type ResumeSignals = {
  research?: string[];
  internships?: string[];
  papers?: string[];
  contests?: string[];
  tags?: string[];
} | null;

function isReal(c: CaseLite) {
  return c.source === "gradcafe" || c.source === "manual";
}

export function calibrateAdmission(opts: {
  school: School;
  input: EvaluateInput;
  cases: CaseLite[];
  resume?: ResumeSignals;
}): CalibratedResult {
  const { school, input, cases, resume } = opts;
  const undergrad = classifyUndergrad(input.undergradSchool);
  const difficulty = programDifficulty(school);
  const major = majorFit(input.undergradMajor, school.field);
  const gap = difficulty.score - undergrad.score; // >0 = reach

  const realAll = cases.filter(isReal);
  const synthAll = cases.filter((c) => !isReal(c));

  const peerReal = realAll.filter((c) => {
    const s = caseUndergradScore(c.undergradSchool);
    return Math.abs(s - undergrad.score) <= 1;
  });
  const peerSynth = synthAll.filter((c) => {
    const s = caseUndergradScore(c.undergradSchool);
    return Math.abs(s - undergrad.score) <= 1;
  });

  // Prefer real GradCafe samples; fall back to synthetic only if needed
  let useCases: CaseLite[];
  let caseSource: string;
  if (peerReal.length >= 5) {
    useCases = peerReal;
    caseSource = `GradCafe thật tự thông báo(giống số n=${peerReal.length})`;
  } else if (realAll.length >= 5) {
    useCases = realAll;
    caseSource = `GradCafe thật tự thông báo(bước qua số lẻn vào, giống số hầu như ${peerReal.length})`;
  } else if (peerReal.length + peerSynth.length >= 5) {
    useCases = [...peerReal, ...peerSynth];
    caseSource = `thật ${peerReal.length} + tổng hợp giống số ${peerSynth.length}(thật mẫu không đủ)`;
  } else {
    useCases = cases.length ? cases : [];
    caseSource = useCases.length
      ? " vụ việc không đủ, bùn sử dụng tất cả nhà kho mẫu(mức độ đáng tin cậy thấp)"
      : " không thể sử dụng vụ việc, hầu như sử dụng có tính chọn lọc mô hình ";
  }

  let admitRate: number | null = null;
  if (useCases.length >= 5) {
    admitRate =
      useCases.filter((c) => c.admissionResult).length / useCases.length;
  }

  // --- score in 0-100 ---
  let p = 50;

  if (gap >= 3) p = 8;
  else if (gap === 2) p = 14;
  else if (gap === 1) p = 28;
  else if (gap === 0) p = 48;
  else if (gap === -1) p = 62;
  else p = 72;

  const gpaDelta = input.gpa - school.avgGpa;
  p += gpaDelta * 28;

  if (school.minToefl != null && input.toefl != null) {
    p += Math.min(8, Math.max(-12, (input.toefl - school.minToefl - 5) * 0.4));
  }
  if (school.minIelts != null && input.ielts != null) {
    p += Math.min(8, Math.max(-12, (input.ielts - school.minIelts - 0.5) * 6));
  }

  p += (major.score - 0.6) * 22;

  const researchN = resume?.research?.length ?? 0;
  const paperN = resume?.papers?.length ?? 0;
  const internN = resume?.internships?.length ?? 0;
  if (paperN > 0) p += 6;
  if (researchN > 0) p += Math.min(5, researchN * 2);
  if (internN > 0) p += Math.min(4, internN);
  if (difficulty.score >= 5 && researchN === 0 && paperN === 0) p -= 8;

  // Soft blend: real peer rate > official rate > synthetic rate
  if (admitRate != null && (peerReal.length >= 5 || realAll.length >= 5)) {
    p = p * 0.65 + admitRate * 100 * 0.35;
  } else if (admitRate != null && peerSynth.length >= 5) {
    p = p * 0.75 + admitRate * 100 * 0.25;
  }
  if (school.admitRateOfficial != null) {
    p = p * 0.9 + school.admitRateOfficial * 100 * 0.1;
  }

  if (gap >= 3) p = Math.min(p, 12);
  else if (gap === 2) p = Math.min(p, 22);
  else if (gap === 1) p = Math.min(p, 40);
  if (gap <= -1) p = Math.max(p, 45);

  p = clamp(p, 3, 92);

  const realN = realAll.length;
  const spread =
    peerReal.length >= 8 ? 5 : peerReal.length >= 5 ? 7 : realN >= 5 ? 9 : 12;
  const low = clamp(Math.round(p - spread), 2, 90);
  const high = clamp(Math.round(p + spread), low + 2, 95);
  const mid = Math.round((low + high) / 2);

  let category: CalibratedResult["category"];
  if (gap >= 1 || mid < 35) category = " chạy nước rút ";
  else if (mid >= 60 && gap <= 0) category = " hòa vốn ";
  else category = " phối hoặc kết hôn ";
  if (mid < 30) category = " chạy nước rút ";
  if (mid >= 65 && gap <= 0) category = " hòa vốn ";

  const evidence: EvidenceItem[] = [
    {
      type: "official_threshold",
      title: " mục bậc cửa(nhà kho bên trong tương tự/mở lỗ khoan)",
      detail: `${school.name} ${school.program}: minGPA ${school.minGpa}, chia cân trong cân đĩa hoặc trên cân ${school.avgGpa}, TOEFL≥${school.minToefl ?? "-"}, IELTS≥${school.minIelts ?? "-"} cột ghi chú: ${school.admissionRequirements.slice(0, 160)}`,
      weight: " cứng hạn chế ",
    },
  ];

  if (school.admitRateOfficial != null) {
    evidence.push({
      type: "official_admit_rate",
      title: " mở/tương tự tỷ lệ chấp nhận(có thể trích dẫn)",
      detail: `cân trong cân đĩa hoặc trên cân ${(school.admitRateOfficial * 100).toFixed(0)}%(${school.admitRateYear ?? " năm cụ thể chưa đánh dấu "}) ${school.admitRateSource ?? ""} Lưu ý: nhiều làm mục/trường cao đẳng lỗ khoan tương tự, viết tắt của cá nhân bảo đảm `,
      weight: " tham khảo ",
    });
  }

  if (school.admitRateGradcafe != null && school.gradcafeSampleSize) {
    evidence.push({
      type: "gradcafe_rate",
      title: "GradCafe tự thông báo mẫu tỷ lệ chấp nhận ",
      detail: `gốc mục nhà kho bên trong GradCafe mẫu n=${school.gradcafeSampleSize}, tự vé vào kỳ thi hoàng gia lấy tỉ lệ cân trong cân đĩa hoặc trên cân ${(school.admitRateGradcafe * 100).toFixed(0)}% tự thông báo may mắn thay tồn tại người mà thiên lệch, hầu như công nhân bằng chứng gián tiếp `,
      weight: " bằng chứng gián tiếp ",
    });
  }

  evidence.push(
    {
      type: "selectivity",
      title: " có tính chọn lọc biến thể của | khóa học đại học hạng sự khác biệt ",
      detail: `khóa học đại học«${undergrad.label}»(${undergrad.score}/5) vs mục«${difficulty.label}»(${difficulty.score}/5), hạng sự khác biệt gap=${gap}(>0 làm chạy nước rút) dựa vào: ${undergrad.source} + ${difficulty.source}`,
      weight: " chủ quyền lặp lại ",
    },
    {
      type: "major_fit",
      title: " chuyên môn phối hoặc kết hôn ",
      detail: `${major.label}(fit=${major.score}) người nộp đơn chuyên môn: ${input.undergradMajor} → mục tiêu field=${school.field}`,
      weight: " trong ",
    },
    {
      type: "peer_cases",
      title: " vụ việc mẫu ",
      detail: `${caseSource} Sử dụng n=${useCases.length}${admitRate != null ? `, giống ao tỷ lệ chấp nhận cân trong cân đĩa hoặc trên cân ${(admitRate * 100).toFixed(0)}%` : ""} thật vụ việc có ưu tiên đi tổng hợp giảm mẫn cảm mẫu `,
      weight: peerReal.length >= 5 ? " Trung Quốc cao " : realN >= 5 ? " trong " : " thấp ",
    },
    {
      type: "profile",
      title: " thành tích biến thể của | liệu tín hiệu ",
      detail: `GPA ${input.gpa}(tương đối chia ${gpaDelta >= 0 ? "+" : ""}${gpaDelta.toFixed(2)}); ngôn ngữ TOEFL ${input.toefl ?? "-"} / IELTS ${input.ielts ?? "-"}; sơ yếu lý lịch tín hiệu research=${researchN}, papers=${paperN}, internships=${internN}`,
      weight: " trong ",
    },
    {
      type: "disclaimer",
      title: " không chính thức phát biểu ",
      detail:
        " gốc kết trái làm cố vấn lỗ khoan sự đánh giá(chạy nước rút/phối hoặc kết hôn/hòa vốn + khu vực giới hạn), không phải trường cao đẳng chính phủ cá nhân chấp nhận ứng viên vượt kỳ thi đầu vào quyết định GradCafe làm người nộp đơn tự thông báo; mở tỷ lệ chấp nhận làm lịch sử/tương tự thống kê chấp nhận ứng viên vượt kỳ thi đầu vào vẫn phụ thuộc vào thư giới thiệu, tài liệu, tạo mối quan hệ tốt với ai đó, chỉ tiêu biến thể của | những ngày đó cạnh tranh ao ",
      weight: " nhất định dấu phẩy ",
    }
  );

  return {
    probability: mid,
    range: { low, high },
    category,
    evidence,
    undergrad,
    difficulty,
    major,
    gap,
    peerCaseStats: {
      n: useCases.length,
      admitRate,
      source: caseSource,
      realN,
    },
  };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
