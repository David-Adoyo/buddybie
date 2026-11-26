import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // We intentionally hydrate browser-only state (localStorage theme,
      // low-data, active Circle, demo data) in effects after mount, which is
      // the SSR-safe pattern. Keep this perf hint as a warning, not an error.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
