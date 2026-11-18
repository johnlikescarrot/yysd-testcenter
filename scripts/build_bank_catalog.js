/* đề thi thật Ngân hàng đề nhẹ số lượng mục lục: trực tiếp phục dùng server/tiku.js buildPool, không xảy ra khác thứ hai bộ Giải thích đáp án động cơ */
const fs = require("fs");
const path = require("path");

const repo = path.join(__dirname, "..");
const OUT = path.join(repo, "app", "library", "toefl");
const HOT = path.join(OUT, "bank-hot.json");
const TIKU = require(path.join(repo, "server", "tiku.js"));

// đi thức câu số ô Bài đánh số tiền tố, theo hanginthere: Nghe LR/C/A, Viết Sắp xếp câu dùng thuần túy con số
const CELL_PREFIX = { choose_response: "LR", conversation: "C", announcement: "A" };
// chỉ có những mục này dạng bài là « một nhóm bộ câu số cách »; còn lại (hàm Nói cả tình cảnh, Nghe toạ đàm bài lẻ) một tấm thẻ tiến trọn bộ
const ROW_TYPES = { choose_response: 1, conversation: 1, announcement: 1, sentence: 1 };
const CODE_TITLE = /^[A-Z]{1,3}-[A-Z]{1,4}\d+-\d+$/;

function groupOf(block) {
  return String(block.set == null? block.paperId: block.set).replace(/-Q\d+$/, "");
}
function num(code) {
  const m = /(\d+)(?!.*\d)/.exec(code);
  return m? Number(m[1]): 0;
}
function qNo(code) {
  const m = /-Q(\d+)$/.exec(code);
  return m? Number(m[1]): 0;
}

function readHot() {
  try {
    return JSON.parse(fs.readFileSync(HOT, "utf8")) || {};
  } catch (e) {
    return {};
  }
}

function build() {
  const pool = TIKU.buildPool(repo).filter((b) => b.source === "bank");
  const hot = readHot();
  const bySkill = {};

  pool.forEach((b) => {
    const code = groupOf(b);
    const skill = bySkill[b.skill] || (bySkill[b.skill] = {});
    const key = code + "|" + b.paperId;
    skill[key] = skill[key] || { type: b.type, paperId: b.paperId, code: code, tasks: [] };
    skill[key].tasks.push({ task: b.task, end: b.end, n: b.n, title: b.title, zh: b.titleZh, code: String(b.set) });
  });

  const out = {};
  Object.keys(bySkill).forEach((skill) => {
    const groups = Object.keys(bySkill[skill])
      .map((k) => bySkill[skill][k])
      .map((g) => {
        g.tasks.sort((a, b) => a.task - b.task);
        const head = g.tasks[0];
        const realTitle = head.title &&!CODE_TITLE.test(head.title)? head.title: "";
        const realZh = head.zh &&!CODE_TITLE.test(head.zh) && head.zh!== realTitle? head.zh: "";
        const cells = g.tasks.map((t, i) => {
          const seq = qNo(t.code) || i + 1;
          const prefix = CELL_PREFIX[g.type];
          return { task: t.task, end: t.end, label: prefix? prefix + String(seq).padStart(2, "0"): String(seq) };
        });
        return {
          type: g.type,
          paperId: g.paperId,
          code: g.code,
          sort: num(g.code),
          task: head.task,
          end: g.tasks[g.tasks.length - 1].end,
          n: g.tasks.reduce((s, t) => s + (t.n || 1), 0),
          title: realTitle,
          zh: realZh,
          cells: ROW_TYPES[g.type]? cells: undefined,
          hot: Number(hot[g.code]) || 0
        };
      });
    groups.sort((a, b) => (a.type < b.type? -1: a.type > b.type? 1: a.sort - b.sort));
    out[skill] = groups;
  });

  Object.keys(out).forEach((skill) => {
    const file = path.join(OUT, "bank-catalog-" + skill + ".json");
    const rows = out[skill].map((g) => {
      const o = Object.assign({}, g);
      if (!o.cells) delete o.cells;
      if (!o.hot) delete o.hot;
      return o;
    });
    fs.writeFileSync(file, JSON.stringify({ skill: skill, count: rows.length, groups: rows }));
    console.log(file.replace(repo + "/", ""), rows.length + " tổ ", fs.statSync(file).size + " B");
  });
}

build();
