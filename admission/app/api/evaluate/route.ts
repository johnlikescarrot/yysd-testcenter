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
      if (hint.gpa!= null && (body.gpa == null || body.gpa === "")) {
        body.gpa = hint.gpa;
      }
      if (hint.undergradSchool) body.undergradSchool = hint.undergradSchool;
      if (hint.undergradMajor) body.undergradMajor = hint.undergradMajor;
    }

    const parsed = evaluateSchema.safeParse({
      ...body,
      gpa: num(body.gpa),
      toefl: body.toefl == null || body.toefl === ""? null: num(body.toefl),
      ielts: body.ielts == null || body.ielts === ""? null: num(body.ielts),
      gre: body.gre == null || body.gre === ""? null: num(body.gre),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: " tham số kiểm tra thất bại ", details: parsed.error.flatten() },
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
        suggestions: [" Cần thỏa mãn yêu cầu tối thiểu của trường trước khi đánh giá độ phù hợp "],
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
            title: " không vượt qua thử thách cánh cửa ",
            detail: gate.reasons.join("; "),
            weight: " một chuyến bác bỏ ",
          },
          {
            type: "undergrad",
            title: " Đại học cấp bậc ",
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
        ` mục tiêu: ${school.country} ${school.name} / ${school.program} (${school.degree}) field=${school.field}`,
        `[đã do hiệu chỉnh động cơ tập trung, cấm bạn sửa chữa con số]category=${calibrated.category}, probability≈${calibrated.probability}%, khu lúc giữa ${calibrated.range.low}-${calibrated.range.high}%`,
        ` cấp bậc: Đại học ${calibrated.undergrad.label} vs hạng mục ${calibrated.difficulty.label}, gap=${calibrated.gap}`,
        ` chuyên nghiệp xứng đôi: ${calibrated.major.label}`,
        ` cánh cửa: minGPA=${school.minGpa} avgGPA=${school.avgGpa} TOEFL>=${school.minToefl?? "-"} IELTS>=${school.minIelts?? "-"}`,
        ` Hồ sơ ứng viên: ${profileText}`,
        ` tương tự án lệ (ưu tiên chân thật GradCafe): ${JSON.stringify(
          similar.map((c) => ({
            year: c.year,
            gpa: c.gpa,
            result: c.admissionResult? "admit": "reject",
            undergrad: c.undergradSchool,
            peerBand: c.peerBand,
            source: c.source,
            desc: c.description,
          }))
        )}`,
        ` chỉ Quay lại JSON: {"analysis":{"strengths":[],"weaknesses":[],"suggestions":[]},"comparison":"..."}`,
        ` yêu cầu: giải thích vì sao là ${calibrated.category}; chớ cho ra và tập trung xác suất mâu thuẫn thành công mong muốn; điểm danh Đại học cấp bậc và chuyên nghiệp xứng đôi vấn đề. `,
      ].join("\n");

      const raw = await qwenChat(
        [
          {
            role: "system",
            content:
              " ngươi là thâm niên du học cố vấn. xác suất và chạy nước rút / xứng đôi / giữ gốc đã do quy tắc động cơ tập trung, bạn chỉ viết phân tích và đối lập, cấm phát ra probability chữ đoạn, cấm ám chỉ cao hơn nắm chắc. ",
          },
          { role: "user", content: prompt },
        ],
        { temperature: 0.25, maxTokens: 1200 }
      );
      const ai = parseJsonFromLLM<AnalysisShape>(raw);
      analysis = ai.analysis || analysis;
      comparison = ai.comparison || comparison;
    } catch {
      comparison = ` hiệu chỉnh kết quả: ${calibrated.category}, tính ra khu lúc giữa ${calibrated.range.low}–${calibrated.range.high}% (ước tính điểm ${calibrated.probability}%). tham khảo bằng chứng hồ sơ. `;
      analysis = {
        strengths:
          calibrated.gap <= 0
            ? [" Điểm số đã đạt yêu cầu chuẩn của trường, và hạng mục lựa chọn tính chênh lệch không lớn "]
            : [" Đã đạt ngưỡng tối thiểu, đủ điều kiện cơ bản để nộp hồ sơ "],
        weaknesses:
          calibrated.gap >= 2
            ? [
                " Đại học cấp bậc và mục tiêu hạng mục lựa chọn tính chênh lệch lớn hơn, cạnh tranh ao ở bên trong cùng đương bối cảnh chiếm so với cao hơn ",
                calibrated.major.score < 0.7
                  ? " chuyên nghiệp xứng đôi bình thường, tương đối mạnh mẽ CS/ công tác thống kê bối cảnh thân thỉnh người ở vào hoàn cảnh xấu "
                  : " nghiên cứu khoa học / luận văn chiều sâu khả năng không đủ để chèo chống cực hạn hạng mục ",
              ]
            : [" cần dùng công văn và thư đề cử chứng minh tương đối đồng loại thân thỉnh người phân chia độ "],
        suggestions: [
          " ưu tiên bổ mạnh mẽ và mục tiêu hạng mục xếp hợp lý định lượng / nghiên cứu khoa học thành quả ",
          " theo như chạy nước rút / xứng đôi / giữ gốc tổ hợp trường học, tránh cho toàn bộ thân đồng nhất đương ",
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
    const msg = e instanceof Error? e.message: " Server Sai ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function num(v: unknown): number {
  const n = typeof v === "number"? v: Number(v);
  if (Number.isNaN(n)) throw new Error(" Trường giá trị số không hợp lệ ");
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
    toefl: input.toefl?? null,
    ielts: input.ielts?? null,
    gre: input.gre?? null,
    undergradSchool: input.undergradSchool,
    undergradMajor: input.undergradMajor,
    resumeFeatures: resumeFeatures?? null,
  };
}

async function parseMultipart(req: NextRequest) {
  const form = await req.formData();
  const body: Record<string, unknown> = {};
  for (const [k, v] of Array.from(form.entries())) {
    if (k === "resume" && v instanceof File) {
      if (v.size > 5 * 1024 * 1024) throw new Error(" lý lịch sơ lược mời nhỏ hơn 5MB");
      const buf = Buffer.from(await v.arrayBuffer());
      body.resumeText = await extractResumeText(buf, v.name);
      continue;
    }
    body[k] = typeof v === "string"? v: String(v);
  }
  return body;
}
