import { createWriteStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import PDFDocument from 'pdfkit';
import { citation, doiLink, guides, scholarLink } from './materials.mjs';

const require = createRequire(import.meta.url);
const fonts = {
  regular: require.resolve('@expo-google-fonts/noto-sans/400Regular/NotoSans_400Regular.ttf'),
  bold: require.resolve('@expo-google-fonts/noto-sans/700Bold/NotoSans_700Bold.ttf'),
};
const resource = (name) => new URL(`../ielts-vi/resources/${name}`, import.meta.url);
const plain = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const htmlCitations = (value) => plain(value).replaceAll(/\[(\d+(?:, \d+)*)\]/g, (_, ids) => (
  `[${ids.split(', ').map((id) => `<a href="#nguon-${id}">${id}</a>`).join(', ')}]`
));
const ink = '#241c32';
const muted = '#5c5369';
const purple = '#4b31a2';

function html(guide) {
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
${sections.join('\n')}
    <h2>Tài liệu tham khảo</h2>
    <p>Google Scholar là công cụ tra cứu. DOI dẫn tới công trình gốc; một số nhà xuất bản có thể yêu cầu quyền truy cập.</p>
    <ol class="references">
${references.join('\n')}
    </ol>
    <p class="fine-print">Sải bước là tài liệu học tập độc lập, không phải ấn phẩm chính thức của IELTS.</p>
  </main>
</body>
</html>
`;
}

async function pdf(guide) {
  const doc = new PDFDocument({
    size: 'A4', margin: 51, autoFirstPage: false, lang: 'vi-VN',
    info: {
      Title: guide.title, Subject: guide.description, Author: 'Sải bước · YYSD',
      CreationDate: new Date('2026-11-18T00:00:00Z'),
    },
  });
  const stream = createWriteStream(resource(`${guide.slug}.pdf`));
  doc.pipe(stream);
  doc.registerFont('regular', fonts.regular).registerFont('bold', fonts.bold);
  const newPage = (label, title) => {
    doc.addPage();
    doc.roundedRect(51, 48, 493, 90, 12).fill('#eee7fb');
    doc.font('bold').fontSize(10).fillColor(purple).text(label, 67, 62, { width: 460 });
    doc.font('bold').fontSize(24).fillColor(ink).text(title, 67, 81, { width: 460 });
    doc.x = 51;
    doc.y = 156;
  };
  const paragraph = (value) => doc.font('regular').fontSize(10.7).fillColor(ink).text(value, { lineGap: 3 }).moveDown(.55);
  let pageNumber = 0;
  const footer = () => {
    if (doc.y > 758) throw new Error(`Too much content on ${guide.slug}, page ${pageNumber + 1}`);
    doc.font('regular').fontSize(9).fillColor(muted).text(`SẢI BƯỚC  /  ${++pageNumber}`, 51, 778, { lineBreak: false });
  };
  for (const [index, page] of guide.pages.entries()) {
    newPage(`IELTS ACADEMIC  /  SỔ TAY ${guide.number}`, guide.title);
    if (index === 0) paragraph(guide.description);
    for (const { heading, paragraphs, list } of page) {
      doc.font('bold').fontSize(13).fillColor(purple).text(heading).moveDown(.32);
      paragraphs.forEach(paragraph);
      list.forEach((item) => paragraph(`•  ${item}`));
      doc.moveDown(.45);
    }
    footer();
  }
  newPage(`IELTS ACADEMIC  /  SỔ TAY ${guide.number}`, 'Tài liệu tham khảo');
  paragraph('Tra cứu trên Google Scholar hoặc mở DOI để xem bài gốc. Một số nhà xuất bản có thể yêu cầu quyền truy cập.');
  for (const [index, source] of guide.sources.entries()) {
    const prefix = `[${index + 1}] `;
    doc.font('regular').fontSize(9.75).fillColor(ink);
    if (source.doi) {
      doc.text(`${prefix}${citation(source)}`, { lineGap: 1.6 });
      doc.fontSize(9).fillColor(purple)
        .text(`DOI ${source.doi}`, { link: doiLink(source.doi), underline: true, continued: true })
        .text('     ', { link: null, underline: false, continued: true })
        .text('Tra Google Scholar', { link: scholarLink(source.doi), underline: true });
    } else {
      doc.text(`${prefix}IELTS. `, { continued: true });
      doc.fillColor(purple).text(source.title, { link: source.url, underline: true });
    }
    doc.moveDown(.52);
  }
  doc.moveDown(.5);
  paragraph('Tài liệu học tập độc lập, không phải ấn phẩm chính thức của IELTS.');
  footer();
  doc.end();
  await once(stream, 'finish');
}

for (const guide of guides) {
  await writeFile(resource(`${guide.slug}.html`), html(guide));
  await pdf(guide);
}
