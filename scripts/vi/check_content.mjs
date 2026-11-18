#!/usr/bin/env node
/**
 * Kiểm tra tính toàn vẹn của toàn bộ nội dung trong `vi/`.
 *
 * Bắt các lỗi mà trình duyệt không báo rõ: id trùng, thiếu tệp bài học,
 * trích dẫn trỏ tới tài liệu không tồn tại, PDF thiếu, trang HTML thiếu thẻ
 * bắt buộc… Chạy trong CI trước khi deploy.
 *
 * Chạy: node scripts/vi/check_content.mjs
 */

import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(fileURLToPath(new URL('../../vi/', import.meta.url)));
const problems = [];
const note = (message) => problems.push(message);
const readJson = async (relative) => JSON.parse(await readFile(path.join(ROOT, relative), 'utf8'));
const exists = async (relative) => {
  try {
    await stat(path.join(ROOT, relative));
    return true;
  } catch {
    return false;
  }
};

const REQUIRED_WORD_FIELDS = ['id', 'term', 'ipa', 'pos', 'vi', 'enDef', 'example', 'exampleVi', 'level'];

async function checkCurriculum() {
  const curriculum = await readJson('data/curriculum.json');
  const units = Array.isArray(curriculum.units) ? curriculum.units : [];
  if (units.length < 6) note(`Chương trình chỉ có ${units.length} đơn vị (cần tối thiểu 6).`);

  const unitIds = new Set();
  const lessonIds = new Set();
  let lessonCount = 0;
  let exerciseCount = 0;
  const types = new Set();
  const assembled = { units: [] };

  for (const unit of units) {
    if (unitIds.has(unit.id)) note(`Trùng id đơn vị: ${unit.id}`);
    unitIds.add(unit.id);
    const file = `data/units/${unit.id}.json`;
    if (!(await exists(file))) {
      note(`Thiếu tệp nội dung ${file}`);
      continue;
    }
    const detail = await readJson(file);
    const lessons = detail.lessons || [];
    if (lessons.length !== (unit.lessons || []).length) {
      note(`Đơn vị ${unit.id}: ${lessons.length} bài trong tệp nhưng ${unit.lessons.length} bài trong lộ trình.`);
    }
    assembled.units.push({ id: unit.id, title: unit.title, lessons });

    for (const [index, lesson] of lessons.entries()) {
      lessonCount += 1;
      if (lessonIds.has(lesson.id)) note(`Trùng id bài học: ${lesson.id}`);
      lessonIds.add(lesson.id);
      const meta = unit.lessons[index];
      if (meta && meta.id !== lesson.id) note(`Đơn vị ${unit.id}: bài ${index + 1} lệch id (${meta.id} ≠ ${lesson.id}).`);
      if (!lesson.title || !lesson.goal) note(`Bài ${lesson.id} thiếu tiêu đề hoặc mục tiêu.`);
      if (!(lesson.xp > 0)) note(`Bài ${lesson.id} cần xp > 0.`);
      const exercises = lesson.exercises || [];
      if (exercises.length < 4) note(`Bài ${lesson.id} chỉ có ${exercises.length} câu hỏi.`);
      for (const exercise of exercises) {
        exerciseCount += 1;
        types.add(exercise.type);
        if (!exercise.id) note(`Bài ${lesson.id} có câu hỏi thiếu id.`);
        if (!exercise.explain) note(`Câu ${exercise.id} thiếu giải thích.`);
        if (exercise.type === 'mcq' && (!Array.isArray(exercise.options) || exercise.options.length < 2)) {
          note(`Câu ${exercise.id} cần ít nhất 2 lựa chọn.`);
        }
        if (exercise.type === 'build' && !(exercise.words || []).length) note(`Câu ${exercise.id} thiếu ngân hàng từ.`);
        if (!['mcq', 'gap', 'build', 'listen'].includes(exercise.type)) {
          note(`Câu ${exercise.id} dùng loại không hỗ trợ: ${exercise.type}`);
        }
      }
    }
  }

  for (const type of ['mcq', 'gap', 'build', 'listen']) {
    if (!types.has(type)) note(`Chương trình chưa có dạng câu hỏi "${type}".`);
  }
  summary('Lộ trình', `${units.length} đơn vị · ${lessonCount} bài · ${exerciseCount} câu hỏi`);
  return assembled;
}

async function checkVocab() {
  const file = await readJson('data/vocab.json');
  const words = file.words || [];
  if (words.length < 60) note(`Kho từ vựng chỉ có ${words.length} từ (cần tối thiểu 60).`);
  const ids = new Set();
  for (const word of words) {
    for (const field of REQUIRED_WORD_FIELDS) {
      if (!word[field]) note(`Từ ${word.id || '(thiếu id)'} thiếu trường ${field}.`);
    }
    if (ids.has(word.id)) note(`Trùng id từ vựng: ${word.id}`);
    ids.add(word.id);
    if (word.ipa && !/[a-z]/.test(word.ipa)) {
      note(`Từ ${word.id} có IPA đáng ngờ: ${word.ipa}`);
    }
  }
  summary('Từ vựng', `${words.length} từ · ${new Set(words.map((word) => word.level)).size} mức`);
  return words;
}

async function checkPapers(docIds) {
  const file = await readJson('data/papers.json');
  const papers = file.papers || [];
  if (papers.length < 25) note(`Thư viện chỉ có ${papers.length} nghiên cứu (cần tối thiểu 25).`);
  const ids = new Set();
  let withDoi = 0;
  for (const paper of papers) {
    if (ids.has(paper.id)) note(`Trùng id nghiên cứu: ${paper.id}`);
    ids.add(paper.id);
    if (!paper.title || !paper.authors) note(`Nghiên cứu ${paper.id} thiếu tiêu đề hoặc tác giả.`);
    if (!(paper.year >= 1950 && paper.year <= new Date().getFullYear() + 1)) note(`Nghiên cứu ${paper.id} có năm bất thường: ${paper.year}`);
    if (paper.doi) {
      withDoi += 1;
      if (!/^10\.\S+\/\S+$/.test(paper.doi)) note(`Nghiên cứu ${paper.id} có DOI sai định dạng: ${paper.doi}`);
    }
    if (!paper.findingVi || !paper.applyVi) note(`Nghiên cứu ${paper.id} thiếu phần tiếng Việt.`);
    for (const docId of paper.docs || []) {
      if (!docIds.has(docId)) note(`Nghiên cứu ${paper.id} trỏ tới tài liệu không tồn tại: ${docId}`);
    }
  }
  summary('Trích dẫn', `${papers.length} nghiên cứu · ${withDoi} có DOI`);
  return papers;
}

async function checkPdfs() {
  const file = await readJson('data/pdfs.json');
  const docs = file.docs || [];
  if (docs.length < 5) note(`Chỉ có ${docs.length} tài liệu PDF (cần tối thiểu 5).`);
  let withFile = 0;
  for (const doc of docs) {
    if (!(await exists(doc.file))) {
      note(`Thiếu tệp PDF: ${doc.file}`);
      continue;
    }
    const info = await stat(path.join(ROOT, doc.file));
    if (info.size < 20_000) note(`PDF ${doc.id} quá nhỏ (${info.size} byte) — có thể hỏng.`);
    else withFile += 1;
    if (!(doc.pages > 0)) note(`PDF ${doc.id} thiếu số trang.`);
    if (!doc.summary || !(doc.bullets || []).length) note(`PDF ${doc.id} thiếu tóm tắt hoặc gạch đầu dòng.`);
  }
  summary('Tài liệu PDF', `${docs.length} tài liệu · ${withFile} tệp hợp lệ`);
  return docs;
}

async function checkPrompts() {
  const file = await readJson('data/prompts.json');
  const writing = file.writing || [];
  const speaking = file.speaking || [];
  if (writing.length < 6) note(`Chỉ có ${writing.length} đề Writing.`);
  if (speaking.length < 6) note(`Chỉ có ${speaking.length} cue card Speaking.`);
  for (const prompt of writing) {
    if (![1, 2].includes(prompt.task)) note(`Đề ${prompt.id} có task không hợp lệ.`);
    if (!(prompt.minWords >= 150)) note(`Đề ${prompt.id} cần tối thiểu 150 từ.`);
    if (!(prompt.outline || []).length || !(prompt.checklist || []).length) note(`Đề ${prompt.id} thiếu dàn ý hoặc checklist.`);
  }
  for (const card of speaking) {
    if (card.part !== 2) note(`Cue card ${card.id} phải là Part 2.`);
    if (!(card.cue || []).length || !card.sample) note(`Cue card ${card.id} thiếu gợi ý hoặc bài mẫu.`);
  }
  summary('Đề luyện', `${writing.length} đề Writing · ${speaking.length} cue card Speaking`);
}

async function checkPages() {
  const pages = [
    ['index.html', 'dashboard', true],
    ['hoc.html', 'learn', true],
    ['bai-hoc.html', 'lesson', true],
    ['luyen-tap.html', 'practice', true],
    ['thu-vien.html', 'library', true],
    ['tien-do.html', 'progress', true],
    ['404.html', 'not-found', false],
  ];
  for (const [file, page, isApp] of pages) {
    if (!(await exists(file))) {
      note(`Thiếu trang ${file}`);
      continue;
    }
    const html = await readFile(path.join(ROOT, file), 'utf8');
    if (!html.includes('lang="vi"')) note(`${file} thiếu thuộc tính lang="vi".`);
    if (!html.includes(`data-page="${page}"`)) note(`${file} thiếu data-page="${page}".`);
    if (!html.includes('manifest.webmanifest')) note(`${file} chưa khai báo manifest PWA.`);
    if (isApp && !html.includes('js/browser.js')) note(`${file} chưa nạp js/browser.js.`);
    if (/lorem ipsum|TODO|FIXME/i.test(html)) note(`${file} còn nội dung tạm.`);
    for (const match of html.matchAll(/href="\.\/(library\/[^"]+\.pdf)"/g)) {
      if (!(await exists(match[1]))) note(`${file} liên kết tới PDF không tồn tại: ${match[1]}`);
    }
  }
  for (const asset of ['css/app.css', 'js/app.js', 'js/browser.js', 'img/favicon.svg', 'manifest.webmanifest', 'sw.js', 'robots.txt', '404.html']) {
    if (!(await exists(asset))) note(`Thiếu tệp bắt buộc: ${asset}`);
  }
  const manifest = await readJson('manifest.webmanifest');
  if (manifest.lang !== 'vi') note('manifest.webmanifest phải khai báo lang = vi.');
  if (!(manifest.icons || []).length) note('manifest.webmanifest thiếu icon.');
  summary('Trang & PWA', `${pages.length} trang HTML · manifest + service worker`);
}

const report = [];
const summary = (label, detail) => report.push(`  ${label.padEnd(14)} ${detail}`);

async function run() {
  const assembled = await checkCurriculum();
  await checkVocab();
  await checkPdfs();
  const docs = await readJson('data/pdfs.json');
  const docIds = new Set((docs.docs || []).map((doc) => doc.id));
  await checkPapers(docIds);
  await checkPrompts();
  await checkPages();

  console.log('Đã kiểm tra nội dung trong vi/:');
  console.log(report.join('\n'));

  if (problems.length > 0) {
    console.error(`\n${problems.length} vấn đề:`);
    for (const problem of problems) console.error(`  ✗ ${problem}`);
    process.exit(1);
  }
  console.log('\nKhông phát hiện vấn đề nào.');
  void assembled;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
