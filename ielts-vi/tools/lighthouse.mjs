import lighthouse from "lighthouse";
import { mkdir, writeFile } from "node:fs/promises";
import { withBrowser } from "./browser.mjs";
const urls = {
  home: "",
  catalogue: "thu-vien.html",
  guide: "cam-nang.html",
  workbook: "so-thuc-hanh.html",
  reading: "library/mock/cambridge-reading/cambridge-10-test-1-reading.html",
  listening: "library/mock/cambridge-listening/cambridge-12-test-1.html",
  writing: "library/mock/cambridge-writing/cambridge-18-test-1-writing.html",
  sample: "library/practice/ielts/sample-academic-reading-1.html",
  dictation: "library/practice/shuzi-tingxie/numbers-1.html",
};
const directory = new URL("../reports/", import.meta.url);
await mkdir(directory, { recursive: true });
const onlyCategories = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
];
let pass = true;
await withBrowser(async (browser, base) => {
  const port = Number(new URL(browser.wsEndpoint()).port);
  for (const [id, path] of Object.entries(urls)) {
    const { lhr, report } = await lighthouse(base + path, {
      port,
      onlyCategories,
      output: "json",
      logLevel: "error",
    });
    await writeFile(new URL(`${id}.json`, directory), report);
    const scores = onlyCategories.map((c) => lhr.categories[c].score);
    console.log(id, JSON.stringify(scores));
    if (scores.some((x) => x !== 1) || lhr.runtimeError) {
      pass = false;
      console.error(
        id,
        lhr.runtimeError ||
          onlyCategories
            .flatMap((c) => lhr.categories[c].auditRefs)
            .filter(
              (a) =>
                a.weight > 0 &&
                lhr.audits[a.id].score !== null &&
                lhr.audits[a.id].score < 1,
            )
            .map((a) => a.id),
      );
    }
  }
});
if (!pass) process.exitCode = 1;
