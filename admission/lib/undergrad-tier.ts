/**
 * Undergrad strength 1–5 (5 = strongest). Used for selectivity gap + peer case filter.
 * Sources: common counselor heuristics / US News-ish peer groups — not official ranks.
 */

export type UndergradBand = {
  score: number; // 1-5
  label: string;
  source: string;
};

const EXACT: Array<{ re: RegExp; score: number; label: string }> = [
  { re: /\b(mit|stanford|harvard|princeton|yale|caltech)\b/i, score: 5, label: " Mỹ bản đỉnh trường học /HYPSM cấp " },
  { re: /\b(berkeley|ucla|michigan|cmu|carnegie mellon|columbia|upenn|u penn|cornell|chicago|northwestern|duke|johns hopkins)\b/i, score: 5, label: " Mỹ bản cực hạn tư nhân / công lập " },
  { re: /\b(penn state|pennsylvania state|psu)\b/i, score: 3, label: " Mỹ Bản Châu lập tàu chiến chỉ huy (trung thượng) " },
  { re: /\b(virginia tech|vt|asu|arizona state|northeastern|purdue|ohio state|wisconsin|minnesota|maryland|uc davis|uc irvine|ucsb|ucsc)\b/i, score: 3, label: " Mỹ bản khá mạnh châu lập / tư nhân " },
  { re: /\b(oxford|cambridge|imperial|ucl|lse)\b/i, score: 5, label: " Anh bản G5" },
  { re: /\b(toronto|ubc|mcgill|waterloo)\b/i, score: 4, label: " thêm bản cực hạn " },
  { re: /\b(melbourne|sydney|anu|unsw|monash)\b/i, score: 4, label: " úc bản bát đại hàng đầu " },
  { re: / Thanh Hoa | bắc đại | phục đán | nộp lên | Chiết Đại | trung khoa đại | nam đại | nhân đại /, score: 5, label: " nội địa cực hạn (thanh bắc hoa ngũ đẳng) " },
  { re: / một 985|985 trường cao đẳng /, score: 4, label: " nội địa 985 (hợp thành án lệ đương) " },
  { re: / một 211|211 trường cao đẳng | song nhất lưu /, score: 3, label: " nội địa 211/ song nhất lưu (hợp thành án lệ đương) " },
  { re: / một hải ngoại Đại học /, score: 3, label: " hải ngoại Đại học (hợp thành án lệ đương) " },
  { re: / chỗ nào đó phương trọng điểm | trung ngoại hợp tác /, score: 2, label: " nội địa bình thường / trung ngoại hợp tác (hợp thành án lệ đương) " },
  // GradCafe anonymized buckets — treat as mid peer band for filtering
  { re: /GradCafe| quốc tế Đại học | Hoa Kỳ Đại học | không đánh dấu Đại học /, score: 3, label: "GradCafe tự báo Đại học (trung đẳng đương giả thiết) " },
];

export function classifyUndergrad(schoolName: string): UndergradBand {
  const name = (schoolName || "").trim();
  if (!name) {
    return { score: 2, label: " vị thức bản khác khoa ", source: "default" };
  }
  for (const row of EXACT) {
    if (row.re.test(name)) {
      return {
        score: row.score,
        label: row.label,
        source: "undergrad_tier_table_v1",
      };
    }
  }
  // Chinese generic
  if (/ đại học | học viện /.test(name)) {
    return { score: 2, label: " nội địa bình thường Đại học (không xứng đôi list danh sách) ", source: "undergrad_tier_table_v1" };
  }
  return { score: 3, label: " không list danh sách viện giáo (theo như trung đẳng giả thiết) ", source: "undergrad_tier_table_v1" };
}

/** Map synthetic case undergrad labels → score for peer filtering */
export function caseUndergradScore(undergradSchool: string): number {
  return classifyUndergrad(undergradSchool).score;
}
