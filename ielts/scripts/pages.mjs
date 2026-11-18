import guides from '../content/guides.json' with { type: 'json' };
import references from '../content/references.json' with { type: 'json' };
import { lessons, skills, units } from '../site/catalog.mjs';
import { goals } from '../site/study.mjs';
import { escape, icon, lessonLink } from '../site/ui/html.mjs';

const brand = 'IELTS Mỗi Ngày';
const menu = [
  ['home', './#lo-trinh', 'compass', 'Lộ trình'],
  ['review', 'review.html', 'review', 'Ôn tập'],
  ['resources', 'resources.html', 'paper', 'Tài liệu'],
  ['progress', 'progress.html', 'bars', 'Tiến độ'],
];
const storageNotice = `<p class="notice" role="status" data-storage-notice hidden>Không thể lưu hoặc đọc tiến độ trên thiết bị này. Bạn vẫn có thể luyện, nhưng tiến độ có thể mất khi rời trang.</p>`;

function layout({ title, description, view = '', active = view, body, mainClass = 'page shell page--narrow' }) {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(description)}">
  <meta name="theme-color" content="#f5f6f7">
  <title>${escape(title)}</title>
  <link rel="icon" type="image/svg+xml" href="media/mark.svg">
  <link rel="stylesheet" href="style.css">
  ${view ? '<script type="module" src="app.js"></script>' : ''}
</head>
<body${view ? ` data-view="${view}"` : ''}>
  <a class="skip" href="#main">Chuyển đến nội dung chính</a>
  <header class="site-header"><div class="site-header__inner shell">
    <a class="brand" href="./"><img class="brand__mark" src="media/mark.svg" width="39" height="39" alt="">
      <span><strong class="brand__name">${brand}</strong><small class="brand__meta">HỌC CÙNG YYSD</small></span></a>
    <nav class="site-nav" aria-label="Điều hướng chính">${menu.map(([id, href, pictogram, name]) =>
      `<a href="${href}"${active === id ? ' aria-current="page"' : ''}>${icon(pictogram)} ${name}</a>`).join('')}</nav>
  </div></header>
  <main id="main" tabindex="-1" class="${mainClass}">
    ${view ? `${storageNotice}<noscript><p class="notice">Hãy bật JavaScript để lưu tiến độ và làm bài. Bạn vẫn có thể <a href="resources.html">đọc tài liệu luyện thi</a>.</p></noscript>` : ''}
    ${body}
  </main>
  <footer class="site-footer"><div class="shell"><span><strong>YYSD</strong> · ${brand}</span><span>Tự luyện IELTS Academic · Không phải bài thi chính thức</span></div></footer>
</body>
</html>\n`;
}

function heading(kicker, title, description) {
  return `<header class="page-heading"><p class="eyebrow">${kicker}</p><h1>${title}</h1><p>${description}</p></header>`;
}

function pathGroup(unit, index) {
  return `<section class="group" aria-labelledby="unit-${unit.number}">
    <header class="group__head"><span class="unit-number" aria-hidden="true">${unit.number}</span><div>
      <h3 id="unit-${unit.number}">Chặng ${index + 1} · ${unit.name}</h3><p>${unit.detail}</p></div></header>
    <ol class="lesson-list">${lessons.filter((lesson) => lesson.unit === index + 1).map((lesson) => `
      <li class="lesson-row" data-lesson="${lesson.id}"><a href="${lessonLink(lesson.id)}">
        <span class="tile tile--${lesson.skill}">${icon(lesson.skill)}</span><span><strong>${lesson.title}</strong>
          <small>${skills[lesson.skill].label} <span aria-hidden="true">·</span> ${lesson.minutes} phút</small></span>
        <span data-lesson-status></span>${icon('chevron', 'lesson-row__go')}</a></li>`).join('')}</ol></section>`;
}

function homePage() {
  return layout({
    title: `${brand} · Luyện bốn kỹ năng`,
    description: 'Lộ trình IELTS Academic bằng tiếng Việt: luyện Nghe, Đọc, Viết, Nói trong các bài ngắn và ôn tập theo lịch riêng.',
    view: 'home', mainClass: 'home shell',
    body: `<section class="hero" aria-labelledby="hero-title"><div class="hero__copy">
      <p class="eyebrow">GÓC TỰ HỌC · <span lang="en">IELTS ACADEMIC</span></p>
      <h1 id="hero-title">Luyện IELTS,<br><em>từng ngày một.</em></h1>
      <p>Mỗi ngày một bài ngắn để vững cả bốn kỹ năng. Làm bài, hiểu vì sao, rồi ôn lại đúng lúc.</p>
      <div class="hero__actions"><a class="button" href="${lessonLink(lessons[0].id)}" data-next><span>Bắt đầu luyện</span>${icon('arrow')}</a>
        <span class="meta">${icon('clock')} 5–8 phút mỗi bài</span></div></div>
      <img class="hero__art" src="media/study-notebook.svg" width="504" height="290" fetchpriority="high" alt="">
    </section>
    <div class="home-grid">
      <section class="path" id="lo-trinh" aria-labelledby="path-title">
        <header class="section-heading"><div><h2 id="path-title">Lộ trình bốn kỹ năng</h2><p>Học theo thứ tự gợi ý hoặc chọn kỹ năng bạn muốn luyện.</p></div>
          <span class="pill" data-completed>0 / ${lessons.length} bài đã học</span></header>
        ${units.map(pathGroup).join('')}
      </section>
      <aside class="sidebar" aria-label="Theo dõi việc học">
        <section class="panel"><h2 class="panel-title">${icon('target')} Mục tiêu hôm nay</h2><div data-goal-today></div>
          <a class="panel-link" href="progress.html#my-goal">Đổi mục tiêu ${icon('chevron')}</a></section>
        <section class="panel"><h2 class="panel-title panel-title--gold">${icon('flame')} Chuỗi ngày học</h2>
          <p><strong class="streak-count" data-streak>0</strong> ngày liên tiếp</p><div data-week></div>
          <a class="panel-link" href="review.html"><span data-review-note>Lịch ôn tập của bạn</span> ${icon('chevron')}</a></section>
        <section class="panel side-note"><h2 class="panel-title">${icon('spark')} Mẹo học hôm nay</h2><p>Thử tự trả lời trước khi xem lời giải. Hôm sau, quay lại thử một lần nữa mà không nhìn tài liệu.</p>
          <a class="panel-link" href="14-ngay-hoc-deu.html">Đọc kế hoạch 14 ngày ${icon('chevron')}</a></section>
      </aside>
    </div>`,
  });
}

function reviewPage() {
  const description = 'Gợi nhớ những câu đã làm và ôn lại theo lịch của riêng bạn.';
  return layout({ title: `Ôn tập · ${brand}`, description, view: 'review', body: `
    ${heading('GIÃN CÁCH LƯỢT LUYỆN', 'Ôn tập theo lịch', description)}<div data-view-content></div>` });
}

function progressPage() {
  const description = 'Theo dõi bài đã hoàn thành, điểm luyện tập và thói quen học của bạn.';
  return layout({ title: `Tiến độ · ${brand}`, description, view: 'progress', body: `
    ${heading('SỔ THEO DÕI', 'Tiến độ của bạn', description)}
    <dl class="summary-grid" data-progress-summary></dl>
    <div class="progress-grid"><div>
      <section class="panel" id="my-goal"><h2>Mục tiêu hôm nay</h2><div data-goal-today></div>
        <div class="goal-field"><label for="daily-goal">Mục tiêu mỗi ngày</label><select id="daily-goal">
          ${goals.map((goal) => `<option value="${goal}">${goal} XP</option>`).join('')}
        </select></div><p class="mini-note" role="status" data-goal-message></p></section>
      <section class="panel"><h2>Bảy ngày gần nhất</h2><div data-week></div>
        <p class="mini-note">Hoàn thành một bài hoặc lượt ôn để thêm một ngày học.</p></section>
    </div><div>
      <section class="panel"><h2>Bốn kỹ năng</h2><ul class="skill-list" data-skills></ul></section>
      <section class="panel"><h2>Cột mốc học tập</h2><ul class="achievement-list" data-milestones></ul></section>
    </div></div>
    <p class="mini-note privacy-note">Tiến độ lưu trên trình duyệt này, không đồng bộ qua thiết bị. XP không phải điểm thi IELTS.</p>` });
}

function practicePage() {
  return layout({ title: `Bài luyện · ${brand}`, description: 'Làm bài luyện IELTS ngắn và xem giải thích sau từng câu.', view: 'practice', active: 'home',
    body: `<a class="back-link" href="./#lo-trinh">${icon('back')} Về lộ trình</a><div data-view-content></div>` });
}

function resourcesPage() {
  const description = 'Đọc cẩm nang tiếng Việt hoặc tải PDF để học ngoài mạng. Mỗi tài liệu ghi rõ nguồn tham khảo và giới hạn của nghiên cứu.';
  return layout({ title: `Tài liệu · ${brand}`, description, active: 'resources', body: `
    ${heading('THƯ VIỆN LUYỆN THI', 'Tài liệu luyện IELTS', description)}
    <ul class="resource-list">${guides.map((guide) => `<li class="panel resource">
      <span class="tile tile--read">${icon('paper')}</span><div><p class="eyebrow">${guide.category}</p><h2>${guide.title}</h2><p>${guide.description}</p>
      <div class="actions"><a class="button" href="${guide.id}.html" aria-label="Đọc trên web: ${guide.title}">Đọc trên web ${icon('arrow')}</a>
        <a class="button button--quiet" download href="pdf/${guide.id}.pdf" aria-label="Tải PDF: ${guide.title}">${icon('download')} Tải PDF</a></div>
      </div></li>`).join('')}</ul>` });
}

const token = /\[@([a-z0-9-]+)\]/g;

export function citationIds(guide) {
  return [...new Set(guide.sections.flatMap((section) => section.paragraphs.flatMap((paragraph) =>
    Array.from(paragraph.matchAll(token), (match) => match[1]))))];
}

function referenceItem(id, index) {
  const ref = references[id];
  if (!ref.doi) return `<li id="ref-${id}"><span lang="en">${escape(ref.authors)}. ${escape(ref.title)}.</span> <a href="${ref.url}">Tài liệu chính thức của IELTS</a></li>`;
  const doiUrl = `https://doi.org/${ref.doi}`;
  const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(`"${ref.title}"`)}`;
  const title = ref.title + (/[.?]$/.test(ref.title) ? '' : '.');
  return `<li id="ref-${id}"><span lang="en">${escape(ref.authors)} (${ref.year}). ${escape(title)} <i>${escape(ref.venue)}</i>.</span><br>
    <a href="${escape(doiUrl)}" aria-label="DOI của nguồn ${index + 1}">DOI: ${escape(ref.doi)}</a>
    <a href="${escape(scholarUrl)}" aria-label="Tra nguồn ${index + 1} trên Google Scholar">Tra trên Google Scholar</a></li>`;
}

function guidePage(guide) {
  const citations = citationIds(guide);
  const para = (text) => `<p>${escape(text).replace(token, (_, id) => {
    const number = citations.indexOf(id) + 1;
    return `<a class="citation" href="#ref-${id}" aria-label="Xem nguồn ${number}">[${number}]</a>`;
  })}</p>`;
  return layout({ title: `${guide.title} · ${brand}`, description: guide.description, active: 'resources', body: `
    <a class="back-link" href="resources.html">${icon('back')} Về tài liệu</a>
    <article class="guide"><header class="page-heading"><p class="eyebrow">${guide.category}</p><h1>${guide.title}</h1><p>${guide.description}</p>
      <a class="button" download href="pdf/${guide.id}.pdf">${icon('download')} Tải PDF</a></header>
    ${guide.sections.map((section) => `<section><h2>${section.title}</h2>${section.paragraphs.map(para).join('')}${section.example
      ? `<blockquote lang="en">${escape(section.example)}</blockquote>` : ''}</section>`).join('')}
    <section><h2>Nguồn tham khảo</h2><p>Liên kết DOI dẫn tới bài gốc. Google Scholar giúp tìm các phiên bản được lập chỉ mục, không phải nhà xuất bản.</p>
    <ol class="references">${citations.map(referenceItem).join('')}</ol></section></article>` });
}

export function pages() {
  return new Map([
    ['index.html', homePage()], ['review.html', reviewPage()], ['progress.html', progressPage()],
    ['practice.html', practicePage()], ['resources.html', resourcesPage()],
    ...guides.map((guide) => [`${guide.id}.html`, guidePage(guide)]),
  ]);
}
