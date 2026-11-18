import lessons from '../content/lessons.json' with { type: 'json' };

export const skills = {
  listen: { label: 'Nghe', english: 'Listening' },
  read: { label: 'Đọc', english: 'Reading' },
  write: { label: 'Viết', english: 'Writing' },
  speak: { label: 'Nói', english: 'Speaking' },
};

export const units = [
  { number: '01', name: 'Xây nền tảng', detail: 'Làm quen với nhịp luyện thi' },
  { number: '02', name: 'Luyện chiến thuật', detail: 'Đi sâu vào những lỗi dễ mắc' },
];

export { lessons };
export const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
export const graded = (item) => item.kind === 'choice' || item.kind === 'input';
export const questions = new Map(lessons.flatMap((lesson) => lesson.items
  .filter(graded).map((item) => [item.id, { lesson, item }])));
