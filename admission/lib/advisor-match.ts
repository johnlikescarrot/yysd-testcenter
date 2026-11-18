import { prisma } from "@/lib/db";
import { qwenChat } from "@/lib/qwen";
import { FIELD_LABELS, type Field } from "@/lib/catalog-labels";
import {
  type AdvisorBackground,
  fitNotes,
  fitPenalty,
} from "@/lib/advisor-bg";

export type AdvisorProgramHit = {
  id: string;
  program: string;
  programZh: string | null;
  degree: string;
  field: string;
  fieldLabel: string;
  blurb: string | null;
  duration: string | null;
  isStem: boolean | null;
  why: string;
  fitNotes?: string[];
};

function scoreProgram(
  query: string,
  p: {
    program: string;
    programZh: string | null;
    field: string;
    blurb: string | null;
    summaryOfficial: string | null;
    admissionRequirements: string;
  }
): number {
  const q = query.toLowerCase();
  const bag = [
    p.program,
    p.programZh || "",
    p.field,
    FIELD_LABELS[p.field as Field] || "",
    p.blurb || "",
    p.summaryOfficial || "",
    p.admissionRequirements,
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  const tokens = q
    .split(/[\s,, , /|]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  for (const t of tokens) {
    if (bag.includes(t)) score += 3;
  }

  const aliases: Array<[RegExp, string[]]> = [
    [/dữ liệu|phân tích|analytics|data/i, ["data", "analytics", " thống kê ", "data science", "business analytics"]],
    [/nhân tạo.?thông minh|máy móc học|ai\b|machine learning/i, ["artificial intelligence", "machine learning", "ai", " dữ liệu "]],
    [/máy tính|phần mềm|lập trình|cs\b|coding|software/i, ["computer science", "software", "cyber"]],
    [/ngân hàng|định lượng|finance|quant/i, ["finance", "financial engineering", " ngân hàng "]],
    [/công ty IT Thương Khoa|Quản lý|mba|business/i, ["business", "management", "analytics"]],
    [/điện|điện tử|kỹ thuật|ee\b|engineering/i, ["electrical", "mechanical", "engineering"]],
    [/thiết kế|nghệ thuật|design|media/i, ["design", "media"]],
    [/Luật|llm|law/i, ["law", "llm"]],
    [/Giáo dục|education/i, ["education"]],
    [/công cộng.?sức khỏe|Sinh học|Sức khỏe|health|bio/i, ["public health", "biotech", "biology"]],
    [/Toán|Vật lý|khoa học tự nhiên|math|physics/i, ["mathematics", "physics"]],
    [/quốc tế.?quan hệ|khoa học xã hội|Xã hội/i, ["international relations", "sociology"]],
  ];
  for (const [re, keys] of aliases) {
    if (re.test(query)) {
      for (const k of keys) {
        if (bag.includes(k.toLowerCase())) score += 4;
      }
    }
  }
  return score;
}

export async function matchProgramsForSchool(
  schoolName: string,
  userMessage: string,
  limit = 8,
  background?: AdvisorBackground | null
): Promise<{ reply: string; programs: AdvisorProgramHit[]; needClarify: boolean }> {
  const programs = await prisma.school.findMany({
    where: { name: schoolName },
    orderBy: [{ tier: "asc" }, { program: "asc" }],
  });

  const verified = programs.filter((p) => p.verifiedAt != null);
  // ponytail: Top schools hide template filler once any verified row exists
  const pool = verified.length ? verified : programs;

  if (!pool.length) {
    return {
      reply: `nhà kho Trung Quốc tạm thời không có ${schoolName} của học viên cao học mục, mời trao đổi một thực ra trường học có thể một lát nữa thử lại `,
      programs: [],
      needClarify: false,
    };
  }

  function toHit(p: (typeof pool)[number], why: string): AdvisorProgramHit {
    const notes = fitNotes(p, background);
    return {
      id: p.id,
      program: p.program,
      programZh: p.programZh,
      degree: p.degree,
      field: p.field,
      fieldLabel: FIELD_LABELS[p.field as Field] || p.field,
      blurb: p.blurb,
      duration: p.duration,
      isStem: p.isStem,
      why: notes.length ? `${why}; ${notes[0]}` : why,
      fitNotes: notes,
    };
  }

  const scored = pool
    .map((p) => {
      const interest = scoreProgram(userMessage, p);
      const notes = fitNotes(p, background);
      return { p, score: interest, penalty: fitPenalty(notes) };
    })
    .sort((a, b) => b.score - a.score || a.penalty - b.penalty);

  const topScore = scored[0]?.score ?? 0;
  const needClarify = topScore < 3 || userMessage.trim().length < 4;

  if (needClarify) {
    if (verified.length) {
      return {
        reply:
          " có thể nói lại cụ thể một chút gì?? ví dụ: dữ liệu khoa học / trí tuệ nhân tạo / kinh doanh phân tích / kỹ thuật giám sát bên dưới trước liệt kê nên kiểm tra đã hạt nhân biến thể của | của học viên cao học mục, cung cấp bạn xem lướt(nên kiểm tra không nhất thiết có truyền thống«máy tính MS»nở hoa mục) ",
        programs: verified.slice(0, limit).map((p) => toHit(p, " nên kiểm tra đã hạt nhân biến thể của | mục ")),
        needClarify: true,
      };
    }
    return {
      reply:
        " có thể nói lại cụ thể một chút gì?? ví dụ: dữ liệu khoa học / trí tuệ nhân tạo / máy tính / ngân hàng kỹ thuật / kinh doanh phân tích / kỹ thuật điện cũng có thể sử dụng nói một lời mô tả hứng thú hướng(nghiêng định lượng, nghiêng phát triển phần mềm, nghiêng công cộng chính sách đợi) ",
      programs: [],
      needClarify: true,
    };
  }

  const hits = scored.filter((s) => s.score > 0).slice(0, limit);
  const use = hits.length ? hits : scored.slice(0, Math.min(5, scored.length));
  const mapped = use.map(({ p, score }) =>
    toHit(p, score > 0 ? " biến thể của | bạn của hứng thú mô tả phối hoặc kết hôn " : " nên kiểm tra phổ biến học viên cao học mục(liên quan vượt qua giống, cung cấp xem lướt)")
  );

  let reply = `theo bạn của hứng thú${background ? " biến thể của | bối cảnh " : ""}, tôi tồn tại«${schoolName}»mục nhà kho Trung Quốc lọc hoàn thành mức đó hoặc thấp hơn liên quan chuyên môn mời kết hợp sự thích nghi chỉ ra xem xét chi tiết, thích hợp có thể trực tiếp nộp đơn xin đánh giá `;

  try {
    const raw = await qwenChat(
      [
        {
          role: "system",
          content:
            " bạn là du học chọn kiểm tra cố vấn trợ lý chỉ có thể bởi vì nêu ra trước của mục danh sách làm đề xuất giải thích, cấm biên soạn danh sách bên ngoài của chuyên môn dường như đề nghị hoàn thành nộp đơn xin bối cảnh, có thể ngắn gọn nhắc đến GPA/ngôn ngữ cổng AND lan can của phối hoặc kết hôn quan hệ, nhưng đừng! biên soạn chưa cho đi ra của điểm sử dụng chữ Hán giản thể ngôn ngữ Trung Quốc, 2–4 Câu, giọng điệu chuyên môn ngắn gọn ",
        },
        {
          role: "user",
          content: JSON.stringify({
            school: schoolName,
            interest: userMessage,
            background: background
              ? {
                  gpa: background.gpa,
                  toefl: background.toefl,
                  ielts: background.ielts,
                  undergradSchool: background.undergradSchool,
                  undergradMajor: background.undergradMajor,
                }
              : null,
            programs: mapped.map((m) => ({
              zh: m.programZh,
              en: m.program,
              degree: m.degree,
              field: m.fieldLabel,
              fit: m.fitNotes,
            })),
          }),
        },
      ],
      { temperature: 0.3, maxTokens: 400 }
    );
    if (raw.trim()) reply = raw.trim();
  } catch {
    /* keep template reply */
  }

  return { reply, programs: mapped, needClarify: false };
}
