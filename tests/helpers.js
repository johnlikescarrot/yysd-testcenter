import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

const ROOT = path.join(process.cwd(), "vi");

export function loadDoc(file, url = "http://localhost/vi/") {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  return new JSDOM(html, { url, pretendToBeVisual: true });
}

export function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
}

export function units() {
  return readJson("data/lessons.json").units;
}

export function docs() {
  return readJson("data/library.json").docs;
}

export function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    map
  };
}

export function jsonResponse(data, ok = true) {
  return { ok, json: async () => data };
}
