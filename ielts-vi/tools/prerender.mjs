// Paint the real initial lesson list before JS loads; don't shift the journal
// down the screen on slow mobile connections. Progress stays client-local.
import { readFile, writeFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { mount } from "../assets/atlas.mjs";
const url = new URL("../dist/index.html", import.meta.url);
const dom = new JSDOM(await readFile(url, "utf8"));
mount(dom.window.document, { getItem: () => null }, () => new Date());
await writeFile(url, dom.serialize());
dom.window.close();
