/**
 * Undergrad strength 1–5 (5 = strongest). Used for selectivity gap + peer case filter.
 * Sources: common counselor heuristics / US News-ish peer groups - not official ranks.
 */

export type UndergradBand = {
  score: number; // 1-5
  label: string;
  source: string;
};

const EXACT: Array<{ re: RegExp; score: number; label: string }> = [
  { re: /\b(mit|stanford|harvard|princeton|yale|caltech)\b/i, score: 5, label: " Châu Mỹ gốc đỉnh kiểm tra/HYPSM cấp " },
  { re: /\b(berkeley|ucla|michigan|cmu|carnegie mellon|columbia|upenn|u penn|cornell|chicago|northwestern|duke|johns hopkins)\b/i, score: 5, label: " Châu Mỹ gốc đỉnh tư nhân/công lập " },
  { re: /\b(penn state|pennsylvania state|psu)\b/i, score: 3, label: " Châu Mỹ Honshū đứng soái hạm(Trung Quốc dùng trong |)" },
  { re: /\b(virginia tech|vt|asu|arizona state|northeastern|purdue|ohio state|wisconsin|minnesota|maryland|uc davis|uc irvine|ucsb|ucsc)\b/i, score: 3, label: " Châu Mỹ gốc so sánh bướng bỉnh do nhà nước điều hành/tư nhân " },
  { re: /\b(oxford|cambridge|imperial|ucl|lse)\b/i, score: 5, label: " Anh gốc G5" },
  { re: /\b(toronto|ubc|mcgill|waterloo)\b/i, score: 4, label: " Canada gốc đỉnh " },
  { re: /\b(melbourne|sydney|anu|unsw|monash)\b/i, score: 4, label: " Ma Cao gốc tám to hàng đầu " },
  { re: /viết tắt của ||Đại học Bắc Kinh|Đại học Phúc Đán|nộp cho|viết tắt của tỉnh Chiết Giang ở miền đông Trung Quốc to|Trung Quốc ngành học to|Đại học Nam Kinh|Quốc hội Nhân dân Toàn quốc/, score: 5, label: " Trung Quốc đại lục đỉnh(triều đại nhà Thanh của Trung Quốc phía bắc viết tắt của Trung Quốc năm đợi)" },
  { re: /một vài 985|985 các trường đại học và cao đẳng/, score: 4, label: " Trung Quốc đại lục 985(tổng hợp vụ việc số)" },
  { re: /một vài 211|211 các trường đại học và cao đẳng|Kế hoạch Hai Hạng Nhất/, score: 3, label: " Trung Quốc đại lục 211/Kế hoạch Hai Hạng Nhất(tổng hợp vụ việc số)" },
  { re: /một vài nước ngoài khóa học đại học/, score: 3, label: " nước ngoài khóa học đại học(tổng hợp vụ việc số)" },
  { re: /một nơi vuông kể lại|Trung-Ngoại hợp tác/, score: 2, label: " Trung Quốc đại lục phổ thông/Trung-Ngoại hợp tác(tổng hợp vụ việc số)" },
  // GradCafe anonymized buckets - treat as mid peer band for filtering
  { re: /GradCafe|quốc tế khóa học đại học|Hoa Kỳ khóa học đại học|chưa đánh dấu khóa học đại học/, score: 3, label: "GradCafe tự thông báo khóa học đại học(trung bình số giả sử)" },
];

export function classifyUndergrad(schoolName: string): UndergradBand {
  const name = (schoolName || "").trim();
  if (!name) {
    return { score: 2, label: " chưa phân biệt khóa học đại học ", source: "default" };
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
  if (/Đại học|trường cao đẳng/.test(name)) {
    return { score: 2, label: " Trung Quốc đại lục phổ thông khóa học đại học(chưa phối hoặc kết hôn danh bạ)", source: "undergrad_tier_table_v1" };
  }
  return { score: 3, label: " chưa đặt tên khắc gỗ trường cao đẳng(nhấn trung bình giả sử)", source: "undergrad_tier_table_v1" };
}

/** Map synthetic case undergrad labels → score for peer filtering */
export function caseUndergradScore(undergradSchool: string): number {
  return classifyUndergrad(undergradSchool).score;
}
