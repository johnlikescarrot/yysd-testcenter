#!/usr/bin/env node
/**
 * Máy chủ tĩnh hiệu năng cao hỗ trợ nén Gzip, tiêu đề bảo mật & xem trước trực tiếp (0.0.0.0)
 * Phục vụ phát triển cục bộ, Live Preview (e2b.app) và kiểm định Google Lighthouse 100/100/100/100.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = path.resolve(process.env.STATIC_ROOT || path.resolve(import.meta.dirname, ".."));
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

const COMPRESSIBLE = new Set([".html", ".css", ".js", ".mjs", ".json", ".svg", ".xml", ".txt"]);

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const cleanRel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const resolved = path.resolve(ROOT, cleanRel);

  if (!resolved.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Từ chối truy cập.");
    return;
  }

  let filePath = resolved;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    if (cleanRel === "robots.txt") {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("User-agent: *\nAllow: /\n");
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Không tìm thấy tài nguyên.");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const headers = {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
  };

  const acceptEnc = String(req.headers["accept-encoding"] || "");
  if (COMPRESSIBLE.has(ext) && acceptEnc.includes("gzip")) {
    headers["Content-Encoding"] = "gzip";
    headers.Vary = "Accept-Encoding";
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(zlib.createGzip()).pipe(res);
    return;
  }

  headers["Content-Length"] = fs.statSync(filePath).size;
  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Máy chủ YYSD IELTS đang chạy tại http://${HOST}:${PORT} (thư mục: ${ROOT})`);
});
