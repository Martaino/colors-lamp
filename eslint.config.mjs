import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["public/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: globals.browser,
    },
    rules: js.configs.recommended.rules,
  },
  {
    files: ["public/js/code.js"],
    rules: {
      "eqeqeq": ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
    },
  },
  {
    // The supplied MD5 helper supports CommonJS as well as browser scripts.
    files: ["public/js/md5.js"],
    languageOptions: {
      globals: { module: "readonly" },
    },
  },
];
