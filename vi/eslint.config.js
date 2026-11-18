/**
 * Cấu hình ESLint (flat config) cho ứng dụng IELTS Việt.
 * Chỉ bật các quy tắc bắt lỗi thật; phần định dạng do Prettier/super-linter lo.
 */

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  location: 'readonly',
  fetch: 'readonly',
  localStorage: 'readonly',
  Blob: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  FormData: 'readonly',
  SpeechSynthesisUtterance: 'readonly',
  caches: 'readonly',
  self: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  process: 'readonly',
};

export default [
  {
    ignores: ['node_modules/**', 'library/**'],
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: browserGlobals,
    },
    rules: {
      'no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-constant-condition': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-unreachable': 'error',
      'no-unsafe-finally': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'error',
      'no-useless-escape': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'multi-line'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['sw.js'],
    languageOptions: {
      globals: { ...browserGlobals, importScripts: 'readonly' },
    },
  },
];
