export const COUNTRIES = ["US", "UK", "CA", "AU"] as const;
export type Country = (typeof COUNTRIES)[number];

export const FIELDS = [
  "cs",
  "engineering",
  "data_ai",
  "business",
  "finance",
  "science",
  "life_health",
  "arts_design",
  "social",
  "education",
  "law",
  "other",
] as const;
export type Field = (typeof FIELDS)[number];

export const COUNTRY_LABELS: Record<Country, string> = {
  US: " Hoa Kỳ ",
  UK: " Vương quốc Anh ",
  CA: " Canada ",
  AU: " Úc ",
};

export const FIELD_LABELS: Record<Field, string> = {
  cs: " máy tính ",
  engineering: " kỹ thuật ",
  data_ai: " dữ liệu/AI",
  business: " công ty IT Thương Khoa ",
  finance: " ngân hàng ",
  science: " khoa học tự nhiên ",
  life_health: " sự sống sức khỏe ",
  arts_design: " nghệ thuật thiết kế ",
  social: " khoa học xã hội ",
  education: " Giáo dục ",
  law: " luật ",
  other: " Khác ",
};
