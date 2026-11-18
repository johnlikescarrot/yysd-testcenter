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
  category: " chạy nước rút " | " xứng đôi " | " giữ gốc ";
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
  const synthAll = cases.filter((c) =>!isReal(c));

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
    caseSource = `GradCafe tự báo cáo thực tế (cùng đương n=${peerReal.length}) `;
  } else if (realAll.length >= 5) {
    useCases = realAll;
    caseSource = `GradCafe tự báo cáo thực tế (vượt qua đương lẫn vào, cùng đương chỉ ${peerReal.length}) `;
  } else if (peerReal.length + peerSynth.length >= 5) {
    useCases = [...peerReal,...peerSynth];
    caseSource = ` chân thật ${peerReal.length} + hợp thành cùng đương ${peerSynth.length} (chân thật hàng mẫu chưa đủ) `;
  } else {
    useCases = cases.length? cases: [];
    caseSource = useCases.length
      ? " án lệ chưa đủ, lẫn vào dùng toàn bộ kho hàng mẫu (có độ tin cậy thấp) "
      : " không thể dùng án lệ, chỉ dùng lựa chọn tính mô hình ";
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

  if (school.minToefl!= null && input.toefl!= null) {
    p += Math.min(8, Math.max(-12, (input.toefl - school.minToefl - 5) * 0.4));
  }
  if (school.minIelts!= null && input.ielts!= null) {
    p += Math.min(8, Math.max(-12, (input.ielts - school.minIelts - 0.5) * 6));
  }

  p += (major.score - 0.6) * 22;

  const researchN = resume?.research?.length?? 0;
  const paperN = resume?.papers?.length?? 0;
  const internN = resume?.internships?.length?? 0;
  if (paperN > 0) p += 6;
  if (researchN > 0) p += Math.min(5, researchN * 2);
  if (internN > 0) p += Math.min(4, internN);
  if (difficulty.score >= 5 && researchN === 0 && paperN === 0) p -= 8;

  // Soft blend: real peer rate > official rate > synthetic rate
  if (admitRate!= null && (peerReal.length >= 5 || realAll.length >= 5)) {
    p = p * 0.65 + admitRate * 100 * 0.35;
  } else if (admitRate!= null && peerSynth.length >= 5) {
    p = p * 0.75 + admitRate * 100 * 0.25;
  }
  if (school.admitRateOfficial!= null) {
    p = p * 0.9 + school.admitRateOfficial * 100 * 0.1;
  }

  if (gap >= 3) p = Math.min(p, 12);
  else if (gap === 2) p = Math.min(p, 22);
  else if (gap === 1) p = Math.min(p, 40);
  if (gap <= -1) p = Math.max(p, 45);

  p = clamp(p, 3, 92);

  const realN = realAll.length;
  const spread =
    peerReal.length >= 8? 5: peerReal.length >= 5? 7: realN >= 5? 9: 12;
  const low = clamp(Math.round(p - spread), 2, 90);
  const high = clamp(Math.round(p + spread), low + 2, 95);
  const mid = Math.round((low + high) / 2);

  let category: CalibratedResult["category"];
  if (gap >= 1 || mid < 35) category = " chạy nước rút ";
  else if (mid >= 60 && gap <= 0) category = " giữ gốc ";
  else category = " xứng đôi ";
  if (mid < 30) category = " chạy nước rút ";
  if (mid >= 65 && gap <= 0) category = " giữ gốc ";

  const evidence: EvidenceItem[] = [
    {
      type: "official_threshold",
      title: " hạng mục cánh cửa (kho bên trong xấp xỉ / công khai đường kính) ",
      detail: `${school.name} ${school.program}: minGPA ${school.minGpa}, chia đều ước ${school.avgGpa}, TOEFL≥${school.minToefl?? "—"}, IELTS≥${school.minIelts?? "—"}. ghi chú: ${school.admissionRequirements.slice(0, 160)}`,
      weight: " cứng rắn ước thúc ",
    },
  ];

  if (school.admitRateOfficial!= null) {
    evidence.push({
      type: "official_admit_rate",
      title: " công khai / xấp xỉ tỷ số trúng tuyển (có thể trích dẫn) ",
      detail: ` ước ${(school.admitRateOfficial * 100).toFixed(0)}% (${school.admitRateYear?? " năm không nhãn hiệu "}). ${school.admitRateSource?? ""}. chú ý: đa số hạng mục / học viện đường kính xấp xỉ, không phải cá nhân cam đoan. `,
      weight: " tham khảo ",
    });
  }

  if (school.admitRateGradcafe!= null && school.gradcafeSampleSize) {
    evidence.push({
      type: "gradcafe_rate",
      title: "GradCafe tự báo hàng mẫu tỷ số trúng tuyển ",
      detail: ` bản hạng mục kho bên trong GradCafe hàng mẫu n=${school.gradcafeSampleSize}, tự báo tỷ số trúng tuyển ước ${(school.admitRateGradcafe * 100).toFixed(0)}%. tự báo may mắn người còn sống độ lệch, chỉ làm bằng chứng phụ. `,
      weight: " bằng chứng phụ ",
    });
  }

  evidence.push(
    {
      type: "selectivity",
      title: " lựa chọn tính và Đại học cấp bậc chênh lệch ",
      detail: ` Đại học «${undergrad.label}»(${undergrad.score}/5) vs hạng mục «${difficulty.label}»(${difficulty.score}/5), cấp bậc chênh lệch gap=${gap} (>0 là chạy nước rút). căn cứ: ${undergrad.source} + ${difficulty.source}`,
      weight: " chủ quyền trọng ",
    },
    {
      type: "major_fit",
      title: " chuyên nghiệp xứng đôi ",
      detail: `${major.label} (fit=${major.score}). thân thỉnh người chuyên nghiệp: ${input.undergradMajor} → mục tiêu field=${school.field}`,
      weight: " Vừa ",
    },
    {
      type: "peer_cases",
      title: " án lệ hàng mẫu ",
      detail: `${caseSource}. sử dụng n=${useCases.length}${admitRate!= null? `, cùng trì tỷ số trúng tuyển ước ${(admitRate * 100).toFixed(0)}%`: ""}. chân thật án lệ ưu tiên tại hợp thành đã ẩn danh hàng mẫu. `,
      weight: peerReal.length >= 5? " Vừa cao ": realN >= 5? " Vừa ": " thấp ",
    },
    {
      type: "profile",
      title: " Điểm số và tài liệu tín hiệu ",
      detail: `GPA ${input.gpa} (tương đối chia đều ${gpaDelta >= 0? "+": ""}${gpaDelta.toFixed(2)}); ngôn ngữ TOEFL ${input.toefl?? "—"} / IELTS ${input.ielts?? "—"}; lý lịch sơ lược tín hiệu research=${researchN}, papers=${paperN}, internships=${internN}`,
      weight: " Vừa ",
    },
    {
      type: "disclaimer",
      title: " không chính thức thanh minh ",
      detail:
        " bản kết quả là cố vấn đường kính tính ra (chạy nước rút / xứng đôi / giữ gốc + khu lúc giữa), không phải viện giáo chính thức cá nhân trúng tuyển quyết định. GradCafe là thân thỉnh người tự báo; công khai tỷ số trúng tuyển là Lịch sử / xấp xỉ công tác thống kê. trúng tuyển còn quyết định bởi tại thư đề cử, công văn, bộ từ, danh ngạch và năm đó cạnh tranh trì. ",
      weight: " tất đọc ",
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
