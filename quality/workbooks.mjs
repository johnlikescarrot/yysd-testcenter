import { readdir, readFile } from 'node:fs/promises';
import { parseExpressionAt } from 'acorn';

const subject = {
  listening: { variable: 'wordData', term: 'word', meaning: 'meaning' },
  reading: { variable: 'wordData', term: 'word', meaning: 'meaning' },
  writing: { variable: 'phraseData', term: 'en', meaning: 'cn' },
};

// A teacher can upload an HTML workbook. Read its literal data without ever
// running its JavaScript, even when a future file contains computed properties.
export function parseWorkbook(source, skill, file) {
  const { variable, term, meaning } = subject[skill];
  const title = /name="exam:title" content="Bài (\d+) · ([^"]+)"/.exec(source);
  const declaration = new RegExp(`^const ${variable} = `, 'm').exec(source);
  if (!title || !declaration) throw new Error(`Missing title or ${variable}: ${file}`);
  const data = parseExpressionAt(source, declaration.index + declaration[0].length, { ecmaVersion: 2022 });
  if (data.type !== 'ArrayExpression' || !data.elements.length) throw new Error(`Empty or invalid workbook: ${file}`);
  const rows = data.elements.map((row) => {
    const fields = new Map();
    for (const prop of row.properties) {
      if (prop.type !== 'Property' || prop.kind !== 'init' || prop.computed || prop.method || prop.shorthand) {
        throw new Error(`Non-literal property in ${file}`);
      }
      fields.set(prop.key.name, prop.value);
    }
    const field = (key) => {
      const node = fields.get(key);
      if (node?.type !== 'Literal' || typeof node.value !== 'string' || !node.value.trim() || /\p{Script=Han}/u.test(node.value)) {
        throw new Error(`Expected localized string ${key} in ${file}`);
      }
      return node.value;
    };
    return { term: field(term), meaning: field(meaning), example: field('example'), note: skill === 'writing' ? field('detail') : '' };
  });
  return { topic: title[2], number: title[1].padStart(2, '0'), rows };
}

export async function loadWorkbooks(skill) {
  const dir = new URL(`../library/study/vocab-special-${skill}/`, import.meta.url);
  const files = (await readdir(dir)).filter((file) => file.endsWith('.html')).sort();
  if (!files.length) throw new Error(`No workbooks: ${skill}`);
  return Promise.all(files.map(async (file) => parseWorkbook(await readFile(new URL(file, dir), 'utf8'), skill, file)));
}
