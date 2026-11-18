// Only keep result summaries on this device. Essays, answers and audio never enter the ledger.
export const historyKey = "yysd:ielts-atlas:results:v1";
const paperPath =
  /^library\/(?:mock\/(?:cambridge-(?:reading|writing|listening)|ielts)|practice\/ielts)\/[a-z0-9-]+\.html$/;
function count(n) {
  return Number.isSafeInteger(n) && n >= 0;
}
function valid(r) {
  return (
    r &&
    paperPath.test(r.path) &&
    typeof r.title === "string" &&
    r.title.length > 0 &&
    r.title.length <= 220 &&
    count(r.at) &&
    r.at <= 8640000000000000 &&
    (r.kind === "writing"
      ? count(r.words)
      : r.kind === "objective" &&
        count(r.total) &&
        r.total > 0 &&
        count(r.score) &&
        r.score <= r.total)
  );
}
export function readHistory(env) {
  try {
    const rows = JSON.parse(env.localStorage.getItem(historyKey));
    return Array.isArray(rows) ? rows.filter(valid).slice(0, 10) : [];
  } catch {
    return [];
  }
}
export function listenForResults(doc, env) {
  // The API-backed site's iframe already has its own score bridge.
  if (env.self !== env.top) return;
  const path = "library/" + env.location.pathname.split("/library/").at(-1);
  if (!paperPath.test(path)) return;
  doc.addEventListener("yysd:paper-result", (event) => {
    const detail = event.detail;
    if (!detail) return;
    const r = {
      path,
      title: doc.title.slice(0, 220),
      at: Date.now(),
      kind: detail.kind,
    };
    if (r.kind === "writing") r.words = detail.words;
    else {
      r.score = detail.score;
      r.total = detail.total;
    }
    if (!valid(r)) return;
    try {
      env.localStorage.setItem(
        historyKey,
        JSON.stringify([r, ...readHistory(env)].slice(0, 10)),
      );
    } catch {
      /* A blocked/full storage area must never interrupt exam submission. */
    }
  });
}
export function showHistory(doc, env) {
  const list = doc.getElementById("paper-history"),
    rows = readHistory(env);
  list.replaceChildren();
  for (const r of rows) {
    const item = doc.createElement("li"),
      link = doc.createElement("a"),
      label = doc.createElement("span");
    link.href = r.path;
    link.textContent = r.title;
    label.textContent = `${new Date(r.at).toLocaleDateString("vi-VN")} · ${r.kind === "writing" ? r.words + " từ đã viết" : r.score + " / " + r.total + " câu đúng"}`;
    item.append(link, label);
    list.appendChild(item);
  }
  doc.getElementById("history-empty").hidden = !!rows.length;
}
