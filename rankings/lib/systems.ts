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
    name: "QS thế giới Đại học xếp hạng ",
    shortName: "QS",
    sourceUrl: "https://www.topuniversities.com",
    sourceHost: "www.topuniversities.com",
    started: 2004,
    latestYear: 2027,
    blurb:
      " do Quacquarelli Symonds phát hành, biến thể của | học thuật danh tiếng, người thuê lao động danh tiếng, giáo viên và học sinh Bỉ, trích dẫn tỉ lệ, quốc tế giáo viên biến thể của | quốc tế học sinh tỷ lệ đợi chiều đánh giá toàn thế giới Đại học ",
    method:
      " học thuật danh tiếng biến thể của | người thuê lao động danh tiếng cộng tổng trọng số so sánh cao; khác ngậm trong miệng giáo viên và học sinh Bỉ, đơn vị giáo viên trích dẫn, quốc tế giáo viên/học sinh tỷ lệ và phát triển bền vững đợi mục tiêu ",
  },
  the: {
    key: "the",
    name: " báo The Times giáo dục cao đẳng và đại học thế giới Đại học xếp hạng ",
    shortName: "THE",
    sourceUrl: "https://www.timeshighereducation.com",
    sourceHost: "www.timeshighereducation.com",
    started: 2004,
    latestYear: 2026,
    blurb:
      " do«báo The Times giáo dục cao đẳng và đại học»phát hành, làm giáo viên học, nghiên cứu môi trường, nghiên cứu chất lượng, công nghiệp biến thể của | quốc tế triển vọng đợi chiều đánh giá nghiên cứu khuôn Đại học ",
    method:
      " dạy, nghiên cứu môi trường, nghiên cứu chất lượng, công nghiệp thu vào, quốc tế triển vọng chung 13 sau cổ hiệu suất mục tiêu; trích dẫn dữ liệu luôn luôn biến thể của | Scopus hợp tác ",
  },
  arwu: {
    key: "arwu",
    name: " mềm ngành học thế giới Đại học học thuật xếp hạng ",
    shortName: "ARWU",
    sourceUrl: "https://www.shanghairanking.com",
    sourceHost: "www.shanghairanking.com",
    started: 2003,
    latestYear: 2025,
    blurb:
      " theo Thành phố Thượng Hải mềm ngành học phát hành, đặt sự nhấn mạnh đặc biệt vào Giải Nobel/Giải thưởng Fields, cao chăn kéo học giả, Nature/Science và SCI/SSCI đợi khách quan học thuật sản xuất ",
    method:
      " giành được giải thưởng bạn học biến thể của | giáo viên, cao chăn kéo học giả, Nature & Science, bài báo số lượng biến thể của | được sinh bằng học thuật thể hiện đợi có thể hạt nhân biến thể của | mục tiêu ",
  },
  usnews: {
    key: "usnews",
    name: "U.S. News toàn thế giới tối ưu Đại học xếp hạng ",
    shortName: "US News",
    sourceUrl: "https://www.usnews.com",
    sourceHost: "www.usnews.com",
    started: 2014,
    latestYear: 2027,
    blurb:
      " do«Hoa Kỳ tin tức biến thể của | tên của các tờ báo khác nhau đường»phát hành, tập trung toàn thế giới nghiên cứu danh tiếng, phát hành, trích dẫn biến thể của | quốc tế hợp tác đợi nghiên cứu thể hiện ",
    method:
      " toàn thế giới/khu vực nghiên cứu danh tiếng, phát hành tham gia cuộc họp bình luận, trở về một biến thể của trích dẫn, cao chăn kéo bài báo, quốc tế hợp tác đợi cân trong cân đĩa hoặc trên cân 13 sau cổ mục tiêu ",
  },
};

export const SYSTEM_ORDER: SystemKey[] = ["qs", "the", "arwu", "usnews"];

export const COUNTRY_LABELS: Record<string, string> = {
  US: " Hoa Kỳ ",
  UK: " Vương quốc Anh ",
  CA: " Canada ",
  AU: " Úc ",
  CN: " Trung Quốc ",
  HK: " Trung Quốc Hồng Kông ",
  SG: " Singapore ",
  JP: " Nhật Bản ",
  KR: " Hàn Quốc ",
  DE: " Đức ",
  FR: " Pháp ",
  CH: " Thụy Sĩ ",
  NL: " Hà Lan ",
  SE: " Thụy Điển ",
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
