import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.mjs'],
    coverage: {
      provider: 'v8',
      all: true,
      include: ['docs/js/**/*.js'],
      reporter: ['text', 'json-summary', 'json', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100
      }
    }
  }
});
