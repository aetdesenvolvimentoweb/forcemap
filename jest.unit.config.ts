import type { Config } from "jest";
import baseConfig from "./jest.config";

const config: Config = {
  ...baseConfig,
  displayName: "Unit Tests",
  roots: ["<rootDir>/src", "<rootDir>/__tests__/unit"],
  testMatch: ["**/__tests__/unit/**/*.spec.ts", "**/*.spec.ts"],
  testPathIgnorePatterns: [
    "<rootDir>/__tests__/integration/",
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
  ],
  coverageDirectory: "coverage/unit",
  // Configurações específicas para testes unitários
  maxWorkers: "50%",
  testTimeout: 5000,
};

export default config;
