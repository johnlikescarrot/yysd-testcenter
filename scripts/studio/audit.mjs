import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { createGzip } from "node:zlib";
import { once } from "node:events";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";

// Use a project subpath just like GitHub Pages. No API, CDN or absolute-root fallbacks.
const prefix = "/yysd-testcenter/",
  dir = resolve("dist");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".css": "text/css",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".png": "image/png",
};
const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  const file = resolve(dir, pathname.slice(prefix.length) || "index.html");
  try {
    if (!pathname.startsWith(prefix) || !file.startsWith(dir + sep))
      throw Error();
    const info = await stat(file);
    if (!info.isFile()) throw Error();
    const ext = extname(file),
      stream = createReadStream(file);
    const gzip =
      [".html", ".svg", ".css", ".mjs", ".json"].includes(ext) &&
      /\bgzip\b/.test(req.headers["accept-encoding"] || "");
    res.writeHead(200, {
      "Content-Type": mime[ext] || "application/octet-stream",
      ...(gzip
        ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" }
        : { "Content-Length": info.size }),
    });
    (gzip ? stream.pipe(createGzip()) : stream).pipe(res);
  } catch {
    res.writeHead(404).end();
  }
});
server.listen(0, "127.0.0.1");
await once(server, "listening");
const categories = ["performance", "accessibility", "best-practices", "seo"];
const origin = `http://127.0.0.1:${server.address().port}${prefix}`;
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
