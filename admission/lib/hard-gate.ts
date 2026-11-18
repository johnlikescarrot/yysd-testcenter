import type { School } from "@prisma/client";
import type { EvaluateInput } from "./validate";

export type GateResult =
  | { ok: true }
  | { ok: false; reasons: string[] };

export function checkHardGate(school: School, input: EvaluateInput): GateResult {
  const reasons: string[] = [];
  if (input.gpa < school.minGpa) {
    reasons.push(
      `GPA ${input.gpa.toFixed(2)} thấp hơn so với nên kiểm tra biến thể của thấp yêu cầu ${school.minGpa.toFixed(2)}`
    );
  }
  const hasLang =
    (input.toefl != null && input.toefl > 0) ||
    (input.ielts != null && input.ielts > 0);
  if (!hasLang && (school.minToefl != null || school.minIelts != null)) {
    reasons.push(" chưa đề nghị TOEFL/IELTS Kết quả, không thể đi qua ngôn ngữ cứng bậc cửa ");
  } else {
    const toeflOk =
      school.minToefl == null ||
      (input.toefl != null && input.toefl >= school.minToefl);
    const ieltsOk =
      school.minIelts == null ||
      (input.ielts != null && input.ielts >= school.minIelts);
    // pass if either language score meets its minimum when provided
    if (school.minToefl != null || school.minIelts != null) {
      const anyPass =
        (input.toefl != null && toeflOk) || (input.ielts != null && ieltsOk);
      if (!anyPass) {
        if (input.toefl != null && school.minToefl != null && input.toefl < school.minToefl) {
          reasons.push(`TOEFL ${input.toefl} thấp hơn so với biến thể của thấp yêu cầu ${school.minToefl}`);
        }
        if (input.ielts != null && school.minIelts != null && input.ielts < school.minIelts) {
          reasons.push(`IELTS ${input.ielts} thấp hơn so với biến thể của thấp yêu cầu ${school.minIelts}`);
        }
        if (reasons.length === 0) {
          reasons.push(" ngôn ngữ thành tích chưa đạt tới nên kiểm tra biến thể của thấp yêu cầu ");
        }
      }
    }
  }
  return reasons.length ? { ok: false, reasons } : { ok: true };
}
