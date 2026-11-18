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
  cs: " Máy tính ",
  engineering: " công trình ",
  data_ai: " số liệu /AI",
  business: " Kinh doanh ",
  finance: " tài chính ",
  science: " khoa học tự nhiên ",
  life_health: " sinh mệnh Sức khỏe ",
  arts_design: " Nghệ thuật xếp đặt thiết kế ",
  social: " xã khoa ",
  education: " Giáo dục ",
  law: " luật học ",
  other: " Khác ",
};

export type SchoolSeed = {
  slug: string;
  name: string;
  program: string;
  programZh?: string;
  degree: string;
  country: Country;
  field: Field;
  city?: string;
  avgGpa: number;
  minGpa: number;
  minToefl: number | null;
  minIelts: number | null;
  gpaScale?: number;
  website: string;
  officialUrl?: string;
  admissionRequirements: string;
  tier: number;
  duration?: string;
  tuitionNote?: string;
  isStem?: boolean;
  greRequired?: boolean | null;
  applicationDeadline?: string;
  blurb?: string;
  summaryOfficial?: string;
};

export function slugify(parts: string[]): string {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
