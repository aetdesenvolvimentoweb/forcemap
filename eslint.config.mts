import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";

// ESLint 9 com Flat Config
export default [
  // Itens a ignorar
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      "**/*.json",
      "**/*.jsonc",
      "**/*.json5",
    ],
  },

  // Regras recomendadas para JS
  js.configs.recommended,

  // Configuração recomendada do TypeScript ESLint (inclui parser configurado)
  ...tseslint.configs.recommendedTypeChecked,

  // Configuração específica para arquivos TypeScript
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.node,
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
    },
  },

  // Configuração para arquivos JavaScript
  {
    files: ["**/*.js", "**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      globals: globals.node,
    },
    plugins: {
      import: importPlugin,
    },
  },

  // Desabilita regras que precisam de type info para arquivos de configuração (não inclusos no tsconfig)
  {
    files: ["eslint.config.*", "**/*.config.*", "**/*.conf.*", "**/*rc.*"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      parserOptions: {
        // Evita resolução de projeto para esses arquivos
        project: null,
      },
    },
  },

  // Configurações customizadas para arquivos TypeScript
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["eslint.config.*", "**/*.config.*", "**/*.conf.*", "**/*rc.*"],
    plugins: {
      import: importPlugin,
    },
    rules: {
      // Ordenação de imports por grupos
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Node.js built-ins
            "external", // npm packages
            "internal", // internal modules
            ["parent", "sibling"], // relative imports
            "index", // index imports
            "type", // type imports
          ],
          "newlines-between": "never",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // Ordenação de membros dentro de imports
      "sort-imports": [
        "error",
        {
          ignoreCase: false,
          ignoreDeclarationSort: true, // Let import/order handle this
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
          allowSeparatedGroups: false,
        },
      ],

      // Remove imports/exports não utilizados
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Força uso de import type quando apropriado
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
        },
      ],

      // Força uso de export type quando apropriado
      "@typescript-eslint/consistent-type-exports": [
        "error",
        {
          fixMixedExportsWithInlineTypeSpecifier: true,
        },
      ],

      // Remove imports duplicados
      "no-duplicate-imports": "error",

      // Garante que imports existam
      "import/no-unresolved": "error",

      // Detecta exports não utilizados em src, ignorando falsos positivos comuns
      "import/no-unused-modules": [
        "error",
        {
          missingExports: true,
          unusedExports: true,
          src: ["src/**/*.{ts,tsx}"],
          ignoreExports: ["**/*.spec.ts", "**/index.ts"],
        },
      ],

      // Não força await em funções async simples (evita erro em validadores assíncronos)
      "@typescript-eslint/require-await": "off",
    },
  },

  // Regras para arquivos de configuração escritos em TS (sem regras que exigem type info)
  {
    files: ["eslint.config.*", "**/*.config.*", "**/*.conf.*", "**/*rc.*"],
    plugins: {
      import: importPlugin,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/consistent-type-exports": "off",
      "@typescript-eslint/await-thenable": "off",
      // Mantemos regras seguras
      "no-duplicate-imports": "error",
      "sort-imports": [
        "error",
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
          allowSeparatedGroups: false,
        },
      ],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
          ],
          "newlines-between": "never",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },

  // Configurações para arquivos JavaScript (regras mais simples)
  {
    files: ["**/*.js", "**/*.mjs"],
    plugins: {
      import: importPlugin,
    },
    rules: {
      // Ordenação de imports por grupos
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
          ],
          "newlines-between": "never",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // Ordenação de membros dentro de imports
      "sort-imports": [
        "error",
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
          allowSeparatedGroups: false,
        },
      ],

      // Remove imports duplicados
      "no-duplicate-imports": "error",

      // Garante que imports existam
      "import/no-unresolved": "error",
    },
  },

  // Override para arquivos de teste (Jest)
  {
    files: ["**/*.spec.ts", "**/*.test.ts", "**/*.spec.tsx", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/unbound-method": "off",
    },
  },

  // Desabilita regras de estilo que conflitam com o Prettier
  eslintConfigPrettier,
];
