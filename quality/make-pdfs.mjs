import { createWriteStream } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import PDFDocument from 'pdfkit';
import { loadWorkbooks } from './workbooks.mjs';
import { citation, doiLink, guides, scholarLink } from './materials.mjs';

const require = createRequire(import.meta.url);
const fonts = {
  regular: require.resolve('@expo-google-fonts/noto-sans/400Regular/NotoSans_400Regular.ttf'),
  bold: require.resolve('@expo-google-fonts/noto-sans/700Bold/NotoSans_700Bold.ttf'),
};
const fontLicense = await readFile(require.resolve('@expo-google-fonts/noto-sans/LICENSE_FONT'));
const resource = (name) => new URL(`../ielts-vi/resources/${name}`, import.meta.url);
const plain = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const htmlCitations = (value) => plain(value).replaceAll(/\[(\d+(?:, \d+)*)\]/g, (_, ids) => (
  `[${ids.split(', ').map((id) => `<a href="#nguon-${id}">${id}</a>`).join(', ')}]`
));
const ink = '#241c32';
const muted = '#5c5369';
const purple = '#4b31a2';
// Preserve individual Unicode characters for PDF search and copy/paste.
const fontFeatureOptions = { features: { ccmp: false, liga: false, clig: false, dlig: false } };

const countWords = (books) => books.reduce((sum, book) => sum + book.rows.length, 0);
function appendixHtml(books) {
  if (!books.length) return '';
  const topics = books.map(({ topic, rows }) => {
    const entries = rows.map(({ term, meaning, example, note }) => `          <li><b lang="en">${plain(term)}</b> — ${plain(meaning)}<br><i lang="en">${plain(example)}</i>${note ? `<br>${plain(note)}` : ''}</li>`);
    return `      <details><summary>${plain(topic)} · ${rows.length} mục</summary>\n        <ol>\n${entries.join('\n')}\n        </ol>\n      </details>`;
  });
  return `    <section class="appendix" id="phu-luc"><h2>Phụ lục từ vựng Anh – Việt</h2>
      <p>${countWords(books)} mục từ kho bài tập YYSD. Mở từng chủ đề để tra nghĩa và đọc câu ví dụ. Các trích dẫn phía trên giải thích phương pháp học, không phải nguồn của các câu ví dụ.</p>
${topics.join('\n')}
    </section>\n`;
}

function html(guide, books) {
  const sections = guide.pages.flat().map(({ heading, paragraphs, list }) => [
    `    <section>\n      <h2>${plain(heading)}</h2>`,
    ...paragraphs.map((paragraph) => `      <p>${htmlCitations(paragraph)}</p>`),
    ...(list.length ? ['      <ul>', ...list.map((item) => `        <li>${htmlCitations(item)}</li>`), '      </ul>'] : []),
    '    </section>',
  ].join('\n'));
  const references = guide.sources.map((source, index) => {
    const details = source.doi
      ? `<span lang="en">${plain(citation(source))}</span> <a href="${doiLink(source.doi)}">DOI ${source.doi}</a> · <a href="${scholarLink(source.doi)}">Tra Google Scholar<span class="visually-hidden"> cho nguồn ${index + 1}</span></a>`
      : `IELTS. <a href="${source.url}">${plain(source.title)}</a>.`;
    return `      <li id="nguon-${index + 1}">${details}</li>`;
  });
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${plain(guide.description)}">
  <title>${plain(guide.title)} · Sải bước</title>
  <link rel="icon" type="image/svg+xml" href="../assets/mark.svg">
  <link rel="stylesheet" href="../assets/style.css">
</head>
<body>
  <main class="handbook">
    <nav aria-label="Thư viện"><a href="../index.html#tai-lieu">← Về thư viện học tập</a></nav>
    <p class="eyebrow">SẢI BƯỚC / SỔ TAY ${guide.number}</p>
    <h1>${plain(guide.title)}</h1>
    <p>${plain(guide.description)}</p>
    <a class="button secondary" href="${guide.slug}.pdf" download>Tải bản PDF</a>
${books.length ? '    <p><a href="#phu-luc">Đến phụ lục từ vựng theo chủ đề ↓</a></p>\n' : ''}${sections.join('\n')}
    <h2>Tài liệu tham khảo</h2>
    <p>Google Scholar là công cụ tra cứu. DOI dẫn tới công trình gốc; một số nhà xuất bản có thể yêu cầu quyền truy cập.</p>
    <ol class="references">
${references.join('\n')}
    </ol>
${appendixHtml(books)}    <p class="fine-print">Sải bước là tài liệu học tập độc lập, không phải ấn phẩm chính thức của IELTS.</p>
  </main>
</body>
</html>
`;
}

async function pdf(guide, books) {
  const doc = new PDFDocument({
    size: 'A4', margin: 51, autoFirstPage: false, lang: 'vi-VN',
    info: {
      Title: guide.title, Subject: guide.description, Author: 'Sải bước · YYSD',
      CreationDate: new Date('2026-11-18T00:00:00Z'),
    },
  });
  const stream = createWriteStream(resource(`${guide.slug}.pdf`));
  doc.pipe(stream);
  doc.file(fontLicense, { name: 'NotoSans-OFL.txt', type: 'text/plain', description: 'Noto Sans font license' });
  doc.registerFont('regular', fonts.regular).registerFont('bold', fonts.bold);
  const print = (value, options) => doc.text(value, { ...fontFeatureOptions, ...options });
  const newPage = (label, title) => {
    doc.addPage();
    doc.roundedRect(51, 48, 493, 90, 12).fill('#eee7fb');
    doc.font('bold').fontSize(10).fillColor(purple).text(label, 67, 62, { ...fontFeatureOptions, width: 460 });
    doc.font('bold').fontSize(24).fillColor(ink).text(title, 67, 81, { ...fontFeatureOptions, width: 460 });
    doc.x = 51;
    doc.y = 156;
  };
  const paragraph = (value) => {
    doc.font('regular').fontSize(10.7).fillColor(ink);
    print(value, { lineGap: 3 }).moveDown(.55);
  };
  let pageNumber = 0;
  const footer = () => {
    if (doc.y > 758) throw new Error(`Too much content on ${guide.slug}, page ${pageNumber + 1}`);
    doc.font('regular').fontSize(9).fillColor(muted).text(`SẢI BƯỚC  /  ${++pageNumber}`, 51, 778, { ...fontFeatureOptions, lineBreak: false });
  };
  for (const [index, page] of guide.pages.entries()) {
    newPage(`IELTS ACADEMIC  /  SỔ TAY ${guide.number}`, guide.title);
    if (index === 0) {
      doc.outline.addItem(guide.title);
      paragraph(guide.description);
      if (books.length) paragraph(`Phụ lục sau danh mục nguồn: ${countWords(books)} mục từ kho YYSD, chia theo ${books.length} chủ đề. Dùng mục lục PDF để chuyển chủ đề.`);
    }
    for (const { heading, paragraphs, list } of page) {
      doc.font('bold').fontSize(13).fillColor(purple);
      print(heading).moveDown(.32);
      paragraphs.forEach(paragraph);
      list.forEach((item) => paragraph(`•  ${item}`));
      doc.moveDown(.45);
    }
    footer();
  }
  newPage(`IELTS ACADEMIC  /  SỔ TAY ${guide.number}`, 'Tài liệu tham khảo');
  doc.outline.addItem('Tài liệu tham khảo');
  paragraph('Tra cứu trên Google Scholar hoặc mở DOI để xem bài gốc. Một số nhà xuất bản có thể yêu cầu quyền truy cập.');
  for (const [index, source] of guide.sources.entries()) {
    const prefix = `[${index + 1}] `;
    doc.font('regular').fontSize(9.75).fillColor(ink);
    if (source.doi) {
      print(`${prefix}${citation(source)}`, { lineGap: 1.6 });
      doc.fontSize(9).fillColor(purple);
      print(`DOI ${source.doi}`, { link: doiLink(source.doi), underline: true, continued: true });
      print('     ', { link: null, underline: false, continued: true });
      print('Tra Google Scholar', { link: scholarLink(source.doi), underline: true });
    } else {
      print(`${prefix}IELTS. `, { continued: true });
      doc.fillColor(purple);
      print(source.title, { link: source.url, underline: true });
    }
    doc.moveDown(.52);
  }
  doc.moveDown(.5);
  paragraph('Tài liệu học tập độc lập, không phải ấn phẩm chính thức của IELTS.');
  footer();
  // Each print page opens on a topic boundary; no clipped examples or
  // accidental page breaks between a phrase and its usage note.
  for (const { topic, rows, number } of books) {
    const perPage = guide.appendix === 'writing' ? 7 : 10;
    for (let start = 0; start < rows.length; start += perPage) {
      newPage(`PHỤ LỤC YYSD  /  CHỦ ĐỀ ${number}  /  ${start + 1}–${Math.min(start + perPage, rows.length)}`, topic);
      if (start === 0) doc.outline.addItem(`${number} · ${topic}`);
      for (const [i, row] of rows.slice(start, start + perPage).entries()) {
        doc.font('bold').fontSize(11).fillColor(purple);
        print(`${start + i + 1}. ${row.term}`, { continued: true });
        doc.font('regular').fillColor(ink);
        print(`  —  ${row.meaning}`);
        doc.fontSize(10);
        print(row.example);
        if (row.note) { doc.fillColor(muted); print(row.note); }
        doc.moveDown(.65);
      }
      footer();
    }
  }
  doc.end();
  await once(stream, 'finish');
}

for (const guide of guides) {
  const books = guide.appendix ? await loadWorkbooks(guide.appendix) : [];
  await writeFile(resource(`${guide.slug}.html`), html(guide, books));
  await pdf(guide, books);
}

// Keep the library usable without JavaScript. Its links and PDFs share one catalog.
const cards = guides.map(({ slug, number, title, description, sources }) => `        <article class="material-card">
          <p class="eyebrow">SỔ TAY ${number} · ${sources.filter((source) => source.doi).length} NGUỒN NGHIÊN CỨU</p>
          <h3>${plain(title)}</h3>
          <p>${plain(description)}</p>
          <div class="material-actions">
            <a class="button secondary" href="resources/${slug}.pdf" download>Tải PDF<span class="visually-hidden">: ${plain(title)}</span></a>
            <a class="button quiet" href="resources/${slug}.html">Đọc trên web<span class="visually-hidden">: ${plain(title)}</span></a>
          </div>
        </article>`);
const home = new URL('../ielts-vi/index.html', import.meta.url);
const contents = await readFile(home, 'utf8');
const marker = /<!-- handbooks:start -->[\s\S]*?<!-- handbooks:end -->/;
if (!marker.test(contents)) throw new Error('Cannot locate static library');
await writeFile(home, contents.replace(marker, `<!-- handbooks:start -->\n      <div class="material-grid">\n${cards.join('\n')}\n      </div>\n      <!-- handbooks:end -->`));
