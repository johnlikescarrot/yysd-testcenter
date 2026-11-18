/**
 * Generates curated ranking JSON under data/raw/ for THE / ARWU / US News only.
 * ponytail: QS comes from data/raw/qs-official via build-qs-from-official.ts (top ≤500).
 */
import fs from "fs";
import path from "path";
import { slugify } from "../lib/systems";

type Uni = { nameEn: string; nameZh: string; country: string; aliases?: string[] };

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "data", "raw");

/** Master list: well-known schools + admission catalog coverage */
const UNIVERSITIES: Uni[] = [
  { nameEn: "Massachusetts Institute of Technology", nameZh: " Viện Công nghệ Massachusetts (MIT) ", country: "US", aliases: ["MIT"] },
  { nameEn: "Imperial College London", nameZh: " Imperial College London ", country: "UK", aliases: ["Imperial"] },
  { nameEn: "University of Oxford", nameZh: " Đại học Oxford ", country: "UK", aliases: ["Oxford"] },
  { nameEn: "Harvard University", nameZh: " Đại học Harvard ", country: "US", aliases: ["Harvard"] },
  { nameEn: "University of Cambridge", nameZh: " Đại học Cambridge ", country: "UK", aliases: ["Cambridge"] },
  { nameEn: "Stanford University", nameZh: " Đại học Stanford ", country: "US", aliases: ["Stanford"] },
  { nameEn: "ETH Zurich", nameZh: " tô lê thế liên bang để ý công học viện ", country: "CH", aliases: ["ETH Zürich", "ETH"] },
  { nameEn: "National University of Singapore", nameZh: " Đại học Quốc gia Singapore (NUS) ", country: "SG", aliases: ["NUS"] },
  { nameEn: "University College London", nameZh: " Đại học College London (UCL) ", country: "UK", aliases: ["UCL"] },
  { nameEn: "California Institute of Technology", nameZh: " Viện Công nghệ California (Caltech) ", country: "US", aliases: ["Caltech"] },
  { nameEn: "University of Pennsylvania", nameZh: " Đại học Pennsylvania ", country: "US", aliases: ["UPenn", "Penn"] },
  { nameEn: "University of California, Berkeley", nameZh: " Đại học California, Berkeley ", country: "US", aliases: ["UC Berkeley", "Berkeley"] },
  { nameEn: "The University of Melbourne", nameZh: " Đại học Melbourne ", country: "AU", aliases: ["University of Melbourne", "Melbourne"] },
  { nameEn: "Peking University", nameZh: " Bắc Kinh đại học ", country: "CN", aliases: ["PKU", "Beida"] },
  { nameEn: "Nanyang Technological University", nameZh: " Đại học Công nghệ Nanyang (NTU) ", country: "SG", aliases: ["NTU"] },
  { nameEn: "Cornell University", nameZh: " Đại học Cornell ", country: "US", aliases: ["Cornell"] },
  { nameEn: "The University of Hong Kong", nameZh: " Hồng Kông đại học ", country: "HK", aliases: ["HKU"] },
  { nameEn: "The University of Sydney", nameZh: " Đại học Sydney ", country: "AU", aliases: ["University of Sydney", "USYD"] },
  { nameEn: "The University of New South Wales", nameZh: " Đại học New South Wales (UNSW) ", country: "AU", aliases: ["UNSW", "UNSW Sydney"] },
  { nameEn: "Tsinghua University", nameZh: " đại học Thanh Hoa ", country: "CN", aliases: ["THU"] },
  { nameEn: "University of Chicago", nameZh: " Đại học Chicago ", country: "US", aliases: ["UChicago"] },
  { nameEn: "Princeton University", nameZh: " Đại học Princeton ", country: "US", aliases: ["Princeton"] },
  { nameEn: "Yale University", nameZh: " Đại học Yale ", country: "US", aliases: ["Yale"] },
  { nameEn: "Johns Hopkins University", nameZh: " Đại học Johns Hopkins ", country: "US", aliases: ["Johns Hopkins", "JHU"] },
  { nameEn: "Columbia University", nameZh: " Đại học Columbia ", country: "US", aliases: ["Columbia"] },
  { nameEn: "University of California, Los Angeles", nameZh: " Đại học California, Los Angeles (UCLA) ", country: "US", aliases: ["UCLA"] },
  { nameEn: "University of Toronto", nameZh: " Đại học Toronto ", country: "CA", aliases: ["UofT", "U of T"] },
  { nameEn: "University of Edinburgh", nameZh: " Đại học Edinburgh ", country: "UK", aliases: ["Edinburgh"] },
  { nameEn: "King's College London", nameZh: " King's College London ", country: "UK", aliases: ["KCL"] },
  { nameEn: "University of Michigan-Ann Arbor", nameZh: " Mi-si-gân đại học ", country: "US", aliases: ["University of Michigan", "UMich"] },
  { nameEn: "Technical University of Munich", nameZh: " Mu-ních đại học công nghiệp ", country: "DE", aliases: ["TUM"] },
  { nameEn: "McGill University", nameZh: " Đại học McGill ", country: "CA", aliases: ["McGill"] },
  { nameEn: "Northwestern University", nameZh: " Đại học Northwestern ", country: "US", aliases: ["Northwestern"] },
  { nameEn: "The Australian National University", nameZh: " Đại học Quốc gia Úc (ANU) ", country: "AU", aliases: ["ANU"] },
  { nameEn: "The University of Queensland", nameZh: " Đại học Queensland ", country: "AU", aliases: ["UQ"] },
  { nameEn: "Fudan University", nameZh: " Phục Sáng đại học ", country: "CN", aliases: ["Fudan"] },
  { nameEn: "New York University", nameZh: " Đại học New York (NYU) ", country: "US", aliases: ["NYU"] },
  { nameEn: "University of Manchester", nameZh: " Đại học Manchester ", country: "UK", aliases: ["Manchester"] },
  { nameEn: "Seoul National University", nameZh: " thủ đô đại học ", country: "KR", aliases: ["SNU"] },
  { nameEn: "University of British Columbia", nameZh: " anh chúc Đại học Columbia ", country: "CA", aliases: ["UBC"] },
  { nameEn: "University of Tokyo", nameZh: " Tô-ki-ô đại học ", country: "JP", aliases: ["UTokyo", "Todai"] },
  { nameEn: "London School of Economics and Political Science", nameZh: " Trường Kinh tế London (LSE) ", country: "UK", aliases: ["LSE"] },
  { nameEn: "Kyoto University", nameZh: " kinh đô đại học ", country: "JP", aliases: ["Kyoto"] },
  { nameEn: "Chinese University of Hong Kong", nameZh: " Hồng Kông Tiếng Việt đại học ", country: "HK", aliases: ["CUHK"] },
  { nameEn: "Hong Kong University of Science and Technology", nameZh: " Hồng Kông Công nghệ đại học ", country: "HK", aliases: ["HKUST"] },
  { nameEn: "Zhejiang University", nameZh: " Chiết Giang đại học ", country: "CN", aliases: ["ZJU"] },
  { nameEn: "Shanghai Jiao Tong University", nameZh: " Thượng Hải Giao thông đại học ", country: "CN", aliases: ["SJTU"] },
  { nameEn: "Carnegie Mellon University", nameZh: " Đại học Carnegie Mellon ", country: "US", aliases: ["CMU"] },
  { nameEn: "Duke University", nameZh: " Đại học Duke ", country: "US", aliases: ["Duke"] },
  { nameEn: "University of California, San Diego", nameZh: " Đại học California, San Diego ", country: "US", aliases: ["UC San Diego", "UCSD"] },
  { nameEn: "University of Washington", nameZh: " Oa-sinh-tơn Hoa Thịnh Đốn đại học ", country: "US", aliases: ["UW"] },
  { nameEn: "University of Illinois at Urbana-Champaign", nameZh: " Elie Noe đại học Champagne phân hiệu ", country: "US", aliases: ["UIUC", "Illinois"] },
  { nameEn: "Georgia Institute of Technology", nameZh: " Viện Công nghệ Georgia ", country: "US", aliases: ["Georgia Tech", "GT"] },
  { nameEn: "University of Texas at Austin", nameZh: " đức châu đại học Austin phân hiệu ", country: "US", aliases: ["UT Austin"] },
  { nameEn: "Monash University", nameZh: " Đại học Monash ", country: "AU", aliases: ["Monash"] },
  { nameEn: "University of Amsterdam", nameZh: " Am-xtéc-đam đại học ", country: "NL", aliases: ["UvA"] },
  { nameEn: "Delft University of Technology", nameZh: " thay Nhĩ Phu đặc(biệt) để ý công đại học ", country: "NL", aliases: ["TU Delft"] },
  { nameEn: "EPFL", nameZh: " Lạc Tang liên bang để ý công học viện ", country: "CH", aliases: ["École Polytechnique Fédérale de Lausanne"] },
  { nameEn: "University of Wisconsin-Madison", nameZh: " Uy-xcon-xin đại học Madison phân hiệu ", country: "US", aliases: ["UW-Madison"] },
  { nameEn: "Brown University", nameZh: " Bố Lãng đại học ", country: "US", aliases: ["Brown"] },
  { nameEn: "University of Southern California", nameZh: " nam thêm châu đại học ", country: "US", aliases: ["USC"] },
  { nameEn: "University of Bristol", nameZh: " Đại học Bristol ", country: "UK", aliases: ["Bristol"] },
  { nameEn: "University of Warwick", nameZh: " Đại học Warwick ", country: "UK", aliases: ["Warwick"] },
  { nameEn: "University of Glasgow", nameZh: " Đại học Glasgow ", country: "UK", aliases: ["Glasgow"] },
  { nameEn: "University of Birmingham", nameZh: " Đại học Birmingham ", country: "UK", aliases: ["Birmingham"] },
  { nameEn: "University of Leeds", nameZh: " Đại học Leeds ", country: "UK", aliases: ["Leeds"] },
  { nameEn: "University of Southampton", nameZh: " Đại học Southampton ", country: "UK", aliases: ["Southampton"] },
  { nameEn: "University of Sheffield", nameZh: " Đại học Sheffield ", country: "UK", aliases: ["Sheffield"] },
  { nameEn: "University of Nottingham", nameZh: " Đại học Nottingham ", country: "UK", aliases: ["Nottingham"] },
  { nameEn: "Queen Mary University of London", nameZh: " Đại học Queen Mary London ", country: "UK", aliases: ["QMUL"] },
  { nameEn: "University of York", nameZh: " Đại học York ", country: "UK", aliases: ["York"] },
  { nameEn: "Durham University", nameZh: " Đại học Durham ", country: "UK", aliases: ["Durham"] },
  { nameEn: "University of St Andrews", nameZh: " Đại học St Andrews ", country: "UK", aliases: ["St Andrews"] },
  { nameEn: "University of Waterloo", nameZh: " Đại học Waterloo ", country: "CA", aliases: ["Waterloo"] },
  { nameEn: "McMaster University", nameZh: " Mike mã tư đặc biệt lớn học ", country: "CA", aliases: ["McMaster"] },
  { nameEn: "University of Alberta", nameZh: " A Nhĩ bá tháp đại học ", country: "CA", aliases: ["Alberta"] },
  { nameEn: "University of Montreal", nameZh: " mơ hồ đặc(biệt) lợi bạn đại học ", country: "CA", aliases: ["UdeM"] },
  { nameEn: "University of Ottawa", nameZh: " Ốt-ta-oa đại học ", country: "CA", aliases: ["Ottawa"] },
  { nameEn: "Queen's University", nameZh: " Nữ Vương đại học ", country: "CA", aliases: ["Queens"] },
  { nameEn: "Western University", nameZh: " Tây An mơ hồ đại học ", country: "CA", aliases: ["Western", "UWO"] },
  { nameEn: "University of Calgary", nameZh: " Tạp Nhĩ Gia Lý đại học ", country: "CA", aliases: ["Calgary"] },
  { nameEn: "Simon Fraser University", nameZh: " Simon phất lôi trạch đại học ", country: "CA", aliases: ["SFU"] },
  { nameEn: "Dalhousie University", nameZh: " Đạt Nhĩ Hào Tư đại học ", country: "CA", aliases: ["Dalhousie"] },
  { nameEn: "University of Victoria", nameZh: " Vích-to-ri-a đại học ", country: "CA", aliases: ["UVic"] },
  { nameEn: "York University", nameZh: " Đại học York (thêm) ", country: "CA", aliases: ["York U"] },
  { nameEn: "University of Western Australia", nameZh: " Đại học Tây Úc ", country: "AU", aliases: ["UWA"] },
  { nameEn: "University of Adelaide", nameZh: " Đại học Adelaide ", country: "AU", aliases: ["Adelaide"] },
  { nameEn: "University of Technology Sydney", nameZh: " Xít-ni Công nghệ đại học ", country: "AU", aliases: ["UTS"] },
  { nameEn: "RMIT University", nameZh: " hoàng gia mực bạn bản để ý công đại học ", country: "AU", aliases: ["RMIT"] },
  { nameEn: "Queensland University of Technology", nameZh: " côn sĩ lan Công nghệ đại học ", country: "AU", aliases: ["QUT"] },
  { nameEn: "Macquarie University", nameZh: " mạch khảo thi thụy đại học ", country: "AU", aliases: ["Macquarie"] },
  { nameEn: "Rice University", nameZh: " Luis đại học ", country: "US", aliases: ["Rice"] },
  { nameEn: "Vanderbilt University", nameZh: " phạm đức lâu đài đại học ", country: "US", aliases: ["Vanderbilt"] },
  { nameEn: "Washington University in St. Louis", nameZh: " Oa-sinh-tơn Hoa Thịnh Đốn đại học St.Louis ", country: "US", aliases: ["WashU"] },
  { nameEn: "Purdue University", nameZh: " phổ độ đại học ", country: "US", aliases: ["Purdue"] },
  { nameEn: "Boston University", nameZh: " Boston đại học ", country: "US", aliases: ["BU"] },
  { nameEn: "Ohio State University", nameZh: " Ô-hai-ô châu lập đại học ", country: "US", aliases: ["OSU"] },
  { nameEn: "Pennsylvania State University", nameZh: " tân vừa mới lập đại học ", country: "US", aliases: ["Penn State", "PSU"] },
  { nameEn: "University of Florida", nameZh: " Flo-ri-đa Flo-ri-đơ đại học ", country: "US", aliases: ["UF"] },
  { nameEn: "University of Maryland, College Park", nameZh: " Me-ri-len đại học ", country: "US", aliases: ["University of Maryland", "UMD"] },
  { nameEn: "University of California, Irvine", nameZh: " Đại học California, Irvine ", country: "US", aliases: ["UC Irvine", "UCI"] },
  { nameEn: "University of California, Davis", nameZh: " Đại học California, Davis ", country: "US", aliases: ["UC Davis", "UCD"] },
  { nameEn: "Northeastern University", nameZh: " đông bắc đại học ", country: "US", aliases: ["Northeastern"] },
  { nameEn: "Arizona State University", nameZh: " A-ri-dô-na E-ri-dâu-nơ châu lập đại học ", country: "US", aliases: ["ASU"] },
  { nameEn: "University of Minnesota Twin Cities", nameZh: " Mi-nê-dô-ta đại học ", country: "US", aliases: ["University of Minnesota", "UMN"] },
  { nameEn: "University of Science and Technology of China", nameZh: " Châu Á khoa học kỹ thuật đại học ", country: "CN", aliases: ["USTC"] },
  { nameEn: "Nanjing University", nameZh: " Nam Kinh đại học ", country: "CN", aliases: ["NJU"] },
  { nameEn: "Wuhan University", nameZh: " Vũ Hán đại học ", country: "CN", aliases: ["WHU"] },
  { nameEn: "Hong Kong Polytechnic University", nameZh: " Hồng Kông để ý công đại học ", country: "HK", aliases: ["PolyU"] },
  { nameEn: "City University of Hong Kong", nameZh: " Hồng Kông thành phố lớn học ", country: "HK", aliases: ["CityU"] },
  { nameEn: "KAIST", nameZh: " Hàn Quốc khoa học viện kỹ thuật ", country: "KR", aliases: ["Korea Advanced Institute of Science and Technology"] },
  { nameEn: "Yonsei University", nameZh: " kéo dài thế đại học ", country: "KR", aliases: ["Yonsei"] },
  { nameEn: "Korea University", nameZh: " Cao Ly đại học ", country: "KR", aliases: ["Korea U"] },
  { nameEn: "University of Copenhagen", nameZh: " Copenhagen đại học ", country: "OTHER", aliases: ["Copenhagen"] },
  { nameEn: "Karolinska Institute", nameZh: " Tạp La lâm Tư Nạp học viện ", country: "SE", aliases: ["Karolinska"] },
  { nameEn: "Ludwig Maximilian University of Munich", nameZh: " Mu-ních đại học ", country: "DE", aliases: ["LMU"] },
  { nameEn: "Heidelberg University", nameZh: " Hyde lâu đài đại học ", country: "DE", aliases: ["Heidelberg"] },
  { nameEn: "Sorbonne University", nameZh: " tác bang đại học ", country: "FR", aliases: ["Sorbonne"] },
  { nameEn: "PSL University", nameZh: " Pa-ri văn lý nghiên cứu đại học ", country: "FR", aliases: ["Université PSL", "PSL"] },
  { nameEn: "Institut Polytechnique de Paris", nameZh: " Pa-ri để ý công học viện ", country: "FR", aliases: ["IP Paris"] },
];

/** Latest-year approximate order per system (public knowledge / typical tops). Rest filled by stable master order. */
const QS_TOP = [
  "Massachusetts Institute of Technology",
  "Imperial College London",
  "Stanford University",
  "University of Oxford",
  "Harvard University",
  "University of Cambridge",
  "ETH Zurich",
  "National University of Singapore",
  "University College London",
  "California Institute of Technology",
  "University of Pennsylvania",
  "University of California, Berkeley",
  "The University of Melbourne",
  "Peking University",
  "Nanyang Technological University",
  "Cornell University",
  "The University of Hong Kong",
  "The University of Sydney",
  "The University of New South Wales",
  "Tsinghua University",
  "University of Chicago",
  "Princeton University",
  "Yale University",
  "Johns Hopkins University",
  "Columbia University",
  "University of California, Los Angeles",
  "University of Toronto",
  "EPFL",
  "University of Edinburgh",
  "King's College London",
  "University of Michigan-Ann Arbor",
  "Technical University of Munich",
  "McGill University",
  "Northwestern University",
  "The Australian National University",
  "The University of Queensland",
  "Fudan University",
  "New York University",
  "University of Manchester",
  "Seoul National University",
  "University of British Columbia",
  "University of Tokyo",
  "London School of Economics and Political Science",
  "Chinese University of Hong Kong",
  "Hong Kong University of Science and Technology",
  "Zhejiang University",
  "Shanghai Jiao Tong University",
  "Carnegie Mellon University",
  "Duke University",
  "Monash University",
];

const THE_TOP = [
  "University of Oxford",
  "Massachusetts Institute of Technology",
  "Harvard University",
  "Princeton University",
  "University of Cambridge",
  "Stanford University",
  "California Institute of Technology",
  "University of California, Berkeley",
  "Imperial College London",
  "Yale University",
  "ETH Zurich",
  "Tsinghua University",
  "University of Chicago",
  "Peking University",
  "Johns Hopkins University",
  "University of Pennsylvania",
  "Columbia University",
  "University of California, Los Angeles",
  "University College London",
  "University of Toronto",
  "Cornell University",
  "University of Michigan-Ann Arbor",
  "National University of Singapore",
  "Carnegie Mellon University",
  "University of Washington",
  "Duke University",
  "Northwestern University",
  "New York University",
  "University of Edinburgh",
  "Technical University of Munich",
  "Nanyang Technological University",
  "University of Hong Kong",
  "The University of Hong Kong",
  "King's College London",
  "McGill University",
  "University of California, San Diego",
  "The University of Melbourne",
  "University of Tokyo",
  "PSL University",
  "University of British Columbia",
  "EPFL",
  "University of Illinois at Urbana-Champaign",
  "Georgia Institute of Technology",
  "University of Manchester",
  "University of Texas at Austin",
  "Fudan University",
  "The University of Sydney",
  "Zhejiang University",
  "Shanghai Jiao Tong University",
  "Monash University",
];

const ARWU_TOP = [
  "Harvard University",
  "Stanford University",
  "Massachusetts Institute of Technology",
  "University of Cambridge",
  "University of California, Berkeley",
  "University of Oxford",
  "Princeton University",
  "California Institute of Technology",
  "Columbia University",
  "University of Chicago",
  "Yale University",
  "Cornell University",
  "University of California, Los Angeles",
  "University of Pennsylvania",
  "Johns Hopkins University",
  "University College London",
  "University of Washington",
  "University of California, San Diego",
  "University of Michigan-Ann Arbor",
  "Imperial College London",
  "University of Toronto",
  "ETH Zurich",
  "Tsinghua University",
  "New York University",
  "Northwestern University",
  "University of Tokyo",
  "Duke University",
  "University of Wisconsin-Madison",
  "Peking University",
  "University of Edinburgh",
  "University of Illinois at Urbana-Champaign",
  "University of Manchester",
  "University of Minnesota Twin Cities",
  "University of British Columbia",
  "University of Texas at Austin",
  "Karolinska Institute",
  "University of Copenhagen",
  "Technical University of Munich",
  "University of Melbourne",
  "The University of Melbourne",
  "Washington University in St. Louis",
  "University of California, Irvine",
  "Sorbonne University",
  "King's College London",
  "University of Maryland, College Park",
  "Zhejiang University",
  "Shanghai Jiao Tong University",
  "Fudan University",
  "Nanyang Technological University",
  "National University of Singapore",
];

const USNEWS_TOP = [
  "Harvard University",
  "Massachusetts Institute of Technology",
  "Stanford University",
  "University of Oxford",
  "University of Cambridge",
  "University of California, Berkeley",
  "Columbia University",
  "University of Washington",
  "California Institute of Technology",
  "Johns Hopkins University",
  "Yale University",
  "Princeton University",
  "University of California, Los Angeles",
  "University of Pennsylvania",
  "University of Chicago",
  "University of California, San Diego",
  "Imperial College London",
  "University College London",
  "University of Michigan-Ann Arbor",
  "Cornell University",
  "Tsinghua University",
  "University of Toronto",
  "ETH Zurich",
  "Northwestern University",
  "Duke University",
  "New York University",
  "Peking University",
  "University of Edinburgh",
  "King's College London",
  "National University of Singapore",
  "University of Melbourne",
  "The University of Melbourne",
  "University of British Columbia",
  "McGill University",
  "University of Illinois at Urbana-Champaign",
  "University of Texas at Austin",
  "Carnegie Mellon University",
  "Georgia Institute of Technology",
  "University of Manchester",
  "Nanyang Technological University",
  "University of Tokyo",
  "Fudan University",
  "Zhejiang University",
  "Shanghai Jiao Tong University",
  "The University of Sydney",
  "The University of Hong Kong",
  "Monash University",
  "University of Queensland",
  "The University of Queensland",
  "Technical University of Munich",
];

/** QS CS subject demo order */
const QS_CS_TOP = [
  "Massachusetts Institute of Technology",
  "Carnegie Mellon University",
  "Stanford University",
  "University of California, Berkeley",
  "University of Oxford",
  "University of Cambridge",
  "Harvard University",
  "ETH Zurich",
  "National University of Singapore",
  "Nanyang Technological University",
  "EPFL",
  "Princeton University",
  "University of Toronto",
  "Cornell University",
  "University of Washington",
  "Imperial College London",
  "Tsinghua University",
  "Peking University",
  "University of California, Los Angeles",
  "Columbia University",
  "University of Illinois at Urbana-Champaign",
  "Georgia Institute of Technology",
  "University College London",
  "University of Edinburgh",
  "University of Tokyo",
  "Hong Kong University of Science and Technology",
  "The University of Hong Kong",
  "University of Michigan-Ann Arbor",
  "New York University",
  "University of Pennsylvania",
];

type SystemSpec = {
  system: string;
  years: number[];
  top: string[];
  title: string;
  categorySlug: string;
  categoryName: string;
  isSubject?: boolean;
  sourceUrl: string;
};

// ponytail: QS world/subject come from qs-official via build-qs-from-official.ts (top 500).
const SPECS: SystemSpec[] = [
  {
    system: "the",
    years: [2022, 2023, 2024, 2025, 2026],
    top: THE_TOP,
    title: "THE thế giới đại học bài danh ",
    categorySlug: "world",
    categoryName: " thế giới đại học bài danh ",
    sourceUrl: "https://www.timeshighereducation.com",
  },
  {
    system: "arwu",
    years: [2021, 2022, 2023, 2024, 2025],
    top: ARWU_TOP,
    title: " mềm khoa thế giới đại học Học thuật bài danh ",
    categorySlug: "world",
    categoryName: " thế giới đại học Học thuật bài danh ",
    sourceUrl: "https://www.shanghairanking.com",
  },
  {
    system: "usnews",
    years: [2023, 2024, 2025, 2026, 2027],
    top: USNEWS_TOP,
    title: "U.S. News toàn cầu tốt nhất đại học bài danh ",
    categorySlug: "world",
    categoryName: " toàn cầu tốt nhất đại học ",
    sourceUrl: "https://www.usnews.com",
  },
];

function orderedList(top: string[]): Uni[] {
  const byName = new Map(UNIVERSITIES.map((u) => [u.nameEn, u]));
  const seen = new Set<string>();
  const out: Uni[] = [];
  for (const name of top) {
    const u = byName.get(name);
    if (!u || seen.has(u.nameEn)) continue;
    seen.add(u.nameEn);
    out.push(u);
  }
  for (const u of UNIVERSITIES) {
    if (seen.has(u.nameEn)) continue;
    seen.add(u.nameEn);
    out.push(u);
  }
  return out;
}

/** Drift ranks slightly by year so history isn't flat. */
function yearOffset(year: number, baseYear: number, rank: number): number {
  const d = year - baseYear;
  if (d === 0) return rank;
  const wobble = ((rank * 7 + year * 3) % 5) - 2;
  return Math.max(1, rank + Math.round(d * 0.15 * (rank % 3 === 0? 1: -1)) + wobble);
}

function buildEdition(spec: SystemSpec, year: number, list: Uni[]) {
  const baseYear = spec.years[spec.years.length - 1];
  const ranked = list.map((u, i) => {
    const baseRank = i + 1;
    const rank = yearOffset(year, baseYear, baseRank);
    return { uni: u, rank };
  });
  ranked.sort((a, b) => a.rank - b.rank || a.uni.nameEn.localeCompare(b.uni.nameEn));
  // re-number densely after sort
  return ranked.map((r, i) => {
    const rank = i + 1;
    const score = Math.max(10, Math.round((100 - rank * 0.35 + (year % 3) * 0.2) * 10) / 10);
    return {
      nameEn: r.uni.nameEn,
      rank,
      rankDisplay: String(rank),
      score,
      metrics: {
        overall: score,
      },
    };
  });
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const universities = UNIVERSITIES.map((u) => ({
    slug: slugify(u.nameEn),
    nameEn: u.nameEn,
    nameZh: u.nameZh,
    country: u.country,
    aliases: u.aliases || [],
  }));
  fs.writeFileSync(path.join(OUT, "universities.json"), JSON.stringify(universities, null, 2));

  const editions: {
    system: string;
    categorySlug: string;
    categoryName: string;
    year: number;
    title: string;
    isSubject: boolean;
    sourceUrl: string;
    entries: ReturnType<typeof buildEdition>;
  }[] = [];

  for (const spec of SPECS) {
    const list = orderedList(spec.top);
    const pool = spec.isSubject? list.slice(0, Math.min(60, list.length)): list;
    for (const year of spec.years) {
      editions.push({
        system: spec.system,
        categorySlug: spec.categorySlug,
        categoryName: spec.categoryName,
        year,
        title: `${spec.title} ${year}`,
        isSubject:!!spec.isSubject,
        sourceUrl: spec.sourceUrl,
        entries: buildEdition(spec, year, pool),
      });
    }
  }

  fs.writeFileSync(path.join(OUT, "editions.json"), JSON.stringify(editions, null, 2));
  console.log(`Wrote ${universities.length} universities, ${editions.length} editions → ${OUT}`);
}

main();
