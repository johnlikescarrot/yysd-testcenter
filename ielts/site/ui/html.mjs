export function escape(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

export function icon(id, className = '') {
  return `<svg class="icon ${className}" width="24" height="24" aria-hidden="true" focusable="false"><use href="media/icons.svg#${id}"></use></svg>`;
}

export const lessonLink = (id) => `practice.html?bai=${encodeURIComponent(id)}`;
export const reviewLink = 'practice.html?on-tap=1';

export function dayLabel(day, options) {
  return new Intl.DateTimeFormat('vi-VN', { timeZone: 'UTC', ...options }).format(new Date(day));
}

export function emptyState(symbol, heading, detail, href, action) {
  return `<section class="panel empty-state"><span class="tile tile--listen">${icon(symbol)}</span>
    <h2>${heading}</h2><p>${detail}</p><a class="button" href="${href}">${action} ${icon('arrow')}</a></section>`;
}
