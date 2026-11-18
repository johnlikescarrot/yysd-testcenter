const names = [
  'window', 'document', 'localStorage', 'SpeechSynthesisUtterance', 'URLSearchParams',
  'URL', 'Event', 'console', 'process', 'fetch', 'innerWidth', 'location', 'setTimeout', 'clearTimeout'
];

export default [{
  files: ['**/*.mjs'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: Object.fromEntries(names.map((name) => [name, 'readonly']))
  },
  rules: {
    'no-undef': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
    'no-unreachable': 'error',
    'no-constant-condition': 'error'
  }
}];
