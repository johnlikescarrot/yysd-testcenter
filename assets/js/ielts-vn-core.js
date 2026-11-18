(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.YYSDIELTSVN = api;
})(globalThis, function () {
  "use strict";

  var STORAGE_KEY = "yysd.ielts.vn.v1";
  var XP_PER_CORRECT = 12;
  var XP_PER_REVIEW = 3;

  function localDateKey(date) {
    var value = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(value.getTime())) throw new TypeError("Ngày không hợp lệ");
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("-");
  }

  function dayDifference(older, newer) {
    var a = new Date(older + "T00:00:00Z");
    var b = new Date(newer + "T00:00:00Z");
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return Infinity;
    return Math.round((b.getTime() - a.getTime()) / 86400000);
  }

  function weekStartKey(date) {
    var value =
      date instanceof Date
        ? new Date(date.getTime())
        : new Date(date || new Date());
    if (Number.isNaN(value.getTime())) throw new TypeError("Ngày không hợp lệ");
    value.setDate(value.getDate() - ((value.getDay() + 6) % 7));
    return localDateKey(value);
  }

  function addXp(state, amount) {
    state.xp += amount;
    state.todayXp += amount;
    state.weekXp += amount;
  }

  function createInitialState(date) {
    var today = localDateKey(date || new Date());
    return {
      version: 1,
      xp: 0,
      weekXp: 0,
      weekOf: weekStartKey(date || new Date()),
      streak: 0,
      bestStreak: 0,
      lastStudyDate: "",
      today: today,
      todayXp: 0,
      answers: 0,
      correct: 0,
      lessons: 0,
      reviewed: 0,
      answeredIds: [],
      claimedGoals: [],
      mastered: [],
      lastSkill: "",
      history: [],
    };
  }

  function normalizeState(input, date) {
    var fresh = createInitialState(date);
    if (!input || typeof input !== "object" || Array.isArray(input))
      return fresh;
    var currentDay = fresh.today;
    var currentWeek = fresh.weekOf;
    var state = Object.assign(fresh, input);
    [
      "xp",
      "weekXp",
      "streak",
      "bestStreak",
      "todayXp",
      "answers",
      "correct",
      "lessons",
      "reviewed",
    ].forEach(function (key) {
      state[key] = Number.isFinite(Number(state[key]))
        ? Math.max(0, Math.floor(Number(state[key])))
        : 0;
    });
    ["answeredIds", "claimedGoals", "mastered", "history"].forEach(
      function (key) {
        if (!Array.isArray(state[key])) state[key] = [];
      },
    );
    if (state.version !== 1) return createInitialState(date);
    if (state.today !== currentDay) {
      state.today = currentDay;
      state.todayXp = 0;
      state.answers = 0;
      state.correct = 0;
      state.lessons = 0;
      state.reviewed = 0;
      state.answeredIds = [];
      state.claimedGoals = [];
    }
    if (state.weekOf !== currentWeek) {
      state.weekOf = currentWeek;
      state.weekXp = 0;
    }
    return state;
  }

  function recordStudy(input, date) {
    var state = normalizeState(input, date);
    var today = localDateKey(date || new Date());
    if (state.lastStudyDate !== today) {
      var gap = state.lastStudyDate
        ? dayDifference(state.lastStudyDate, today)
        : Infinity;
      state.streak = gap === 1 ? state.streak + 1 : 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      state.lastStudyDate = today;
      state.history = state.history
        .filter(function (day) {
          return day !== today;
        })
        .concat(today)
        .slice(-30);
    }
    state.today = today;
    return state;
  }

  function applyAnswer(input, question, choice, date) {
    if (!question || typeof question.id !== "string" || !question.id)
      throw new TypeError("Câu hỏi cần có mã định danh");
    var state = recordStudy(input, date);
    var correct = choice === question.answer;
    state.answers += 1;
    state.correct += correct ? 1 : 0;
    addXp(state, correct ? XP_PER_CORRECT : 1);
    state.answeredIds = state.answeredIds.concat(question.id).slice(-100);
    if (correct && !state.mastered.includes(question.id))
      state.mastered.push(question.id);
    state.lastSkill = question.skill || "vocabulary";
    return {
      state: state,
      correct: correct,
      xpEarned: correct ? XP_PER_CORRECT : 1,
    };
  }

  function completeLesson(input, date) {
    var state = recordStudy(input, date);
    state.lessons += 1;
    addXp(state, 5);
    return state;
  }

  function completeReview(input, date) {
    var state = recordStudy(input, date);
    state.reviewed += 1;
    addXp(state, XP_PER_REVIEW);
    return state;
  }

  function levelForXp(xp) {
    var total = Math.max(0, Math.floor(Number(xp) || 0));
    var level = Math.floor(total / 100) + 1;
    return {
      level: level,
      current: total % 100,
      needed: 100,
      progress: total % 100,
    };
  }

  function dailyGoals(state) {
    return [
      {
        id: "lesson",
        label: "Hoàn thành một bài học",
        value: state.lessons,
        target: 1,
        reward: 10,
      },
      {
        id: "practice",
        label: "Trả lời đúng năm câu",
        value: state.correct,
        target: 5,
        reward: 15,
      },
      {
        id: "review",
        label: "Ôn lại ba mục từ",
        value: state.reviewed,
        target: 3,
        reward: 10,
      },
    ].map(function (goal) {
      return Object.assign(goal, {
        done: goal.value >= goal.target,
        claimed: state.claimedGoals.includes(goal.id),
        progress: Math.min(100, Math.round((goal.value / goal.target) * 100)),
      });
    });
  }

  function claimGoalRewards(input, date) {
    var state = normalizeState(input, date);
    var payable = dailyGoals(state).filter(function (goal) {
      return goal.done && !goal.claimed;
    });
    var reward = payable.reduce(function (total, goal) {
      return total + goal.reward;
    }, 0);
    state.claimedGoals = state.claimedGoals.concat(
      payable.map(function (goal) {
        return goal.id;
      }),
    );
    addXp(state, reward);
    return { state: state, reward: reward };
  }

  function accuracy(state) {
    return state.answers
      ? Math.round((state.correct / state.answers) * 100)
      : 0;
  }

  function loadState(storage, date) {
    try {
      var raw = storage.getItem(STORAGE_KEY);
      return normalizeState(raw ? JSON.parse(raw) : null, date);
    } catch {
      return createInitialState(date);
    }
  }

  function saveState(storage, state) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[character];
    });
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    XP_PER_CORRECT: XP_PER_CORRECT,
    XP_PER_REVIEW: XP_PER_REVIEW,
    localDateKey: localDateKey,
    dayDifference: dayDifference,
    weekStartKey: weekStartKey,
    createInitialState: createInitialState,
    normalizeState: normalizeState,
    recordStudy: recordStudy,
    applyAnswer: applyAnswer,
    completeLesson: completeLesson,
    completeReview: completeReview,
    levelForXp: levelForXp,
    dailyGoals: dailyGoals,
    claimGoalRewards: claimGoalRewards,
    accuracy: accuracy,
    loadState: loadState,
    saveState: saveState,
    escapeHtml: escapeHtml,
  };
});
