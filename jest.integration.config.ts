import type { Config } from "jest";
import baseConfig from "./jest.config";

const config: Config = {
  ...baseConfig,
  displayName: "Integration Tests",
  roots: ["<rootDir>/src", "<rootDir>/__tests__/integration"],
  testMatch: ["**/__tests__/integration/**/*.test.ts", "**/*.test.ts"],
  testPathIgnorePatterns: [
    "<rootDir>/__tests__/unit/",
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
  ],
  coverageDirectory: "coverage/integration",
  // Configurações específicas para testes de integração
  maxWorkers: 1, // Testes de integração podem precisar rodar sequencialmente
  testTimeout: 30000, // Timeout maior para testes de integração
};

export default config;
