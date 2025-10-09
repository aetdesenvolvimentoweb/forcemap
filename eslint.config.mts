import js from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";
import globals from "globals";
// importação removida, pois o preset será usado
import tsParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";

export default defineConfig([
  // Global ignores
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "build/**"],
  },
  // Config for source files with TypeScript project
  {
    files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}"],
    ignores: ["eslint.config.mts"],
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
      "prettier/prettier": "error",
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
      "sort-imports": "off",
      "import/order": "off",
    },
    settings: {
      "import/resolver": {
        typescript: {},
      },
    },
  },
  // Config for test and mock files without TypeScript project
  {
    files: [
      "__tests__/**/*.{js,mjs,cjs,ts,mts,cts}",
      "__mocks__/**/*.{js,mjs,cjs,ts,mts,cts}",
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      js,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
      prettier,
    },
    rules: {
      "prettier/prettier": "error",
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
      "sort-imports": "off",
      "import/order": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
    settings: {
      "import/resolver": {
        typescript: {},
      },
    },
  },
]);
