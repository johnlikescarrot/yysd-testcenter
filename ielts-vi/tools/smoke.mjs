import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { Script } from "node:vm";
import { withBrowser } from "./browser.mjs";
const root = new URL("../dist/", import.meta.url);
const errors = [];
let files = [];
for (const kind of ["listening", "reading", "writing"]) {
  const path = `library/mock/cambridge-${kind}/`;
  files.push(
    ...(await readdir(new URL(path, root)))
      .filter((n) => n.endsWith(".html"))
      .map((n) => ({ kind, path: path + n })),
  );
}
await withBrowser(async (browser, base) => {
  const p = await browser.newPage();
  p.setDefaultTimeout(5000);
  p.on("dialog", (d) => d.accept());
  p.on("pageerror", (e) => errors.push(`${p.url()}: ${e}`));
  p.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  await p.goto(base);
  await p.click("#start");
  for (let i = 0; i < 3; i++) {
    await p.click(`#response input[value="${[0, 0, 2][i]}"]`);
    await p.click("#response button");
    await p.click("#advance");
  }
  assert.match(
    await p.$eval("#activity", (el) => el.textContent),
    /2 \/ 3 câu đúng · \+15 XP/,
  );
  await p.click("#back");
  await p.reload();
  assert.equal(await p.$eval("#xp", (e) => e.textContent), "15");
  await p.click("#review");
  await p.keyboard.press("Escape");
  await p.waitForFunction(() => !document.querySelector("dialog").open);
  await p.click('[data-lesson="listen-detail"]');
  const src = await p.$eval("audio", (a) => a.src);
  assert.equal((await p.goto(src)).status(), 200);
  await p.goto(base + "thu-vien.html");
  assert.equal(await p.$$eval(".paper-row a", (a) => a.length), files.length);
  for (const { kind, path } of files) {
    // Parse every inline script and exercise the source engine after translation.
    for (const m of (await readFile(new URL(path, root), "utf8")).matchAll(
      /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
    ))
      new Script(m[1], { filename: path });
    await p.goto(base + path, { waitUntil: "domcontentloaded" });
    await p.$eval(".pc-go", (b) => b.click());
    if (kind === "writing") {
      await p.$eval("#t1", (e) => {
        e.value = "A steady increase.";
        e.dispatchEvent(new Event("input"));
      });
      await p.$eval(".submit-btn", (b) => b.click());
      assert.equal(await p.$eval("#r1", (e) => e.textContent), "3", path);
      assert.equal(
        await p.$eval("#dump1", (e) => e.textContent),
        "A steady increase.",
        path,
      );
    } else {
      await p.$eval("button[onclick=\"startTest('practice')\"]", (b) =>
        b.click(),
      );
      const missing = await p.evaluate(() => {
        /* global TEST */
        const missing = [];
        for (const part of TEST.passages || TEST.sections) {
          for (const g of part.groups) {
            for (const [i, q] of g.questions.entries()) {
              const value = String(
                g.kind === "multi" ? g.answerSet[i] : [].concat(q.answer)[0],
              );
              const input = document.getElementById(q.id);
              const radio = [...document.getElementsByName(q.id)].find(
                (r) => r.value.toUpperCase() === value.toUpperCase(),
              );
              if (input) {
                input.value = value;
              } else if (radio) {
                radio.checked = true;
              } else if (
                document.getElementById(q.id + "a") &&
                document.getElementById(q.id + "b")
              ) {
                const [a, b] = value.split(" ");
                document.getElementById(q.id + "a").value = a;
                document.getElementById(q.id + "b").value = b;
              } else missing.push(q.id);
            }
          }
        }
        return missing;
      });
      assert.deepEqual(missing, [], path + " answer controls");
      await p.$eval(".submit-btn", (b) => b.click());
      assert.equal(
        await p.$eval("#resCorrect", (e) => e.textContent),
        "40/40",
        path,
      );
      assert.equal(await p.$$eval(".ritem", (es) => es.length), 40, path);
    }
  }
  await p.goto(base + "library/practice/ielts/sample-academic-reading-1.html");
  await p.click("[name=q1][value=FALSE]");
  await p.type("[name=q6]", "polarized");
  await p.click("#submit");
  assert.match(await p.$eval("#result", (e) => e.textContent), /2 \/ 8/);
  await p.goto(base + "library/practice/shuzi-tingxie/numbers-1.html");
  await p.type("#answer", "041-965 7156");
  await p.click("#checkBtn");
  assert.match(await p.$eval("#verdict", (e) => e.textContent), /Chính xác/);
  await p.click("#nextBtn");
  assert.match(await p.$eval("#itemTag", (e) => e.textContent), /Câu 2/);
  await p.goto(base);
  await p.setViewport({ width: 360, height: 780 });
  assert.ok(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "mobile page overflows",
  );
  await p.close();
});
assert.deepEqual(errors, []);
console.log(
  `Chromium: daily lesson, recovery, review, mobile, audio, ${files.length} full papers and both practice tools passed under a project subpath.`,
);
