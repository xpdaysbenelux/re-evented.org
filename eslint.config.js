import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["public_html/**/*.js"],
    ignores: ["public_html/sw.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
  {
    files: ["public_html/sw.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.serviceworker,
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
];
