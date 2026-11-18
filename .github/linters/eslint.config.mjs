export default [{
  files: ['**/*.js'],
  languageOptions: {
    ecmaVersion: 2022,
    globals: {
      module: 'readonly',
      globalThis: 'readonly',
      document: 'readonly',
      localStorage: 'readonly',
      IeltsCore: 'readonly'
    }
  },
  rules: {
    'no-undef': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    'no-unreachable': 'error',
    'no-constant-condition': 'error'
  }
}];
