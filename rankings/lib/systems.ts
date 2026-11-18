export type SystemKey = "qs" | "the" | "arwu" | "usnews";

export type SystemMeta = {
  key: SystemKey;
  name: string;
  shortName: string;
  sourceUrl: string;
  sourceHost: string;
  started: number;
  latestYear: number;
  blurb: string;
  method: string;
};

export const SYSTEMS: Record<SystemKey, SystemMeta> = {
  qs: {
    key: "qs",
    name: "QS thế giới đại học bài danh ",
    shortName: "QS",
    sourceUrl: "https://www.topuniversities.com",
    sourceHost: "www.topuniversities.com",
    started: 2004,
    latestYear: 2027,
    blurb:
      " do Quacquarelli Symonds tuyên bố, từ Học thuật danh dự, cố chủ danh dự, thầy trò so với, trích dẫn dẫn đầu, quốc tế giáo viên và quốc tế Học viên tỉ lệ {các loại:đợi} duy độ ước định toàn cầu đại học. ",
    method:
      " Học thuật danh dự và cố chủ danh dự cộng lại quyền trọng tương đối cao; khác hàm thầy trò so với, đơn vị giáo viên trích dẫn, quốc tế Giáo viên / Học viên tỉ lệ và có thể tiếp tục phát triển {các loại:đợi} chỉ tiêu. ",
  },
  the: {
    key: "the",
    name: " Thames giáo dục cao đẳng thế giới đại học bài danh ",
    shortName: "THE",
    sourceUrl: "https://www.timeshighereducation.com",
    sourceHost: "www.timeshighereducation.com",
    started: 2004,
    latestYear: 2026,
    blurb:
      " do « Thames giáo dục cao đẳng » tuyên bố, từ dạy học, nghiên cứu Môi trường, nghiên cứu chất lượng, sản nghiệp và quốc tế triển vọng {các loại:đợi} duy độ ước định nghiên cứu hình đại học. ",
    method:
      " dạy học, nghiên cứu Môi trường, nghiên cứu chất lượng, sản nghiệp thu nhập, quốc tế triển vọng tổng 13 hạng tích hiệu quả chỉ tiêu; lời trích dẫn số liệu thường và Scopus hợp tác. ",
  },
  arwu: {
    key: "arwu",
    name: " mềm khoa thế giới đại học Học thuật bài danh ",
    shortName: "ARWU",
    sourceUrl: "https://www.shanghairanking.com",
    sourceHost: "www.shanghairanking.com",
    started: 2003,
    latestYear: 2025,
    blurb:
      " do Thượng Hải mềm khoa tuyên bố, trọng điểm dạ thưởng / Phil tư thưởng, cao bị dẫn học giả, Nature/Science và SCI/SSCI {các loại:đợi} khách quan Học thuật sản xuất. ",
    method:
      " trúng thưởng đồng học và giáo viên, cao bị dẫn học giả, Nature & Science, luận văn số lượng và sinh đều Học thuật biểu hiện {các loại:đợi} có thể hạch nghiệm chỉ tiêu. ",
  },
  usnews: {
    key: "usnews",
    name: "U.S. News toàn cầu tốt nhất đại học bài danh ",
    shortName: "US News",
    sourceUrl: "https://www.usnews.com",
    sourceHost: "www.usnews.com",
    started: 2014,
    latestYear: 2027,
    blurb:
      " do « Hoa Kỳ tin tức và thế giới đưa tin » tuyên bố, tập trung toàn cầu nghiên cứu danh dự, phát biểu, trích dẫn và quốc tế hợp tác {các loại:đợi} nghiên cứu biểu hiện. ",
    method:
      " toàn cầu / khu vực nghiên cứu danh dự, phát biểu tham dự hội nghị nghị, quy nhất hóa trích dẫn, cao bị dẫn luận văn, quốc tế hợp tác {các loại:đợi} ước 13 hạng chỉ tiêu. ",
  },
};

export const SYSTEM_ORDER: SystemKey[] = ["qs", "the", "arwu", "usnews"];

export const COUNTRY_LABELS: Record<string, string> = {
  US: " Hoa Kỳ ",
  UK: " Vương quốc Anh ",
  CA: " Canada ",
  AU: " Úc ",
  CN: " Châu Á ",
  HK: " Hồng Kông ",
  SG: " Singapore ",
  JP: " Nhật Bản ",
  KR: " Hàn Quốc ",
  DE: " Đức ",
  FR: " Pháp ",
  CH: " Thụy Sĩ ",
  NL: " Hà Lan ",
  SE: " Thuỵ Điển ",
  OTHER: " Khác ",
};

/** Tape colors for the four ranking tracks (dashboard UI). */
export const SYSTEM_TRACK: Record<SystemKey, string> = {
  qs: "#e11d48",
  the: "#2563eb",
  arwu: "#ca8a04",
  usnews: "#0d9488",
};

export function countryLabel(code: string): string {
  return COUNTRY_LABELS[code] || code;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
