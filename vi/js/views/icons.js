/** Bộ biểu tượng SVG nội tuyến (nét mảnh, 24×24) — không phụ thuộc mạng. */

const PATHS = {
  home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  book: '<path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M8 20a3 3 0 0 1-3-3V4"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  library: '<path d="M4 5h5v15H4zM11 5h4v15h-4zM17 6l3 14"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  flame: '<path d="M12 3c3 4 6 6 6 10a6 6 0 0 1-12 0c0-3 2-5 3-7 0 2 1 3 2 3 0-2 0-4 1-6z"/>',
  bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
  gem: '<path d="m12 3 7 5-7 13L5 8z"/><path d="M5 8h14M9 8l3 13M15 8l-3 13"/>',
  heart: '<path d="M12 20s-7-4.6-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.4 12 20 12 20z"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  pencil: '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="m14 6 4 4"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  download: '<path d="M12 4v10M7 11l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  external: '<path d="M14 4h6v6M20 4l-8 8"/><path d="M18 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>',
  spark: '<path d="M12 3v5M12 16v5M4 12h5M15 12h5M6.5 6.5l3 3M14.5 14.5l3 3M17.5 6.5l-3 3M9.5 14.5l-3 3"/>',
  cards: '<rect x="3" y="6" width="12" height="14" rx="2"/><path d="M9 3h9a2 2 0 0 1 2 2v11"/>',
  crown: '<path d="M4 17 6 7l4 4 2-6 2 6 4-4 2 10z"/><path d="M5 20h14"/>',
  flag: '<path d="M6 21V4M6 4h11l-2 4 2 4H6"/>',
  repeat: '<path d="m4 9 3-3 3 3"/><path d="M7 6h9a4 4 0 0 1 4 4v2"/><path d="m20 15-3 3-3-3"/><path d="M17 18H8a4 4 0 0 1-4-4v-2"/>',
  volume: '<path d="M5 10v4h3l4 4V6L8 10z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
  info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8h.01"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  quote: '<path d="M8 6c-2 1-3 3-3 5v5h5v-5H7c0-1 .4-2 1.5-2.5zM18 6c-2 1-3 3-3 5v5h5v-5h-3c0-1 .4-2 1.5-2.5z"/>',
  star: '<path d="m12 4 2.4 5 5.6.8-4 4 1 5.6-5-2.7-5 2.7 1-5.6-4-4L10 9.6z"/>',
  shield: '<path d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
};

/** SVG cho một biểu tượng; tự đánh dấu trang trí cho trình đọc màn hình. */
export function icon(name, className = '') {
  const path = PATHS[name] || PATHS.info;
  const cls = className ? ` class="${className}"` : '';
  return `<svg${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
}
