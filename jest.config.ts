import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  collectCoverage: false,
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!<rootDir>/src/**/error.ts",
    "!<rootDir>/src/**/index.ts",
    "!<rootDir>/src/**/interface.ts",
    "!<rootDir>/src/**/protocol.ts",
  ],
  coverageDirectory: "coverage",
  coverageProvider: "babel",
  coverageReporters: ["text", "text-summary", "html", "lcov"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  passWithNoTests: true,
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  testMatch: ["**/__tests__/**/*.spec.ts", "**/__tests__/**/*.test.ts"], // Todos os testes
  moduleNameMapper: {
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@application/(.*)$": "<rootDir>/src/application/$1",
    "^@infra/(.*)$": "<rootDir>/src/infra/$1",
    "^@presentation/(.*)$": "<rootDir>/src/presentation/$1",
    "^@tests/(.*)$": "<rootDir>/__tests__/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  displayName: "All Tests (.spec.ts + .test.ts)",
};

export default config;
