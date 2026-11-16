import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  // Generated output: build, coverage and Playwright reports/traces (the latter bundle large third-party JS).
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "coverage/**", "test-results/**", "playwright-report/**", "blob-report/**"]),
]);
