import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "node_modules/**",
      "coverage/**",
      "dist/**",
    ],
  },

  {
    files: ["src/**/*.js", "scripts/**/*.js", "test/**/*.js"],

    plugins: {
      js,
    },

    extends: ["js/recommended"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
]);
