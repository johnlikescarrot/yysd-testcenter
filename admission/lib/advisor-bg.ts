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
  if (bg.gpa < p.minGpa) notes.push(`GPA ${bg.gpa} thấp hơn tham khảo thấp nhất ${p.minGpa}`);
  else if (bg.gpa + 0.15 < p.avgGpa) notes.push(`GPA tương đối chia đều thiên chạy nước rút (tham khảo chia đều ước ${p.avgGpa.toFixed(2)}) `);
  else if (bg.gpa >= p.avgGpa) notes.push("GPA đạt tham khảo chia đều phụ cận ");

  const langOk =
    (p.minToefl!= null && bg.toefl!= null && bg.toefl >= p.minToefl) ||
    (p.minIelts!= null && bg.ielts!= null && bg.ielts >= p.minIelts);
  const langLow =
    (p.minToefl!= null && bg.toefl!= null && bg.toefl < p.minToefl) ||
    (p.minIelts!= null && bg.ielts!= null && bg.ielts < p.minIelts);

  if (langLow) {
    notes.push(
      p.minToefl!= null && bg.toefl!= null && bg.toefl < p.minToefl
        ? `TOEFL ${bg.toefl} có thể thấp hơn ${p.minToefl}`
        : `IELTS ${bg.ielts} có thể thấp hơn ${p.minIelts}`
    );
  } else if (langOk) {
    notes.push(" ngôn ngữ Điểm số đạt tham khảo cánh cửa ");
  } else if (p.minToefl!= null || p.minIelts!= null) {
    notes.push(" Chưa điền ngôn ngữ Điểm số, không cách nào so với cánh cửa ");
  }
  return notes;
}

/** Secondary sort key: lower = better fit when interest scores tie. */
export function fitPenalty(notes: string[]): number {
  let p = 0;
  for (const n of notes) {
    if (n.includes(" thấp hơn ")) p += 2;
    if (n.includes(" chạy nước rút ")) p += 1;
    if (n.includes(" đạt tham khảo ")) p -= 1;
  }
  return p;
}
