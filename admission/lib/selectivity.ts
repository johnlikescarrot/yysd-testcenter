import type { School } from "@prisma/client";

/**
 * Program difficulty 1–5 (5 = hardest to get in).
 * Combines DB tier with brand + field competitiveness.
 */

const ELITE_BRAND =
  /\b(mit|stanford|harvard|princeton|yale|caltech|cmu|carnegie mellon|berkeley|oxford|cambridge|imperial|ucl|lse)\b/i;

const HIGH_BRAND =
  /\b(columbia|upenn|cornell|chicago|northwestern|duke|johns hopkins|ucla|michigan|toronto|ubc|mcgill|waterloo|melbourne|sydney|anu|unsw)\b/i;

export function programDifficulty(school: School): {
  score: number;
  label: string;
  source: string;
} {
  let score = school.tier === 1? 5: school.tier === 2? 3: 2;

  if (ELITE_BRAND.test(school.name)) score = Math.max(score, 5);
  else if (HIGH_BRAND.test(school.name)) score = Math.max(score, 4);

  // Field heat: CS / Data / Finance harder at same brand
  if (school.field === "cs" || school.field === "data_ai") score = Math.min(5, score + 0);
  if (school.field === "finance" && score >= 4) score = Math.min(5, score + 0);

  // Named ultra-competitive programs
  if (/cmu|carnegie/i.test(school.name) && /data|computer|ai/i.test(school.program)) {
    score = 5;
  }
  if (/mit|stanford/i.test(school.name)) score = 5;

  const label =
    score >= 5
      ? " cực hạn rất khó hạng mục "
      : score === 4
        ? " cao lựa chọn tính hạng mục "
        : score === 3
          ? " Vừa cao lựa chọn tính hạng mục "
          : score === 2
            ? " trung đẳng lựa chọn tính hạng mục "
            : " tương đối hữu hảo hạng mục ";

  return { score, label, source: "selectivity_model_v1" };
}

export function majorFit(
  undergradMajor: string,
  field: string
): { score: number; label: string } {
  const m = (undergradMajor || "").toLowerCase();
  const stem =
    /computer|software|cs\b|informatic|electrical|ee\b|data|statistic|math|ai|artificial/.test(
      m
    );
  const socialData = /social data|data analytics|analytics/.test(m);
  const business = /business|finance|econ|management|accounting/.test(m);
  const design = /design|art|media/.test(m);

  if (field === "cs") {
    if (/computer|software|cs\b|informatic/.test(m))
      return { score: 1, label: " chuyên nghiệp độ cao xứng đôi (CS) " };
    if (stem || socialData) return { score: 0.55, label: " chuyên nghiệp bộ phận xứng đôi (định lượng / số liệu phân tích, không phải mạnh mẽ CS) " };
    return { score: 0.25, label: " chuyên nghiệp khoảng cách đại (tương đối CS) " };
  }
  if (field === "data_ai") {
    if (/data|statistic|ai|computer|math|informatic/.test(m))
      return { score: 0.9, label: " chuyên nghiệp so sánh xứng đôi (số liệu / định lượng) " };
    if (socialData) return { score: 0.65, label: " chuyên nghiệp bộ phận xứng đôi (Social Data Analytics) " };
    if (stem) return { score: 0.7, label: " chuyên nghiệp bộ phận xứng đôi (để ý công định lượng) " };
    return { score: 0.35, label: " chuyên nghiệp xứng đôi hơi yếu " };
  }
  if (field === "business" || field === "finance") {
    if (business || /data|statistic|math/.test(m))
      return { score: 0.85, label: " chuyên nghiệp so sánh xứng đôi (Kinh doanh / định lượng) " };
    return { score: 0.45, label: " chuyên nghiệp xứng đôi bình thường " };
  }
  if (field === "arts_design") {
    if (design) return { score: 0.9, label: " chuyên nghiệp so sánh xứng đôi " };
    return { score: 0.3, label: " chuyên nghiệp khoảng cách đại " };
  }
  return { score: 0.6, label: " chuyên nghiệp xứng đôi trung đẳng (cam chịu) " };
}
