import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { evaluateSchema } from "@/lib/validate";
import { checkHardGate } from "@/lib/hard-gate";
import { calibrateAdmission } from "@/lib/calibrate";
import { buildProfileText, findSimilarCases, resolveSameSchoolCaseIds } from "@/lib/similar";
import { parseResumeFeatures } from "@/lib/resume";
import { extractResumeText, hintFromResume } from "@/lib/resume-file";
import { parseJsonFromLLM, qwenChat } from "@/lib/qwen";
import { classifyUndergrad } from "@/lib/undergrad-tier";

export const runtime = "nodejs";
export const maxDuration = 60;

type AnalysisShape = {
  analysis: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  comparison: string;
};

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, unknown>;

    if (contentType.includes("multipart/form-data")) {
      body = await parseMultipart(req);
    } else {
      body = await req.json();
    }

    // Resume hints can override empty/generic form fields
    if (typeof body.resumeText === "string" && body.resumeText.trim()) {
      const hint = hintFromResume(body.resumeText);
      if (hint.gpa != null && (body.gpa == null || body.gpa === "")) {
        body.gpa = hint.gpa;
      }
      if (hint.undergradSchool) body.undergradSchool = hint.undergradSchool;
      if (hint.undergradMajor) body.undergradMajor = hint.undergradMajor;
    }

    const parsed = evaluateSchema.safeParse({
      ...body,
      gpa: num(body.gpa),
      toefl: body.toefl == null || body.toefl === "" ? null : num(body.toefl),
      ielts: body.ielts == null || body.ielts === "" ? null : num(body.ielts),
      gre: body.gre == null || body.gre === "" ? null : num(body.gre),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: " tham số kiểm tra bị đánh bại ", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const input = parsed.data;

    const school = await prisma.school.findUnique({
      where: { id: input.targetSchoolId },
    });
    if (!school) {
      return NextResponse.json({ error: " trường học không tồn tại " }, { status: 404 });
    }

    let resumeFeatures = null;
    if (input.resumeText?.trim()) {
      try {
        resumeFeatures = await parseResumeFeatures(input.resumeText);
      } catch {
        resumeFeatures = null;
      }
    }

    const gate = checkHardGate(school, input);
    if (!gate.ok) {
      const analysis = {
        strengths: [] as string[],
        weaknesses: gate.reasons,
        suggestions: [" trước thoả mãn nên kiểm tra cứng nhắc biến thể của thấp yêu cầu hoàng hậu lại đánh giá phối hoặc kết hôn vượt qua "],
      };
      const ug = classifyUndergrad(input.undergradSchool);
      await prisma.userQuery.create({
        data: {
          targetSchoolId: school.id,
          userBackground: sanitizeBackground(input, resumeFeatures),
          resultProbability: 0,
          analysisText: JSON.stringify({ analysis, comparison: gate.reasons.join("; ") }),
        },
      });
      return NextResponse.json({
        probability: 0,
        range: { low: 0, high: 0 },
        category: " chạy nước rút ",
        analysis,
        comparison: gate.reasons.join("; "),
        similar_cases: [],
        evidence: [
          {
            type: "hard_gate",
            title: " chưa nắm vững hoàn hảo cái gì đó bậc cửa ",
            detail: gate.reasons.join("; "),
            weight: " một vé phủ quyết ",
          },
          {
            type: "undergrad",
            title: " khóa học đại học hạng ",
            detail: `${ug.label} (${ug.score}/5)`,
          },
        ],
        rejected: true,
        calibrated: true,
      });
    }

    const tags = [
      ...(input.backgroundTags || []),
      ...(resumeFeatures?.tags || []),
    ];
    const profileText = buildProfileText(input, tags, resumeFeatures);
    const ugScore = classifyUndergrad(input.undergradSchool).score;

    const yearFrom = new Date().getFullYear() - 2;
    // Calibration may use peer schools internally; similar-cases UI never does.
    let cases = await prisma.case.findMany({
      where: {
        schoolId: school.id,
        OR: [{ source: { in: ["gradcafe", "manual"] } }, { year: { gte: yearFrom } }],
      },
      take: 200,
      orderBy: { year: "desc" },
    });
    const realN = cases.filter((c) => c.source === "gradcafe" || c.source === "manual").length;
    if (cases.length < 8 || realN < 5) {
      const peers = await prisma.school.findMany({
        where: {
          country: school.country,
          field: school.field,
          tier: school.tier,
        },
        select: { id: true },
        take: 40,
      });
      cases = await prisma.case.findMany({
        where: {
          schoolId: { in: peers.map((p) => p.id) },
          OR: [{ source: { in: ["gradcafe", "manual"] } }, { year: { gte: yearFrom } }],
        },
        take: 200,
        orderBy: { year: "desc" },
      });
    }

    const calibrated = calibrateAdmission({
      school,
      input,
      cases,
      resume: resumeFeatures,
    });

    const { ids: similarIds, scope: similarScope } = await resolveSameSchoolCaseIds(school);
    const similar =
      similarScope === "none"
        ? []
        : await findSimilarCases(
            similarIds,
            profileText,
            tags,
            input.gpa,
            ugScore,
            5,
            school.id
          );

    let analysis: AnalysisShape["analysis"] = {
      strengths: [],
      weaknesses: [],
      suggestions: [],
    };
    let comparison = "";

    try {
      const prompt = [
        `mục tiêu: ${school.country} ${school.name} / ${school.program} (${school.degree}) field=${school.field}`,
        `[đã theo hiệu chuẩn động cơ khóa, cấm bạn sửa đổi chữ số]category=${calibrated.category}, probability≈${calibrated.probability}%, khu vực giới hạn ${calibrated.range.low}-${calibrated.range.high}%`,
        `hạng: khóa học đại học ${calibrated.undergrad.label} vs mục ${calibrated.difficulty.label}, gap=${calibrated.gap}`,
        `chuyên môn phối hoặc kết hôn: ${calibrated.major.label}`,
        `bậc cửa: minGPA=${school.minGpa} avgGPA=${school.avgGpa} TOEFL>=${school.minToefl ?? "-"} IELTS>=${school.minIelts ?? "-"}`,
        `người nộp đơn: ${profileText}`,
        `tương tự vụ việc(có ưu tiên thật GradCafe): ${JSON.stringify(
          similar.map((c) => ({
            year: c.year,
            gpa: c.gpa,
            result: c.admissionResult ? "admit" : "reject",
            undergrad: c.undergradSchool,
            peerBand: c.peerBand,
            source: c.source,
            desc: c.description,
          }))
        )}`,
        `chỉ trở về JSON: {"analysis":{"strengths":[],"weaknesses":[],"suggestions":[]},"comparison":"..."}`,
        `Yêu cầu: giải thích tại sao là${calibrated.category}; đừng cho đi ra biến thể của | khóa xác suất mâu thuẫn của Trấn Thành Công hoặc trấn Chengkung ở huyện Đài Đông | mong đợi; điểm danh khóa học đại học hạng biến thể của | chuyên môn phối hoặc kết hôn câu hỏi `,
      ].join("\n");

      const raw = await qwenChat(
        [
          {
            role: "system",
            content:
              " bạn là kỳ cựu du học cố vấn xác suất biến thể của | chạy nước rút/phối hoặc kết hôn/hòa vốn đã theo quy tắc động cơ khóa, bạn chỉ viết phân tích biến thể của | so sánh, cấm xuất khẩu probability ), cấm gợi ý thay đổi hoặc thay thế cao nắm bắt ",
          },
          { role: "user", content: prompt },
        ],
        { temperature: 0.25, maxTokens: 1200 }
      );
      const ai = parseJsonFromLLM<AnalysisShape>(raw);
      analysis = ai.analysis || analysis;
      comparison = ai.comparison || comparison;
    } catch {
      comparison = `hiệu chuẩn kết trái: ${calibrated.category}, sự đánh giá khu vực giới hạn ${calibrated.range.low}–${calibrated.range.high}%(điểm ước tính ${calibrated.probability}%) dựa vào thấy evidence `;
      analysis = {
        strengths:
          calibrated.gap <= 0
            ? [" thành tích đã băng qua nên kiểm tra cứng bậc cửa, biến thể của | mục có tính chọn lọc chênh lệch không quá "]
            : [" đã đi qua biến thể của thấp cứng nhắc bậc cửa, có nộp nộp đơn xin của cơ bản trình độ "],
        weaknesses:
          calibrated.gap >= 2
            ? [
                " khóa học đại học hạng biến thể của | mục tiêu mục có tính chọn lọc chênh lệch tương đối lớn, cạnh tranh ao Trung Quốc giống số bối cảnh tỉ lệ thay đổi hoặc thay thế cao ",
                calibrated.major.score < 0.7
                  ? " chuyên môn phối hoặc kết hôn giống, tương đối bướng bỉnh CS/thống kê bối cảnh người nộp đơn ở trong thua kém "
                  : " nghiên cứu/bài báo độ sâu có thể không đủ biến thể cũ của chống đỡ đỉnh mục ",
              ]
            : [" yêu cầu sử dụng tài liệu biến thể của | thư giới thiệu bằng chứng tương đối tương tự người nộp đơn của phân biệt vượt qua "],
        suggestions: [
          " có ưu tiên gia cố biến thể của | mục tiêu mục căn chỉnh của định lượng/nghiên cứu kết quả ",
          " nhấn chạy nước rút/phối hoặc kết hôn/hòa vốn lắp ráp trường học, ngăn chặn tất cả tên cũ của Thượng Hải giống hệt số ",
        ],
      };
    }

    await prisma.userQuery.create({
      data: {
        targetSchoolId: school.id,
        userBackground: sanitizeBackground(input, resumeFeatures),
        resultProbability: calibrated.probability,
        analysisText: JSON.stringify({
          analysis,
          comparison,
          range: calibrated.range,
          category: calibrated.category,
          evidence: calibrated.evidence,
        }),
      },
    });

    return NextResponse.json({
      probability: calibrated.probability,
      range: calibrated.range,
      category: calibrated.category,
      analysis,
      comparison,
      similar_cases: similar,
      similar_scope: similarScope,
      evidence: calibrated.evidence,
      meta: {
        undergrad: calibrated.undergrad,
        difficulty: calibrated.difficulty,
        major: calibrated.major,
        gap: calibrated.gap,
        peerCaseStats: calibrated.peerCaseStats,
        similarScope,
      },
      rejected: false,
      calibrated: true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : " máy chủ sai lầm ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) throw new Error(" giá trị số ) không hợp lệ ");
  return n;
}

function sanitizeBackground(
  input: {
    gpa: number;
    toefl?: number | null;
    ielts?: number | null;
    gre?: number | null;
    undergradSchool: string;
    undergradMajor: string;
  },
  resumeFeatures: unknown
) {
  return {
    gpa: input.gpa,
    toefl: input.toefl ?? null,
    ielts: input.ielts ?? null,
    gre: input.gre ?? null,
    undergradSchool: input.undergradSchool,
    undergradMajor: input.undergradMajor,
    resumeFeatures: resumeFeatures ?? null,
  };
}

async function parseMultipart(req: NextRequest) {
  const form = await req.formData();
  const body: Record<string, unknown> = {};
  for (const [k, v] of Array.from(form.entries())) {
    if (k === "resume" && v instanceof File) {
      if (v.size > 5 * 1024 * 1024) throw new Error(" sơ yếu lý lịch mời nhỏ hơn 5MB");
      const buf = Buffer.from(await v.arrayBuffer());
      body.resumeText = await extractResumeText(buf, v.name);
      continue;
    }
    body[k] = typeof v === "string" ? v : String(v);
  }
  return body;
}
