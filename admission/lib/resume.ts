import { parseJsonFromLLM, qwenChat } from "./qwen";

export type ResumeFeatures = {
  research: string[];
  internships: string[];
  papers: string[];
  contests: string[];
  tags: string[];
};

const SYSTEM = ` Bạn là trợ lý phân tích hồ sơ du học. Trích xuất đặc điểm cấu trúc từ văn bản CV/sơ yếu lý lịch, chỉ trả về JSON, không lấy thông tin riêng tư như họ tên / số điện thoại / email.
 cách thức: {"research":[],"internships":[],"papers":[],"contests":[],"tags":[]}
tags dùng ngắn Tiếng Anh nhãn hiệu, ví dụ research, internship, publication, competition, leadership. `;

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
  return Array.isArray(v)? v.map(String).slice(0, 15): [];
}
