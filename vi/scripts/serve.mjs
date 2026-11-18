#!/usr/bin/env node
/* Máy chủ tĩnh tối giản để xem trước IELTS Việt (không dùng cho production). */

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".txt": "text/plain; charset=utf-8"
};

export function resolvePath(urlPath, root = ROOT) {
  const decoded = decodeURIComponent((urlPath || "/").split("?")[0]);
  const candidate = path.normalize(path.join(root, decoded));
  if (!candidate.startsWith(root)) return null;
  const target = fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()
    ? path.join(candidate, "index.html")
    : candidate;
  return fs.existsSync(target) ? target : null;
}

export function createServer(root = ROOT) {
  return http.createServer((request, response) => {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { "content-type": "text/plain; charset=utf-8" }).end("Method not allowed");
      return;
    }
    const file = resolvePath(request.url, root);
    if (!file) {
      const fallback = path.join(root, "index.html");
      if (fs.existsSync(fallback)) {
        response.writeHead(200, { "content-type": MIME[".html"], "cache-control": "no-cache" });
        if (request.method === "HEAD") return response.end();
        fs.createReadStream(fallback).pipe(response);
        return;
      }
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
      return;
    }
    const type = MIME[path.extname(file)] || "application/octet-stream";
    response.writeHead(200, {
      "content-type": type,
      "cache-control": type.startsWith("text/html") ? "no-cache" : "public, max-age=3600",
      "x-content-type-options": "nosniff"
    });
    if (request.method === "HEAD") return response.end();
    fs.createReadStream(file).pipe(response);
  });
}

if (process.argv[1] && process.argv[1].endsWith("serve.mjs")) {
  createServer().listen(PORT, HOST, () => {
    console.log(`IELTS Việt đang chạy tại http://${HOST}:${PORT}/vi/`);
  });
}
