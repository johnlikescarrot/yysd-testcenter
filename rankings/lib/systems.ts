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
    name: "QS thế giớiĐại họcXếp hạng",
    shortName: "QS",
    sourceUrl: "https://www.topuniversities.com",
    sourceHost: "www.topuniversities.com",
    started: 2004,
    latestYear: 2027,
    blurb:
      " Quacquarelli Symonds phát hành,biến thể củaHọc thuậtdanh tiếng,người thuê lao độngdanh tiếng,giáo viên và học sinhBỉ,trích dẫntỉ lệ,quốc tếgiáo viênquốc tếHọc viêntỷ lệđợichiều toán họcđánh giátoàn thế giớiĐại học.",
    method:
      "Học thuậtdanh tiếngngười thuê lao độngdanh tiếngcộng tổngtrọng số tức là tầm quan trọng gắn với điều gì đóhình thức ràng buộc so sánh họ;khác ngậm trong miệnggiáo viên và học sinhBỉ,đơn vị đo lườnggiáo viêntrích dẫn,quốc tếGiáo viên/Học viêntỷ lệvàphát triển bền vữngđợimục tiêu sản xuất.",
  },
  the: {
    key: "the",
    name: "báo The Timesgiáo dục cao đẳng và đại họcthế giớiĐại họcXếp hạng",
    shortName: "THE",
    sourceUrl: "https://www.timeshighereducation.com",
    sourceHost: "www.timeshighereducation.com",
    started: 2004,
    latestYear: 2026,
    blurb:
      "«báo The Timesgiáo dục cao đẳng và đại học»phát hành,làm giáo viênhọc,nghiên cứuMôi trường,nghiên cứuchất lượng,công nghiệpquốc tếtriển vọngđợichiều toán họcđánh giánghiên cứukhuônĐại học.",
    method:
      "dạy như một giáo sư,nghiên cứuMôi trường,nghiên cứuchất lượng,công nghiệpthu vào,quốc tếtriển vọng 13 họhiệu suấtmục tiêu sản xuất;trích dẫndữ liệuhọ Scopus hợp tác.",
  },
  arwu: {
    key: "arwu",
    name: "mềm ngành họcthế giớiĐại họcHọc thuậtXếp hạng",
    shortName: "ARWU",
    sourceUrl: "https://www.shanghairanking.com",
    sourceHost: "www.shanghairanking.com",
    started: 2003,
    latestYear: 2025,
    blurb:
      "Thành phố Thượng Hảimềm ngành họcphát hành,đặt sự nhấn mạnh đặc biệt vàoGiải Nobel/Giải thưởng Fields cho toán học,họ chăn kéo ví dụ: dây cunghọc giả,Nature/Science  SCI/SSCI đợikhách quanHọc thuậtsản xuất sinh viên tốt nghiệp.",
    method:
      "giành được giải thưởngbạn họcgiáo viên,họ chăn kéo ví dụ: dây cunghọc giả,Nature & Science,bài báosố lượngđược sinh bằngHọc thuậtthể hiệnđợi tiền tố có thể hạt nhân biến thể củamục tiêu sản xuất.",
  },
  usnews: {
    key: "usnews",
    name: "U.S. News toàn thế giớitối ưuĐại họcXếp hạng",
    shortName: "US News",
    sourceUrl: "https://www.usnews.com",
    sourceHost: "www.usnews.com",
    started: 2014,
    latestYear: 2027,
    blurb:
      "«Hoa Kỳtin tứctên của các tờ báo khác nhauđường»phát hành,tập trungtoàn thế giớinghiên cứudanh tiếng,phát hành,trích dẫnquốc tếhợp tácđợinghiên cứuthể hiện.",
    method:
      "toàn thế giới/khu vựcnghiên cứudanh tiếng,phát hànhtham gia cuộc họpbình luận,họ một biến thể củatrích dẫn,họ chăn kéo ví dụ: dây cungbài báo,quốc tếhợp tácđợi cân trong cân đĩa hoặc trên cân 13 họmục tiêu sản xuất.",
  },
};

export const SYSTEM_ORDER: SystemKey[] = ["qs", "the", "arwu", "usnews"];

export const COUNTRY_LABELS: Record<string, string> = {
  US: "Hoa Kỳ",
  UK: "Vương quốc Anh",
  CA: "thêmra vẻ",
  AU: "Úc",
  CN: "Trung Quốc",
  HK: "Trung QuốcHồng Kông",
  SG: "viết tắt của Tân Cương thêm dốc",
  JP: "Nhật Bản",
  KR: "Hàn Quốc Đại Hàn Dân Quốc",
  DE: "Đức",
  FR: "Pháp",
  CH: "Thụy Sĩ",
  NL: "Hà Lan",
  SE: "Thụy Điển",
  OTHER: "Khác",
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
