/** Shared applicant background for advisor chat + eval prefill. */

export type AdvisorBackground = {
  gpa: number;
  toefl: number | null;
  ielts: number | null;
  gre: number | null;
  undergradSchool: string;
  undergradMajor: string;
};

export function fitNotes(
  p: { minGpa: number; avgGpa: number; minToefl: number | null; minIelts: number | null },
  bg: AdvisorBackground | null | undefined
): string[] {
  if (!bg) return [];
  const notes: string[] = [];
  if (bg.gpa < p.minGpa) notes.push(`GPA ${bg.gpa} thấp hơn so với tham khảo biến thể của thấp ${p.minGpa}`);
  else if (bg.gpa + 0.15 < p.avgGpa) notes.push(`GPA tương đối chia nghiêng chạy nước rút(tham khảo chia cân trong cân đĩa hoặc trên cân ${p.avgGpa.toFixed(2)})`);
  else if (bg.gpa >= p.avgGpa) notes.push("GPA đạt tới tham khảo chia gần đó ");

  const langOk =
    (p.minToefl != null && bg.toefl != null && bg.toefl >= p.minToefl) ||
    (p.minIelts != null && bg.ielts != null && bg.ielts >= p.minIelts);
  const langLow =
    (p.minToefl != null && bg.toefl != null && bg.toefl < p.minToefl) ||
    (p.minIelts != null && bg.ielts != null && bg.ielts < p.minIelts);

  if (langLow) {
    notes.push(
      p.minToefl != null && bg.toefl != null && bg.toefl < p.minToefl
        ? `TOEFL ${bg.toefl} có thể thấp hơn so với ${p.minToefl}`
        : `IELTS ${bg.ielts} có thể thấp hơn so với ${p.minIelts}`
    );
  } else if (langOk) {
    notes.push(" ngôn ngữ thành tích đạt tới tham khảo bậc cửa ");
  } else if (p.minToefl != null || p.minIelts != null) {
    notes.push(" chưa lấp hoặc nhồi ngôn ngữ thành tích, không thể so sánh bậc cửa ");
  }
  return notes;
}

/** Secondary sort key: lower = better fit when interest scores tie. */
export function fitPenalty(notes: string[]): number {
  let p = 0;
  for (const n of notes) {
    if (n.includes(" thấp hơn so với ")) p += 2;
    if (n.includes(" chạy nước rút ")) p += 1;
    if (n.includes(" đạt tới tham khảo ")) p -= 1;
  }
  return p;
}
