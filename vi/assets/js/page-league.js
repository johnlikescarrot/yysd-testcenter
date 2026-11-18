/* =========================================================================
   page-league.js — bảng xếp hạng tuần trên thiết bị, tất định theo tuần.
   ========================================================================= */

import { createI18n } from "./i18n.js";
import { daysLeftInWeek, leagueFor } from "./gamify.js";
import { buildCohort, daysRemaining, userRank } from "./league.js";
import { createEl, markActiveNav, q, setText, updateTopbar } from "./page-common.js";
import { hashString } from "./util.js";

function zoneLabel(zone) {
  if (zone === "promote") return "Thăng hạng";
  if (zone === "demote") return "Nguy cơ xuống hạng";
  return "";
}

export function initLeague(options = {}) {
  const { document, store, i18n = createI18n(), now = new Date() } = options;
  if (!document || !store) throw new Error("initLeague cần document và store");
  const state = store.get();
  markActiveNav(document);
  updateTopbar(document, state);

  const seed = hashString(`${state.weekStart || "tuan"}-${state.name}`);
  const rows = buildCohort({ seed, size: 15, user: { name: state.name, weeklyXp: state.weekXp } });
  const me = userRank(rows);
  const league = leagueFor(state.weekXp);

  setText(document, "#league-name", `${league.icon} ${league.name}`);
  setText(document, "#league-days", i18n.t("league.remaining", { days: daysRemaining(now) }));
  setText(document, "#league-rank", `#${me.rank}`);
  const host = q(document, "#league-rows");
  if (host) {
    host.textContent = "";
    for (const row of rows) {
      const li = createEl(document, "li", `league-row league-row--${row.zone}${row.isUser ? " league-row--user" : ""}`);
      li.append(createEl(document, "span", "league-row__rank", String(row.rank)));
      const avatar = createEl(document, "span", "league-row__avatar", row.avatar);
      avatar.setAttribute("aria-hidden", "true");
      li.append(avatar);
      const name = createEl(document, "span", "league-row__name");
      name.append(createEl(document, "span", "", row.name));
      if (row.isUser) name.append(createEl(document, "small", "", i18n.t("league.you")));
      const label = zoneLabel(row.zone);
      if (label && row.zone === "promote") name.append(createEl(document, "small", "", label));
      li.append(name);
      li.append(createEl(document, "span", "league-row__xp", `${row.weeklyXp} XP`));
      host.append(li);
    }
  }
  setText(document, "#league-week", `${state.weekStart || ""}`);
  return { rows, me, league, seed, daysLeft: daysLeftInWeek(now) };
}
