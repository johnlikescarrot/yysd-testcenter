import { describe, expect, it, vi } from "vitest";
import {
  SW_URL,
  isStandalone,
  registerServiceWorker,
  supportsServiceWorker,
  watchConnectivity
} from "../vi/assets/js/pwa.js";
import { CACHE_NAME, CORE_ASSETS, cacheKeyFor, isCacheFirst, shouldCache } from "../vi/assets/js/pwa-cache.js";

describe("pwa.js", () => {
  it("nhận diện service worker", () => {
    expect(supportsServiceWorker(null)).toBe(false);
    expect(supportsServiceWorker({})).toBe(false);
    expect(supportsServiceWorker({ serviceWorker: {} })).toBe(true);
  });

  it("isStandalone", () => {
    expect(isStandalone(null)).toBe(false);
    expect(isStandalone({})).toBe(false);
    expect(isStandalone({ matchMedia: () => ({ matches: true }) })).toBe(true);
    expect(isStandalone({ matchMedia: () => ({ matches: false }) })).toBe(false);
    expect(isStandalone({ navigator: { standalone: true } })).toBe(true);
    expect(isStandalone({})).toBe(false);
  });

  it("đăng ký thành công", async () => {
    const registration = { scope: "./" };
    const nav = { serviceWorker: { register: vi.fn().mockResolvedValue(registration) } };
    await expect(registerServiceWorker(nav)).resolves.toBe(registration);
    expect(nav.serviceWorker.register).toHaveBeenCalledWith(SW_URL, { scope: "./", type: "module" });
  });

  it("dùng url/scope tuỳ chỉnh", async () => {
    const nav = { serviceWorker: { register: vi.fn().mockResolvedValue(null) } };
    await registerServiceWorker(nav, { url: "./sw.js", scope: "/vi/" });
    expect(nav.serviceWorker.register).toHaveBeenCalledWith("./sw.js", { scope: "/vi/", type: "module" });
  });

  it("không hỗ trợ hoặc lỗi trả null", async () => {
    await expect(registerServiceWorker(null)).resolves.toBeNull();
    const nav = { serviceWorker: { register: vi.fn().mockRejectedValue(new Error("no")) } };
    await expect(registerServiceWorker(nav)).resolves.toBeNull();
  });

  it("watchConnectivity phát sự kiện và huỷ", () => {
    const listeners = {};
    const win = {
      addEventListener: (type, fn) => {
        listeners[type] = fn;
      },
      removeEventListener: vi.fn()
    };
    const onChange = vi.fn();
    const off = watchConnectivity(win, onChange);
    listeners.online();
    listeners.offline();
    expect(onChange).toHaveBeenNthCalledWith(1, true);
    expect(onChange).toHaveBeenNthCalledWith(2, false);
    off();
    expect(win.removeEventListener).toHaveBeenCalledTimes(2);
    expect(watchConnectivity(null, onChange)).toBeTypeOf("function");
  });
});

describe("pwa-cache.js", () => {
  it("shouldCache", () => {
    const origin = "https://example.com";
    expect(shouldCache({ method: "GET", url: `${origin}/vi/index.html` }, origin)).toBe(true);
    expect(shouldCache({ method: "POST", url: `${origin}/vi/` }, origin)).toBe(false);
    expect(shouldCache({ method: "GET" }, origin)).toBe(false);
    expect(shouldCache({ method: "GET", url: "https://other.com/a.js" }, origin)).toBe(false);
    expect(shouldCache({ method: "GET", url: `${origin}/api/state` }, origin)).toBe(false);
    expect(shouldCache(null, origin)).toBe(false);
  });

  it("isCacheFirst", () => {
    expect(isCacheFirst("https://x/a.css")).toBe(true);
    expect(isCacheFirst("https://x/a.PDF")).toBe(false);
    expect(isCacheFirst("https://x/a.pdf")).toBe(true);
    expect(isCacheFirst("https://x/vi/")).toBe(true);
    expect(isCacheFirst("https://x/vi/index.html")).toBe(false);
  });

  it("cacheKeyFor và hằng số", () => {
    expect(cacheKeyFor("https://x/vi/a.js?v=1")).toBe("/vi/a.js");
    expect(CACHE_NAME).toBe("yysd-ielts-vi-v1");
    expect(CORE_ASSETS).toContain("./index.html");
  });
});

describe("service worker", () => {
  it("precache, cleanup và fetch hoạt động", async () => {
    vi.resetModules();
    const store = new Map();
    const cache = {
      addAll: vi.fn().mockResolvedValue(undefined),
      match: vi.fn((request) => store.get(typeof request === "string" ? request : request.url)),
      put: vi.fn().mockResolvedValue(undefined)
    };
    const cachesMock = {
      open: vi.fn().mockResolvedValue(cache),
      keys: vi.fn().mockResolvedValue([CACHE_NAME, "old-cache"]),
      delete: vi.fn().mockResolvedValue(true)
    };
    globalThis.caches = cachesMock;

    const handlers = {};
    const addListener = vi.spyOn(window, "addEventListener").mockImplementation((type, handler) => {
      handlers[type] = handler;
    });
    const skipWaiting = vi.fn();
    const claim = vi.fn();
    window.skipWaiting = skipWaiting;
    window.clients = { claim };

    const sw = await import("../vi/assets/js/sw.js");

    const installEvent = { waitUntil: vi.fn() };
    handlers.install(installEvent);
    await installEvent.waitUntil.mock.calls[0][0];
    expect(cache.addAll).toHaveBeenCalledWith(CORE_ASSETS);
    expect(skipWaiting).toHaveBeenCalled();

    const activateEvent = { waitUntil: vi.fn() };
    handlers.activate(activateEvent);
    await activateEvent.waitUntil.mock.calls[0][0];
    expect(cachesMock.delete).toHaveBeenCalledWith("old-cache");
    expect(claim).toHaveBeenCalled();

    const post = { request: { method: "POST", url: "http://localhost:3000/vi/" }, respondWith: vi.fn() };
    handlers.fetch(post);
    expect(post.respondWith).not.toHaveBeenCalled();

    const getEvent = { request: { method: "GET", url: "http://localhost:3000/vi/assets/css/app.css" }, respondWith: vi.fn((promise) => promise.catch(() => {})) };
    handlers.fetch(getEvent);
    expect(getEvent.respondWith).toHaveBeenCalled();

    await expect(sw.respond({ request: { method: "POST", url: "http://localhost:3000/vi/" } })).resolves.toBeUndefined();

    const cachedResponse = { ok: true, type: "basic" };
    cache.match.mockResolvedValueOnce(cachedResponse);
    await expect(
      sw.respond({ request: { method: "GET", url: "http://localhost:3000/vi/assets/img/icon.svg" } })
    ).resolves.toBe(cachedResponse);

    // HTML có cache nhưng không cache-first → vẫn thử mạng
    const htmlFresh = { ok: true, type: "basic", clone: () => "html-clone" };
    globalThis.fetch = vi.fn().mockResolvedValue(htmlFresh);
    cache.match.mockResolvedValueOnce(cachedResponse);
    await expect(
      sw.respond({ request: { method: "GET", url: "http://localhost:3000/vi/index.html" } })
    ).resolves.toBe(htmlFresh);
    expect(cache.put).toHaveBeenCalledWith({ method: "GET", url: "http://localhost:3000/vi/index.html" }, "html-clone");

    // response null → không put
    globalThis.fetch = vi.fn().mockResolvedValue(null);
    cache.match.mockResolvedValueOnce(undefined);
    await expect(
      sw.respond({ request: { method: "GET", url: "http://localhost:3000/vi/assets/js/b.js" } })
    ).resolves.toBeNull();

    cache.match.mockResolvedValueOnce(cachedResponse);
    await expect(
      sw.respond({ request: { method: "GET", url: "http://localhost:3000/vi/assets/css/app.css" } })
    ).resolves.toBe(cachedResponse);

    const fresh = { ok: true, type: "basic", clone: () => "clone" };
    globalThis.fetch = vi.fn().mockResolvedValue(fresh);
    cache.match.mockResolvedValueOnce(undefined);
    await expect(
      sw.respond({ request: { method: "GET", url: "http://localhost:3000/vi/assets/js/a.js" } })
    ).resolves.toBe(fresh);
    expect(cache.put).toHaveBeenCalledWith({ method: "GET", url: "http://localhost:3000/vi/assets/js/a.js" }, "clone");

    const htmlResponse = { ok: false, type: "cors" };
    globalThis.fetch = vi.fn().mockResolvedValue(htmlResponse);
    cache.match.mockResolvedValueOnce(undefined);
    await expect(
      sw.respond({ request: { method: "GET", url: "http://localhost:3000/vi/index.html" } })
    ).resolves.toBe(htmlResponse);

    globalThis.fetch = vi.fn().mockRejectedValue(new Error("offline"));
    cache.match.mockResolvedValueOnce(cachedResponse);
    await expect(
      sw.respond({ request: { method: "GET", url: "http://localhost:3000/vi/hoc.html" } })
    ).resolves.toBe(cachedResponse);

    cache.match.mockResolvedValue(undefined);
    await expect(
      sw.respond({ request: { method: "GET", url: "http://localhost:3000/vi/khac.html", mode: "navigate" } })
    ).resolves.toBeUndefined();

    await expect(
      sw.respond({ request: { method: "GET", url: "http://localhost:3000/vi/data/x.json", mode: "cors" } })
    ).rejects.toThrow("offline");

    await sw.precache();
    await sw.cleanup();
    expect(cachesMock.open).toHaveBeenCalled();

    addListener.mockRestore();
    delete globalThis.caches;
    delete window.skipWaiting;
    delete window.clients;
  });
});
