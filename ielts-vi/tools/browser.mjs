import chromium from "@sparticuz/chromium";
// Serve the release under a project-site prefix in tests. No server code is shipped.
import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".mjs": "text/javascript",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".mp3": "audio/mpeg",
};
export async function withBrowser(run) {
  const prefix = "/yysd-testcenter/";
  const server = http.createServer(async (req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    const filename = resolve(
      dist,
      decodeURIComponent(pathname.slice(prefix.length)) || "index.html",
    );
    try {
      if (
        !pathname.startsWith(prefix) ||
        !filename.startsWith(resolve(dist) + sep)
      )
        throw Error("Outside artifact");
      const info = await stat(filename);
      if (!info.isFile()) throw Error("Not a file");
      res.writeHead(200, {
        "content-type": types[extname(filename)] || "application/octet-stream",
        "content-length": info.size,
      });
      createReadStream(filename)
        .on("error", () => res.destroy())
        .pipe(res);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath:
        process.env.CHROME_PATH || (await chromium.executablePath()),
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    await run(browser, `http://127.0.0.1:${server.address().port}${prefix}`);
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}
