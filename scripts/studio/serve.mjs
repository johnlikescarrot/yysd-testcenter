import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { createGzip } from "node:zlib";
import { once } from "node:events";

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
export async function serveProject() {
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
  return {
    server,
    origin: `http://127.0.0.1:${server.address().port}${prefix}`,
  };
}
