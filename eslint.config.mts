import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettier from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
// importação removida, pois o preset será usado
import tsParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    ignores: ["dist/**", "node_modules/**", "coverage/**", "eslint.config.mts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
      globals: globals.node,
    },
    plugins: {
      js,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
      prettier,
    },
    extends: ["js/recommended", ...tseslint.configs.recommended],
    rules: {
      "prettier/prettier": "error", // Ativa o Prettier como regra do ESLint
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
    settings: {
      "import/resolver": {
        typescript: {},
      },
    },
  },
]);
