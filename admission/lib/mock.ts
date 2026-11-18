import type { SimilarCase } from "./similar";

export const MOCK_EVAL = {
  probability: 16,
  range: { low: 8, high: 24 },
  category: " chạy nước rút " as const,
  calibrated: true,
  analysis: {
    strengths: [" Đã qua thấp nhất cứng rắn cánh cửa ", " có đủ thực tập và số liệu phân tích trải qua "],
    weaknesses: [" Đại học cấp bậc và cực hạn DS hạng mục chênh lệch lớn ", " nghiên cứu khoa học / luận văn chiều sâu chưa đủ "],
    suggestions: [" giảm xuống chạy nước rút trường học chiếm so với ", " bổ mạnh mẽ định lượng nghiên cứu khoa học sản xuất "],
  },
  comparison: " cùng đương bối cảnh tại cực hạn hạng mục tỷ số trúng tuyển rõ rệt hơi thấp. ",
  evidence: [
    {
      type: "selectivity",
      title: " lựa chọn tính và Đại học cấp bậc chênh lệch ",
      detail: " Mỹ Bản Châu lập tàu chiến chỉ huy vs cực hạn rất khó hạng mục, gap≥2",
      weight: " chủ quyền trọng ",
    },
    {
      type: "disclaimer",
      title: " không chính thức thanh minh ",
      detail: " cố vấn đường kính tính ra, không phải viện giáo chính thức tỷ số trúng tuyển. ",
      weight: " tất đọc ",
    },
  ],
  similar_cases: [
    {
      id: "mock-1",
      gpa: 3.5,
      toefl: 105,
      ielts: null,
      gre: null,
      undergradSchool: " một 211 trường cao đẳng ",
      undergradMajor: "Data Science",
      backgroundTags: ["internship"],
      admissionResult: false,
      year: 2025,
      description: " cởi mẫn án lệ: cùng đương bối cảnh thân thỉnh cực hạn DS, đa số bị cự. ",
      similarity: 0.7,
      peerBand: true,
    },
  ] satisfies SimilarCase[],
};
