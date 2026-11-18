import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Script } from "node:vm";
import { JSDOM } from "jsdom";

const root = "dist/library";
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );
}
const pages = process.argv.includes("--source")
  ? [
      ...new Set(
        [
          ...new JSDOM(
            readFileSync("atlas-library.html", "utf8"),
          ).window.document.querySelectorAll('a[href^="library/"]'),
        ].map((a) => a.getAttribute("href")),
      ),
    ]
  : files(root).filter((p) => p.endsWith(".html"));
const failures = [];
for (const path of pages) {
  const dom = new JSDOM(readFileSync(path, "utf8"), {
    url: "https://example.org/project/" + path.slice(5),
    runScripts: "outside-only",
  });
  const w = dom.window,
    d = w.document;
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.fetch = async (url) => ({
    ok: true,
    json: async () =>
      JSON.parse(readFileSync(join(dirname(path), url), "utf8")),
  });
  w.confirm = () => true;
  w.HTMLMediaElement.prototype.pause = () => {};
  w.HTMLMediaElement.prototype.play = () => Promise.resolve();
  try {
    const context = dom.getInternalVMContext();
    for (const script of d.scripts)
      new Script(script.textContent, { filename: path }).runInContext(context);
    if (path.includes("sample-academic")) {
      d.querySelectorAll(".q").forEach((q) => {
        const key = q.dataset.answer.split("|")[0];
        const input = q.querySelector('input[type="text"]');
        if (input) input.value = key;
        else q.querySelector(`input[value="${key}"]`).checked = true;
      });
      d.querySelector("#submit").click();
      assert.match(d.querySelector("#result").textContent, /8 \/ 8/);
    } else if (path.includes("/placement-")) {
      const key = new Script("answerKey").runInContext(context);
      for (const [id, values] of Object.entries(key)) {
        const field = d.getElementById(id);
        if (field && field.type !== "radio") field.value = values[0];
        else {
          const option = [...d.getElementsByName(id)].find(
            (r) => r.value.toLowerCase() === values[0].toLowerCase(),
          );
          assert.ok(option, id);
          option.checked = true;
        }
      }
      w.submitTest();
      assert.ok(d.querySelector("#feedbackList").textContent.includes("20/20"));
      assert.ok(d.querySelector('#rubricContent input[type="range"]'));
    } else if (path.includes("cambridge-writing/")) {
      w.startTest();
      const t = d.querySelector("#t1");
      t.value = "A steady increase.";
      t.dispatchEvent(new w.Event("input"));
      assert.equal(d.querySelector("#wc1").textContent, "3");
      assert.ok(
        w.localStorage.getItem(
          path.split("/").at(-1).replace(".html", "-draft"),
        ),
      );
      w.finishTest();
      assert.equal(d.querySelector("#dump1").textContent, t.value);
      w.backToCover();
    } else {
      w.openMode();
      w.startTest("practice");
      assert.ok(d.querySelector("#questionsHolder").children.length, path);
      if (d.getElementById("txVi")) {
        await new Promise((resolve) => setImmediate(resolve));
        assert.ok(d.querySelector('.tx-sent [lang="en"]'));
        d.getElementById("txVi").checked = true;
        w.toggleTranscript();
        assert.ok(d.querySelector(".tx-translation").textContent.trim());
        w.seekTranscript(3, 0);
        assert.equal(d.getElementById("player").currentTime, 3);
      }
      w.submitTest();
      assert.match(d.querySelector("#resCorrect").textContent, /0\s*\/\s*40/);
      w.backToCover();
      w.openMode();
      w.startTest("exam");
      const data = new Script("TEST").runInContext(context);
      for (const section of data.sections ?? data.passages)
        for (const group of section.groups) {
          group.questions.forEach((q, i) => {
            const correct =
              group.kind === "multi"
                ? group.answerSet[i]
                : [].concat(q.answer)[0];
            const field = d.getElementById(q.id);
            if (field) field.value = correct;
            else if (d.getElementById(q.id + "a")) {
              const [a, b] = correct.split(" ");
              d.getElementById(q.id + "a").value = a;
              d.getElementById(q.id + "b").value = b;
            } else {
              const radio = Array.from(d.getElementsByName(q.id)).find(
                (r) => r.value === correct,
              );
              assert.ok(radio, `Missing answer control: ${q.id}, ${correct}`);
              radio.checked = true;
            }
            assert.equal(w.readAns(q), correct, `Unselectable answer: ${q.id}`);
          });
        }
      w.confirmSubmit();
      assert.match(d.querySelector("#resCorrect").textContent, /40\s*\/\s*40/);
      w.backToCover();
    }
  } catch (e) {
    failures.push(`${path}: ${e.stack}`);
  } finally {
    await new Promise((resolve) => setImmediate(resolve));
    w.close();
  }
}
assert.equal(failures.length, 0, failures.join("\n"));
console.log(
  `Validated ${pages.length} published paper players, including grading, counters and drafts.`,
);
