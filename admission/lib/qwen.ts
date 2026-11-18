const DASHSCOPE_CHAT =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const DASHSCOPE_EMBED =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings";

function apiKey() {
  return process.env.DASHSCOPE_API_KEY || "";
}

export function chatModel() {
  return process.env.DASHSCOPE_MODEL || "qwen-plus";
}

export function embedModel() {
  return process.env.DASHSCOPE_EMBED_MODEL || "text-embedding-v3";
}

export async function qwenChat(
  messages: { role: string; content: string }[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const key = apiKey();
  if (!key) throw new Error("DASHSCOPE_API_KEY không phối trí ");
  const res = await fetch(DASHSCOPE_CHAT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: chatModel(),
      messages,
      temperature: opts?.temperature?? 0.3,
      max_tokens: opts?.maxTokens?? 2000,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "DashScope Yêu cầu thất bại ");
  }
  const content = data?.choices?.[0]?.message?.content;
  if (content == null || content === "") throw new Error("Dữ liệu phản hồi từ AI bị trống ");
  return typeof content === "string"? content: JSON.stringify(content);
}

/** DashScope text-embedding-v3 → 1024-d by default */
export async function qwenEmbed(text: string): Promise<number[]> {
  const key = apiKey();
  if (!key) throw new Error("DASHSCOPE_API_KEY không phối trí ");
  const res = await fetch(DASHSCOPE_EMBED, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: embedModel(),
      input: text.slice(0, 8000),
      dimensions: 1024,
      encoding_format: "float",
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Embedding Yêu cầu thất bại ");
  }
  const emb = data?.data?.[0]?.embedding;
  if (!Array.isArray(emb)) throw new Error("Dữ liệu Embedding từ AI bị trống ");
  return emb as number[];
}

export function parseJsonFromLLM<T = unknown>(text: string): T {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced? fenced[1].trim(): trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("LLM không Quay lại JSON");
  return JSON.parse(raw.slice(start, end + 1)) as T;
}
