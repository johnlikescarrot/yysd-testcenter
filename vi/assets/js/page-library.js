/* =========================================================================
   page-library.js — thư viện PDF: tìm kiếm, lọc, trích dẫn Scholar.
   ========================================================================= */

import { createI18n } from "./i18n.js";
import { earnedBadges } from "./gamify.js";
import {
  availableSkills,
  citationsFor,
  citationCount,
  filterDocs,
  libraryStats,
  searchDocs,
  sortDocs
} from "./library.js";
import { createEl, markActiveNav, q, setText, updateTopbar } from "./page-common.js";

function renderCitations(document, doc) {
  const details = createEl(document, "details", "citations");
  const summary = createEl(document, "summary", "", `📚 ${doc.citations.length} trích dẫn Google Scholar`);
  details.append(summary);
  const list = createEl(document, "ol", "");
  citationsFor(doc).forEach((citation) => {
    const li = createEl(document, "li", "");
    li.append(createEl(document, "b", "", citation.title));
    li.append(createEl(document, "span", "", ` — ${citation.authors} (${citation.year}). ${citation.venue}`));
    const link = createEl(document, "a", "", "Xem trên Google Scholar ↗");
    link.href = citation.url;
    link.target = "_blank";
    link.rel = "noopener";
    li.append(link);
    list.append(li);
  });
  details.append(list);
  return details;
}

function renderDoc(document, doc, read) {
  const article = createEl(document, "article", "doc");
  article.id = doc.id;
  const cover = createEl(document, "div", "doc__cover", "📄");
  cover.setAttribute("aria-hidden", "true");
  const body = createEl(document, "div", "doc__body");
  const title = createEl(document, "h2");
  const titleLink = createEl(document, "a", "", doc.title);
  titleLink.href = doc.file;
  titleLink.target = "_blank";
  titleLink.rel = "noopener";
  title.append(titleLink);
  body.append(title);
  body.append(createEl(document, "p", "doc__sub", `${doc.subtitle} · ${doc.level}`));
  body.append(createEl(document, "p", "doc__summary", doc.summary));

  const meta = createEl(document, "p", "card__meta");
  meta.append(createEl(document, "span", "tag", `${citationCount(doc)} trích dẫn`));
  meta.append(createEl(document, "span", "tag", `${doc.pages} trang`));
  for (const tag of doc.tags || []) meta.append(createEl(document, "span", "tag", tag));
  body.append(meta);

  const actions = createEl(document, "div", "doc__actions");
  const readLink = createEl(document, "a", "btn", "Đọc PDF");
  readLink.href = doc.file;
  readLink.target = "_blank";
  readLink.rel = "noopener";
  const download = createEl(document, "a", "btn btn--ghost", "Tải PDF");
  download.href = doc.file;
  download.download = doc.file.split("/").pop();
  const mark = createEl(document, "button", "btn btn--ghost", read ? "✓ Đã đọc" : "Đánh dấu đã đọc");
  mark.type = "button";
  mark.dataset.read = doc.id;
  mark.disabled = read;
  actions.append(readLink, download, mark);
  body.append(actions);
  body.append(renderCitations(document, doc));
  article.append(cover, body);
  return article;
}

/** Khởi tạo thư viện. */
export function initLibrary(options = {}) {
  const { document, store, docs = [], i18n = createI18n() } = options;
  if (!document || !store) throw new Error("initLibrary cần document và store");
  markActiveNav(document);
  updateTopbar(document, store.get());

  const searchInput = q(document, "#library-search");
  const skillSelect = q(document, "#library-skill");
  const levelSelect = q(document, "#library-level");
  const sortSelect = q(document, "#library-sort");
  const host = q(document, "#library-list");
  const empty = q(document, "#library-empty");
  const stats = libraryStats(docs);
  setText(document, "[data-bind='library-stats']", i18n.t("library.stats", { docs: stats.docs, citations: stats.citations }));

  if (skillSelect) {
    for (const skill of availableSkills(docs)) {
      const option = createEl(document, "option", "", i18n.t(`skill.${skill}`));
      option.value = skill;
      skillSelect.append(option);
    }
  }
  if (levelSelect) {
    const levels = [...new Set(docs.map((doc) => doc.level))];
    for (const level of levels) {
      const option = createEl(document, "option", "", level);
      option.value = level;
      levelSelect.append(option);
    }
  }

  const view = { query: "", skill: "all", level: "all", sort: "featured" };
  let visible = [];

  function apply() {
    const filtered = filterDocs(searchDocs(docs, view.query), { skill: view.skill, level: view.level });
    visible = sortDocs(filtered, view.sort);
    if (!host) return visible;
    host.textContent = "";
    const readDocs = store.get().readDocs || [];
    for (const doc of visible) host.append(renderDoc(document, doc, readDocs.includes(doc.id)));
    if (empty) empty.hidden = visible.length > 0;
    return visible;
  }

  function markRead(docId) {
    const state = store.get();
    if ((state.readDocs || []).includes(docId)) return state;
    const next = store.update((draft) => {
      const readDocs = [...(draft.readDocs || []), docId];
      return {
        ...draft,
        docsRead: (draft.docsRead || 0) + 1,
        readDocs,
        badges: earnedBadges({
          lessons: Object.keys(draft.completed).length,
          streak: draft.streak,
          xp: draft.xp,
          perfect: 0,
          reviews: draft.reviews,
          docsRead: readDocs.length
        })
      };
    });
    apply();
    return next;
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      view.query = searchInput.value;
      apply();
    });
  }
  if (skillSelect) {
    skillSelect.addEventListener("change", () => {
      view.skill = skillSelect.value;
      apply();
    });
  }
  if (levelSelect) {
    levelSelect.addEventListener("change", () => {
      view.level = levelSelect.value;
      apply();
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      view.sort = sortSelect.value;
      apply();
    });
  }
  if (host) {
    host.addEventListener("click", (event) => {
      const button = event.target.closest("[data-read]");
      if (button) markRead(button.dataset.read);
    });
  }

  const list = apply();
  return {
    view,
    visible: () => visible,
    apply,
    markRead,
    setQuery(value) {
      view.query = value;
      if (searchInput) searchInput.value = value;
      return apply();
    },
    setSkill(value) {
      view.skill = value;
      return apply();
    },
    setLevel(value) {
      view.level = value;
      return apply();
    },
    setSort(value) {
      view.sort = value;
      return apply();
    },
    stats,
    docs: list
  };
}

