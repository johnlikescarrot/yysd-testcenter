/**
 * Self-check for advisor keyword matching (no DB / no LLM).
 * Usage: npx tsx lib/check-advisor.ts
 */

function scoreProgram(
  query: string,
  bagParts: string[]
): number {
  const q = query.toLowerCase();
  const bag = bagParts.join(" ").toLowerCase();
  let score = 0;
  const tokens = q.split(/[\s,, , /|]+/).filter((t) => t.length >= 2);
  for (const t of tokens) if (bag.includes(t)) score += 3;
  if (/dữ liệu|data/i.test(query) && /data science|analytics/.test(bag)) score += 4;
  if (/nhân tạo.?thông minh|ai\b/i.test(query) && /artificial intelligence|machine learning/.test(bag))
    score += 4;
  return score;
}

const ds = scoreProgram(" tôi logarit biến thể của | khoa học cảm thấy hứng thú ", [
  "Data Science",
  " dữ liệu khoa học ",
  "data_ai",
  " thống kê, máy móc học ",
]);
const cs = scoreProgram(" tôi logarit biến thể của | khoa học cảm thấy hứng thú ", [
  "Computer Science",
  " khoa học máy tính ",
  "cs",
]);
console.assert(ds > cs, `data should beat cs: ${ds} vs ${cs}`);
console.assert(ds >= 3, "should not need clarify");
console.log("check-advisor OK", { ds, cs });
