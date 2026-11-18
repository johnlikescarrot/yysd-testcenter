import type { SimilarCase } from "./similar";

export const MOCK_EVAL = {
  probability: 16,
  range: { low: 8, high: 24 },
  category: " chạy nước rút " as const,
  calibrated: true,
  analysis: {
    strengths: [" đã băng qua biến thể của thấp cứng bậc cửa ", " có thực hành biến thể của | dữ liệu phân tích kinh nghiệm "],
    weaknesses: [" khóa học đại học hạng biến thể của | đỉnh DS mục chênh lệch to ", " nghiên cứu/bài báo độ sâu không đủ "],
    suggestions: [" giảm chạy nước rút kiểm tra tỉ lệ ", " gia cố định lượng nghiên cứu sản xuất "],
  },
  comparison: " giống số bối cảnh tồn tại đỉnh mục tỷ lệ chấp nhận nổi bật ở mức thấp ",
  evidence: [
    {
      type: "selectivity",
      title: " có tính chọn lọc biến thể của | khóa học đại học hạng sự khác biệt ",
      detail: " Châu Mỹ Honshū đứng soái hạm vs đỉnh cực kỳ khó mục, gap≥2",
      weight: " chủ quyền lặp lại ",
    },
    {
      type: "disclaimer",
      title: " không chính thức phát biểu ",
      detail: " cố vấn lỗ khoan sự đánh giá, viết tắt của trường cao đẳng chính phủ tỷ lệ chấp nhận ",
      weight: " nhất định dấu phẩy ",
    },
  ],
  similar_cases: [
    {
      id: "mock-1",
      gpa: 3.5,
      toefl: 105,
      ielts: null,
      gre: null,
      undergradSchool: " một vài 211 các trường đại học và cao đẳng ",
      undergradMajor: "Data Science",
      backgroundTags: ["internship"],
      admissionResult: false,
      year: 2025,
      description: " giảm mẫn cảm vụ việc: giống số bối cảnh nộp đơn xin đỉnh DS, đa số chăn kháng cự ",
      similarity: 0.7,
      peerBand: true,
    },
  ] satisfies SimilarCase[],
};
