import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { lessons } from "../assets/course.mjs";
import { dayOf, fresh, finish, save } from "../assets/progress.mjs";
import { mount } from "../assets/atlas.mjs";
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const date = new Date(2026, 10, 18, 11);
function fixture() {
  const { window: w } = new JSDOM(html, {
    url: "https://example.test/yysd-testcenter/",
  });
  const d = w.document,
    get = (id) => d.getElementById(id),
    modal = get("session");
  // jsdom does not implement the native dialog methods. Real Chromium also
  // exercises this interaction in tools/smoke.mjs.
  modal.showModal = () => modal.setAttribute("open", "");
  modal.close = () => {
    modal.removeAttribute("open");
    modal.dispatchEvent(new w.Event("close"));
  };
  function respond(i) {
    d.querySelector(`input[value="${i}"]`).click();
    d.querySelector("#response button").click();
  }
  const complete = (qs) =>
    qs.forEach((q) => {
      respond(q.answer);
      get("advance").click();
    });
  return { d, w, get, modal, respond, complete };
}
test("public entry renders, validates the form, supports retries, persists only completed sessions", async () => {
  const { d, w, get, modal, respond } = fixture();
  globalThis.document = d;
  globalThis.localStorage = w.localStorage;
  try {
    await import("../assets/start.mjs");
    assert.equal(d.querySelectorAll("[data-lesson]").length, 8);
    get("filters").click();
    get("lesson-list").click();
    d.querySelector('[data-filter="listening"]').click();
    assert.equal(d.querySelectorAll("[data-lesson]").length, 2);
    d.querySelector('[data-lesson="listen-detail"] b').click();
    assert.ok(d.querySelector("audio[controls]"));
    get("close").click();
    assert.ok(!modal.open);
    assert.equal(w.localStorage.length, 0);
    get("start").click();
    d.querySelector("#response button").click();
    assert.equal(get("advance"), null);
    for (const [i, q] of lessons[0].cards.entries()) {
      respond(i === 0 ? 0 : q.answer);
      assert.ok(get("feedback").textContent.includes(q.why));
      get("advance").click();
    }
    assert.match(get("activity").textContent, /2 \/ 3 câu đúng · \+15 XP/);
    get("back").click();
    assert.equal(get("streak").textContent, "1");
    get("review").click();
    respond(lessons[0].cards[0].answer);
    get("advance").click();
    assert.match(get("activity").textContent, /\+0 XP/);
    get("back").click();
    assert.ok(get("review").disabled);
    assert.equal(get("xp").textContent, "15");
    assert.match(get("badge").textContent, /Khởi hành/);
    const reload = fixture();
    mount(reload.d, w.localStorage, () => new Date());
    assert.equal(reload.get("xp").textContent, "15");
    assert.equal(reload.get("next-title").textContent, lessons[1].title);
    reload.w.close();
  } finally {
    delete globalThis.document;
    delete globalThis.localStorage;
    w.close();
  }
});

test("badges require practice in four distinct skills and a real seven-day chain; isolated storage fallback", () => {
  const { d, w, get, complete } = fixture();
  let current = date,
    day = dayOf(current);
  const s = fresh();
  for (const l of lessons.slice(0, 4))
    finish(
      s,
      day,
      l.cards.map((q) => ({ id: q.id, correct: true })),
      l.id,
    );
  save(w.localStorage, s);
  mount(d, w.localStorage, () => current);
  assert.match(get("badge").textContent, /Toàn diện/);
  current = new Date(2026, 10, 19, 1);
  Object.defineProperty(d, "hidden", { value: true, configurable: true });
  d.dispatchEvent(new w.Event("visibilitychange"));
  assert.ok(get("review").disabled);
  Object.defineProperty(d, "hidden", { value: false });
  d.dispatchEvent(new w.Event("visibilitychange"));
  assert.ok(!get("review").disabled);
  get("review").click();
  assert.match(get("activity").textContent, /1 \/ 6/);
  get("close").click();
  for (let i = 1; i < 7; i++)
    finish(s, day - i, [{ id: "hive", correct: true }], null);
  const more = fixture();
  mount(more.d, { getItem: () => JSON.stringify(s) }, () => date);
  assert.match(more.get("badge").textContent, /Bền bỉ/);
  more.get("start").click();
  more.complete(lessons[4].cards);
  assert.match(more.get("storage-note").textContent, /không cho phép lưu/);
  assert.match(more.get("activity").textContent, /3 \/ 3/);
  assert.ok(typeof complete === "function");
  more.w.close();
  w.close();
});
