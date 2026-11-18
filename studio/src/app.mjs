import { historyKey, showHistory } from "./history.mjs";
import { cards, lessons, skills } from "./lessons.mjs";
import {
  localDay,
  lessonCards,
  restore,
  storageKey,
  summarize,
} from "./progress.mjs";

const icon = (name) =>
  `<svg class="ico" aria-hidden="true"><use href="studio/art/icons.svg#${name}"/></svg>`;
const number = (n) => String(n).padStart(2, "0");
const weekLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const badgeLabels = [
  "Khởi hành · hoàn thành chặng đầu",
  "Bốn phương · luyện đủ bốn kỹ năng",
  "Giữ nhịp · học ba ngày liên tiếp",
];

export function renderRows(filter, completed) {
  return lessons
    .filter((l) => filter === "all" || l.skill === filter)
    .map(
      (l) =>
        `<li><button type="button" class="lesson-row" data-unit="${l.id}"><span class="skill-icon ${l.skill}">${icon(skills[l.skill].icon)}</span><span class="row-main"><span class="row-label">CHẶNG ${number(lessons.indexOf(l) + 1)} &nbsp;/&nbsp; ${l.skill}</span><span class="row-name">${l.title}</span></span><span class="row-end">${completed.has(l.id) ? "Đã học " + icon("check") : "3 câu " + icon("arrow")}</span></button></li>`,
    )
    .join("");
}

export function mount(doc, env) {
  const $ = (id) => doc.getElementById(id);
  let raw = null;
  try {
    raw = env.localStorage.getItem(storageKey);
  } catch {
    $("storage-note").hidden = false;
  }
  let state = restore(raw),
    filter = "all",
    run;
  const today = () => localDay(new Date());
  function save() {
    try {
      env.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      $("storage-note").hidden = false;
    }
  }
  function render() {
    showHistory(doc, env);
    const date = new Date(),
      day = localDay(date),
      s = summarize(state, day),
      next = s.next;
    const weekdays = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy",
    ];
    $("date").textContent =
      `${weekdays[date.getDay()]}, ${date.getDate()} tháng ${date.getMonth() + 1}`;
    $("feature-title").textContent = next.title;
    $("feature-unit").textContent =
      `CHẶNG ${number(lessons.indexOf(next) + 1)} / ${number(lessons.length)}  ·  ${next.skill.toUpperCase()}`;
    $("feature-topic").textContent = next.topic;
    $("streak").textContent = s.streak;
    $("xp").textContent = s.xp;
    $("league").textContent = `Hạng ${s.league.name} · ${s.league.xp} XP`;
    $("league-next").textContent =
      s.league.next === null
        ? "Bạn đã đạt hạng cao nhất tuần này."
        : `Cần thêm ${s.league.next - s.league.xp} XP để lên hạng tiếp theo.`;
    const monday = day - ((date.getDay() + 6) % 7);
    $("week").innerHTML = weekLabels
      .map((label, i) => {
        const active = s.days.has(monday + i),
          now = monday + i === day;
        return `<li class="${active ? "studied" : ""} ${now ? "today" : ""}" aria-label="${label}: ${active ? "đã học" : "chưa học"}${now ? ", hôm nay" : ""}"><span>${label}</span><i aria-hidden="true">${active ? "✓" : now ? "•" : ""}</i></li>`;
      })
      .join("");
    $("goal").value = String(state.goal);
    $("goal-progress").max = state.goal;
    $("goal-progress").value = Math.min(s.count, state.goal);
    $("goal-text").textContent =
      `Đã hoàn thành ${s.count} / ${state.goal} bài${s.count >= state.goal ? " · Đạt mục tiêu!" : ""}`;
    $("due-note").textContent = s.due.length
      ? `${s.due.length} câu đã đến lúc ôn lại. Mỗi lượt tối đa 5 câu.`
      : state.sessions.length
        ? "Bạn đã ôn xong các câu đến hạn. Hẹn gặp lại ở lần ôn tới."
        : "Câu đã học sẽ trở lại theo lịch ôn riêng của bạn.";
    $("review").disabled = !s.due.length;
    $("completed").textContent =
      `${s.completed.size} / ${lessons.length} chặng`;
    $("badges").innerHTML = badgeLabels
      .map(
        (b, i) =>
          `<li class="${s.badges[i] ? "earned" : ""}">${icon(s.badges[i] ? "award" : "lock")}<span>${b} · ${s.badges[i] ? "đã đạt" : "chưa đạt"}</span></li>`,
      )
      .join("");
    const list = $("lessons"),
      key = `${filter}:${[...s.completed].join(",")}`;
    if (list.dataset.rendered !== key) {
      list.innerHTML = renderRows(filter, s.completed);
      list.dataset.rendered = key;
    }
  }
  function start(unit, ids) {
    run = { unit, ids, picks: [] };
    $("mode").textContent =
      unit === "review"
        ? "SỔ ÔN TẬP / ÔN CÁCH QUÃNG"
        : "LỘ TRÌNH / BÀI HỌC NGẮN";
    question();
    $("session").showModal();
    $("session-title").focus();
  }
  function question() {
    const i = run.picks.length,
      card = cards.get(run.ids[i]),
      l = card.lesson;
    const context = l.audio
      ? `<div class="audio-box"><audio aria-label="Đoạn nghe tiếng Anh" controls preload="metadata" src="studio/audio/${l.audio}.mp3"></audio><details><summary>Xem tóm tắt đoạn nghe</summary><p lang="en">${l.transcript}</p></details></div>`
      : `<p class="context" lang="en">${l.text}</p>`;
    $("exercise").innerHTML =
      `<p class="row-label">${l.skill} &nbsp; / &nbsp; Câu ${i + 1} trên ${run.ids.length}</p><h2 id="session-title" tabindex="-1">${l.title}</h2><progress aria-label="Tiến độ bài học" max="${run.ids.length}" value="${i}"></progress>${context}<p class="question" id="prompt" lang="en">${card.prompt}</p><div class="choices" role="group" aria-labelledby="prompt">${card.options.map((o, j) => `<button type="button" class="choice" data-choice="${j}" lang="en">${o}</button>`).join("")}</div><div id="feedback" aria-live="polite"></div>`;
    $("session-title").focus();
  }
  function pick(choice) {
    const card = cards.get(run.ids[run.picks.length]);
    run.picks.push([card.id, choice]);
    const correct = choice === card.key;
    doc.querySelectorAll("[data-choice]").forEach((btn, j) => {
      btn.disabled = true;
      btn.classList.toggle("right", j === card.key);
      btn.classList.toggle("wrong", j === choice && !correct);
    });
    $("feedback").innerHTML =
      `<div class="feedback ${correct ? "good" : ""}"><b>${correct ? "Chính xác!" : "Chưa đúng."}</b><p>Đáp án: <span lang="en">${card.options[card.key]}</span></p><p>${card.note}</p></div><button type="button" id="advance" class="btn primary">${run.picks.length === run.ids.length ? "Xem kết quả" : "Câu tiếp theo"} ${icon("arrow")}</button>`;
    $("advance").focus();
  }
  function finish() {
    const day = today();
    const before = summarize(state, day).xp;
    state.sessions.push({ day, unit: run.unit, picks: run.picks });
    save();
    const after = summarize(state, day),
      n = run.picks.filter(([id, c]) => cards.get(id).key === c).length;
    $("exercise").innerHTML =
      `<h2 id="session-title" tabindex="-1">Đã hoàn thành!</h2><span class="result-xp">+${after.xp - before} XP</span><p>Bạn trả lời đúng <b>${n} / ${run.ids.length}</b> câu.</p><p class="result-summary">Câu sai có thể ôn lại ngay. Câu đúng sẽ trở lại theo lịch 1, 3, 7, 14 và 30 ngày. Làm lại cùng ngày không cộng điểm hai lần cho cùng đáp án đúng.</p><button class="btn primary" id="return" type="button">Trở về bàn học ${icon("arrow")}</button>`;
    render();
    $("session-title").focus();
  }
  $("start").addEventListener("click", () => {
    const l = summarize(state, today()).next;
    start(l.id, lessonCards(l));
  });
  $("lessons").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-unit]");
    if (btn) {
      const l = lessons.find((x) => x.id === btn.dataset.unit);
      start(l.id, lessonCards(l));
    }
  });
  $("review").addEventListener("click", () => {
    const ids = summarize(state, today()).due.slice(0, 5);
    if (ids.length) start("review", ids);
    else render();
  });
  $("session").addEventListener("close", () => {
    $("exercise").replaceChildren();
    run = null;
  });
  $("exercise").addEventListener("click", (event) => {
    const btn = event.target.closest("button");
    if (!btn || btn.disabled) return;
    if (btn.hasAttribute("data-choice")) pick(Number(btn.dataset.choice));
    else if (btn.id === "advance") {
      if (run.picks.length < run.ids.length) question();
      else finish();
    } else $("session").close();
  });
  doc.querySelectorAll("[data-skill]").forEach((btn) =>
    btn.addEventListener("click", () => {
      filter = btn.dataset.skill;
      doc
        .querySelectorAll("[data-skill]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      render();
    }),
  );
  $("goal").addEventListener("change", () => {
    state.goal = Number($("goal").value);
    save();
    render();
  });
  env.addEventListener("storage", (event) => {
    if (event.key === historyKey) showHistory(doc, env);
    if (event.key === storageKey || event.key === null) {
      state = restore(event.newValue);
      render();
    }
  });
  env.addEventListener("focus", render);
  render();
}
