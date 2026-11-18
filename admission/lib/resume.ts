import { parseJsonFromLLM, qwenChat } from "./qwen";

export type ResumeFeatures = {
  research: string[];
  internships: string[];
  papers: string[];
  contests: string[];
  tags: string[];
};

const SYSTEM = `bạn là du học nộp đơn xin liệu phân tích trợ lý biến thể của | sơ yếu lý lịch một văn bản rút cấu trúc biến thể của đặc điểm, chỉ trở về JSON, đừng! và tên/điện thoại/hộp thư đợi bí mật ) 
hình thức: {"research":[],"internships":[],"papers":[],"contests":[],"tags":[]}
tags sử dụng ngắn tiếng Anh nhãn, như research, internship, publication, competition, leadership `;

export async function parseResumeFeatures(
  resumeText: string
): Promise<ResumeFeatures> {
  const text = resumeText.slice(0, 12000);
  const raw = await qwenChat(
    [
      { role: "system", content: SYSTEM },
      { role: "user", content: text },
    ],
    { temperature: 0.1, maxTokens: 800 }
  );
  const parsed = parseJsonFromLLM<Partial<ResumeFeatures>>(raw);
  return {
    research: arr(parsed.research),
    internships: arr(parsed.internships),
    papers: arr(parsed.papers),
    contests: arr(parsed.contests),
    tags: arr(parsed.tags).slice(0, 20),
  };
}

function arr(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String).slice(0, 15) : [];
}
