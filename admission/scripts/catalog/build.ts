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

/** Multiple graduate programs per field - curated catalog approximating common official offerings */
const PROGRAMS_BY_FIELD: Record<Field, ProgMeta[]> = {
  cs: [
    {
      program: "Computer Science",
      programZh: " khoa học máy tính ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1.5–2 years",
      durationUK: "1 year",
      blurb: " hệ thống, số học, phần mềm biến thể của | đếm lý thuyết hướng của học viên cao học khóa học ",
    },
    {
      program: "Software Engineering",
      programZh: " phần mềm kỹ thuật ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " đối mặt phần mềm thiết kế, kỹ thuật thực hành biến thể của | lớn hệ thống giao nộp của chuyên môn bằng cấp học thuật ",
    },
    {
      program: "Cybersecurity",
      programZh: " Internet an toàn ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " an toàn hệ thống, tấn công và phòng thủ biến thể của | bí mật bảo vệ liên quan học viên cao học mục ",
    },
  ],
  engineering: [
    {
      program: "Electrical Engineering",
      programZh: " kỹ thuật điện ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1.5–2 years",
      durationUK: "1 year",
      blurb: " điện tử, trao đổi thư từ, năng lượng điện biến thể của | kiểm soát hệ thống đợi hướng ",
    },
    {
      program: "Mechanical Engineering",
      programZh: " kỹ thuật cơ khí ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1.5–2 years",
      durationUK: "1 year",
      blurb: " cơ học, sản xuất, hâm nóng chảy biến thể của | thiết bị máy móc và phát điện tích hợp hướng ",
    },
  ],
  data_ai: [
    {
      program: "Data Science",
      programZh: " dữ liệu khoa học ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " thống kê, máy móc học biến thể của | dữ liệu kỹ thuật giao nhau của đưa vào sử dụng khuôn học viên cao học mục ",
    },
    {
      program: "Artificial Intelligence",
      programZh: " trí tuệ nhân tạo ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " máy móc học, học sâu biến thể của | thông minh hệ thống hướng ",
    },
    {
      program: "Business Analytics",
      programZh: " kinh doanh phân tích ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1–1.5 years",
      durationUK: "1 year",
      blurb: " dữ liệu phân tích điều khiển kinh doanh quyết định chiến lược của liên ngành mục(nghiêng đưa vào sử dụng) ",
    },
  ],
  business: [
    {
      program: "Business Analytics",
      programZh: " kinh doanh phân tích ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: false,
      durationUS: "1–1.5 years",
      durationUK: "1 year",
      blurb: " dữ liệu biến thể của | giám sát kết hợp của công ty IT Thương Khoa học viên cao học mục ",
    },
    {
      program: "Management",
      programZh: " nghiên cứu quản lý ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " tổ chức giám sát, chiến lược biến thể của | năng lực lãnh đạo hướng ",
    },
  ],
  finance: [
    {
      program: "Finance",
      programZh: " ngân hàng ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " công ty ngân hàng, tài sản định giá biến thể của | thị trường tài chính hướng ",
    },
    {
      program: "Financial Engineering",
      programZh: " ngân hàng kỹ thuật ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1–1.5 years",
      durationUK: "1 year",
      blurb: " định lượng ngân hàng, phát sinh hàng hóa biến thể của | quản lý rủi ro hướng ",
    },
  ],
  science: [
    {
      program: "Physics",
      programZh: " vật lý ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1.5–2 years",
      durationUK: "1 year",
      blurb: " vật lý nghiên cứu khuôn có thể dạy khuôn học viên cao học mục ",
    },
    {
      program: "Mathematics",
      programZh: " Toán ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1.5–2 years",
      durationUK: "1 year",
      blurb: " thuần khiết đếm/toán học ứng dụng hướng học viên cao học khóa học ",
    },
  ],
  life_health: [
    {
      program: "Public Health",
      programZh: " y tế công cộng ",
      degreeUS: "MPH",
      degreeUK: "MSc",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " dịch tễ học, sức khỏe chính sách biến thể của | y tế công cộng thực hành ",
    },
    {
      program: "Biotechnology",
      programZh: " công nghệ sinh học ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: true,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " công nghệ sinh học nghiên cứu và phát triển biến thể của | công nghiệp đưa vào sử dụng hướng ",
    },
  ],
  arts_design: [
    {
      program: "Design",
      programZh: " thiết kế ",
      degreeUS: "MDes",
      degreeUK: "MA",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " hàng hóa/lẫn nhau/thị giác đợi thiết kế loại học viên cao học mục ",
    },
    {
      program: "Media Studies",
      programZh: " truyền thông nghiên cứu ",
      degreeUS: "MA",
      degreeUK: "MA",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " truyền thông, truyền bá biến thể của | chữ số văn hóa hướng ",
    },
  ],
  social: [
    {
      program: "International Relations",
      programZh: " quan hệ quốc tế ",
      degreeUS: "MA",
      degreeUK: "MSc",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " quốc tế chính trị, ngoại giao biến thể của | toàn thế giới quản trị hướng ",
    },
    {
      program: "Sociology",
      programZh: " xã hội học ",
      degreeUS: "MA",
      degreeUK: "MSc",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " xã hội lý thuyết biến thể của | bằng chứng thực tế nghiên cứu phương pháp hướng ",
    },
  ],
  education: [
    {
      program: "Education",
      programZh: " khoa sư phạm ",
      degreeUS: "MEd",
      degreeUK: "MA",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " giáo dục lý thuyết, khóa học biến thể của | dạy thực hành hướng ",
    },
  ],
  law: [
    {
      program: "Law",
      programZh: " luật(LLM)",
      degreeUS: "LLM",
      degreeUK: "LLM",
      isStem: false,
      durationUS: "1 year",
      durationUK: "1 year",
      blurb: " luật bằng thạc sĩ, thường thấy đi luật pháp quốc tế/nhà Thương biến thể của đợi chia hướng ",
    },
  ],
  other: [
    {
      program: "Interdisciplinary Studies",
      programZh: " liên ngành nghiên cứu ",
      degreeUS: "MS",
      degreeUK: "MSc",
      isStem: false,
      durationUS: "1–2 years",
      durationUK: "1 year",
      blurb: " liên ngành đặt làm riêng khuôn học viên cao học mục ",
    },
  ],
};

function thresholds(country: Country, tier: number, field: Field) {
  const baseAvg = tier === 1 ? 3.75 : tier === 2 ? 3.55 : 3.35;
  const fieldBump =
    field === "cs" || field === "data_ai" || field === "finance" ? 0.08 : 0;
  const avgGpa = Math.min(3.95, baseAvg + fieldBump);
  const minGpa = Math.max(2.8, avgGpa - 0.45);

  if (country === "UK" || country === "AU") {
    return {
      avgGpa,
      minGpa,
      minToefl: null as number | null,
      minIelts: tier === 1 ? 7.0 : tier === 2 ? 6.5 : 6.0,
    };
  }
  return {
    avgGpa,
    minGpa,
    minToefl: tier === 1 ? 100 : tier === 2 ? 90 : 80,
    minIelts: tier === 1 ? 7.0 : 6.5,
  };
}

function tuitionNote(country: Country, tier: number): string {
  if (country === "US") {
    return tier === 1
      ? " cân trong cân đĩa hoặc trên cân USD 50,000–80,000 / năm(học phí, biến thể cũ của mục và khác; biến thể cũ của trang web chính thức làm chuẩn)"
      : tier === 2
        ? " cân trong cân đĩa hoặc trên cân USD 35,000–60,000 / năm(học phí, biến thể cũ của mục và khác; biến thể cũ của trang web chính thức làm chuẩn)"
        : " cân trong cân đĩa hoặc trên cân USD 25,000–45,000 / năm(học phí, biến thể cũ của mục và khác; biến thể cũ của trang web chính thức làm chuẩn)";
  }
  if (country === "UK") {
    return tier === 1
      ? " cân trong cân đĩa hoặc trên cân GBP 28,000–45,000 / năm(quốc tế được sinh học phí, biến thể cũ của trang web chính thức làm chuẩn)"
      : " cân trong cân đĩa hoặc trên cân GBP 20,000–35,000 / năm(quốc tế được sinh học phí, biến thể cũ của trang web chính thức làm chuẩn)";
  }
  if (country === "CA") {
    return " cân trong cân đĩa hoặc trên cân CAD 25,000–55,000 / năm(quốc tế được sinh học phí, biến thể cũ của trang web chính thức làm chuẩn)";
  }
  return " cân trong cân đĩa hoặc trên cân AUD 35,000–55,000 / năm(quốc tế được sinh học phí, biến thể cũ của trang web chính thức làm chuẩn)";
}

function greRequired(country: Country, field: Field, tier: number): boolean | null {
  if (country !== "US") return false;
  if (field === "arts_design" || field === "education") return false;
  if (tier === 1 && (field === "cs" || field === "data_ai" || field === "finance"))
    return null; // often optional now
  return null;
}

function deadline(country: Country): string {
  if (country === "US") return " thường thấy lần lượt: 12/15, 1/15, 2/1, 3/15(biến thể cũ của mục đầu làm chuẩn)";
  if (country === "UK") return " thường thấy: lăn chấp nhận ứng viên vượt kỳ thi đầu vào có thể 1–3 mặt trăng đóng(biến thể cũ của mục đầu làm chuẩn)";
  if (country === "CA") return " thường thấy: 12–2 mặt trăng đóng(biến thể cũ của mục đầu làm chuẩn)";
  return " thường thấy: 10–12 mặt trăng có ưu tiên bánh xe / tiếp theo năm 2 tháng(biến thể cũ của mục đầu làm chuẩn)";
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
        const degree = ukish ? meta.degreeUK : meta.degreeUS;
        const slug = slugify([inst.name, meta.program, degree, inst.country]);
        if (seen.has(slug)) continue;
        seen.add(slug);
        const t = thresholds(inst.country, inst.tier, field);
        const duration = ukish ? meta.durationUK : meta.durationUS;
        const lang =
          t.minToefl != null
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
          admissionRequirements: `${inst.name} ${meta.program}(${degree}) Gợi ý GPA ≥ ${t.minGpa.toFixed(1)}(4.0 hệ thống tương tự), chia tham khảo cân trong cân đĩa hoặc trên cân ${t.avgGpa.toFixed(2)}; ngôn ngữ ${lang} quy tắc và quy định chi tiết biến thể cũ của trang web chính thức làm chuẩn `,
          tier: inst.tier,
          duration,
          tuitionNote: tuitionNote(inst.country, inst.tier),
          isStem: meta.isStem,
          greRequired: greRequired(inst.country, field, inst.tier),
          applicationDeadline: deadline(inst.country),
          blurb: meta.blurb,
          summaryOfficial: `${meta.programZh}(${meta.program})là ${inst.name} thường thấy của học viên cao học dạy/chuyên môn khuôn mục một trong, hệ thống giáo dục cân trong cân đĩa hoặc trên cân ${duration} ${meta.blurb}nộp đơn xin bậc cửa biến thể của | liệu danh sách mục mời biến thể cũ của trường học chính phủ mục đầu làm chuẩn; gốc trạm tóm tắt sử dụng trong cố vấn truy xuất biến thể của | so sánh, không thay thế cho chính phủ thông báo chính phủ lối vào: ${inst.website}`,
        });
      }
    }
  }
  return out;
}
