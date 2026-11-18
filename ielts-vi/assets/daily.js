import { decks } from './deck.js';

// Interleave topics before choosing five cards per civil day. Each ID belongs
// to a source term, not to its position in today's batch or the answer order.
const key = (value) => [...value].reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0, 7);
const cards = decks.flatMap(([topic, rows]) => rows.map(([id, term, gloss, sentence], position) => ({
  id: `word-${id}`, topic, position, term, gloss, sentence,
}))).sort((a, b) => a.position - b.position || a.id.localeCompare(b.id, 'en'));
export const dailySize = 5;
export const dailyIds = (day) => Array.from({ length: dailySize }, (_, i) => cards[(day * dailySize + i) % cards.length].id);

export const dailyQuestions = cards.map((card, index) => {
  // Different topics avoid ambiguous near-synonyms such as fridge/refrigerator.
  const options = [];
  for (let i = index + 1; options.length < 3; i += 1) {
    const other = cards[i % cards.length];
    if (other.topic !== card.topic && other.gloss !== card.gloss && !options.includes(other.gloss)) options.push(other.gloss);
  }
  const answer = key(card.id) % 4;
  options.splice(answer, 0, card.gloss);
  return {
    id: card.id, lessonId: 'daily', type: 'choice', answer, options, optionLang: 'vi',
    prompt: `${card.sentence}\n\nWhat does “${card.term.toLowerCase()}” mean here?`,
    explanation: `Trong chủ đề ${card.topic.toLocaleLowerCase('vi')}, “${card.term.toLowerCase()}” có nghĩa là ${card.gloss}. Hãy nói một câu mới có dùng từ này.`,
  };
});
