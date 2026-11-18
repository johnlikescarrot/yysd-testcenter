import type { Country } from "@/lib/catalog-labels";
import logoMap from "./logo-map.json";

export type InstitutionMeta = {
  name: string;
  nameZh: string;
  country: Country;
  /** Optional image URL; letter mark used when absent */
  logoUrl?: string;
};

/** Chinese display names keyed by catalog English `School.name` */
export const INSTITUTIONS: InstitutionMeta[] = [
  // US
  { name: "MIT", nameZh: " Viện Công nghệ Massachusetts ", country: "US" },
  { name: "Stanford", nameZh: " Đại học Stanford ", country: "US" },
  { name: "CMU", nameZh: " Đại học Carnegie Mellon ", country: "US" },
  { name: "UC Berkeley", nameZh: " Đại học California Berkeley chi nhánh của trường học ", country: "US" },
  { name: "Caltech", nameZh: " Viện Công nghệ California ", country: "US" },
  { name: "Harvard", nameZh: " Đại học Harvard ", country: "US" },
  { name: "Princeton", nameZh: " Đại học Princeton ", country: "US" },
  { name: "Yale", nameZh: " Đại học Yale ", country: "US" },
  { name: "Columbia", nameZh: " Đại học Columbia ", country: "US" },
  { name: "UPenn", nameZh: " Đại học Pennsylvania ", country: "US" },
  { name: "Cornell", nameZh: " Đại học Cornell ", country: "US" },
  { name: "University of Chicago", nameZh: " Đại học Chicago ", country: "US" },
  { name: "Duke", nameZh: " cây du viết tắt của | Đại học ", country: "US" },
  { name: "Northwestern", nameZh: " Đại học Northwest ", country: "US" },
  { name: "Johns Hopkins", nameZh: " John Đại học Johns Hopkins ", country: "US" },
  { name: "Brown", nameZh: " Đại học Brown ", country: "US" },
  { name: "Rice", nameZh: " Đại học Rice ", country: "US" },
  { name: "Vanderbilt", nameZh: " mô hình nước Đức pháo đài Đại học ", country: "US" },
  { name: "Washington University in St. Louis", nameZh: " Washington Đại học St Louis ", country: "US" },
  { name: "UCLA", nameZh: " Đại học California Los Angeles chi nhánh của trường học ", country: "US" },
  { name: "UC San Diego", nameZh: " Đại học California Santiago chi nhánh của trường học ", country: "US" },
  { name: "USC", nameZh: " phía nam Đại học California ", country: "US" },
  { name: "NYU", nameZh: " Đại học New York ", country: "US" },
  { name: "University of Michigan", nameZh: " Đại học Michigan ", country: "US" },
  { name: "Georgia Tech", nameZh: " Georgia khoa học và kỹ thuật như các môn học học thuật trường cao đẳng ", country: "US" },
  { name: "UIUC", nameZh: " bang Illinois Đại học rượu sâm panh chi nhánh của trường học ", country: "US" },
  { name: "University of Texas at Austin", nameZh: " thành phố cấp địa khu Đức Châu ở Sơn Đông Đại học Austin hoặc Austen chi nhánh của trường học ", country: "US" },
  { name: "University of Washington", nameZh: " Washington Đại học ", country: "US" },
  { name: "Purdue", nameZh: " Đại học Purdue ", country: "US" },
  { name: "Boston University", nameZh: " Đại học Boston ", country: "US" },
  { name: "University of Wisconsin-Madison", nameZh: " Wisconsin Đại học Madison chi nhánh của trường học ", country: "US" },
  { name: "Ohio State University", nameZh: " Ohio đứng Đại học ", country: "US" },
  { name: "Penn State", nameZh: " Pennsylvania Đại học Bang ", country: "US" },
  { name: "University of Florida", nameZh: " Florida Đại học ", country: "US" },
  { name: "University of Maryland", nameZh: " Maryland Đại học ", country: "US" },
  { name: "UC Irvine", nameZh: " Đại học California Owen chi nhánh của trường học ", country: "US" },
  { name: "UC Davis", nameZh: " Đại học California Davis hoặc Davies chi nhánh của trường học ", country: "US" },
  { name: "Northeastern", nameZh: " Đại học Đông Bắc ", country: "US" },
  { name: "Arizona State University", nameZh: " Arizona đứng Đại học ", country: "US" },
  { name: "University of Minnesota", nameZh: " Minnesota Đại học ", country: "US" },
  // UK
  { name: "University of Oxford", nameZh: " Đại học Oxford ", country: "UK" },
  { name: "University of Cambridge", nameZh: " Đại học Cambridge ", country: "UK" },
  { name: "Imperial College London", nameZh: " Imperial College London ", country: "UK" },
  { name: "UCL", nameZh: " University College London ", country: "UK" },
  { name: "LSE", nameZh: " Luân Đôn kinh tế chính trị sân ", country: "UK" },
  { name: "University of Edinburgh", nameZh: " Đại học Edinburgh ", country: "UK" },
  { name: "King's College London", nameZh: " Luân Đôn vua trường cao đẳng ", country: "UK" },
  { name: "University of Manchester", nameZh: " Manchester Đại học ", country: "UK" },
  { name: "University of Bristol", nameZh: " Đại học Bristol ", country: "UK" },
  { name: "University of Warwick", nameZh: " Đại học Warwick ", country: "UK" },
  { name: "University of Glasgow", nameZh: " Đại học Glasgow ", country: "UK" },
  { name: "University of Birmingham", nameZh: " Đại học Birmingham ", country: "UK" },
  { name: "University of Leeds", nameZh: " Đại học Leeds ", country: "UK" },
  { name: "University of Southampton", nameZh: " Nam An chung dừng Đại học ", country: "UK" },
  { name: "University of Sheffield", nameZh: " cảm ơn viết tắt của Philippines | Lễ Eid Đại học ", country: "UK" },
  { name: "University of Nottingham", nameZh: " thành phố Nottingham Đại học ", country: "UK" },
  { name: "Queen Mary University of London", nameZh: " Luân Đôn Mary hoặc Marie nữ hoàng Đại học ", country: "UK" },
  { name: "University of York", nameZh: " York Đại học ", country: "UK" },
  { name: "Durham University", nameZh: " cây du mối quan hệ giữa người với người Đại học ", country: "UK" },
  { name: "University of St Andrews", nameZh: " Thánh Andrew Slovakia Đại học ", country: "UK" },
  // CA
  { name: "University of Toronto", nameZh: " Toronto Đại học ", country: "CA" },
  { name: "University of British Columbia", nameZh: " British Columbia Đại học ", country: "CA" },
  { name: "McGill University", nameZh: " lúa mì may mắn biến thể của | Đại học ", country: "CA" },
  { name: "University of Waterloo", nameZh: " Waterloo Đại học ", country: "CA" },
  { name: "McMaster University", nameZh: " Mike ngựa Slovakia cực kỳ lớn học ", country: "CA" },
  { name: "University of Alberta", nameZh: " tỉnh Alberta của Canada Đại học ", country: "CA" },
  { name: "University of Montreal", nameZh: " Montreal Đại học ", country: "CA" },
  { name: "University of Ottawa", nameZh: " Ottawa Đại học ", country: "CA" },
  { name: "Queen's University", nameZh: " nữ hoàng Đại học ", country: "CA" },
  { name: "Western University", nameZh: " Tây An một đại cương Đại học ", country: "CA" },
  { name: "University of Calgary", nameZh: " Calgary Đại học ", country: "CA" },
  { name: "Simon Fraser University", nameZh: " phương Tây mưa phùn Freyr hồ Đại học ", country: "CA" },
  { name: "Dalhousie University", nameZh: " đạt tới biến thể của | hùng vĩ Slovakia Đại học ", country: "CA" },
  { name: "University of Victoria", nameZh: " Victoria Đại học ", country: "CA" },
  { name: "York University", nameZh: " York Đại học(Canada)", country: "CA" },
  // AU
  { name: "University of Melbourne", nameZh: " Melbourne Đại học ", country: "AU" },
  { name: "University of Sydney", nameZh: " Sydney Đại học ", country: "AU" },
  { name: "ANU", nameZh: " Đại học Quốc gia Úc ", country: "AU" },
  { name: "University of Queensland", nameZh: " Queensland Đại học ", country: "AU" },
  { name: "UNSW Sydney", nameZh: " New South Wales Đại học ", country: "AU" },
  { name: "Monash University", nameZh: " đừng Nash Đại học ", country: "AU" },
  { name: "University of Western Australia", nameZh: " phương Tây Ma Cao Đại học ", country: "AU" },
  { name: "University of Adelaide", nameZh: " Adelaide Đại học ", country: "AU" },
  { name: "University of Technology Sydney", nameZh: " Sydney đại học khoa học và công nghệ ", country: "AU" },
  { name: "RMIT University", nameZh: " hoàng gia Melbourne Đại học Khoa học và Kỹ thuật ", country: "AU" },
  { name: "Queensland University of Technology", nameZh: " Queensland đại học khoa học và công nghệ ", country: "AU" },
  { name: "Macquarie University", nameZh: " lúa mì đánh may mắn Đại học ", country: "AU" },
];

const LOGO_BY_NAME = logoMap as Record<string, string>;
const BY_NAME = new Map(
  INSTITUTIONS.map((i) => [
    i.name,
    { ...i, logoUrl: i.logoUrl || LOGO_BY_NAME[i.name] },
  ])
);

export function getInstitutionMeta(name: string): InstitutionMeta | undefined {
  const base = BY_NAME.get(name);
  if (base) return base;
  const logoUrl = LOGO_BY_NAME[name];
  if (!logoUrl) return undefined;
  return { name, nameZh: name, country: "US", logoUrl };
}

/** Short mark for letter avatar, e.g. CMU / MIT / Toronto → UT */
export function institutionMark(name: string): string {
  const known: Record<string, string> = {
    MIT: "MIT",
    CMU: "CMU",
    UCLA: "UCLA",
    NYU: "NYU",
    USC: "USC",
    UIUC: "UIUC",
    UCL: "UCL",
    LSE: "LSE",
    ANU: "ANU",
    UPenn: "UP",
    "UC Berkeley": "UCB",
    "UC San Diego": "UCSD",
    "UC Irvine": "UCI",
    "UC Davis": "UCD",
    "Georgia Tech": "GT",
    "Penn State": "PSU",
    Northeastern: "NEU",
    "Arizona State University": "ASU",
    "UNSW Sydney": "UNSW",
  };
  if (known[name]) return known[name];
  const words = name.replace(/University|of|the|at|College|Institute/gi, " ").trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
