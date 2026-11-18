import { lessons, skills } from "./course.mjs";
import {
  dayOf,
  dueCards,
  finish,
  restore,
  save,
  summary,
} from "./progress.mjs";

const icon = (name, cls) =>
  `<svg class="${cls}" aria-hidden="true"><use href="assets/marks.svg#${name}"/></svg>`;
const filters = [["all", "Tất cả"], ...Object.entries(skills)];
const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

// All HTML fragments below are authored course content, never user input or storage.
export function mount(doc, storage, now) {
  const el = (id) => doc.getElementById(id);
  const s = restore(storage);
  const dialog = el("session");
  let filter = "all",
    questions,
    results,
    lessonId,
    index;

  function render() {
    const date = now(),
      day = dayOf(date);
    const { streak, xp, next, week, skills: learned } = summary(s, day);
    const due = dueCards(s, day).length;
    el("xp").textContent = xp;
    el("streak").textContent = streak;
    el("path-count").textContent =
      `${s.completed.length} / ${lessons.length} bài`;
    el("next-title").textContent = next.title;
    el("next-note").textContent = next.subtitle;
    el("next-tag").textContent =
      `${String(lessons.indexOf(next) + 1).padStart(2, "0")} / ${String(lessons.length).padStart(2, "0")} · ${next.skill.toUpperCase()}`;
    el("week").innerHTML = week
      .map((done, i) => {
        const label = weekdays[(date.getDay() + i + 1) % 7];
        return `<li class="${done ? "done" : ""}" aria-label="${label}: ${done ? "đã học" : "chưa học"}"><b aria-hidden="true">${done ? "✓" : "·"}</b><span>${label}</span></li>`;
      })
      .join("");
    el("badge").textContent =
      streak >= 7
        ? "Huy hiệu Bền bỉ · Học 7 ngày liên tiếp"
        : learned === 4
          ? "Huy hiệu Toàn diện · Đã luyện cả bốn kỹ năng"
          : s.completed.length
            ? "Huy hiệu Khởi hành · Đã hoàn thành bài đầu"
            : "Hoàn thành bài đầu để nhận huy hiệu Khởi hành.";
    el("review").disabled = !due;
    el("review-note").textContent = due
      ? `${due} câu đến hạn. Mỗi lượt ôn tối đa 6 câu, ưu tiên câu đến hạn sớm nhất.`
      : "Chưa có câu đến hạn. Hãy hoàn thành bài mới hoặc quay lại vào ngày mai.";
    el("filters").innerHTML = filters
      .map(
        ([id, label]) =>
          `<button data-filter="${id}" aria-pressed="${id === filter}">${label}</button>`,
      )
      .join("");
    el("lesson-list").innerHTML = lessons
      .map((l, i) => {
        if (filter !== "all" && l.skill !== filter) return "";
        return `<li class="${l.skill}"><button class="lesson" data-lesson="${l.id}"><span class="number">${String(i + 1).padStart(2, "0")}</span>${icon(l.skill, "skill-icon")}<span><small class="row-meta">${skills[l.skill]} · ${l.topic}</small><b>${l.title}</b></span><span class="row-end">${s.completed.includes(l.id) ? '<span aria-label="Đã hoàn thành">✓</span>' : "→"}</span></button></li>`;
      })
      .join("");
  }

  function question() {
    const q = questions[index];
    const context = q.audio
      ? `<audio controls preload="none" src="../app/library/toefl/audio/set-1-s-lr-${q.audio}.mp3" aria-label="Đoạn ghi âm tiếng Anh"></audio><details><summary>Xem lời thoại tiếng Anh</summary><p lang="en">${q.context}</p></details>`
      : `<blockquote class="extract" lang="en">${q.context}</blockquote>`;
    el("activity").innerHTML =
      `<p class="folio">Câu ${index + 1} / ${questions.length}</p>${context}<form id="response"><fieldset class="question"><legend lang="en">${q.prompt}</legend>${q.options.map((o, i) => `<label class="choice"><input required type="radio" name="answer" value="${i}"><span lang="en">${o}</span></label>`).join("")}</fieldset><button class="primary" type="submit">Kiểm tra</button></form><div id="feedback" aria-live="polite"></div>`;
    el("response").addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        const correct =
          Number(el("response").elements.answer.value) === q.answer;
        results.push({ id: q.id, correct });
        el("response").querySelector("fieldset").disabled = true;
        el("response").querySelector("button").hidden = true;
        el("feedback").innerHTML =
          `<div class="feedback ${correct ? "" : "wrong"}"><b>${correct ? "Chính xác." : "Chưa đúng."}</b><span>Đáp án: <span lang="en">${q.options[q.answer]}</span></span>${q.why}</div><button class="primary" id="advance">${index + 1 === questions.length ? "Xem kết quả" : "Câu tiếp theo"} →</button>`;
        el("advance").addEventListener("click", advance);
        el("advance").focus();
      },
      { once: true },
    );
    el("session-title").focus();
  }

  function advance() {
    if (++index < questions.length) {
      question();
      return;
    }
    const xp = finish(s, dayOf(now()), results, lessonId);
    if (!save(storage, s))
      el("storage-note").textContent =
        "Trình duyệt không cho phép lưu. Tiến độ chỉ được giữ đến khi đóng trang.";
    el("session-title").textContent = "Đã hoàn thành phiên học";
    el("activity").innerHTML =
      `<p><b>${results.filter((r) => r.correct).length} / ${results.length} câu đúng · +${xp} XP</b></p><p class="subtle">Mỗi câu được tính XP một lần mỗi ngày. Câu sai có thể ôn ngay; câu đúng được hẹn lại sau 1, 3, 7 hoặc 14 ngày. XP không phải band IELTS.</p><button class="primary" id="back">Về bàn học</button>`;
    el("back").addEventListener("click", () => dialog.close());
    el("session-title").focus();
    render();
  }

  function begin(lesson) {
    lessonId = lesson?.id;
    questions = lesson ? lesson.cards : dueCards(s, dayOf(now())).slice(0, 6);
    results = [];
    index = 0;
    el("session-title").textContent = lesson ? lesson.title : "Ôn câu đến hạn";
    dialog.showModal();
    question();
  }
  el("filters").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) {
      filter = b.dataset.filter;
      render();
      el("filters").querySelector('[aria-pressed="true"]').focus();
    }
  });
  el("lesson-list").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) begin(lessons.find((l) => l.id === b.dataset.lesson));
  });
  el("start").addEventListener("click", () =>
    begin(summary(s, dayOf(now())).next),
  );
  el("review").addEventListener("click", () => begin(null));
  el("close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    el("activity").replaceChildren();
    el("start").focus();
  });
  doc.addEventListener("visibilitychange", () => {
    if (!doc.hidden) render();
  });
  render();
}
