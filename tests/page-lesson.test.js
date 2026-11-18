import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import { createSpeech, initLesson } from "../vi/assets/js/page-lesson.js";
import { createStore } from "../vi/assets/js/store.js";
import { loadDoc, memoryStorage } from "./helpers.js";

const NOW = new Date("2026-11-18T09:00:00");

const choice = { id: "q1", type: "choice", prompt: "Chọn đáp án", options: ["sai", "đúng"], answer: 1, explain: "Vì đúng." };
const fill = { id: "q2", type: "fill", prompt: "Điền từ", answer: "inevitable", accept: ["unavoidable"] };
const order = { id: "q3", type: "order", prompt: "Sắp xếp", bank: ["The", "study", "found"], answer: ["The", "study", "found"] };
const listen = { id: "q4", type: "listen", prompt: "Nghe", audio: "Hello world", options: ["a", "b"], answer: 0 };
const odd = { id: "q5", type: "odd", prompt: "Lạ", answer: "x" };

function session(questions, lessonId = "u1l1") {
  return { id: `s-${lessonId}`, lessonId, unitId: "u1", title: "Bài kiểm thử", questions };
}

function setup(questions = [choice, fill, order], storeOverrides = {}) {
  const dom = loadDoc("hoc.html");
  const store = createStore({ storage: memoryStorage(), now: () => NOW });
  if (Object.keys(storeOverrides).length) store.update(storeOverrides);
  const speech = { supported: true, speak: vi.fn().mockReturnValue(true) };
  const controller = initLesson({
    document: dom.window.document,
    store,
    session: session(questions),
    now: () => NOW,
    speech
  });
  return { dom, document: dom.window.document, store, controller, speech };
}

describe("chọn đáp án", () => {
  it("chọn, kiểm tra đúng, sang câu tiếp", () => {
    const { document, controller, store } = setup();
    const options = document.querySelectorAll("#lesson-options .option");
    expect(options).toHaveLength(2);
    options[1].click();
    expect(options[1].getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelector("#lesson-check").disabled).toBe(false);
    const result = controller.submit();
    expect(result.correct).toBe(true);
    expect(document.querySelector("#lesson-feedback").className).toContain("feedback--correct");
    expect(document.querySelector("#lesson-feedback").textContent).toContain("Chính xác");
    expect(document.querySelector("#lesson-next").hidden).toBe(false);
    expect(store.get().hearts).toBe(5);
    controller.next();
    expect(controller.index).toBe(1);
    expect(document.querySelector("#lesson-step").textContent).toContain("2/3");
  });

  it("trả lời sai mất tim và hiện đáp án", () => {
    const { document, controller, store } = setup();
    document.querySelectorAll("#lesson-options .option")[0].click();
    const result = controller.submit();
    expect(result.correct).toBe(false);
    expect(store.get().hearts).toBe(4);
    expect(document.querySelector("#lesson-feedback").textContent).toContain("đúng");
    expect(document.querySelectorAll(".option--wrong")).toHaveLength(1);
    expect(document.querySelectorAll(".option--correct")).toHaveLength(1);
    expect(document.querySelector("[data-stat='hearts']").textContent).toBe("4");
  });

  it("hết tim vẫn cho xem phản hồi", () => {
    const { document, controller, store } = setup([choice], { hearts: 0 });
    document.querySelectorAll("#lesson-options .option")[0].click();
    controller.submit();
    expect(store.get().hearts).toBe(0);
    expect(document.querySelector("#lesson-feedback").textContent).toContain("đáp án");
  });

  it("không chọn thì không chấm", () => {
    const { controller } = setup([choice]);
    expect(controller.submit()).toBeNull();
    expect(controller.next()).toBeNull();
  });

  it("bỏ qua thao tác sau khi đã chấm", () => {
    const { document, controller } = setup([choice]);
    document.querySelectorAll("#lesson-options .option")[1].click();
    controller.submit();
    document.querySelectorAll("#lesson-options .option")[0].click();
    expect(controller.pending).toBe(1);
  });
});

describe("điền từ", () => {
  it("nhập đúng (không phân biệt hoa thường)", () => {
    const { document, controller } = setup([fill]);
    const input = document.querySelector("#lesson-fill");
    input.value = "INEVITABLE";
    input.dispatchEvent(new document.defaultView.Event("input"));
    expect(document.querySelector("#lesson-check").disabled).toBe(false);
    expect(controller.submit().correct).toBe(true);
  });

  it("chấp nhận từ đồng nghĩa và chặn chuỗi rỗng", () => {
    const { document, controller } = setup([fill]);
    const input = document.querySelector("#lesson-fill");
    input.value = "   ";
    input.dispatchEvent(new document.defaultView.Event("input"));
    expect(document.querySelector("#lesson-check").disabled).toBe(true);
    expect(controller.submit()).toBeNull();
    input.value = "unavoidable";
    input.dispatchEvent(new document.defaultView.Event("input"));
    expect(controller.submit().correct).toBe(true);
  });
});

describe("sắp xếp câu", () => {
  it("chọn và bỏ từ, chấm đúng", () => {
    const { document, controller } = setup([order]);
    const chips = document.querySelectorAll("#lesson-bank .chip");
    expect(chips).toHaveLength(3);
    chips[1].click();
    chips[0].click();
    chips[2].click();
    expect(document.querySelectorAll("#lesson-answer .chip")).toHaveLength(3);
    controller.removeToken(0);
    expect(document.querySelectorAll("#lesson-answer .chip")).toHaveLength(2);
    controller.removeToken(1);
    controller.removeToken(0);
    controller.pickToken(0);
    controller.pickToken(1);
    controller.pickToken(2);
    controller.pickToken(0); // trùng thì bỏ qua
    expect(controller.pending).toEqual(["The", "study", "found"]);
    expect(controller.submit().correct).toBe(true);
  });
});

describe("nghe", () => {
  it("hiện nút phát và gọi speech", () => {
    const { document, controller, speech } = setup([listen]);
    const play = [...document.querySelectorAll("#lesson-media button")][0];
    expect(play.textContent).toContain("Phát audio");
    play.click();
    expect(speech.speak).toHaveBeenCalledWith("Hello world");
    document.querySelectorAll("#lesson-options .option")[0].click();
    expect(controller.submit().correct).toBe(true);
  });

  it("createSpeech dùng Web Speech API", () => {
    const utterance = vi.fn(function Utterance(text) {
      this.text = text;
      this.lang = "";
      this.rate = 1;
    });
    const win = {
      speechSynthesis: { cancel: vi.fn(), speak: vi.fn() },
      SpeechSynthesisUtterance: function SpeechSynthesisUtterance(text) {
        utterance.call(this, text);
      }
    };
    const speech = createSpeech(win);
    expect(speech.supported).toBe(true);
    expect(speech.speak("Xin chào")).toBe(true);
    expect(win.speechSynthesis.cancel).toHaveBeenCalled();
    expect(win.speechSynthesis.speak).toHaveBeenCalled();
    expect(speech.speak("")).toBe(false);
    const silent = createSpeech({});
    expect(silent.supported).toBe(false);
    expect(silent.speak("x")).toBe(false);
  });
});

describe("tổng kết", () => {
  it("hoàn thành bài, cộng XP, lưu SRS và huy hiệu", () => {
    const { document, controller, store } = setup([choice, fill]);
    document.querySelectorAll("#lesson-options .option")[1].click();
    controller.submit();
    controller.next();
    const input = document.querySelector("#lesson-fill");
    input.value = "inevitable";
    input.dispatchEvent(new document.defaultView.Event("input"));
    controller.submit();
    const summary = controller.next();
    expect(summary.correct).toBe(2);
    expect(summary.perfect).toBe(true);
    expect(document.querySelector("#lesson-summary").hidden).toBe(false);
    expect(document.querySelector("#lesson-summary").textContent).toContain("Hoàn thành bài học");
    expect(document.querySelector("#lesson-card").hidden).toBe(true);
    expect(document.querySelector("#lesson-progress-fill").style.width).toBe("100%");
    expect(store.get().xp).toBeGreaterThan(0);
    expect(store.get().completed.u1l1).toBe(true);
    expect(Object.keys(store.get().srs)).toEqual(["q1", "q2"]);
    expect(store.get().badges).toContain("first-lesson");
    expect(store.get().gems).toBe(140);
    expect(controller.next()).toBe(summary);
    expect(controller.finish()).toBe(summary);
    expect(controller.isFinished()).toBe(true);
  });

  it("phiên luyện tập không đánh dấu hoàn thành lộ trình", () => {
    const { controller, store } = setup([choice], {});
    const practice = session([choice], "practice");
    const dom = loadDoc("hoc.html");
    const localStore = createStore({ storage: memoryStorage(), now: () => NOW });
    const c = initLesson({ document: dom.window.document, store: localStore, session: practice, now: () => NOW, speech: { speak: vi.fn() } });
    dom.window.document.querySelectorAll("#lesson-options .option")[1].click();
    c.submit();
    c.next();
    expect(localStore.get().completed).toEqual({});
    store.reset();
    expect(controller.index).toBe(0);
  });

  it("dạng câu không hỗ trợ bị chấm sai", () => {
    const { controller } = setup([odd]);
    expect(controller.submit()).toBeNull();
    controller.select(0);
    expect(controller.submit().correct).toBe(false);
  });

  it("phiên rỗng hiển thị thông báo", () => {
    const { document, controller } = setup([]);
    expect(document.querySelector("#lesson-prompt").textContent).toContain("Chưa có câu hỏi");
    expect(document.querySelector("#lesson-check").hidden).toBe(true);
    expect(controller.isFinished()).toBe(false);
  });
});

describe("giao diện tối giản", () => {
  it("không có phần tử tuỳ chọn vẫn chạy", () => {
    const d = new JSDOM(`<!doctype html><html><body>
      <div id="lesson-card"><h2 id="lesson-prompt"></h2><div id="lesson-options"></div><div id="lesson-bank"></div><div id="lesson-answer"></div></div>
      <section id="lesson-summary" hidden></section>
    </body></html>`).window.document;
    const store = createStore({ storage: memoryStorage(), now: () => NOW });
    const controller = initLesson({ document: d, store, session: session([choice]), now: () => NOW, speech: { speak: vi.fn() } });
    controller.select(1);
    controller.submit();
    expect(store.get().hearts).toBe(5);
    expect(d.querySelector("#lesson-feedback")).toBeNull();
    controller.next();
    expect(d.querySelector("#lesson-summary").hidden).toBe(false);
  });

  it("thiếu tham số báo lỗi", () => {
    expect(() => initLesson({})).toThrow("initLesson");
  });
});
