export default [
  {
    files: ["vi/assets/js/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        caches: "readonly",
        self: "readonly",
        globalThis: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        Intl: "readonly",
        Set: "readonly",
        Map: "readonly",
        console: "readonly",
        process: "readonly"
      }
    },
    linterOptions: { reportUnusedDisableDirectives: true },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      eqeqeq: ["error", "smart"],
      curly: ["error", "multi-line"],
      semi: ["error", "always"],
      quotes: ["error", "double", { avoidEscape: true }],
      "no-var": "error",
      "prefer-const": "error",
      "no-console": "off"
    }
  }
];
