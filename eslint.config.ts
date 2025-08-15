import js from "@eslint/js";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  js.configs.recommended,
  prettier,
  {
    files: ["src/**/*.ts"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      "unused-imports": unusedImports,
      import: importPlugin,
    },
    languageOptions: {
      globals: globals.node,
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      // Desabilitar regras que são problemáticas com TypeScript
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "none",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // Organização de imports
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Node.js built-ins
            "external", // External packages
            "internal", // Internal modules (usando paths)
            "parent", // Parent directory imports
            "sibling", // Sibling imports
            "index", // Index imports
            "type", // Type imports
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: "@application/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@domain/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@presentation/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@infra/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],

      // Remoção de imports não utilizados
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // Outras regras úteis para imports
      "import/no-duplicates": "error",
      "import/no-unresolved": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-named-as-default": "warn",
    },
  },
];
