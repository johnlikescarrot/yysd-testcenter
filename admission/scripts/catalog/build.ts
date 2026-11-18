import {
  type Country,
  type Field,
  type SchoolSeed,
  slugify,
} from "./fields";
import { isVerifiedSchool } from "../../data/verified-programs";

export type Institution = {
  name: string;
  country: Country;
  city: string;
  tier: number;
  website: string;
  fields: Field[];
};

type ProgMeta = {
  program: string;
  programZh: string;
  degreeUS: string;
  degreeUK: string;
  isStem: boolean;
  durationUS: string;
  durationUK: string;
  blurb: string;
};

/** Multiple graduate programs per field — curated catalog approximating common official offerings */
const PROGRAMS_BY_FIELD: Record<Field, ProgMeta[]> = {
  cs: [
    {
      program: "Computer Science",
      programZh: " Khoa học máy tính ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1.5–2 years",
      durationUK: "1 year",
      blurb: " hệ thống, phép tính, phần mềm và tính toán lý luận phương hướng nghiên cứu sinh chương trình học. ",
    },
    {
      program: "Software Engineering",
      programZh: " phần mềm công trình ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " mặt hướng phần mềm xếp đặt thiết kế, công trình thực tế và cỡ lớn hệ thống giao phó chuyên nghiệp học vị. ",
    },
    {
      program: "Cybersecurity",
      programZh: " Internet Security ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " an toàn hệ thống, công thủ và việc riêng tư bảo hộ tương quan nghiên cứu sinh hạng mục. ",
    },
  ],
  engineering: [
    {
      program: "Electrical Engineering",
      programZh: " điện khí công trình ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1.5–2 years",
      durationUK: "1 year",
      blurb: " điện tử, thư từ qua lại, điện lực và hệ thống điều khiển {các loại:đợi} phương hướng. ",
    },
    {
      program: "Mechanical Engineering",
      programZh: " máy móc công trình ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1.5–2 years",
      durationUK: "1 year",
      blurb: " cơ học, chế tạo, nhiệt lưu và cơ điện nhất thể hóa phương hướng. ",
    },
  ],
  data_ai: [
    {
      program: "Data Science",
      programZh: " số liệu khoa học ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " công tác thống kê, máy móc Học tập và số liệu công trình đan chéo hữu ích,thiết thực hình nghiên cứu sinh hạng mục. ",
    },
    {
      program: "Artificial Intelligence",
      programZh: " trí tuệ nhân tạo ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " máy móc Học tập, chiều sâu Học tập và hệ thống trí năng phương hướng. ",
    },
    {
      program: "Business Analytics",
      programZh: " Kinh doanh phân tích ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1–1.5 years",
      durationUK: "1 year",
      blurb: " số liệu phân tích khu động Kinh doanh quyết sách vượt qua ngành học hạng mục (thiên hữu ích,thiết thực). ",
    },
  ],
  business: [
    {
      program: "Business Analytics",
      programZh: " Kinh doanh phân tích ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: false,
      durationUS: "1–1.5 years",
      durationUK: "1 year",
      blurb: " số liệu và Quản trị kết hợp Kinh doanh nghiên cứu sinh hạng mục. ",
    },
    {
      program: "Management",
      programZh: " Quản trị học ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " tổ chức Quản trị, chiến lược và lãnh đạo lực phương hướng. ",
    },
  ],
  finance: [
    {
      program: "Finance",
      programZh: " tài chính ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " công ty tài chính, tài sản định giá và thị trường chứng khoán phương hướng. ",
    },
    {
      program: "Financial Engineering",
      programZh: " tài chính công trình ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1–1.5 years",
      durationUK: "1 year",
      blurb: " định lượng tài chính, diễn sinh phẩm và mạo hiểm Quản trị phương hướng. ",
    },
  ],
  science: [
    {
      program: "Physics",
      programZh: " vật lý học ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1.5–2 years",
      durationUK: "1 year",
      blurb: " vật lý học nghiên cứu hình hoặc giảng bài hình nghiên cứu sinh hạng mục. ",
    },
    {
      program: "Mathematics",
      programZh: " Toán học ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1.5–2 years",
      durationUK: "1 year",
      blurb: " thuần túy mấy / hữu ích,thiết thực Toán học phương hướng nghiên cứu sinh chương trình học. ",
    },
  ],
  life_health: [
    {
      program: "Public Health",
      programZh: " vệ sinh công cộng ",
      degreeUS: "MPH",
      degreeUK: "MSc",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " bệnh truyền nhiễm học, Sức khỏe chính sách và vệ sinh công cộng thực tế. ",
    },
    {
      program: "Biotechnology",
      programZh: " Sinh học kỹ thuật ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " Sinh học kỹ thuật nghiên cứu phát minh và sản nghiệp hữu ích,thiết thực phương hướng. ",
    },
  ],
  arts_design: [
    {
      program: "Design",
      programZh: " xếp đặt thiết kế ",
      degreeUS: "MDes",
      degreeUK: "MA",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " sản phẩm / lẫn nhau / thị giác {các loại:đợi} xếp đặt thiết kế loại nghiên cứu sinh hạng mục. ",
    },
    {
      program: "Media Studies",
      programZh: " truyền thông nghiên cứu ",
      degreeUS: "MA",
      degreeUK: "MA",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " truyền thông, truyền bá và con số văn hóa phương hướng. ",
    },
  ],
  social: [
    {
      program: "International Relations",
      programZh: " quốc tế quan hệ ",
      degreeUS: "MA",
      degreeUK: "MSc",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " quốc tế chính trị, ngoại giao và toàn cầu thống trị phương hướng. ",
    },
    {
      program: "Sociology",
      programZh: " xã hội học ",
      degreeUS: "MA",
      degreeUK: "MSc",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " xã hội lý luận và chứng minh thực tế nghiên cứu phương pháp phương hướng. ",
    },
  ],
  education: [
    {
      program: "Education",
      programZh: " Giáo dục học ",
      degreeUS: "MEd",
      degreeUK: "MA",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " Giáo dục lý luận, chương trình học và dạy học thực tế phương hướng. ",
    },
  ],
  law: [
    {
      program: "Law",
      programZh: " luật học (LLM) ",
      degreeUS: "LLM",
      degreeUK: "LLM",
      isStem: false,
      durationUS: "1 year",
      durationUK: "1 year",
      blurb: " luật học Thạc sĩ, thông thường với đất nước tế pháp / thương lượng pháp {các loại:đợi} mảnh điểm phương hướng. ",
    },
  ],
  other: [
    {
      program: "Interdisciplinary Studies",
      programZh: " vượt qua ngành học nghiên cứu ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " vượt qua ngành học định chế(*hàng đặt theo yêu cầu) hình nghiên cứu sinh hạng mục. ",
    },
  ],
};

function thresholds(country: Country, tier: number, field: Field) {
  const baseAvg = tier === 1? 3.75: tier === 2? 3.55: 3.35;
  const fieldBump =
    field === "cs" || field === "data_ai" || field === "finance"? 0.08: 0;
  const avgGpa = Math.min(3.95, baseAvg + fieldBump);
  const minGpa = Math.max(2.8, avgGpa - 0.45);

  if (country === "UK" || country === "AU") {
    return {
      avgGpa,
      minGpa,
      minToefl: null as number | null,
      minIelts: tier === 1? 7.0: tier === 2? 6.5: 6.0,
    };
  }
  return {
    avgGpa,
    minGpa,
    minToefl: tier === 1? 100: tier === 2? 90: 80,
    minIelts: tier === 1? 7.0: 6.5,
  };
}

function tuitionNote(country: Country, tier: number): string {
  if (country === "US") {
    return tier === 1
      ? " ước USD 50,000–80,000 / năm (học phí, bởi vì hạng mục mà khác; dùng Website Games làm chuẩn) "
      : tier === 2
        ? " ước USD 35,000–60,000 / năm (học phí, bởi vì hạng mục mà khác; dùng Website Games làm chuẩn) "
        : " ước USD 25,000–45,000 / năm (học phí, bởi vì hạng mục mà khác; dùng Website Games làm chuẩn) ";
  }
  if (country === "UK") {
    return tier === 1
      ? " ước GBP 28,000–45,000 / năm (quốc tế sinh học phí, dùng Website Games làm chuẩn) "
      : " ước GBP 20,000–35,000 / năm (quốc tế sinh học phí, dùng Website Games làm chuẩn) ";
  }
  if (country === "CA") {
    return " ước CAD 25,000–55,000 / năm (quốc tế sinh học phí, dùng Website Games làm chuẩn) ";
  }
  return " ước AUD 35,000–55,000 / năm (quốc tế sinh học phí, dùng Website Games làm chuẩn) ";
}

function greRequired(country: Country, field: Field, tier: number): boolean | null {
  if (country!== "US") return false;
  if (field === "arts_design" || field === "education") return false;
  if (tier === 1 && (field === "cs" || field === "data_ai" || field === "finance"))
    return null; // often optional now
  return null;
}

function deadline(country: Country): string {
  if (country === "US") return " thông thường theo trình tự: 12/15, 1/15, 2/1, 3/15 (dùng hạng mục trang làm chuẩn) ";
  if (country === "UK") return " thông thường: chuyển động trúng tuyển hoặc 1–3 tháng Hạn chót (dùng hạng mục trang làm chuẩn) ";
  if (country === "CA") return " thông thường: 12–2 tháng Hạn chót (dùng hạng mục trang làm chuẩn) ";
  return " thông thường: 10–12 tháng ưu tiên luân phiên / năm sau 2 tháng (dùng hạng mục trang làm chuẩn) ";
}

export function expandInstitutions(list: Institution[]): SchoolSeed[] {
  const out: SchoolSeed[] = [];
  const seen = new Set<string>();

  for (const inst of list) {
    // Top schools use hand-verified catalog only (scripts/apply-verified.ts)
    if (isVerifiedSchool(inst.name)) continue;
    // All fields the school offers × up to 2 flagship programs each
    for (const field of inst.fields) {
      const progs = PROGRAMS_BY_FIELD[field] || PROGRAMS_BY_FIELD.other;
      for (const meta of progs.slice(0, 2)) {
        const ukish = inst.country === "UK" || inst.country === "AU";
        const degree = ukish? meta.degreeUK: meta.degreeUS;
        const slug = slugify([inst.name, meta.program, degree, inst.country]);
        if (seen.has(slug)) continue;
        seen.add(slug);
        const t = thresholds(inst.country, inst.tier, field);
        const duration = ukish? meta.durationUK: meta.durationUS;
        const lang =
          t.minToefl!= null
            ? `TOEFL ≥ ${t.minToefl} hoặc tương đương IELTS`
            : `IELTS ≥ ${t.minIelts}`;
        out.push({
          slug,
          name: inst.name,
          program: meta.program,
          programZh: meta.programZh,
          degree,
          country: inst.country,
          field,
          city: inst.city,
          avgGpa: t.avgGpa,
          minGpa: t.minGpa,
          minToefl: t.minToefl,
          minIelts: t.minIelts,
          gpaScale: 4.0,
          website: inst.website,
          officialUrl: inst.website,
          admissionRequirements: `${inst.name} ${meta.program} (${degree}). đề nghị GPA ≥ ${t.minGpa.toFixed(1)} (4.0 chế xấp xỉ), chia đều tham khảo ước ${t.avgGpa.toFixed(2)}; ngôn ngữ ${lang}. quy tắc chi tiết dùng Website Games làm chuẩn. `,
          tier: inst.tier,
          duration,
          tuitionNote: tuitionNote(inst.country, inst.tier),
          isStem: meta.isStem,
          greRequired: greRequired(inst.country, field, inst.tier),
          applicationDeadline: deadline(inst.country),
          blurb: meta.blurb,
          summaryOfficial: `${meta.programZh} (${meta.program}) là ${inst.name} thường gặp nghiên cứu sinh giảng bài / chuyên nghiệp hình hạng mục một trong, chế độ giáo dục ước ${duration}. ${meta.blurb} thân thỉnh cánh cửa và tài liệu danh sách mời dùng trường học chính thức hạng mục trang làm chuẩn; trạm[trang web] trích yếu dùng cho cố vấn kiểm tra và đối lập, không thay thế chính thức thông tri. chính thức cửa vào: ${inst.website}`,
        });
      }
    }
  }
  return out;
}
