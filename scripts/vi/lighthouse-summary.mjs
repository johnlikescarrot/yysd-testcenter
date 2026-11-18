#!/usr/bin/env node
/**
 * Tóm tắt kết quả Lighthouse CI thành Markdown để đăng vào Pull Request.
 *
 * Đọc các tệp `.lighthouseci/lhr-*.json` do `lhci autorun` sinh ra và liệt kê
 * những audit chưa đạt, kèm điểm bốn hạng mục. Không có dữ liệu thì in thông báo.
 *
 * Chạy: node scripts/vi/lighthouse-summary.mjs
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.resolve('.lighthouseci');

async function main() {
  let files;
  try {
    files = (await readdir(DIR)).filter((name) => name.startsWith('lhr-') && name.endsWith('.json'));
  } catch {
    console.log('Không tìm thấy thư mục .lighthouseci — Lighthouse CI chưa sinh báo cáo.');
    return;
  }
  if (files.length === 0) {
    console.log('Không có báo cáo Lighthouse nào.');
    return;
  }

  const lines = ['### Lighthouse CI — audit chưa đạt', ''];

  for (const file of files.sort()) {
    const report = JSON.parse(await readFile(path.join(DIR, file), 'utf8'));
    const scores = Object.entries(report.categories || {})
      .map(([key, category]) => `${key} ${Math.round((category.score ?? 0) * 100)}`)
      .join(' · ');
    const failing = Object.values(report.audits || {})
      .filter((audit) => audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'informative')
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .slice(0, 12);

    lines.push(`**${report.finalDisplayedUrl || report.requestedUrl}** — ${scores}`);
    if (failing.length === 0) {
      lines.push('');
      lines.push('- Không có audit nào dưới 100.');
    } else {
      for (const audit of failing) {
        const detail = (audit.displayValue || audit.title || '').replace(/\|/g, '\\|');
        lines.push(`- \`${audit.id}\` (${Math.round((audit.score ?? 0) * 100)}) — ${detail}`);
      }
    }
    lines.push('');
  }

  console.log(lines.join('\n'));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
