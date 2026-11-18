import globals from 'globals';

export default [
  {
    files: ['docs/js/**/*.js', 'tests/**/*.mjs', 'vitest.config.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        vi: 'readonly'
      }
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
];
