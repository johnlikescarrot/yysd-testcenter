/** Truy vấn chương trình học: đơn vị, bài, khoá mở, bài kế tiếp. */

/** Tìm đơn vị theo id. */
export function findUnit(curriculum, unitId) {
  return (curriculum?.units || []).find((unit) => unit.id === unitId) || null;
}

/** Tìm bài học (kèm đơn vị) theo id. */
export function findLesson(curriculum, lessonId) {
  for (const unit of curriculum?.units || []) {
    const lesson = (unit.lessons || []).find((item) => item.id === lessonId);
    if (lesson) return { unit, lesson };
  }
  return null;
}

/** Danh sách phẳng toàn bộ bài học theo thứ tự chương trình. */
export function allLessons(curriculum) {
  const rows = [];
  for (const unit of curriculum?.units || []) {
    for (const lesson of unit.lessons || []) {
      rows.push({ unit, lesson });
    }
  }
  return rows;
}

/** Tiến độ một đơn vị. */
export function unitProgress(state, unit) {
  const lessons = unit?.lessons || [];
  const done = lessons.filter((lesson) => Boolean(state?.lessonsDone?.[lesson.id])).length;
  const total = lessons.length;
  return { done, total, ratio: total > 0 ? done / total : 0 };
}

/** Đơn vị đã hoàn thành chưa. */
export function isUnitDone(state, unit) {
  const progress = unitProgress(state, unit);
  return progress.total > 0 && progress.done === progress.total;
}

/** Đơn vị đầu tiên luôn mở; các đơn vị sau cần 60% đơn vị trước. */
export function isUnitUnlocked(state, curriculum, unit) {
  const units = curriculum?.units || [];
  const index = units.findIndex((item) => item.id === unit?.id);
  if (index <= 0) return index === 0;
  const previous = units[index - 1];
  return unitProgress(state, previous).ratio >= 0.6;
}

/** Bài học mở khi bài trước đã xong (bài đầu của đơn vị cần đơn vị đã mở). */
export function isLessonUnlocked(state, curriculum, unit, lesson) {
  if (!isUnitUnlocked(state, curriculum, unit)) return false;
  const lessons = unit?.lessons || [];
  const index = lessons.findIndex((item) => item.id === lesson?.id);
  if (index <= 0) return index === 0;
  return Boolean(state?.lessonsDone?.[lessons[index - 1].id]);
}

/** Bài học kế tiếp người học nên làm. */
export function nextLesson(state, curriculum) {
  for (const unit of curriculum?.units || []) {
    if (!isUnitUnlocked(state, curriculum, unit)) continue;
    for (const lesson of unit.lessons || []) {
      if (!state?.lessonsDone?.[lesson.id]) return { unit, lesson };
    }
  }
  return null;
}

/** Tiến độ toàn khoá. */
export function courseProgress(state, curriculum) {
  const rows = allLessons(curriculum);
  const done = rows.filter((row) => Boolean(state?.lessonsDone?.[row.lesson.id])).length;
  const total = rows.length;
  return { done, total, ratio: total > 0 ? done / total : 0 };
}

/** Trạng thái hiển thị của một đơn vị: done | current | locked. */
export function unitStatus(state, curriculum, unit) {
  if (isUnitDone(state, unit)) return 'done';
  if (isUnitUnlocked(state, curriculum, unit)) return 'current';
  return 'locked';
}

/** Kiểm tra cấu trúc chương trình; trả về mảng lỗi (rỗng là hợp lệ). */
export function validateCurriculum(curriculum) {
  const errors = [];
  const units = curriculum?.units;
  if (!Array.isArray(units) || units.length === 0) {
    errors.push('Chương trình phải có ít nhất một đơn vị.');
    return errors;
  }
  const lessonIds = new Set();
  const unitIds = new Set();
  const exerciseIds = new Set();
  for (const unit of units) {
    if (!unit.id) errors.push('Đơn vị thiếu id.');
    if (unitIds.has(unit.id)) errors.push(`Trùng id đơn vị: ${unit.id}`);
    unitIds.add(unit.id);
    if (!unit.title) errors.push(`Đơn vị ${unit.id} thiếu tiêu đề.`);
    if (!Array.isArray(unit.lessons) || unit.lessons.length === 0) {
      errors.push(`Đơn vị ${unit.id} không có bài học.`);
      continue;
    }
    for (const lesson of unit.lessons) {
      if (!lesson.id) errors.push(`Bài trong ${unit.id} thiếu id.`);
      if (lessonIds.has(lesson.id)) errors.push(`Trùng id bài: ${lesson.id}`);
      lessonIds.add(lesson.id);
      if (!lesson.title) errors.push(`Bài ${lesson.id} thiếu tiêu đề.`);
      if (!(lesson.xp > 0)) errors.push(`Bài ${lesson.id} cần xp > 0.`);
      if (!Array.isArray(lesson.exercises) || lesson.exercises.length === 0) {
        errors.push(`Bài ${lesson.id} không có bài tập.`);
        continue;
      }
      for (const exercise of lesson.exercises) {
        if (!exercise.id) errors.push(`Bài ${lesson.id} có câu hỏi thiếu id.`);
        if (exerciseIds.has(exercise.id)) errors.push(`Trùng id câu hỏi: ${exercise.id}`);
        exerciseIds.add(exercise.id);
        if (!exercise.explain) errors.push(`Câu ${exercise.id} thiếu giải thích.`);
        if (!['mcq', 'gap', 'build', 'listen'].includes(exercise.type)) {
          errors.push(`Câu ${exercise.id} có loại không hỗ trợ: ${exercise.type}`);
          continue;
        }
        if (exercise.type === 'mcq') {
          if (!Array.isArray(exercise.options) || exercise.options.length < 2) {
            errors.push(`Câu ${exercise.id} cần ít nhất 2 lựa chọn.`);
          }
          if (!Number.isInteger(exercise.answer)) errors.push(`Câu ${exercise.id} thiếu chỉ số đáp án.`);
        }
        if (exercise.type === 'build' && (!Array.isArray(exercise.words) || exercise.words.length === 0)) {
          errors.push(`Câu ${exercise.id} thiếu ngân hàng từ.`);
        }
        if (['gap', 'listen', 'build'].includes(exercise.type) && !exercise.answer) {
          errors.push(`Câu ${exercise.id} thiếu đáp án.`);
        }
      }
    }
  }
  return errors;
}
