import { skills, units } from './lessons.js';
import { lessonState } from './learning.js';

export const icon = (name, size = 20) => `<svg aria-hidden="true" width="${size}" height="${size}"><use href="media/icons.svg#${name}"></use></svg>`;
const statusLabel = { ready: 'Bắt đầu', done: 'Học lại', locked: 'Chưa mở' };
const statusIcon = { ready: 'arrow', done: 'check', locked: 'lock' };

export function pathMarkup(progress) {
  return units.map((unit, index) => `
    <section class="unit" aria-labelledby="${unit.id}-title">
      <header class="unit-head">
        <span class="unit-number">0${index + 1}</span>
        <div><p class="eyebrow">CHẶNG ${index + 1}</p><h3 id="${unit.id}-title">${unit.title}</h3><p class="unit-description">${unit.description}</p></div>
      </header>
      <ol class="unit-lessons">
        ${unit.lessons.map(lesson => {
          const state = lessonState(lesson, progress);
          return `<li><button class="lesson" type="button" data-lesson="${lesson.id}" data-state="${state}" ${state === 'locked' ? 'disabled' : ''}>
            <span class="tile ${lesson.skill}">${icon(lesson.skill, 22)}</span>
            <span class="lesson-copy"><span class="lesson-meta">${skills[lesson.skill].label} · ${lesson.minutes} phút</span><strong>${lesson.title}</strong></span>
            <span class="lesson-state"><span>${statusLabel[state]}</span>${icon(statusIcon[state], 17)}</span>
          </button></li>`;
        }).join('')}
      </ol>
    </section>`).join('');
}
