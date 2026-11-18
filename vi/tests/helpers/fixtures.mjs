/** Dữ liệu mẫu dùng chung cho kiểm thử. */

export const NOW = new Date('2026-11-18T09:00:00').getTime();
export const DAY = 86400000;

export function exercise(overrides = {}) {
  return {
    id: 'ex-1',
    type: 'mcq',
    skill: 'reading',
    prompt: 'Chọn đáp án đúng',
    stem: 'Câu hỏi?',
    options: ['A', 'B', 'C'],
    answer: 1,
    explain: 'Giải thích',
    ...overrides,
  };
}

export function lesson(overrides = {}) {
  return {
    id: 'lesson-1',
    title: 'Bài một',
    goal: 'Mục tiêu',
    xp: 10,
    exercises: [exercise()],
    ...overrides,
  };
}

export const CURRICULUM = {
  version: 1,
  units: [
    {
      id: 'unit-1',
      order: 1,
      skill: 'reading',
      skillLabel: 'Reading · Đọc hiểu',
      level: 'A2',
      title: 'Đơn vị một',
      icon: 'book',
      blurb: 'Mô tả đơn vị một',
      lessons: [
        { id: 'lesson-1', title: 'Bài một', goal: 'Mục tiêu 1', xp: 10, exercises: 5 },
        { id: 'lesson-2', title: 'Bài hai', goal: 'Mục tiêu 2', xp: 10, exercises: 5 },
      ],
    },
    {
      id: 'unit-2',
      order: 2,
      skill: 'listening',
      skillLabel: 'Listening · Nghe',
      level: 'B1',
      title: 'Đơn vị hai',
      icon: 'headphones',
      blurb: 'Mô tả đơn vị hai',
      lessons: [{ id: 'lesson-3', title: 'Bài ba', goal: 'Mục tiêu 3', xp: 12, exercises: 5 }],
    },
  ],
};

export const VOCAB = [
  {
    id: 'analyse', term: 'analyse', ipa: 'ˈæn.əl.aɪz', pos: 'verb', vi: 'phân tích',
    enDef: 'to examine in detail', example: 'Researchers analyse the data.',
    exampleVi: 'Các nhà nghiên cứu phân tích dữ liệu.', colloc: ['analyse the data'],
    tags: ['Học thuật'], level: 'B1',
  },
  {
    id: 'benefit', term: 'benefit', ipa: 'ˈben.ɪ.fɪt', pos: 'noun', vi: 'lợi ích',
    enDef: 'an advantage', example: 'It brings benefits.',
    exampleVi: 'Nó mang lại lợi ích.', colloc: ['a major benefit'],
    tags: ['Học thuật'], level: 'B1',
  },
  {
    id: 'context', term: 'context', ipa: 'ˈkɒn.tekst', pos: 'noun', vi: 'ngữ cảnh',
    enDef: 'the situation', example: 'Words need context.',
    exampleVi: 'Từ cần ngữ cảnh.', colloc: ['in context'],
    tags: ['Học thuật'], level: 'B1',
  },
  {
    id: 'factor', term: 'factor', ipa: 'ˈfæk.tər', pos: 'noun', vi: 'yếu tố',
    enDef: 'one element', example: 'Cost is a factor.',
    exampleVi: 'Chi phí là một yếu tố.', colloc: ['a key factor'],
    tags: ['Học thuật'], level: 'B1',
  },
];

export const PROMPTS = {
  writing: [
    {
      id: 'w1', task: 1, minutes: 20, minWords: 150, title: 'Đề một',
      prompt: 'The chart shows something.', outline: ['Mở bài', 'Thân bài'],
      phrases: ['stood at'], model: 'Model answer.', checklist: ['Đủ 150 từ'],
    },
    {
      id: 'w2', task: 2, minutes: 40, minWords: 250, title: 'Đề hai',
      prompt: 'Discuss both views.', outline: ['Mở bài', 'Kết luận'],
      phrases: ['in my view'], model: 'Another model.', checklist: ['Đủ 250 từ'],
    },
  ],
  speaking: [
    {
      id: 's1', part: 2, topic: 'Kỹ năng', title: 'Describe a skill',
      cue: ['what it is', 'when you learned it'], prep: 60, speak: 120,
      sample: 'I would like to talk about…', tips: ['Dùng quá khứ'],
    },
  ],
};

export const PAPERS = [
  {
    id: 'p1', authors: 'Cepeda, N. J.', year: 2006, title: 'Distributed practice',
    venue: 'Psychological Bulletin', doi: '10.1037/0033-2909.132.3.354', tags: ['phuong-phap'],
    findingVi: 'Ôn ngắt quãng hiệu quả hơn.', applyVi: 'Lịch ôn 1–3–7.', docs: ['doc-a'],
  },
  {
    id: 'p2', authors: 'Nation, I. S. P.', year: 2006, title: 'How large a vocabulary',
    venue: 'Canadian Modern Language Review', doi: null, tags: ['tu-vung', 'doc'],
    findingVi: 'Cần 8.000 họ từ.', applyVi: 'Kho từ theo tần suất.', docs: ['doc-a', 'doc-b'],
  },
  {
    id: 'p3', authors: 'Roediger, H. L.', year: 2006, title: 'Test-enhanced learning',
    venue: 'Psychological Science', doi: '10.1111/j.1467-9280.2006.01693.x', tags: ['phuong-phap'],
    findingVi: 'Tự kiểm tra giúp nhớ lâu.', applyVi: 'Bài tập tự kiểm tra.', docs: [],
  },
];

export const DOCS = [
  {
    id: 'doc-a', file: 'library/pdf/cam-nang.pdf', kicker: 'Lộ trình', title: 'Cẩm nang',
    pages: 4, level: 'A2–B1', summary: 'Tóm tắt', bullets: ['Một', 'Hai'], tags: ['phuong-phap'],
  },
  {
    id: 'doc-b', file: 'library/pdf/tu-vung.pdf', kicker: 'Từ vựng', title: 'Từ vựng',
    pages: 4, level: 'B1', summary: 'Tóm tắt 2', bullets: ['Ba'], tags: ['tu-vung'],
  },
];

export function lessonData(overrides = {}) {
  return {
    unit: CURRICULUM.units[0],
    lesson: {
      ...lesson(),
      exercises: [
        exercise({ id: 'q1', type: 'mcq', options: ['A', 'B', 'C'], answer: 1 }),
        exercise({ id: 'q2', type: 'gap', stem: 'The ___ is here.', answer: 'answer', accept: ['reply'], hint: 'Bắt đầu bằng a' }),
        exercise({ id: 'q3', type: 'build', words: ['a', 'is', 'This', 'test'], answer: 'This is a test' }),
        exercise({ id: 'q4', type: 'listen', audio: 'Open the door.', answer: 'Open the door.' }),
      ],
    },
    ...overrides,
  };
}

export const DATA = {
  curriculum: CURRICULUM,
  vocab: VOCAB,
  prompts: PROMPTS,
  papers: PAPERS,
  docs: DOCS,
  wordOfDay: VOCAB[0],
};
