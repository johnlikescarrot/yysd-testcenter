import json from '@eslint/json';

export default [
  { ignores: ['**/dist/**', '**/coverage/**', '**/reports/**'] },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    rules: { 'json/no-duplicate-keys': 'error' },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        Buffer: 'readonly', console: 'readonly', document: 'readonly', process: 'readonly',
        URL: 'readonly', window: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-unreachable': 'error',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-dupe-keys': 'error',
      'no-empty': 'error',
      'no-fallthrough': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': 'error',
    },
  },
];
