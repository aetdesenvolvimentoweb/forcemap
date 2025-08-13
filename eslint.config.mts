import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

// ESLint 9 com Flat Config
export default [
  // Itens a ignorar
  { ignores: ["node_modules", "dist", "build"] },

  // Regras recomendadas para JS
  js.configs.recommended,

  // Regras recomendadas para TypeScript
  ...tseslint.configs.recommended,

  // Opções de linguagem do projeto (ex.: globals de Node)
  {
    languageOptions: {
      globals: globals.node,
    },
  },

  // Desabilita regras de estilo que conflitam com o Prettier
  eslintConfigPrettier,
];
