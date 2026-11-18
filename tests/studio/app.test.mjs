import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { mount } from "../../studio/src/app.mjs";
import { lessons, cards } from "../../studio/src/lessons.mjs";
import { empty, localDay, storageKey } from "../../studio/src/progress.mjs";
const html = readFileSync(new URL("../../atlas.html", import.meta.url), "utf8");
function setup(denied = false) {
  const { window: w } = new JSDOM(html, {
      url: "https://example.org/project/",
    }),
    d = w.document,
    $ = (s) => d.querySelector(s);
  if (denied)
    Object.defineProperty(w, "localStorage", {
      get() {
        throw Error("denied");
      },
    });
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new w.Event("close"));
  };
  mount(d, w);
  return { w, d, $, click: (s) => $(s).click() };
}
test("learn, get feedback, finish, review mistakes, change goal, reload, cancel; keyboard focus and filters", () => {
  const { w, $, d, click } = setup();
  assert.equal($("#xp").textContent, "0");
  assert.equal($("#review").disabled, true);
  click("#lessons");
  click('[data-skill="Listening"]');
  assert.equal(d.querySelectorAll(".lesson-row").length, 2);
  click('[data-unit="listen-numbers"] .row-name');
  assert.ok($("audio").src.endsWith("park-area.mp3"));
  click("#exercise");
  $("#session").close();
  assert.equal(w.localStorage.length, 0);
  click('[data-skill="all"]');
  click("#start");
  assert.equal($("#session").open, true);
  const ids = lessons[0].items.map((_, i) => `${lessons[0].id}:${i}`);
  for (const [i, id] of ids.entries()) {
    const k = cards.get(id).key,
      choice = i === 1 ? (k + 1) % 3 : k;
    click(`[data-choice="${choice}"]`);
    $("[data-choice]").dispatchEvent(new w.Event("click", { bubbles: true }));
    assert.ok($("#feedback").textContent.includes(cards.get(id).note));
    assert.equal(d.activeElement, $("#advance"));
    click("#advance");
  }
  assert.equal($("#session-title").textContent, "Đã hoàn thành!");
  assert.ok($("#exercise").textContent.includes("2 / 3"));
  assert.equal($("#xp").textContent, "20");
  click("#return");
  assert.equal($("#streak").textContent, "1");
  assert.ok($("#due-note").textContent.includes("1 câu"));
  click("#review");
  assert.ok($("#prompt").textContent.includes(cards.get(ids[1]).prompt));
  click(`[data-choice="${cards.get(ids[1]).key}"]`);
  click("#advance");
  click("#return");
  assert.equal($("#xp").textContent, "25");
  assert.equal($("#review").disabled, true);
  $("#review").dispatchEvent(new w.Event("click"));
  assert.equal($("#session").open, false);
  $("#goal").value = "3";
  $("#goal").dispatchEvent(new w.Event("change"));
  const saved = w.localStorage.getItem(storageKey);
  assert.equal(JSON.parse(saved).goal, 3);
  assert.ok($("#goal-text").textContent.includes("2 / 3"));
  w.dispatchEvent(
    new w.StorageEvent("storage", { key: "other", newValue: null }),
  );
  assert.equal($("#xp").textContent, "25");
  w.dispatchEvent(new w.StorageEvent("storage", { key: null, newValue: null }));
  assert.equal($("#xp").textContent, "0");
  w.dispatchEvent(
    new w.StorageEvent("storage", { key: storageKey, newValue: saved }),
  );
  assert.equal($("#xp").textContent, "25");
  w.dispatchEvent(new w.Event("focus"));
  w.close();
});
test("the hub refreshes the paper ledger on a same-origin storage update", () => {
  const { w, $ } = setup();
  const key = "yysd:ielts-atlas:results:v1";
  w.localStorage.setItem(
    key,
    JSON.stringify([
      {
        path: "library/mock/ielts/placement-test-1.html",
        title: "Đề 1",
        at: 1,
        kind: "objective",
        score: 4,
        total: 5,
      },
    ]),
  );
  w.dispatchEvent(new w.StorageEvent("storage", { key }));
  assert.match($("#paper-history").textContent, /4 \/ 5/);
  w.close();
});
test("storage denied: progress still works; weekly strip distinguishes earlier study days", () => {
  const { w, $, click } = setup(true);
  assert.equal($("#storage-note").hidden, false);
  $("#goal").value = "2";
  $("#goal").dispatchEvent(new w.Event("change"));
  click("#start");
  $("#session").close();
  const today = localDay(new Date());
  const s = {
    ...empty(),
    sessions: Array.from({ length: 7 }, (_, i) => ({
      day: today - i,
      unit: "review",
      picks: [["main-idea:0", 1]],
    })),
  };
  w.dispatchEvent(
    new w.StorageEvent("storage", {
      key: storageKey,
      newValue: JSON.stringify(s),
    }),
  );
  assert.equal($("#streak").textContent, "7");
  assert.ok($(".studied"));
  w.close();
});
test("browser entry point mounts the shipped HTML", async () => {
  const { window } = new JSDOM(html, { url: "https://example.org/base/" });
  globalThis.window = window;
  globalThis.document = window.document;
  try {
    await import("../../studio/src/main.mjs");
    assert.equal(document.querySelectorAll(".lesson-row").length, 8);
  } finally {
    window.close();
    delete globalThis.document;
    delete globalThis.window;
  }
});

test("weekly top tier is personal and rendered without an invented leaderboard", () => {
  const { w, $ } = setup();
  const day = localDay(new Date());
  const entries = lessons.map((l) => ({
    day,
    unit: l.id,
    picks: l.items.map((q, i) => [`${l.id}:${i}`, q[2]]),
  }));
  // Use a Sunday, so two full distinct study days in this week can reach platinum.
  const sun = day + ((7 - new Date().getDay()) % 7);
  const original = globalThis.Date;
  globalThis.Date = class extends original {
    constructor(...args) {
      super(
        ...(args.length
          ? args
          : [new original().setDate(new original().getDate() + sun - day)]),
      );
    }
  };
  try {
    const sessions = [sun - 1, sun].flatMap((d) =>
      entries.map((e) => ({ ...e, day: d })),
    );
    w.dispatchEvent(
      new w.StorageEvent("storage", {
        key: storageKey,
        newValue: JSON.stringify({ ...empty(), sessions }),
      }),
    );
    assert.match($("#league").textContent, /Bạch kim · 400 XP/);
    assert.match($("#league-next").textContent, /cao nhất/);
  } finally {
    globalThis.Date = original;
    w.close();
  }
});
