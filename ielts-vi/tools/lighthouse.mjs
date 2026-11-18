import lighthouse from "lighthouse";
import { mkdir, writeFile } from "node:fs/promises";
import { withBrowser } from "./browser.mjs";
const urls = {
  home: "",
  grammar: "library/practice/changnanju/c10-t1p1.html",
  dialogue: "doi-thoai.html",
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
const runs = Number(process.env.LH_RUNS || 3);
if (![1, 3, 5].includes(runs)) throw Error("LH_RUNS must be 1, 3 or 5");
const summary = {
  runs,
  formFactor: "mobile",
  categories: onlyCategories,
  pages: [],
};
let pass = true;
await withBrowser(async (browser, base) => {
  const port = Number(new URL(browser.wsEndpoint()).port);
  summary.browser = await browser.version();
  for (const [id, path] of Object.entries(urls)) {
    const all = [];
    for (let i = 1; i <= runs; i++) {
      const { lhr, report } = await lighthouse(base + path, {
        port,
        onlyCategories,
        output: "json",
        logLevel: "error",
      });
      if (lhr.runtimeError) throw Error(`${id}: ${lhr.runtimeError.message}`);
      summary.lighthouse = lhr.lighthouseVersion;
      await writeFile(new URL(`${id}-${i}.json`, directory), report);
      all.push(
        onlyCategories.map((c) => Math.round(lhr.categories[c].score * 100)),
      );
    }
    const median = onlyCategories.map(
      (_, j) =>
        all.map((r) => r[j]).sort((a, b) => a - b)[Math.floor(runs / 2)],
    );
    summary.pages.push({ path: path || "index.html", scores: all, median });
    console.log(
      id,
      "scores",
      JSON.stringify(all),
      "median",
      JSON.stringify(median),
    );
    if (median.some((x) => x !== 100)) {
      console.error(
        `::error::${id}: Lighthouse median ${median.join("/")}. See all ${runs} reports for the failing audits.`,
      );
      pass = false;
    }
  }
});
await writeFile(
  new URL("scores.json", directory),
  JSON.stringify(summary, null, 2) + "\n",
);
if (!pass) process.exitCode = 1;
