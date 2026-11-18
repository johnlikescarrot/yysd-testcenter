import { parseJsonFromLLM, qwenChat } from "./qwen";

export type ResumeFeatures = {
  research: string[];
  internships: string[];
  papers: string[];
  contests: string[];
  tags: string[];
};

const SYSTEM = ` ngươi là du học thân thỉnh tài liệu Giải thích đáp án trợ thủ. giản lược lịch văn bản chắt lọc kết cấu hóa đặc thù, chỉ Quay lại JSON, không nên tính danh / điện thoại / hòm thư {các loại:đợi} việc riêng tư chữ đoạn.
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
