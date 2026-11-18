import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

test("legacy writing bridge still reports prompts and real word counts; empty Vietnamese placeholders are not essays", async () => {
  const path =
      "library/mock/cambridge-writing/cambridge-19-test-1-writing.html",
    id = "cambridge-19-test-1-writing";
  for (const text of ["", "A steady increase."]) {
    const dom = new JSDOM(readFileSync(path, "utf8"), {
      url: "https://example.org/" + path,
      runScripts: "outside-only",
    });
    const w = dom.window,
      d = w.document,
      ctx = dom.getInternalVMContext(),
      messages = [];
    w.scrollTo = () => {};
    w.postMessage = (msg) => messages.push(msg);
    for (const s of d.scripts) new Script(s.textContent).runInContext(ctx);
    const bridge = d.createElement("script");
    Object.assign(bridge.dataset, {
      mode: "writing",
      examId: id,
      cdt: "1",
      pack: "drill",
    });
    Object.defineProperty(d, "currentScript", { get: () => bridge });
    new Script(readFileSync("assets/js/exam-bridge.js", "utf8")).runInContext(
      ctx,
    );
    await new Promise((resolve) => setImmediate(resolve));
    w.startTest();
    d.getElementById("t1").value = text;
    w.dispatchEvent(
      new w.MessageEvent("message", { data: { type: "yysd:time-up" } }),
    );
    await new Promise((resolve) => setImmediate(resolve));
    const scores = messages.filter((m) => m.type === "yysd:score");
    assert.equal(scores.length, 1);
    assert.equal(scores[0].writingWords, text ? 3 : 0);
    assert.equal(scores[0].writingTask2, "");
    assert.equal(scores[0].writingTask1, text);
    assert.ok(scores[0].writingPrompt1.length > 25);
    w.close();
  }
});
