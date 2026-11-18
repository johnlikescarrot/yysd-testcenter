/* =========================================================================
   page-practice.js — luyện tập theo kỹ năng, dẫn vào trình học.
   ========================================================================= */

import { createI18n } from "./i18n.js";
import { allLessons, pathProgress } from "./quiz.js";
import { dueCards } from "./srs.js";
import { createEl, markActiveNav, q, setText, updateTopbar } from "./page-common.js";

export const SKILLS = [
  { id: "all", icon: "🎯" },
  { id: "vocab", icon: "📚" },
  { id: "grammar", icon: "🧩" },
  { id: "listening", icon: "🎧" },
  { id: "reading", icon: "📖" },
  { id: "writing", icon: "✍️" },
  { id: "speaking", icon: "🎙️" }
];

/** Đếm số câu hỏi theo kỹ năng. */
export function countBySkill(units) {
  const counts = { all: 0 };
  for (const lesson of allLessons(units)) {
    const skill = lesson.skill || "all";
    counts[skill] = (counts[skill] || 0) + (lesson.questions?.length || 0);
    counts.all += lesson.questions?.length || 0;
  }
  return counts;
}

export function initPractice(options = {}) {
  const { document, store, units = [], i18n = createI18n(), now = new Date() } = options;
  if (!document || !store) throw new Error("initPractice cần document và store");
  markActiveNav(document);
  updateTopbar(document, store.get());
  const counts = countBySkill(units);
  const due = dueCards(store.get().srs, now).length;
  setText(document, "#practice-due", String(due));
  setText(document, "#practice-total", String(counts.all));
  setText(document, "#practice-progress", `${pathProgress(units, store.get().completed).percent}%`);

  const host = q(document, "#practice-skills");
  if (host) {
    host.textContent = "";
    for (const skill of SKILLS) {
      const card = createEl(document, "article", "skill-card");
      const title = createEl(document, "h3", "");
      const icon = createEl(document, "span", "", skill.icon);
      icon.setAttribute("aria-hidden", "true");
      title.append(icon, createEl(document, "span", "", i18n.t(`skill.${skill.id}`)));
      card.append(title);
      card.append(createEl(document, "p", "", `${counts[skill.id] || 0} câu hỏi trong lộ trình`));
      const link = createEl(document, "a", "btn", i18n.t("practice.start", { skill: i18n.t(`skill.${skill.id}`) }));
      link.href = `hoc.html?bai=practice&ky-nang=${encodeURIComponent(skill.id)}`;
      card.append(link);
      host.append(card);
    }
  }
  return { counts, due };
}
