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
  { name: "MIT", nameZh: " Viện Công nghệ Massachusetts (MIT) ", country: "US" },
  { name: "Stanford", nameZh: " Đại học Stanford ", country: "US" },
  { name: "CMU", nameZh: " Đại học Carnegie Mellon ", country: "US" },
  { name: "UC Berkeley", nameZh: " Đại học California, Berkeley ", country: "US" },
  { name: "Caltech", nameZh: " Viện Công nghệ California (Caltech) ", country: "US" },
  { name: "Harvard", nameZh: " Đại học Harvard ", country: "US" },
  { name: "Princeton", nameZh: " Đại học Princeton ", country: "US" },
  { name: "Yale", nameZh: " Đại học Yale ", country: "US" },
  { name: "Columbia", nameZh: " Đại học Columbia ", country: "US" },
  { name: "UPenn", nameZh: " Đại học Pennsylvania ", country: "US" },
  { name: "Cornell", nameZh: " Đại học Cornell ", country: "US" },
  { name: "University of Chicago", nameZh: " Đại học Chicago ", country: "US" },
  { name: "Duke", nameZh: " Đại học Duke ", country: "US" },
  { name: "Northwestern", nameZh: " Đại học Northwestern ", country: "US" },
  { name: "Johns Hopkins", nameZh: " Đại học Johns Hopkins ", country: "US" },
  { name: "Brown", nameZh: " Bố Lãng đại học ", country: "US" },
  { name: "Rice", nameZh: " Luis đại học ", country: "US" },
  { name: "Vanderbilt", nameZh: " phạm đức lâu đài đại học ", country: "US" },
  { name: "Washington University in St. Louis", nameZh: " Oa-sinh-tơn Hoa Thịnh Đốn đại học St.Louis ", country: "US" },
  { name: "UCLA", nameZh: " Đại học California, Los Angeles (UCLA) ", country: "US" },
  { name: "UC San Diego", nameZh: " Đại học California, San Diego ", country: "US" },
  { name: "USC", nameZh: " nam thêm châu đại học ", country: "US" },
  { name: "NYU", nameZh: " Đại học New York (NYU) ", country: "US" },
  { name: "University of Michigan", nameZh: " Mi-si-gân đại học ", country: "US" },
  { name: "Georgia Tech", nameZh: " Viện Công nghệ Georgia ", country: "US" },
  { name: "UIUC", nameZh: " Elie Noe đại học Champagne phân hiệu ", country: "US" },
  { name: "University of Texas at Austin", nameZh: " đức châu đại học Austin phân hiệu ", country: "US" },
  { name: "University of Washington", nameZh: " Oa-sinh-tơn Hoa Thịnh Đốn đại học ", country: "US" },
  { name: "Purdue", nameZh: " phổ độ đại học ", country: "US" },
  { name: "Boston University", nameZh: " Boston đại học ", country: "US" },
  { name: "University of Wisconsin-Madison", nameZh: " Uy-xcon-xin đại học Madison phân hiệu ", country: "US" },
  { name: "Ohio State University", nameZh: " Ô-hai-ô châu lập đại học ", country: "US" },
  { name: "Penn State", nameZh: " tân vừa mới lập đại học ", country: "US" },
  { name: "University of Florida", nameZh: " Flo-ri-đa Flo-ri-đơ đại học ", country: "US" },
  { name: "University of Maryland", nameZh: " Me-ri-len đại học ", country: "US" },
  { name: "UC Irvine", nameZh: " Đại học California, Irvine ", country: "US" },
  { name: "UC Davis", nameZh: " Đại học California, Davis ", country: "US" },
  { name: "Northeastern", nameZh: " đông bắc đại học ", country: "US" },
  { name: "Arizona State University", nameZh: " A-ri-dô-na E-ri-dâu-nơ châu lập đại học ", country: "US" },
  { name: "University of Minnesota", nameZh: " Mi-nê-dô-ta đại học ", country: "US" },
  // UK
  { name: "University of Oxford", nameZh: " Đại học Oxford ", country: "UK" },
  { name: "University of Cambridge", nameZh: " Đại học Cambridge ", country: "UK" },
  { name: "Imperial College London", nameZh: " Imperial College London ", country: "UK" },
  { name: "UCL", nameZh: " Đại học College London (UCL) ", country: "UK" },
  { name: "LSE", nameZh: " Trường Kinh tế London (LSE) ", country: "UK" },
  { name: "University of Edinburgh", nameZh: " Đại học Edinburgh ", country: "UK" },
  { name: "King's College London", nameZh: " King's College London ", country: "UK" },
  { name: "University of Manchester", nameZh: " Đại học Manchester ", country: "UK" },
  { name: "University of Bristol", nameZh: " Đại học Bristol ", country: "UK" },
  { name: "University of Warwick", nameZh: " Đại học Warwick ", country: "UK" },
  { name: "University of Glasgow", nameZh: " Đại học Glasgow ", country: "UK" },
  { name: "University of Birmingham", nameZh: " Đại học Birmingham ", country: "UK" },
  { name: "University of Leeds", nameZh: " Đại học Leeds ", country: "UK" },
  { name: "University of Southampton", nameZh: " Đại học Southampton ", country: "UK" },
  { name: "University of Sheffield", nameZh: " Đại học Sheffield ", country: "UK" },
  { name: "University of Nottingham", nameZh: " Đại học Nottingham ", country: "UK" },
  { name: "Queen Mary University of London", nameZh: " Đại học Queen Mary London ", country: "UK" },
  { name: "University of York", nameZh: " Đại học York ", country: "UK" },
  { name: "Durham University", nameZh: " Đại học Durham ", country: "UK" },
  { name: "University of St Andrews", nameZh: " Đại học St Andrews ", country: "UK" },
  // CA
  { name: "University of Toronto", nameZh: " Đại học Toronto ", country: "CA" },
  { name: "University of British Columbia", nameZh: " anh chúc Đại học Columbia ", country: "CA" },
  { name: "McGill University", nameZh: " Đại học McGill ", country: "CA" },
  { name: "University of Waterloo", nameZh: " Đại học Waterloo ", country: "CA" },
  { name: "McMaster University", nameZh: " Mike mã tư đặc biệt lớn học ", country: "CA" },
  { name: "University of Alberta", nameZh: " A Nhĩ bá tháp đại học ", country: "CA" },
  { name: "University of Montreal", nameZh: " mơ hồ đặc(biệt) lợi bạn đại học ", country: "CA" },
  { name: "University of Ottawa", nameZh: " Ốt-ta-oa đại học ", country: "CA" },
  { name: "Queen's University", nameZh: " Nữ Vương đại học ", country: "CA" },
  { name: "Western University", nameZh: " Tây An mơ hồ đại học ", country: "CA" },
  { name: "University of Calgary", nameZh: " Tạp Nhĩ Gia Lý đại học ", country: "CA" },
  { name: "Simon Fraser University", nameZh: " Simon phất lôi trạch đại học ", country: "CA" },
  { name: "Dalhousie University", nameZh: " Đạt Nhĩ Hào Tư đại học ", country: "CA" },
  { name: "University of Victoria", nameZh: " Vích-to-ri-a đại học ", country: "CA" },
  { name: "York University", nameZh: " Đại học York (thêm) ", country: "CA" },
  // AU
  { name: "University of Melbourne", nameZh: " Đại học Melbourne ", country: "AU" },
  { name: "University of Sydney", nameZh: " Đại học Sydney ", country: "AU" },
  { name: "ANU", nameZh: " Đại học Quốc gia Úc (ANU) ", country: "AU" },
  { name: "University of Queensland", nameZh: " Đại học Queensland ", country: "AU" },
  { name: "UNSW Sydney", nameZh: " Đại học New South Wales (UNSW) ", country: "AU" },
  { name: "Monash University", nameZh: " Đại học Monash ", country: "AU" },
  { name: "University of Western Australia", nameZh: " Đại học Tây Úc ", country: "AU" },
  { name: "University of Adelaide", nameZh: " Đại học Adelaide ", country: "AU" },
  { name: "University of Technology Sydney", nameZh: " Xít-ni Công nghệ đại học ", country: "AU" },
  { name: "RMIT University", nameZh: " hoàng gia mực bạn bản để ý công đại học ", country: "AU" },
  { name: "Queensland University of Technology", nameZh: " côn sĩ lan Công nghệ đại học ", country: "AU" },
  { name: "Macquarie University", nameZh: " mạch khảo thi thụy đại học ", country: "AU" },
];

const LOGO_BY_NAME = logoMap as Record<string, string>;
const BY_NAME = new Map(
  INSTITUTIONS.map((i) => [
    i.name,
    {...i, logoUrl: i.logoUrl || LOGO_BY_NAME[i.name] },
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
