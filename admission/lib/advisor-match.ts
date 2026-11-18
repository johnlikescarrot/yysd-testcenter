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
    .split(/[\s,,, /|]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  for (const t of tokens) {
    if (bag.includes(t)) score += 3;
  }

  const aliases: Array<[RegExp, string[]]> = [
    [/ số liệu | phân tích |analytics|data/i, ["data", "analytics", " công tác thống kê ", "data science", "business analytics"]],
    [/ nhân công.? trí tuệ nhân tạo | máy móc Học tập |ai\b|machine learning/i, ["artificial intelligence", "machine learning", "ai", " số liệu "]],
    [/ Máy tính | phần mềm | lập trình |cs\b|coding|software/i, ["computer science", "software", "cyber"]],
    [/ tài chính | định lượng |finance|quant/i, ["finance", "financial engineering", " tài chính "]],
    [/ Kinh doanh | Quản trị |mba|business/i, ["business", "management", "analytics"]],
    [/ điện khí | điện tử | công trình |ee\b|engineering/i, ["electrical", "mechanical", "engineering"]],
    [/ xếp đặt thiết kế | Nghệ thuật |design|media/i, ["design", "media"]],
    [/ pháp luật |llm|law/i, ["law", "llm"]],
    [/ Giáo dục |education/i, ["education"]],
    [/ công cộng.? vệ sinh | Sinh học | Sức khỏe |health|bio/i, ["public health", "biotech", "biology"]],
    [/ Toán học | Vật lý | khoa học tự nhiên |math|physics/i, ["mathematics", "physics"]],
    [/ quốc tế.? quan hệ | xã khoa | xã hội /i, ["international relations", "sociology"]],
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

  const verified = programs.filter((p) => p.verifiedAt!= null);
  // ponytail: Top schools hide template filler once any verified row exists
  const pool = verified.length? verified: programs;

  if (!pool.length) {
    return {
      reply: ` trong kho tạm thời chưa có ${schoolName} nghiên cứu sinh hạng mục, mời đổi một chỗ trường học hoặc sau đó Thử lại. `,
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
      why: notes.length? `${why}; ${notes[0]}`: why,
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

  const topScore = scored[0]?.score?? 0;
  const needClarify = topScore < 3 || userMessage.trim().length < 4;

  if (needClarify) {
    if (verified.length) {
      return {
        reply:
          "Bạn có thể chia sẻ cụ thể hơn một chút được không? Ví dụ: Khoa học dữ liệu / Trí tuệ nhân tạo / Phân tích kinh doanh / Quản lý kỹ thuật. Dưới đây là các chương trình sau đại học đã được kiểm chứng của trường này để bạn tham khảo (trường có thể không mở chương trình Thạc sĩ Khoa học Máy tính truyền thống).",
        programs: verified.slice(0, limit).map((p) => toHit(p, " Chương trình đã kiểm chứng của trường này ")),
        needClarify: true,
      };
    }
    return {
      reply:
        " có thể rồi hãy nói cụ thể một chút sao? tỷ như: số liệu khoa học / trí tuệ nhân tạo / Máy tính / tài chính công trình / Kinh doanh phân tích / điện khí công trình. cũng có thể dùng một câu miêu tả hứng thú phương hướng (thiên định lượng, thiên Sofware Developer, thiên công cộng chính sách {các loại:đợi}). ",
      programs: [],
      needClarify: true,
    };
  }

  const hits = scored.filter((s) => s.score > 0).slice(0, limit);
  const use = hits.length? hits: scored.slice(0, Math.min(5, scored.length));
  const mapped = use.map(({ p, score }) =>
    toHit(p, score > 0? " Phù hợp với mô tả sở thích của bạn ": " Chương trình sau đại học hàng đầu của trường này (tương quan độ bình thường, cung cấp xem) ")
  );

  let reply = ` dựa theo hứng thú của bạn ${background? " và bối cảnh ": ""}, tôi tại «${schoolName}» hạng mục trong kho sàng lọc phía dưới tương quan chuyên nghiệp. mời kết hợp thích xứng nhắc nhở Xem chi tiết, phù hợp có thể trực tiếp đánh giá hồ sơ. `;

  try {
    const raw = await qwenChat(
      [
        {
          role: "system",
          content:
            " Bạn là trợ lý tư vấn chọn trường du học. chỉ có thể căn cứ vào quy định sẵn hạng mục liệt biểu List làm Đề xuất giải thích, cấm lập liệt biểu List bên ngoài chuyên nghiệp. như cung cấp thân thỉnh bối cảnh, có thể giản yếu đề cập GPA/ ngôn ngữ và ngưỡng cửa xứng đôi quan hệ, nhưng không nên lập không cho ra điểm. dùng tiếng trung giản thể, 2–4 câu, ngữ khí chuyên nghiệp ngắn gọn. ",
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
