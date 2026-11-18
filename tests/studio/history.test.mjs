import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import {
  historyKey,
  listenForResults,
  readHistory,
  showHistory,
} from "../../studio/src/history.mjs";
const href =
  "https://example.org/course/library/mock/cambridge-writing/cambridge-19-test-1-writing.html";
function page(url = href) {
  const { window: w } = new JSDOM(
    '<title>Đề mẫu</title><ol id="paper-history"></ol><p id="history-empty"></p>',
    { url },
  );
  return w;
}
function result(w, detail) {
  w.document.dispatchEvent(new w.CustomEvent("yysd:paper-result", { detail }));
}
test("standalone entry records only summary fields, validates, caps history and renders plain text", async () => {
  const w = page(),
    d = w.document;
  globalThis.window = w;
  globalThis.document = d;
  await import("../../studio/src/paper.mjs");
  delete globalThis.window;
  delete globalThis.document;
  for (const bad of [
    null,
    { kind: "other" },
    { kind: "objective", score: 0, total: 0 },
    { kind: "objective", score: 3, total: 2 },
    { kind: "objective", score: NaN, total: 1 },
    { kind: "writing", words: -1 },
  ])
    result(w, bad);
  assert.deepEqual(readHistory(w), []);
  showHistory(d, w);
  assert.equal(d.querySelector("#history-empty").hidden, false);
  for (let i = 0; i < 12; i++)
    result(w, { kind: "objective", score: i, total: 20 });
  d.title = "<b>Task 1</b>";
  result(w, { kind: "writing", words: 300, essay: "never save this" });
  const rows = readHistory(w);
  assert.equal(rows.length, 10);
  assert.deepEqual(
    rows.map((r) => r.words ?? r.score),
    [300, 11, 10, 9, 8, 7, 6, 5, 4, 3],
  );
  assert.ok(!w.localStorage.getItem(historyKey).includes("never save this"));
  showHistory(d, w);
  assert.equal(d.querySelector("#paper-history a").textContent, d.title);
  assert.ok(!d.querySelector("#paper-history b"));
  assert.match(d.querySelector("li").textContent, /300 từ/);
  assert.match(d.querySelector("li+li").textContent, /11 \/ 20/);
  assert.ok(d.querySelector("#history-empty").hidden);
  w.localStorage.setItem(
    historyKey,
    JSON.stringify([
      null,
      { ...rows[0], path: "https://example.org/" },
      { ...rows[0], title: 3 },
      { ...rows[0], title: "" },
      { ...rows[0], title: "x".repeat(221) },
      { ...rows[0], at: NaN },
      { ...rows[0], at: 9e15 },
      rows[0],
    ]),
  );
  assert.equal(readHistory(w).length, 1);
  w.localStorage.setItem(historyKey, "not-json");
  assert.deepEqual(readHistory(w), []);
  w.close();
});
test("blocked storage and non-paper or embedded contexts never interrupt the exam", () => {
  const w = page();
  Object.defineProperty(w, "localStorage", {
    get() {
      throw Error("disabled");
    },
  });
  listenForResults(w.document, w);
  assert.doesNotThrow(() => result(w, { kind: "writing", words: 100 }));
  assert.deepEqual(readHistory(w), []);
  w.close();
  const other = page("https://example.org/course/");
  listenForResults(other.document, other);
  listenForResults(other.document, { self: 1, top: 2 });
  result(other, { kind: "objective", score: 1, total: 1 });
  assert.deepEqual(readHistory(other), []);
  other.close();
});
