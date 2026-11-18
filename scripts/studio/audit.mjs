import { mkdir, writeFile } from "node:fs/promises";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { serveProject } from "./serve.mjs";
const { server, origin } = await serveProject();
const categories = ["performance", "accessibility", "best-practices", "seo"];
const routes = process.argv.slice(2);
const summary = {};
let chrome;
try {
  chrome = await launch({
    chromePath: process.env.CHROME_PATH,
    chromeFlags: [
      "--headless",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--disable-gpu",
    ],
  });
  await mkdir(".lighthouseci", { recursive: true });
  for (const route of routes.length
    ? routes
    : [
        "index.html",
        "atlas-library.html",
        "library/practice/ielts/sample-academic-reading-1.html",
        "library/mock/cambridge-reading/cambridge-19-test-1-reading.html",
        "library/mock/cambridge-listening/cambridge-19-test-1.html",
        "library/mock/cambridge-writing/cambridge-19-test-1-writing.html",
      ]) {
    // A single mobile timing can be skewed by unrelated runner activity. Retain all
    // three cold navigations, gate median performance, and require every other score.
    const samples = [];
    for (let i = 1; i <= 3; i++) {
      const { lhr, report } = await lighthouse(origin + route, {
        port: chrome.port,
        output: "html",
        logLevel: "error",
        onlyCategories: categories,
      });
      await writeFile(`.lighthouseci/${i}-${route.split("/").at(-1)}`, report);
      const scores = Object.fromEntries(
        categories.map((k) => [k, Math.round(lhr.categories[k].score * 100)]),
      );
      samples.push(scores);
      for (const k of categories.filter((k) => scores[k] < 100)) {
        for (const { id, weight } of lhr.categories[k].auditRefs) {
          const a = lhr.audits[id];
          if (weight && a.score !== null && a.score < 1)
            console.warn(`${route} #${i} ${id}: ${a.displayValue || ""}`);
        }
      }
    }
    const scores = Object.fromEntries(
      categories.map((k) => {
        const values = samples.map((s) => s[k]).sort((a, b) => a - b);
        return [k, k === "performance" ? values[1] : values[0]];
      }),
    );
    summary[route] = { scores, samples };
    console.log(
      route,
      scores,
      "Performance samples:",
      samples.map((s) => s.performance),
    );
    if (categories.some((k) => scores[k] !== 100)) {
      process.exitCode = 1;
      if (process.env.GITHUB_ACTIONS)
        console.error(
          `::error title=Lighthouse ${route}::${JSON.stringify(summary[route])}`,
        );
    }
  }
  await writeFile(
    ".lighthouseci/scores.json",
    JSON.stringify(summary, null, 2),
  );
} finally {
  if (chrome) await chrome.kill();
  server.close();
}
