/* =========================================================================
   page-profile.js — hồ sơ: thống kê, huy hiệu, thẻ đến hạn, đặt lại tiến độ.
   ========================================================================= */

import { createI18n } from "./i18n.js";
import { BADGES, earnedBadges, levelFromXp } from "./gamify.js";
import { allLessons } from "./quiz.js";
import { dueCards, retention, upcomingCards } from "./srs.js";
import { createEl, markActiveNav, q, setText, shortDate, updateTopbar } from "./page-common.js";

function questionLookup(units) {
  const map = new Map();
  for (const lesson of allLessons(units)) {
    for (const question of lesson.questions || []) map.set(question.id, { ...question, lessonTitle: lesson.title });
  }
  return map;
}

export function initProfile(options = {}) {
  const { document, store, units = [], i18n = createI18n(), now = new Date() } = options;
  if (!document || !store) throw new Error("initProfile cần document và store");
  const state = store.get();
  markActiveNav(document);
  updateTopbar(document, state);

  const level = levelFromXp(state.xp);
  setText(document, "#profile-level", `${level.level} · ${level.title}`);
  setText(document, "#profile-xp", String(state.xp));
  setText(document, "#profile-streak", String(state.streak));
  setText(document, "#profile-best", String(state.bestStreak));
  setText(document, "#profile-retention", `${retention(state.srs)}%`);
  setText(document, "#profile-reviews", String(state.reviews));

  const earned = earnedBadges({
    lessons: Object.keys(state.completed).length,
    streak: state.streak,
    xp: state.xp,
    perfect: state.badges.includes("perfect") ? 1 : 0,
    reviews: state.reviews,
    docsRead: state.docsRead
  });
  const badgeHost = q(document, "#profile-badges");
  if (badgeHost) {
    badgeHost.textContent = "";
    for (const badge of BADGES) {
      const has = earned.includes(badge.id);
      const li = createEl(document, "li", `badge ${has ? "badge--earned" : "badge--locked"}`);
      const icon = createEl(document, "span", "badge__icon", badge.icon);
      icon.setAttribute("aria-hidden", "true");
      li.append(icon);
      li.append(createEl(document, "strong", "", badge.title));
      li.append(createEl(document, "small", "", badge.desc));
      if (!has) li.append(createEl(document, "span", "sr-only", "Chưa mở khoá"));
      badgeHost.append(li);
    }
  }

  const lookup = questionLookup(units);
  const due = dueCards(state.srs, now, 8);
  const dueHost = q(document, "#profile-due");
  if (dueHost) {
    dueHost.textContent = "";
    if (!due.length) {
      dueHost.append(createEl(document, "li", "", i18n.t("profile.dueEmpty")));
    }
    for (const card of due) {
      const question = lookup.get(card.id);
      const li = createEl(document, "li", "");
      li.append(createEl(document, "b", "", question?.term || question?.prompt || card.id));
      li.append(createEl(document, "small", "", `${question?.lessonTitle || "Ôn tập"} · hạn ${shortDate(card.due)}`));
      dueHost.append(li);
    }
  }

  const upcoming = upcomingCards(state.srs, now, 7);
  setText(document, "#profile-soon", `${upcoming.length} thẻ trong 7 ngày`);

  const reset = q(document, "#reset-progress");
  let armed = false;
  if (reset) {
    reset.addEventListener("click", () => {
      if (!armed) {
        armed = true;
        reset.textContent = i18n.t("profile.resetConfirm");
        reset.dataset.armed = "true";
        return;
      }
      store.reset();
      armed = false;
      reset.textContent = i18n.t("profile.reset");
      delete reset.dataset.armed;
      initProfile({ document, store, units, i18n, now });
    });
  }

  return { state, level, earned, due, upcoming };
}
