/* =========================================================================
   page-home.js — trang học: chuỗi ngày, mục tiêu, lộ trình, nhiệm vụ.
   ========================================================================= */

import { createI18n } from "./i18n.js";
import { BADGES, dailyGoalStatus, dailyQuests, earnedBadges, leagueFor, levelFromXp, questProgress, refreshHearts, rollWeek } from "./gamify.js";
import { allLessons, nextLesson, pathProgress } from "./quiz.js";
import { dueCards } from "./srs.js";
import { createEl, markActiveNav, q, setText, updateTopbar } from "./page-common.js";

function lessonState(lesson, index, list, completed) {
  if (completed[lesson.id]) return "done";
  const previous = list[index - 1];
  if (!previous || completed[previous.id]) return "next";
  return "locked";
}

/** Vẽ danh sách unit + bài học. */
export function renderPath(document, units, completed) {
  const host = q(document, "#home-path");
  if (!host) return [];
  const list = allLessons(units);
  host.textContent = "";
  const links = [];
  for (const unit of units) {
    const section = createEl(document, "section", "unit");
    const head = createEl(document, "div", "unit__head");
    const icon = createEl(document, "span", "unit__icon", unit.icon || "📘");
    icon.setAttribute("aria-hidden", "true");
    const copy = createEl(document, "div", "unit__copy");
    copy.append(createEl(document, "h3", "", unit.title));
    copy.append(createEl(document, "p", "", unit.subtitle || ""));
    head.append(icon, copy);
    const ul = createEl(document, "ul", "lesson-list");
    for (const lesson of unit.lessons || []) {
      const index = list.findIndex((item) => item.id === lesson.id);
      const state = lessonState(lesson, index, list, completed);
      const li = createEl(document, "li", "");
      const link = createEl(document, "a", `lesson-link lesson-link--${state}`);
      link.href = `hoc.html?bai=${encodeURIComponent(lesson.id)}`;
      link.dataset.lesson = lesson.id;
      if (state === "locked") link.setAttribute("aria-disabled", "true");
      const badge = createEl(document, "span", "lesson-link__icon", state === "done" ? "✓" : state === "locked" ? "🔒" : "▶");
      badge.setAttribute("aria-hidden", "true");
      const text = createEl(document, "span", "lesson-link__text");
      text.append(createEl(document, "span", "", lesson.title));
      text.append(createEl(document, "small", "", `${lesson.questions?.length || 0} câu · ${lesson.goal || ""}`));
      link.append(badge, text);
      li.append(link);
      ul.append(li);
      links.push(link);
    }
    section.append(head, ul);
    host.append(section);
  }
  return links;
}

/** Vẽ 3 nhiệm vụ ngày. */
export function renderQuests(document, state) {
  const host = q(document, "#home-quests");
  if (!host) return [];
  const quests = dailyQuests(state.todayKey || "2026-01-01", 7);
  const stats = {
    xp: state.todayXp,
    correct: state.todayCorrect,
    reviews: state.todayReviews,
    lessons: state.todayLessons,
    accuracy: state.todayAnswered ? Math.round((state.todayCorrect / state.todayAnswered) * 100) : 0
  };
  host.textContent = "";
  return quests.map((quest) => {
    const progress = questProgress(quest, stats);
    const li = createEl(document, "li", "quest");
    const icon = createEl(document, "span", "quest__icon", quest.icon);
    icon.setAttribute("aria-hidden", "true");
    const copy = createEl(document, "div", "quest__copy");
    copy.append(createEl(document, "strong", "", quest.title));
    copy.append(createEl(document, "small", "", `${progress.value}/${quest.target} · +${quest.reward} 💎`));
    const bar = createEl(document, "div", "quest__progress");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuenow", String(progress.percent));
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-label", quest.title);
    const fill = createEl(document, "span");
    fill.style.width = `${progress.percent}%`;
    bar.append(fill);
    li.append(icon, copy, bar);
    host.append(li);
    return { quest, progress };
  });
}

/** Vẽ các tài liệu nổi bật ở trang chủ. */
export function renderFeaturedDocs(document, docs) {
  const host = q(document, "#home-library");
  if (!host) return [];
  host.textContent = "";
  const featured = docs.filter((doc) => doc.featured).slice(0, 2);
  for (const doc of featured) {
    const card = createEl(document, "article", "card");
    card.append(createEl(document, "h3", "", doc.title));
    card.append(createEl(document, "p", "", doc.summary.slice(0, 132) + (doc.summary.length > 132 ? "…" : "")));
    const meta = createEl(document, "p", "card__meta");
    meta.append(createEl(document, "span", "tag", `${doc.citations.length} trích dẫn`));
    const link = createEl(document, "a", "btn btn--ghost", "Mở thư viện PDF");
    link.href = `thu-vien.html#${doc.id}`;
    card.append(meta, link);
    host.append(card);
  }
  return featured;
}

/** Khởi tạo trang học. */
export function initHome(options = {}) {
  const { document, store, units = [], docs = [], i18n = createI18n(), now = new Date() } = options;
  if (!document || !store) throw new Error("initHome cần document và store");
  let state = refreshHearts(store.get(), now);
  state = rollWeek(state, now);
  const hasHearts = state.hearts !== store.get().hearts || state.weekXp !== store.get().weekXp;
  if (hasHearts) {
    store.update(() => state);
    state = store.get();
  }

  markActiveNav(document);
  updateTopbar(document, state);
  setText(document, "[data-bind='greeting']", i18n.t("home.greeting", { name: state.name }));
  setText(document, "[data-stat='streak-days']", i18n.t("home.streakDays", { days: state.streak }));

  const ring = q(document, "#streak-ring");
  if (ring) {
    ring.style.setProperty("--streak-progress", String(Math.min(100, Math.round((state.streak / 7) * 100))));
  }
  setText(document, "#streak-value", state.streak);

  const goal = dailyGoalStatus(state);
  setText(document, "#goal-done", goal.done);
  setText(document, "#goal-goal", goal.goal);
  setText(document, "#goal-percent", `${goal.percent}%`);
  setText(document, "#goal-note", goal.doneFlag ? i18n.t("home.goalDone") : i18n.t("home.goalProgress", { done: goal.done, goal: goal.goal }));
  const fill = q(document, "#goal-fill");
  if (fill) fill.style.width = `${goal.percent}%`;
  const goalBar = q(document, "#goal-progress");
  if (goalBar) goalBar.setAttribute("aria-valuenow", String(goal.percent));

  const level = levelFromXp(state.xp);
  setText(document, "#stat-level", level.level);
  setText(document, "#stat-level-title", level.title);
  setText(document, "#stat-xp", state.xp);
  setText(document, "#stat-streak", state.streak);
  const due = dueCards(state.srs, now);
  setText(document, "#stat-due", due.length);
  setText(document, "#stat-league", leagueFor(state.weekXp).name);

  const lessons = allLessons(units);
  const next = nextLesson(units, state.completed);
  const cta = q(document, "#continue-link");
  if (cta && next) {
    cta.href = `hoc.html?bai=${encodeURIComponent(next.id)}`;
    cta.textContent = state.xp ? i18n.t("home.continue") : i18n.t("home.start");
  }
  setText(document, "#continue-title", next ? next.title : "");
  const path = pathProgress(units, state.completed);
  setText(document, "#path-progress", `${path.done}/${path.total} bài · ${path.percent}%`);
  const pathFill = q(document, "#path-fill");
  if (pathFill) pathFill.style.width = `${path.percent}%`;
  const pathBar = q(document, "#path-progress-bar");
  if (pathBar) pathBar.setAttribute("aria-valuenow", String(path.percent));

  const links = renderPath(document, units, state.completed);
  renderQuests(document, state, now);
  renderFeaturedDocs(document, docs);

  const earned = earnedBadges({
    lessons: Object.keys(state.completed).length,
    streak: state.streak,
    xp: state.xp,
    perfect: state.badges.includes("perfect") ? 1 : 0,
    reviews: state.reviews,
    docsRead: state.docsRead
  });
  const badgeHost = q(document, "#home-badges");
  if (badgeHost) {
    badgeHost.textContent = "";
    for (const badge of BADGES.filter((item) => earned.includes(item.id))) {
      const chip = createEl(document, "li", "tag", `${badge.icon} ${badge.title}`);
      badgeHost.append(chip);
    }
    if (!earned.length) badgeHost.append(createEl(document, "li", "tag", "Chưa có huy hiệu"));
  }

  return { state, next, lessons, path, links, goal, level };
}
