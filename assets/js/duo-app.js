/**
 * Trình điều khiển giao diện Lộ Trình IELTS Thông Minh (assets/js/duo-app.js)
 * Kết nối trực tiếp các mô-đun lõi trong src/ (đạt 100% độ bao phủ kiểm thử).
 */

import {
  BADGE_DEFINITIONS,
  CAST_CHARACTERS,
  DAILY_XP_GOALS,
  FRIEND_DIRECTORY,
  INTERACTIVE_STORIES,
  MAX_ENERGY,
  MAX_FRIEND_STREAKS,
  PROFICIENCY_BANDS,
  ROLEPLAY_SCENARIOS,
  SEASONAL_SUITS,
  SHOP_ITEMS,
  WEEKLY_LEAGUES,
  addFriendStreak,
  awardActivityCompletion,
  buildForgettingCurvePoints,
  buildLeagueStandings,
  buildScholarlyReportHtml,
  buildWordBankPool,
  claimDailyQuest,
  commitHlrReview,
  commitUnitLesson,
  computeOverallIeltsBand,
  computeTargetGap,
  consumeEnergyOnMistake,
  createHlrCard,
  evaluateExercise,
  evaluateSpeakingResponse,
  exportStateJson,
  formatLinkedInBadge,
  getDailyQuests,
  getPathProgress,
  getReviewQueue,
  getRoleplayById,
  getStoryById,
  getUnitById,
  importStateJson,
  isDoubleXpActive,
  isSuperActive,
  loadAppState,
  nudgeFriend,
  purchaseShopItem,
  rawScoreToIeltsBand,
  recordReminderOutcome,
  removeFriendStreak,
  renderAvatarSvg,
  saveAppState,
  scoreToProfile,
  selectAdaptiveDrill,
  selectSmartReminder,
  setDailyGoal,
  settleWeeklyLeague,
  toDateKey,
  updateAvatar,
} from "../../src/index.js";

const backing = typeof window !== "undefined" ? window.localStorage : null;
let appState = loadAppState(backing);
let activeTab = "path";
let activeLesson = null; // { titleVi, unit, exercises, idx, correctCount, combo, maxCombo, wbPicked, pairLeft, pairMap, mcqChoice, feedback }
let activeStory = null; // { story, qAnswers, submitted }
let activeRoleplay = null; // { scenario, evaluation }
let hlrRevealedId = "";
let toastTimer = null;

function esc(val) {
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function persist() {
  saveAppState(backing, appState);
  renderHud();
}

function showToast(msg) {
  const el = document.getElementById("duo-toast");
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 3600);
}

function speakEnglish(text) {
  if (!("speechSynthesis" in window) || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-GB";
    u.rate = 0.96;
    window.speechSynthesis.speak(u);
  } catch {
    // Bỏ qua nếu trình duyệt không hỗ trợ tổng hợp giọng nói
  }
}

function openScholarReport(includeAll = false) {
  const html = buildScholarlyReportHtml({
    learnerName: appState.profile.displayName,
    proficiencyScore: appState.profile.proficiencyScore,
    targetBand: appState.profile.targetBand,
    gamification: appState.gamification,
    hlrCards: appState.hlrCards,
    generatedDate: toDateKey(),
    includeAllCitations: includeAll,
  });
  const win = window.open("", "_blank");
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
  }
}

function renderHud() {
  const g = appState.gamification;
  const prof = scoreToProfile(appState.profile.proficiencyScore);
  const superOn = isSuperActive(g);
  const dblOn = isDoubleXpActive(g);

  const streakEl = document.getElementById("hud-streak");
  const gemsEl = document.getElementById("hud-gems");
  const energyEl = document.getElementById("hud-energy");
  const scoreEl = document.getElementById("hud-score");

  if (streakEl) streakEl.textContent = `Chuỗi ${g.streak} ngày · ${g.totalXp} XP${dblOn ? " (2x)" : ""}`;
  if (gemsEl) gemsEl.textContent = `${g.gems} Đá quý`;
  if (energyEl) {
    energyEl.textContent = superOn
      ? "Siêu Cấp: Vô hạn NL"
      : `${g.energy}/${MAX_ENERGY} Năng lượng`;
  }
  if (scoreEl) {
    scoreEl.textContent = `${prof.score}/160 (${prof.cefr} · Band ${prof.ieltsBand.toFixed(1)})`;
  }
}

function renderSidePanel() {
  const side = document.getElementById("duo-side-panel");
  if (!side) return;
  const g = appState.gamification;
  const today = toDateKey();
  const quests = getDailyQuests(g, today);
  const league = WEEKLY_LEAGUES[g.leagueTier] || WEEKLY_LEAGUES[0];
  const queue = getReviewQueue(appState.hlrCards);
  const reminder = selectSmartReminder(
    appState.bandit,
    {
      studiedToday: g.lastStudyDateKey === today,
      streak: g.streak,
      dueCount: queue.due.length,
      friendCount: g.friendStreaks.length,
      leagueName: league.nameVi,
      targetBand: appState.profile.targetBand,
    },
    0.2,
  );
  const goalPct = Math.min(100, Math.round(((g.todayDateKey === today ? g.todayXp : 0) / g.dailyGoalXp) * 100));

  side.innerHTML = `
    <div class="yi-card">
      <div class="yi-avatar-box">${renderAvatarSvg(g.avatar)}</div>
      <h2 style="text-align:center;font-size:18px;">${esc(appState.profile.displayName)}</h2>
      <p class="yi-muted" style="text-align:center;">
        Giải <strong>${esc(league.nameVi)}</strong> · Đóng băng chuỗi: <strong>${g.streakFreezes}/2</strong> · Lá chắn: <strong>${g.comboShields}</strong>
      </p>
      <div>
        <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;">
          <span>Mục tiêu ngày</span>
          <span>${g.todayDateKey === today ? g.todayXp : 0}/${g.dailyGoalXp} XP</span>
        </div>
        <div class="yi-progress" role="progressbar" aria-label="Tiến độ mục tiêu XP hôm nay" aria-valuenow="${goalPct}" aria-valuemin="0" aria-valuemax="100">
          <div class="yi-progress__bar" style="width:${goalPct}%"></div>
        </div>
      </div>
    </div>

    <div class="yi-card">
      <h2 style="font-size:17px;">Nhiệm Vụ Hàng Ngày</h2>
      ${quests
        .map((q) => {
          const pct = Math.round((q.progress / q.target) * 100);
          return `
            <div style="margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;">
                <span>${esc(q.titleVi)}</span>
                <span>+${q.rewardGems} Đá quý</span>
              </div>
              <div class="yi-progress"><div class="yi-progress__bar" style="width:${pct}%"></div></div>
              ${
                q.claimed
                  ? `<span class="yi-tag yi-tag--emerald">Đã nhận thưởng</span>`
                  : q.completed
                    ? `<button type="button" class="yi-btn yi-btn--emerald" data-claim-quest="${esc(q.id)}">Mở rương +${q.rewardGems} Đá quý</button>`
                    : `<span class="yi-muted">${q.progress}/${q.target}</span>`
              }
            </div>`;
        })
        .join("")}
    </div>

    <div class="yi-card">
      <span class="yi-tag yi-tag--amber">Nhắc học Bandit · ${esc(reminder.chosen.character)}</span>
      <h2 style="font-size:16px;margin-top:8px;">${esc(reminder.chosen.titleVi)}</h2>
      <p class="yi-muted">${esc(reminder.chosen.bodyVi)}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button type="button" class="yi-btn yi-btn--primary" data-bandit-act="accept" data-tpl="${esc(reminder.chosen.id)}">Học ngay</button>
        <button type="button" class="yi-btn" data-bandit-act="dismiss" data-tpl="${esc(reminder.chosen.id)}">Đổi lời nhắc</button>
      </div>
    </div>
  `;
}

function startLesson(unit, customExercises = null, customTitle = "") {
  if (appState.gamification.energy <= 0 && !isSuperActive(appState.gamification)) {
    showToast("Bạn đã hết năng lượng! Hãy vào Cửa hàng để nạp lại bằng Đá quý.");
    switchTab("shop");
    return;
  }
  const exercises = customExercises || unit.exercises;
  activeLesson = {
    titleVi: customTitle || unit.titleVi,
    unit,
    exercises,
    idx: 0,
    correctCount: 0,
    combo: 0,
    maxCombo: 0,
    wbPicked: [],
    pairLeft: "",
    pairMap: {},
    mcqChoice: "",
    clozeText: "",
    feedback: null,
    finishedSummary: null,
  };
  activeTab = "path";
  renderMain();
}

function renderActiveLesson(container) {
  const L = activeLesson;
  if (L.finishedSummary) {
    const s = L.finishedSummary;
    container.innerHTML = `
      <div class="yi-card">
        <span class="yi-tag yi-tag--emerald">Hoàn thành phiên học xuất sắc!</span>
        <h2>${esc(L.titleVi)}</h2>
        <div class="yi-stats-row">
          <div class="yi-stat"><strong>+${s.reward.earnedXp} XP</strong><span>Hệ số ${s.reward.multiplier}x</span></div>
          <div class="yi-stat"><strong>${s.reward.accuracyPct}%</strong><span>Độ chính xác (${L.correctCount}/${L.exercises.length})</span></div>
          <div class="yi-stat"><strong>+${s.reward.earnedGems} Đá quý</strong><span>Mạch combo tối đa: ${L.maxCombo}</span></div>
          <div class="yi-stat"><strong>${s.newScore}/160</strong><span>Điểm năng lực cập nhật</span></div>
        </div>
        ${
          s.reward.newlyEarnedBadges.length
            ? `<p style="margin-top:14px;font-weight:700;color:var(--yi-emerald);">Huy hiệu mới mở khóa: ${s.reward.newlyEarnedBadges
                .map((id) => BADGE_DEFINITIONS.find((b) => b.id === id)?.nameVi || id)
                .join(", ")}</p>`
            : ""
        }
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;">
          <button type="button" class="yi-btn yi-btn--primary" id="btn-exit-lesson">Quay về Cây Kỹ Năng</button>
          <button type="button" class="yi-btn" id="btn-go-hlr">Ôn thẻ từ HLR vừa mở khóa</button>
        </div>
      </div>`;
    return;
  }

  const ex = L.exercises[L.idx];
  const pct = Math.round((L.idx / L.exercises.length) * 100);
  let bodyHtml = "";

  if (ex.stimulusEn) {
    bodyHtml += `
      <div class="yi-stimulus">${esc(ex.stimulusEn)}</div>
      <button type="button" class="yi-btn" data-speak="${esc(ex.stimulusEn)}" style="margin-bottom:10px;">
        Nghe phát âm tiếng Anh (Anh-Anh)
      </button>`;
  }
  if (ex.sourceVi) {
    bodyHtml += `<div class="yi-stimulus"><strong>Câu gốc tiếng Việt:</strong> ${esc(ex.sourceVi)}</div>`;
  }

  if (ex.options) {
    bodyHtml += `<div class="yi-options" role="group" aria-label="Các phương án trả lời">
      ${ex.options
        .map(
          (opt) =>
            `<button type="button" class="yi-option${L.mcqChoice === opt ? " is-selected" : ""}" data-mcq="${esc(opt)}" ${L.feedback ? "disabled" : ""}>${esc(opt)}</button>`,
        )
        .join("")}
    </div>`;
  } else if (ex.type === "cloze") {
    bodyHtml += `
      <label>
        <span class="yi-muted">Gợi ý: ${esc(ex.hintVi)}</span>
        <input type="text" class="yi-input" id="cloze-input" value="${esc(L.clozeText)}" placeholder="Nhập từ tiếng Anh chính xác..." autocomplete="off" spellcheck="false" ${L.feedback ? "disabled" : ""}>
      </label>`;
  } else if (ex.answerTokens) {
    const pool = buildWordBankPool(ex);
    const pickedSet = new Set(L.wbPicked.map((p) => p.chipId));
    bodyHtml += `
      <p class="yi-muted">Nhấn vào các thẻ từ bên dưới để ghép câu hoàn chỉnh (nhấn vào thẻ trên khay để bỏ ra):</p>
      <div class="yi-wb-tray" aria-label="Khay câu trả lời của bạn">
        ${L.wbPicked
          .map(
            (chip) =>
              `<button type="button" class="yi-chip yi-chip--picked" data-wb-remove="${esc(chip.chipId)}" ${L.feedback ? "disabled" : ""}>${esc(chip.text)}</button>`,
          )
          .join("")}
      </div>
      <div class="yi-wb-pool" aria-label="Ngân hàng thẻ từ xáo trộn">
        ${pool
          .filter((c) => !pickedSet.has(c.chipId))
          .map(
            (chip) =>
              `<button type="button" class="yi-chip" data-wb-add="${esc(chip.chipId)}" data-wb-text="${esc(chip.text)}" ${L.feedback ? "disabled" : ""}>${esc(chip.text)}</button>`,
          )
          .join("")}
      </div>`;
  } else if (ex.type === "pairs") {
    const rights = [...ex.pairs].map((p) => p.right).sort((a, b) => a.localeCompare(b));
    const usedRights = new Set(Object.values(L.pairMap));
    bodyHtml += `
      <p class="yi-muted">Chọn một mục ở cột trái rồi ghép với mục tương ứng ở cột phải:</p>
      <div class="yi-pairs-grid">
        <div class="yi-options">
          ${ex.pairs
            .map((p) => {
              const matched = L.pairMap[p.left];
              const sel = L.pairLeft === p.left;
              return `<button type="button" class="yi-option${sel ? " is-selected" : ""}" data-pair-left="${esc(p.left)}" ${L.feedback ? "disabled" : ""}>
                <strong>${esc(p.left)}</strong>${matched ? `<br><small>→ ${esc(matched)}</small>` : ""}
              </button>`;
            })
            .join("")}
        </div>
        <div class="yi-options">
          ${rights
            .map(
              (r) =>
                `<button type="button" class="yi-option${usedRights.has(r) ? " is-selected" : ""}" data-pair-right="${esc(r)}" ${L.feedback ? "disabled" : ""}>${esc(r)}</button>`,
            )
            .join("")}
        </div>
      </div>`;
  }

  let feedbackHtml = "";
  if (L.feedback) {
    const fb = L.feedback;
    const cit = fb.explanation.citation;
    feedbackHtml = `
      <div class="yi-feedback${fb.correct ? "" : " yi-feedback--wrong"}">
        <h3>${esc(fb.explanation.headlineVi)}</h3>
        ${fb.correct ? "" : `<p><strong>Đáp án chuẩn:</strong> ${esc(fb.expectedDisplay)}</p>`}
        <p><strong>Giải thích sư phạm (Miễn phí):</strong> ${esc(fb.explanation.ruleVi)}</p>
        <p><strong>Lưu ý bẫy phòng thi:</strong> ${esc(fb.explanation.trapVi)}</p>
        ${
          cit
            ? `<p><strong>Cơ sở nghiên cứu:</strong> <a href="${esc(cit.scholarUrl)}" target="_blank" rel="noopener noreferrer">${esc(cit.shortRef)} — ${esc(cit.title)} (Google Scholar)</a></p>`
            : ""
        }
      </div>`;
  }

  container.innerHTML = `
    <div class="yi-card">
      <div class="yi-unit__top">
        <div>
          <span class="yi-tag yi-tag--blue">Câu ${L.idx + 1}/${L.exercises.length} · Combo ${L.combo}</span>
          ${ex.type === "sus" ? `<span class="yi-tag yi-tag--amber">Câu Bất Ngờ Ngữ Nghĩa (SUS)</span>` : ""}
        </div>
        <button type="button" class="yi-btn" id="btn-exit-lesson">Thoát bài học</button>
      </div>
      <div class="yi-progress"><div class="yi-progress__bar" style="width:${pct}%"></div></div>
      <h2 style="font-size:19px;margin-top:12px;">${esc(ex.promptVi)}</h2>
      ${bodyHtml}
      ${feedbackHtml}
      <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
        ${
          L.feedback
            ? `<button type="button" class="yi-btn yi-btn--primary" id="btn-next-ex">${L.idx + 1 >= L.exercises.length ? "Hoàn tất & Nhận XP" : "Câu tiếp theo →"}</button>`
            : `<button type="button" class="yi-btn yi-btn--emerald" id="btn-check-ex">Kiểm tra & Xem giải thích</button>`
        }
      </div>
    </div>`;
}

function renderPathTab(container) {
  if (activeLesson) {
    renderActiveLesson(container);
    return;
  }
  const units = getPathProgress(appState.completedUnits);
  const statusLabels = {
    legendary: "Huyền thoại (3/3 vương miện)",
    completed: "Đã hoàn thành",
    current: "Đề xuất học ngay",
    available: "Sẵn sàng mở rộng",
  };
  container.innerHTML = `
    <div class="yi-card">
      <h2>Cây Kỹ Năng IELTS Academic Tuyến Tính (8 Chặng · CEFR A2+ → C2)</h2>
      <p class="yi-muted">Mỗi chặng gồm sổ tay chiến thuật có trích dẫn Google Scholar và chuỗi bài tập ngắn 4 phút kèm Giải thích Lỗi sai Miễn phí.</p>
      <div class="yi-path-list">
        ${units
          .map(
            (u) => `
          <article class="yi-unit yi-unit--${esc(u.status)}">
            <div class="yi-unit__top">
              <div class="yi-badges-inline">
                <span class="yi-tag yi-tag--blue">CEFR ${esc(u.cefr)} · Band ${u.targetBand.toFixed(1)}</span>
                <span class="yi-tag yi-tag--emerald">${esc(statusLabels[u.status])}</span>
                <span class="yi-tag">+${u.xpReward} XP · Vương miện ${u.masteryLevel}/3</span>
              </div>
              <button type="button" class="yi-btn yi-btn--primary" data-start-unit="${esc(u.id)}">
                ${u.completions > 0 ? "Luyện nâng vương miện" : "Vào học chặng này"}
              </button>
            </div>
            <h3>${esc(u.titleVi)}</h3>
            <p class="yi-muted" style="margin:0;">${esc(u.subtitleVi)}</p>
            <details>
              <summary style="cursor:pointer;font-weight:700;font-size:14px;color:var(--yi-ink);">Sổ tay chiến thuật &amp; cơ sở khoa học</summary>
              <p style="font-size:14px;margin:8px 0 0;">${esc(u.guidebookVi)}</p>
            </details>
          </article>`,
          )
          .join("")}
      </div>
    </div>`;
}

function renderHlrTab(container) {
  const queue = getReviewQueue(appState.hlrCards);
  const nextCard = queue.all[0];
  const avgH =
    queue.all.reduce((sum, c) => sum + c.halfLifeHours, 0) / Math.max(1, queue.all.length);
  const curve = buildForgettingCurvePoints(avgH);

  container.innerHTML = `
    <div class="yi-card">
      <span class="yi-tag yi-tag--blue">Settles &amp; Meeder (2016) · ACL</span>
      <h2>Phòng Ôn Tập Lặp Lại Ngắt Quãng Half-Life Regression (HLR)</h2>
      <p class="yi-muted">
        Độ bền trí nhớ trung bình: <strong>${queue.averageRetentionPct}%</strong> ·
        Thẻ cần củng cố ngay: <strong>${queue.due.length}/${queue.all.length}</strong> ·
        Công thức xác suất nhớ: <code>p = 2^(-Δ / h)</code>.
      </p>
      ${
        nextCard
          ? `
        <div class="yi-stimulus">
          <span class="yi-tag yi-tag--amber">Ưu tiên số 1 · Xác suất nhớ hiện tại: ${Math.round(nextCard.recallProb * 100)}% (h = ${nextCard.halfLifeHours.toFixed(1)}h)</span>
          <h3 style="font-size:22px;margin:10px 0 6px;">${esc(nextCard.term)}</h3>
          ${nextCard.exampleEn ? `<p style="margin:0 0 8px;"><em>"${esc(nextCard.exampleEn)}"</em></p>` : ""}
          ${
            hlrRevealedId === nextCard.id
              ? `<p style="font-weight:700;color:var(--yi-emerald);">Nghĩa tiếng Việt: ${esc(nextCard.meaningVi)}</p>
                 <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">
                   <button type="button" class="yi-btn yi-btn--emerald" data-hlr-grade="right" data-card="${esc(nextCard.id)}">Tôi nhớ chính xác (+XP, tăng chu kỳ h)</button>
                   <button type="button" class="yi-btn" data-hlr-grade="wrong" data-card="${esc(nextCard.id)}">Còn lúng túng (ôn lại sớm hơn)</button>
                 </div>`
              : `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">
                   <button type="button" class="yi-btn yi-btn--primary" data-hlr-reveal="${esc(nextCard.id)}">Tự nhớ lại &amp; Lật xem nghĩa</button>
                   <button type="button" class="yi-btn" data-speak="${esc(nextCard.term)}">Nghe phát âm</button>
                 </div>`
          }
        </div>`
          : ""
      }

      <h3 style="margin-top:18px;">Thêm từ vựng IELTS cá nhân vào bộ thẻ HLR</h3>
      <form id="form-add-hlr" class="yi-grid-3" style="margin-bottom:18px;">
        <input type="text" class="yi-input" id="hlr-new-term" placeholder="Từ / collocation tiếng Anh" aria-label="Từ tiếng Anh mới" required>
        <input type="text" class="yi-input" id="hlr-new-meaning" placeholder="Nghĩa tiếng Việt chuẩn" aria-label="Nghĩa tiếng Việt" required>
        <button type="submit" class="yi-btn yi-btn--primary">Thêm vào lịch HLR</button>
      </form>

      <h3>Dự báo đường cong quên trung bình (h = ${avgH.toFixed(1)} giờ)</h3>
      <div class="yi-badges-inline" style="margin-bottom:16px;">
        ${curve.map((pt) => `<span class="yi-tag">${esc(pt.labelVi)}: ${pt.retentionPct}%</span>`).join("")}
      </div>

      <div class="yi-table-wrap">
        <table class="yi-table">
          <thead><tr><th>Từ / Cụm học thuật</th><th>Nghĩa tiếng Việt</th><th>Chu kỳ bán rã h</th><th>Xác suất nhớ</th><th>Trạng thái</th></tr></thead>
          <tbody>
            ${queue.all
              .map(
                (c) => `
              <tr>
                <td><strong>${esc(c.term)}</strong></td>
                <td>${esc(c.meaningVi)}</td>
                <td>${c.halfLifeHours.toFixed(1)} giờ</td>
                <td>${Math.round(c.recallProb * 100)}%</td>
                <td><span class="yi-tag">${esc(c.status.labelVi)}</span></td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderStoriesTab(container) {
  if (activeStory) {
    const st = activeStory.story;
    container.innerHTML = `
      <div class="yi-card">
        <div class="yi-unit__top">
          <span class="yi-tag yi-tag--blue">Truyện IELTS · CEFR ${esc(st.cefr)} · Band ${st.targetBand.toFixed(1)}</span>
          <button type="button" class="yi-btn" id="btn-close-story">Quay lại danh sách</button>
        </div>
        <h2>${esc(st.titleVi)}</h2>
        <p class="yi-muted">${esc(st.subtitleVi)}</p>
        <div class="yi-badges-inline" style="margin-bottom:14px;">
          ${Object.entries(st.glossary)
            .map(([en, vi]) => `<span class="yi-tag yi-tag--amber"><strong>${esc(en)}</strong>: ${esc(vi)}</span>`)
            .join("")}
        </div>
        ${st.lines
          .map((ln) => {
            const ch = CAST_CHARACTERS[ln.speaker] || CAST_CHARACTERS.linh;
            return `
              <div class="yi-stimulus">
                <strong>${esc(ch.nameVi)} (${esc(ch.roleVi)}):</strong> ${esc(ln.en)}
                <div class="yi-muted" style="margin:4px 0 0;">${esc(ln.vi)}</div>
                <button type="button" class="yi-btn" data-speak="${esc(ln.en)}" style="margin-top:6px;">Nghe câu thoại</button>
              </div>`;
          })
          .join("")}
        <h3 style="margin-top:16px;">Câu hỏi đọc &amp; nghe hiểu nhanh</h3>
        ${st.checkpoints
          .map(
            (q) => `
          <div style="margin-bottom:14px;">
            <p><strong>${esc(q.questionVi)}</strong></p>
            <div class="yi-options">
              ${q.options
                .map(
                  (opt) =>
                    `<button type="button" class="yi-option${activeStory.qAnswers[q.id] === opt ? " is-selected" : ""}" data-story-q="${esc(q.id)}" data-story-opt="${esc(opt)}">${esc(opt)}</button>`,
                )
                .join("")}
            </div>
            ${activeStory.submitted ? `<p class="yi-muted"><strong>Đáp án:</strong> ${esc(q.answer)} — ${esc(q.explainVi)}</p>` : ""}
          </div>`,
          )
          .join("")}
        ${
          activeStory.submitted
            ? `<button type="button" class="yi-btn yi-btn--primary" id="btn-close-story">Hoàn tất &amp; Quay lại</button>`
            : `<button type="button" class="yi-btn yi-btn--emerald" id="btn-submit-story">Nộp câu trả lời &amp; Nhận +${st.xpReward} XP</button>`
        }
      </div>`;
    return;
  }

  if (activeRoleplay) {
    const rp = activeRoleplay.scenario;
    const ch = CAST_CHARACTERS[rp.character];
    const ev = activeRoleplay.evaluation;
    container.innerHTML = `
      <div class="yi-card">
        <div class="yi-unit__top">
          <span class="yi-tag yi-tag--emerald">${esc(rp.partLabelVi)}</span>
          <button type="button" class="yi-btn" id="btn-close-rp">Quay lại danh sách</button>
        </div>
        <h2>${esc(rp.titleVi)}</h2>
        <div class="yi-stimulus">
          <strong>${esc(ch.nameVi)}:</strong> "${esc(rp.openingEn)}"
          <div class="yi-muted" style="margin-top:4px;">${esc(rp.openingVi)}</div>
          <button type="button" class="yi-btn" data-speak="${esc(rp.openingEn)}" style="margin-top:8px;">Nghe giám khảo hỏi</button>
        </div>
        <p class="yi-muted">Gợi ý từ vựng học thuật nên lồng ghép: ${rp.suggestedKeywords.map((k) => `<code>${esc(k)}</code>`).join(", ")}</p>
        <label>
          <span class="yi-tag" style="margin-bottom:6px;">Câu trả lời tiếng Anh của bạn (khuyến nghị 25–60 từ)</span>
          <textarea class="yi-textarea" id="rp-answer-input" placeholder="Nhập câu trả lời IELTS Speaking bằng tiếng Anh..."></textarea>
        </label>
        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
          <button type="button" class="yi-btn yi-btn--emerald" id="btn-eval-rp">Chấm 4 Tiêu Chí IELTS &amp; Nhận XP</button>
        </div>
        ${
          ev
            ? `
          <div class="yi-feedback${ev.valid ? "" : " yi-feedback--wrong"}">
            <h3>${ev.valid ? `Band ước lượng: ${ev.overallBand.toFixed(1)} (${ev.wordCount} từ)` : "Cần bổ sung câu trả lời"}</h3>
            <p>${esc(ev.messageVi)}</p>
            ${
              ev.criteria
                ? `<ul>
                    ${Object.values(ev.criteria)
                      .map((c) => `<li><strong>${esc(c.labelVi)} — Band ${c.band.toFixed(1)}:</strong> ${esc(c.noteVi)}</li>`)
                      .join("")}
                  </ul>`
                : ""
            }
            ${
              ev.transferTipsVi.length
                ? `<p><strong>Cảnh báo lỗi chuyển di Việt–Anh:</strong> ${ev.transferTipsVi.map(esc).join(" ")}</p>`
                : ""
            }
            <p><strong>Câu mẫu nâng cấp Band 8.5:</strong> <em>"${esc(ev.modelUpgradeEn)}"</em></p>
          </div>`
            : ""
        }
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="yi-card">
      <h2>Truyện Ngắn Học Thuật IELTS Tương Tác</h2>
      <p class="yi-muted">Đọc và nghe hội thoại sinh động giữa Cô Linh, Thầy Hùng &amp; Bạn Mai kèm giải nghĩa từ vựng học thuật tức thì.</p>
      <div class="yi-grid-3">
        ${INTERACTIVE_STORIES.map(
          (s) => `
          <article class="yi-unit">
            <span class="yi-tag yi-tag--blue">CEFR ${esc(s.cefr)} · Band ${s.targetBand.toFixed(1)}</span>
            <h3>${esc(s.titleVi)}</h3>
            <p class="yi-muted">${esc(s.subtitleVi)}</p>
            <button type="button" class="yi-btn yi-btn--primary" data-open-story="${esc(s.id)}">
              ${appState.completedStories.includes(s.id) ? "Đọc lại truyện" : `Đọc truyện (+${s.xpReward} XP)`}
            </button>
          </article>`,
        ).join("")}
      </div>
    </div>

    <div class="yi-card">
      <h2>Đối Thoại Nhập Vai IELTS Speaking Cùng Nhân Vật</h2>
      <p class="yi-muted">Thực hành phản xạ Part 2 &amp; Part 3, nhận phân tích tức thì theo 4 tiêu chí FC, LR, GRA, P và cảnh báo lỗi chuyển di tiếng Việt.</p>
      <div class="yi-grid-3">
        ${ROLEPLAY_SCENARIOS.map(
          (r) => `
          <article class="yi-unit">
            <span class="yi-tag yi-tag--emerald">${esc(r.partLabelVi)}</span>
            <h3>${esc(r.titleVi)}</h3>
            <p class="yi-muted">Mục tiêu Band ${r.targetBand.toFixed(1)} · +${r.xpReward} XP</p>
            <button type="button" class="yi-btn yi-btn--emerald" data-open-rp="${esc(r.id)}">Bắt đầu đối thoại</button>
          </article>`,
        ).join("")}
      </div>
    </div>`;
}

function renderLeaguesTab(container) {
  const g = appState.gamification;
  const board = buildLeagueStandings(g, `${appState.profile.displayName} (Bạn)`);
  const zoneLabel = {
    promotion: "Nhóm Thăng hạng (Top 7)",
    safe: "Nhóm An toàn",
    demotion: "Nhóm Xuống hạng (24–30)",
  };
  const addedIds = new Set(g.friendStreaks.map((f) => f.id));

  container.innerHTML = `
    <div class="yi-card">
      <h2>Hệ Thống 10 Giải Đấu Hàng Tuần (Đồng → Kim Cương)</h2>
      <div class="yi-badges-inline" style="margin-bottom:14px;">
        ${WEEKLY_LEAGUES.map(
          (lg) =>
            `<span class="yi-tag${lg.tier === board.league.tier ? " yi-tag--emerald" : ""}">${lg.tier + 1}. ${esc(lg.nameVi)}</span>`,
        ).join("")}
      </div>
      <div class="yi-unit__top" style="margin-bottom:12px;">
        <p class="yi-muted" style="margin:0;">
          Giải hiện tại: <strong>${esc(board.league.nameVi)} (${esc(board.league.nameEn)})</strong> ·
          Hạng của bạn: <strong>#${board.learnerRank}/30</strong> (${esc(zoneLabel[board.learnerZone])}) ·
          XP tuần này: <strong>${g.weeklyXp} XP</strong>.
        </p>
        <button type="button" class="yi-btn yi-btn--primary" id="btn-settle-league">Tổng kết tuần giải đấu</button>
      </div>
      <div class="yi-table-wrap">
        <table class="yi-table">
          <thead><tr><th>Hạng</th><th>Học viên</th><th>XP Tuần</th><th>Khu vực</th></tr></thead>
          <tbody>
            ${board.standings
              .slice(0, 12)
              .concat(board.learnerRank > 12 ? [board.standings[board.learnerRank - 1]] : [])
              .map(
                (row) => `
              <tr class="${row.isLearner ? "yi-row-me" : row.zone === "promotion" ? "yi-row-promo" : row.zone === "demotion" ? "yi-row-demo" : ""}">
                <td>#${row.rank}</td>
                <td>${esc(row.name)}</td>
                <td>${row.xp} XP</td>
                <td>${esc(zoneLabel[row.zone])}</td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="yi-card">
      <h2>Chuỗi Bạn Bè (Friend Streaks · ${g.friendStreaks.length}/${MAX_FRIEND_STREAKS} bạn đồng hành)</h2>
      <p class="yi-muted">Chia sẻ chuỗi ngày học hàng ngày với tối đa 5 người bạn cùng luyện IELTS và gửi lời cổ vũ (+5 XP/lần).</p>
      <div class="yi-grid-2" style="margin-bottom:16px;">
        ${g.friendStreaks
          .map(
            (fr) => `
          <div class="yi-unit">
            <div class="yi-unit__top">
              <strong>${esc(fr.name)}</strong>
              <span class="yi-tag yi-tag--amber">Chuỗi chung: ${fr.streak} ngày</span>
            </div>
            <p class="yi-muted" style="margin:0;">${esc(fr.city)} · Mục tiêu Band ${fr.targetBand.toFixed(1)}</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" class="yi-btn yi-btn--emerald" data-nudge-friend="${esc(fr.id)}">Cổ vũ giữ chuỗi (+5 XP)</button>
              <button type="button" class="yi-btn" data-remove-friend="${esc(fr.id)}">Gỡ kết nối</button>
            </div>
          </div>`,
          )
          .join("")}
      </div>
      <h3>Kết nối thêm bạn đồng hành IELTS</h3>
      <div class="yi-grid-3">
        ${FRIEND_DIRECTORY.filter((f) => !addedIds.has(f.id))
          .map(
            (f) => `
          <div class="yi-unit">
            <strong>${esc(f.name)}</strong>
            <span class="yi-muted">${esc(f.city)} · Band ${f.targetBand.toFixed(1)}</span>
            <button type="button" class="yi-btn" data-add-friend="${esc(f.id)}" ${g.friendStreaks.length >= MAX_FRIEND_STREAKS ? "disabled" : ""}>
              Thêm Chuỗi Bạn Bè
            </button>
          </div>`,
          )
          .join("")}
      </div>
    </div>`;
}

function renderShopTab(container) {
  const g = appState.gamification;
  container.innerHTML = `
    <div class="yi-card">
      <h2>Cửa Hàng Vật Phẩm Đá Quý (Hiện có: ${g.gems} Đá quý)</h2>
      <p class="yi-muted">Đổi Đá quý tích lũy từ bài học để bảo vệ Chuỗi Ngày Học, nhân đôi XP, nạp năng lượng hoặc kích hoạt Siêu Cấp IELTS miễn phí.</p>
      <div class="yi-grid-2">
        ${SHOP_ITEMS.map(
          (it) => `
          <div class="yi-unit">
            <div class="yi-unit__top">
              <strong>${esc(it.nameVi)}</strong>
              <span class="yi-tag yi-tag--blue">${it.costGems} Đá quý</span>
            </div>
            <p class="yi-muted" style="margin:0;">${esc(it.descVi)}</p>
            <button type="button" class="yi-btn yi-btn--primary" data-buy-item="${esc(it.id)}">Đổi vật phẩm</button>
          </div>`,
        ).join("")}
      </div>
    </div>

    <div class="yi-card">
      <h2>Xưởng Ảnh Đại Diện &amp; 4 Bộ Trang Phục Theo Mùa</h2>
      <div class="yi-avatar-box">${renderAvatarSvg(g.avatar)}</div>
      <div class="yi-grid-3" style="margin-bottom:16px;">
        <label>
          <span class="yi-tag">Kiểu tóc</span>
          <select class="yi-select" data-avatar-key="hairStyle">
            <option value="scholar" ${g.avatar.hairStyle === "scholar" ? "selected" : ""}>Học giả thanh lịch</option>
            <option value="bun" ${g.avatar.hairStyle === "bun" ? "selected" : ""}>Búi cao năng động</option>
          </select>
        </label>
        <label>
          <span class="yi-tag">Kính học thuật</span>
          <select class="yi-select" data-avatar-key="glasses">
            <option value="round" ${g.avatar.glasses === "round" ? "selected" : ""}>Kính gọng tròn</option>
            <option value="none" ${g.avatar.glasses === "none" ? "selected" : ""}>Không đeo kính</option>
          </select>
        </label>
        <label>
          <span class="yi-tag">Biểu cảm</span>
          <select class="yi-select" data-avatar-key="expression">
            <option value="smile" ${g.avatar.expression === "smile" ? "selected" : ""}>Tươi tắn thân thiện</option>
            <option value="confident" ${g.avatar.expression === "confident" ? "selected" : ""}>Tự tin chinh phục Band 8+</option>
          </select>
        </label>
      </div>
      <div class="yi-grid-2">
        ${SEASONAL_SUITS.map((suit) => {
          const owned = g.unlockedSuits.includes(suit.id);
          const wearing = g.avatar.suitId === suit.id;
          return `
            <div class="yi-unit">
              <span class="yi-tag yi-tag--amber">${esc(suit.seasonVi)}</span>
              <strong>${esc(suit.nameVi)}</strong>
              ${
                wearing
                  ? `<span class="yi-tag yi-tag--emerald">Đang mặc</span>`
                  : owned
                    ? `<button type="button" class="yi-btn" data-wear-suit="${esc(suit.id)}">Khoác bộ này</button>`
                    : `<button type="button" class="yi-btn yi-btn--primary" data-buy-item="${esc(suit.id)}">Mở khóa (${suit.costGems} Đá quý)</button>`
              }
            </div>`;
        }).join("")}
      </div>
    </div>

    <div class="yi-card">
      <h2>Bộ Sưu Tập 12 Huy Hiệu Thành Tích (${g.earnedBadges.length}/12)</h2>
      <div class="yi-grid-3">
        ${BADGE_DEFINITIONS.map((b) => {
          const ok = g.earnedBadges.includes(b.id);
          return `
            <div class="yi-unit" style="opacity:${ok ? "1" : "0.68"}">
              <span class="yi-tag ${ok ? "yi-tag--emerald" : ""}">${ok ? "Đã đạt" : "Chưa mở"}</span>
              <strong>${esc(b.nameVi)}</strong>
              <span class="yi-muted">${esc(b.descVi)}</span>
            </div>`;
        }).join("")}
      </div>
    </div>`;
}

function renderScoreTab(container) {
  const prof = scoreToProfile(appState.profile.proficiencyScore);
  const gap = computeTargetGap(prof.score, appState.profile.targetBand);
  const badge = formatLinkedInBadge(prof.score, appState.profile.displayName, toDateKey());
  const queue = getReviewQueue(appState.hlrCards);
  const league = WEEKLY_LEAGUES[appState.gamification.leagueTier] || WEEKLY_LEAGUES[0];
  const banditView = selectSmartReminder(
    appState.bandit,
    {
      studiedToday: appState.gamification.lastStudyDateKey === toDateKey(),
      streak: appState.gamification.streak || 1,
      dueCount: queue.due.length,
      friendCount: appState.gamification.friendStreaks.length,
      leagueName: league.nameVi,
      targetBand: appState.profile.targetBand,
    },
    0.25,
  );

  container.innerHTML = `
    <div class="yi-card">
      <h2>Hồ Sơ Điểm Năng Lực 0–160 ↔ CEFR ↔ IELTS Academic</h2>
      <div class="yi-stats-row">
        <div class="yi-stat"><strong>${prof.score}/160</strong><span>${esc(prof.cefrLabelVi)} (${esc(prof.cefr)})</span></div>
        <div class="yi-stat"><strong>Band ${prof.ieltsBand.toFixed(1)}</strong><span>Quy đổi IELTS hiện tại</span></div>
        <div class="yi-stat"><strong>Band ${gap.targetBand.toFixed(1)}</strong><span>Mục tiêu (${gap.reached ? "Đã đạt!" : `còn +${gap.pointsNeeded} điểm`})</span></div>
        <div class="yi-stat"><strong>${gap.recommendedSessions} phiên</strong><span>Khuyến nghị học phân tán</span></div>
      </div>
      <p style="margin-top:12px;"><strong>Năng lực hiện tại:</strong> ${esc(prof.canDoVi)}</p>

      <div class="yi-grid-3" style="margin:14px 0;">
        <label>
          <span class="yi-tag">Tên hiển thị trên chứng nhận</span>
          <input type="text" class="yi-input" id="inp-learner-name" value="${esc(appState.profile.displayName)}">
        </label>
        <label>
          <span class="yi-tag">Mục tiêu IELTS Band</span>
          <select class="yi-select" id="sel-target-band">
            ${[5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0]
              .map((b) => `<option value="${b}" ${appState.profile.targetBand === b ? "selected" : ""}>Band ${b.toFixed(1)}</option>`)
              .join("")}
          </select>
        </label>
        <label>
          <span class="yi-tag">Mục tiêu XP hàng ngày</span>
          <select class="yi-select" id="sel-daily-goal">
            ${DAILY_XP_GOALS.map((g) => `<option value="${g.xp}" ${appState.gamification.dailyGoalXp === g.xp ? "selected" : ""}>${g.xp} XP — ${esc(g.labelVi)}</option>`).join("")}
          </select>
        </label>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
        <a class="yi-btn yi-btn--primary" href="${esc(badge.linkedInUrl)}" target="_blank" rel="noopener noreferrer">
          Thêm điểm ${prof.score}/160 vào hồ sơ LinkedIn
        </a>
        <button type="button" class="yi-btn yi-btn--emerald" id="btn-print-report">
          Xuất Báo Cáo Học Thuật PDF (Kèm 80 Trích Dẫn Google Scholar)
        </button>
        <button type="button" class="yi-btn" id="btn-export-json">Tải sao lưu tiến độ (.json)</button>
      </div>

      <h3>Công cụ tính điểm IELTS Overall &amp; điểm thô 40 câu Cambridge</h3>
      <div class="yi-grid-3" style="margin-bottom:10px;">
        <label><span class="yi-tag">Số câu đúng Listening (/40)</span><input type="number" class="yi-input" id="calc-l-raw" min="0" max="40" value="32"></label>
        <label><span class="yi-tag">Số câu đúng Reading (/40)</span><input type="number" class="yi-input" id="calc-r-raw" min="0" max="40" value="33"></label>
        <label><span class="yi-tag">Writing &amp; Speaking TB</span><input type="number" class="yi-input" id="calc-ws-band" min="2" max="9" step="0.5" value="7.0"></label>
      </div>
      <p id="calc-band-output" class="yi-stimulus"></p>

      <h3>Bảng đối chiếu chuẩn 0–160 ↔ CEFR ↔ IELTS</h3>
      <div class="yi-table-wrap">
        <table class="yi-table">
          <thead><tr><th>Thang 0–160</th><th>CEFR</th><th>IELTS</th><th>Mô tả năng lực</th></tr></thead>
          <tbody>
            ${PROFICIENCY_BANDS.slice(4)
              .map(
                (b) => `
              <tr class="${prof.score >= b.minScore && prof.score <= b.maxScore ? "yi-row-me" : ""}">
                <td>${b.minScore}–${b.maxScore}</td>
                <td>${esc(b.cefr)} (${esc(b.cefrLabelVi)})</td>
                <td>Band ${b.ieltsBand.toFixed(1)}</td>
                <td>${esc(b.canDoVi)}</td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="yi-card">
      <span class="yi-tag yi-tag--amber">Yancey &amp; Settles (2020) · ACM SIGKDD</span>
      <h2>Phân Phối Xác Suất Nhắc Học Recovering-Difference Softmax Bandit</h2>
      <div class="yi-table-wrap">
        <table class="yi-table">
          <thead><tr><th>Nhân vật</th><th>Thông điệp nhắc học</th><th>Độ hữu ích u(Δ)</th><th>Xác suất Softmax</th></tr></thead>
          <tbody>
            ${banditView.candidates
              .map(
                (c) => `
              <tr>
                <td><strong>${esc(c.character)}</strong></td>
                <td>${esc(c.titleVi)}</td>
                <td>${c.utility.toFixed(3)}</td>
                <td>${Math.round(c.probability * 100)}%</td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>`;

  updateCalculatorOutput();
}

function updateCalculatorOutput() {
  const out = document.getElementById("calc-band-output");
  if (!out) return;
  const lRaw = Number(document.getElementById("calc-l-raw")?.value || 0);
  const rRaw = Number(document.getElementById("calc-r-raw")?.value || 0);
  const ws = Number(document.getElementById("calc-ws-band")?.value || 6.5);
  const lBand = rawScoreToIeltsBand(lRaw, 40, "listening");
  const rBand = rawScoreToIeltsBand(rRaw, 40, "reading");
  const overall = computeOverallIeltsBand({ listening: lBand, reading: rBand, writing: ws, speaking: ws });
  out.textContent = `Kết quả quy đổi Cambridge: Listening ${lBand.toFixed(1)} · Academic Reading ${rBand.toFixed(1)} · Writing ${ws.toFixed(1)} · Speaking ${ws.toFixed(1)} → IELTS Overall Band ${overall.toFixed(1)}.`;
}

function switchTab(nextTab) {
  activeTab = nextTab;
  for (const btn of document.querySelectorAll(".yi-tab")) {
    btn.setAttribute("aria-selected", btn.dataset.tab === nextTab ? "true" : "false");
  }
  renderMain();
}

function renderMain() {
  renderHud();
  renderSidePanel();
  const main = document.getElementById("duo-main-panel");
  if (!main) return;
  if (activeTab === "path") renderPathTab(main);
  else if (activeTab === "hlr") renderHlrTab(main);
  else if (activeTab === "stories") renderStoriesTab(main);
  else if (activeTab === "leagues") renderLeaguesTab(main);
  else if (activeTab === "shop") renderShopTab(main);
  else renderScoreTab(main);
}

document.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;

  if (btn.dataset.tab) {
    activeLesson = null;
    switchTab(btn.dataset.tab);
    return;
  }
  if (btn.id === "btn-quick-lesson") {
    const units = getPathProgress(appState.completedUnits);
    const nextUnit = units.find((u) => u.status === "current") || units[0];
    startLesson(nextUnit);
    return;
  }
  if (btn.id === "btn-adaptive-drill") {
    const drill = selectAdaptiveDrill(
      appState.profile.proficiencyScore,
      appState.profile.recentAccuracyPct,
      5,
    );
    const baseUnit = getUnitById(drill.exercises[0].unitId);
    startLesson(baseUnit, drill.exercises, `Luyện Thích Ứng Thông Minh · ${drill.difficultyLabelVi}`);
    return;
  }
  if (btn.dataset.startUnit) {
    const unit = getUnitById(btn.dataset.startUnit);
    if (unit) startLesson(unit);
    return;
  }
  if (btn.dataset.speak) {
    speakEnglish(btn.dataset.speak);
    return;
  }
  if (btn.id === "btn-exit-lesson") {
    activeLesson = null;
    renderMain();
    return;
  }
  if (btn.id === "btn-go-hlr") {
    activeLesson = null;
    switchTab("hlr");
    return;
  }
  if (btn.dataset.mcq && activeLesson && !activeLesson.feedback) {
    activeLesson.mcqChoice = btn.dataset.mcq;
    renderMain();
    return;
  }
  if (btn.dataset.wbAdd && activeLesson && !activeLesson.feedback) {
    activeLesson.wbPicked.push({ chipId: btn.dataset.wbAdd, text: btn.dataset.wbText });
    renderMain();
    return;
  }
  if (btn.dataset.wbRemove && activeLesson && !activeLesson.feedback) {
    activeLesson.wbPicked = activeLesson.wbPicked.filter((c) => c.chipId !== btn.dataset.wbRemove);
    renderMain();
    return;
  }
  if (btn.dataset.pairLeft && activeLesson && !activeLesson.feedback) {
    activeLesson.pairLeft = btn.dataset.pairLeft;
    renderMain();
    return;
  }
  if (btn.dataset.pairRight && activeLesson && !activeLesson.feedback && activeLesson.pairLeft) {
    activeLesson.pairMap[activeLesson.pairLeft] = btn.dataset.pairRight;
    activeLesson.pairLeft = "";
    renderMain();
    return;
  }
  if (btn.id === "btn-check-ex" && activeLesson) {
    const ex = activeLesson.exercises[activeLesson.idx];
    let response = activeLesson.mcqChoice;
    if (ex.type === "cloze") {
      const inp = document.getElementById("cloze-input");
      activeLesson.clozeText = inp ? inp.value : "";
      response = activeLesson.clozeText;
    } else if (ex.answerTokens) {
      response = activeLesson.wbPicked.map((c) => c.text);
    } else if (ex.type === "pairs") {
      response = activeLesson.pairMap;
    }
    const result = evaluateExercise(ex, response);
    activeLesson.feedback = result;
    if (result.correct) {
      activeLesson.correctCount += 1;
      activeLesson.combo += 1;
      activeLesson.maxCombo = Math.max(activeLesson.maxCombo, activeLesson.combo);
    } else {
      const eRes = consumeEnergyOnMistake(appState.gamification);
      appState = { ...appState, gamification: eRes.state };
      if (eRes.shieldUsed) showToast("Lá Chắn Giữ Mạch Combo đã bảo vệ năng lượng và chuỗi đúng của bạn!");
      else activeLesson.combo = 0;
      persist();
    }
    renderMain();
    return;
  }
  if (btn.id === "btn-next-ex" && activeLesson) {
    if (activeLesson.idx + 1 < activeLesson.exercises.length) {
      activeLesson.idx += 1;
      activeLesson.wbPicked = [];
      activeLesson.pairLeft = "";
      activeLesson.pairMap = {};
      activeLesson.mcqChoice = "";
      activeLesson.clozeText = "";
      activeLesson.feedback = null;
    } else {
      const committed = commitUnitLesson(appState, {
        unit: activeLesson.unit,
        correctCount: activeLesson.correctCount,
        totalCount: activeLesson.exercises.length,
        maxCombo: activeLesson.maxCombo,
      });
      appState = committed.state;
      activeLesson.finishedSummary = committed;
      persist();
      showToast(`Hoàn thành bài học! +${committed.reward.earnedXp} XP & +${committed.reward.earnedGems} Đá quý.`);
    }
    renderMain();
    return;
  }
  if (btn.dataset.hlrReveal) {
    hlrRevealedId = btn.dataset.hlrReveal;
    renderMain();
    return;
  }
  if (btn.dataset.hlrGrade) {
    const ok = btn.dataset.hlrGrade === "right";
    const res = commitHlrReview(appState, btn.dataset.card, ok);
    if (res.ok) {
      appState = res.state;
      hlrRevealedId = "";
      persist();
      showToast(
        ok
          ? `Tuyệt vời! Chu kỳ bán rã tăng lên ${res.nextHalfLifeHours.toFixed(1)} giờ (+${res.reward.earnedXp} XP).`
          : `Đã rút ngắn chu kỳ bán rã xuống ${res.nextHalfLifeHours.toFixed(1)} giờ để củng cố lại.`,
      );
      renderMain();
    }
    return;
  }
  if (btn.dataset.openStory) {
    const st = getStoryById(btn.dataset.openStory);
    if (st) {
      activeStory = { story: st, qAnswers: {}, submitted: false };
      renderMain();
    }
    return;
  }
  if (btn.dataset.storyQ && activeStory && !activeStory.submitted) {
    activeStory.qAnswers[btn.dataset.storyQ] = btn.dataset.storyOpt;
    renderMain();
    return;
  }
  if (btn.id === "btn-submit-story" && activeStory) {
    const st = activeStory.story;
    const correct = st.checkpoints.filter((q) => activeStory.qAnswers[q.id] === q.answer).length;
    const rew = awardActivityCompletion(appState.gamification, {
      activityType: "story",
      baseXp: st.xpReward,
      correctCount: correct,
      totalCount: st.checkpoints.length,
    });
    const doneStories = appState.completedStories.includes(st.id)
      ? appState.completedStories
      : [...appState.completedStories, st.id];
    appState = { ...appState, gamification: rew.state, completedStories: doneStories };
    activeStory.submitted = true;
    persist();
    showToast(`Hoàn thành truyện ngắn! Đúng ${correct}/${st.checkpoints.length} · +${rew.earnedXp} XP.`);
    renderMain();
    return;
  }
  if (btn.id === "btn-close-story") {
    activeStory = null;
    renderMain();
    return;
  }
  if (btn.dataset.openRp) {
    const rp = getRoleplayById(btn.dataset.openRp);
    if (rp) {
      activeRoleplay = { scenario: rp, evaluation: null };
      renderMain();
    }
    return;
  }
  if (btn.id === "btn-eval-rp" && activeRoleplay) {
    const text = document.getElementById("rp-answer-input")?.value || "";
    const evRes = evaluateSpeakingResponse(activeRoleplay.scenario, text);
    activeRoleplay.evaluation = evRes;
    if (evRes.valid) {
      const rew = awardActivityCompletion(appState.gamification, {
        activityType: "roleplay",
        baseXp: activeRoleplay.scenario.xpReward,
        correctCount: Math.round(evRes.overallBand),
        totalCount: 9,
      });
      appState = { ...appState, gamification: rew.state };
      persist();
      showToast(`Chấm Speaking hoàn tất: Band ${evRes.overallBand.toFixed(1)} · +${rew.earnedXp} XP!`);
    }
    renderMain();
    return;
  }
  if (btn.id === "btn-close-rp") {
    activeRoleplay = null;
    renderMain();
    return;
  }
  if (btn.id === "btn-settle-league") {
    const settled = settleWeeklyLeague(appState.gamification);
    appState = { ...appState, gamification: settled.state };
    persist();
    showToast(
      `Tổng kết hạng #${settled.finalRank}: Giải ${settled.newLeague.nameVi}${settled.bonusGems ? ` (+${settled.bonusGems} Đá quý)` : ""}!`,
    );
    renderMain();
    return;
  }
  if (btn.dataset.addFriend) {
    const res = addFriendStreak(appState.gamification, btn.dataset.addFriend);
    appState = { ...appState, gamification: res.state };
    persist();
    showToast(res.reasonVi);
    renderMain();
    return;
  }
  if (btn.dataset.removeFriend) {
    appState = {
      ...appState,
      gamification: removeFriendStreak(appState.gamification, btn.dataset.removeFriend),
    };
    persist();
    showToast("Đã cập nhật danh sách Chuỗi Bạn Bè.");
    renderMain();
    return;
  }
  if (btn.dataset.nudgeFriend) {
    const res = nudgeFriend(appState.gamification, btn.dataset.nudgeFriend, toDateKey());
    appState = { ...appState, gamification: res.state };
    persist();
    showToast(res.messageVi);
    renderMain();
    return;
  }
  if (btn.dataset.buyItem) {
    const res = purchaseShopItem(appState.gamification, btn.dataset.buyItem);
    appState = { ...appState, gamification: res.state };
    persist();
    showToast(res.messageVi);
    renderMain();
    return;
  }
  if (btn.dataset.wearSuit) {
    appState = {
      ...appState,
      gamification: updateAvatar(appState.gamification, { suitId: btn.dataset.wearSuit }),
    };
    persist();
    renderMain();
    return;
  }
  if (btn.dataset.claimQuest) {
    const res = claimDailyQuest(appState.gamification, btn.dataset.claimQuest, toDateKey());
    if (res.ok) {
      appState = { ...appState, gamification: res.state };
      persist();
      showToast(`Đã mở rương nhiệm vụ: +${res.rewardGems} Đá quý!`);
      renderMain();
    }
    return;
  }
  if (btn.dataset.banditAct) {
    const accepted = btn.dataset.banditAct === "accept";
    appState = {
      ...appState,
      bandit: recordReminderOutcome(appState.bandit, btn.dataset.tpl, accepted),
    };
    persist();
    if (accepted) {
      const units = getPathProgress(appState.completedUnits);
      startLesson(units.find((u) => u.status === "current") || units[0]);
    } else {
      showToast("Đã cập nhật mô hình Softmax Bandit và chuyển sang thông điệp mới.");
      renderMain();
    }
    return;
  }
  if (btn.id === "btn-print-report") {
    openScholarReport(true);
    return;
  }
  if (btn.id === "btn-export-json") {
    const blob = new Blob([exportStateJson(appState)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yysd-ielts-tien-do-${toDateKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
});

document.addEventListener("change", (ev) => {
  const el = ev.target;
  if (el.dataset.avatarKey) {
    appState = {
      ...appState,
      gamification: updateAvatar(appState.gamification, { [el.dataset.avatarKey]: el.value }),
    };
    persist();
    renderMain();
  } else if (el.id === "inp-learner-name") {
    appState = {
      ...appState,
      profile: { ...appState.profile, displayName: el.value.trim() || "Học viên IELTS" },
    };
    persist();
    renderMain();
  } else if (el.id === "sel-target-band") {
    appState = {
      ...appState,
      profile: { ...appState.profile, targetBand: Number(el.value) || 7.5 },
    };
    persist();
    renderMain();
  } else if (el.id === "sel-daily-goal") {
    appState = {
      ...appState,
      gamification: setDailyGoal(appState.gamification, Number(el.value)),
    };
    persist();
    renderMain();
  } else if (el.id === "inp-import-json" && el.files?.[0]) {
    el.files[0].text().then((txt) => {
      const res = importStateJson(txt);
      if (res.ok) {
        appState = res.state;
        persist();
        renderMain();
        showToast("Đã khôi phục tiến độ học tập thành công!");
      } else {
        showToast(res.errorVi);
      }
    });
  }
});

document.addEventListener("input", (ev) => {
  if (["calc-l-raw", "calc-r-raw", "calc-ws-band"].includes(ev.target.id)) {
    updateCalculatorOutput();
  }
});

document.addEventListener("submit", (ev) => {
  if (ev.target.id === "form-add-hlr") {
    ev.preventDefault();
    const term = document.getElementById("hlr-new-term")?.value.trim();
    const meaningVi = document.getElementById("hlr-new-meaning")?.value.trim();
    if (!term || !meaningVi) return;
    const card = createHlrCard({
      id: `user_${Date.now()}`,
      term,
      meaningVi,
      skill: "vocabulary",
      difficulty: 0.55,
    });
    appState = { ...appState, hlrCards: [card, ...appState.hlrCards] };
    persist();
    showToast(`Đã thêm "${term}" vào lịch lặp lại ngắt quãng HLR!`);
    renderMain();
  }
});

renderMain();
