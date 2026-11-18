import type { School } from "@prisma/client";
import type { EvaluateInput } from "./validate";

export type GateResult =
  | { ok: true }
  | { ok: false; reasons: string[] };

export function checkHardGate(school: School, input: EvaluateInput): GateResult {
  const reasons: string[] = [];
  if (input.gpa < school.minGpa) {
    reasons.push(
      `GPA ${input.gpa.toFixed(2)} thấp hơn cai giáo yêu cầu thấp nhất ${school.minGpa.toFixed(2)}`
    );
  }
  const hasLang =
    (input.toefl!= null && input.toefl > 0) ||
    (input.ielts!= null && input.ielts > 0);
  if (!hasLang && (school.minToefl!= null || school.minIelts!= null)) {
    reasons.push(" không cung cấp TOEFL/IELTS Điểm số, không cách nào thông qua ngôn ngữ cứng rắn cánh cửa ");
  } else {
    const toeflOk =
      school.minToefl == null ||
      (input.toefl!= null && input.toefl >= school.minToefl);
    const ieltsOk =
      school.minIelts == null ||
      (input.ielts!= null && input.ielts >= school.minIelts);
    // pass if either language score meets its minimum when provided
    if (school.minToefl!= null || school.minIelts!= null) {
      const anyPass =
        (input.toefl!= null && toeflOk) || (input.ielts!= null && ieltsOk);
      if (!anyPass) {
        if (input.toefl!= null && school.minToefl!= null && input.toefl < school.minToefl) {
          reasons.push(`TOEFL ${input.toefl} thấp hơn yêu cầu thấp nhất ${school.minToefl}`);
        }
        if (input.ielts!= null && school.minIelts!= null && input.ielts < school.minIelts) {
          reasons.push(`IELTS ${input.ielts} thấp hơn yêu cầu thấp nhất ${school.minIelts}`);
        }
        if (reasons.length === 0) {
          reasons.push(" ngôn ngữ Điểm số không đạt tới cai giáo yêu cầu thấp nhất ");
        }
      }
    }
  }
  return reasons.length? { ok: false, reasons }: { ok: true };
}
