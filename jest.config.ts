import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "ESNext",
          moduleResolution: "bundler",
        },
      },
    ],
  },
  moduleNameMapper: {
    "^@application/(.*)$": "<rootDir>/src/application/$1",
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@presentation/(.*)$": "<rootDir>/src/presentation/$1",
    "^@infra/(.*)$": "<rootDir>/src/infra/$1",
    "^@main/(.*)$": "<rootDir>/src/main/$1",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/**/index.ts"],
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: [],
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  collectCoverage: false,
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.spec.ts",
    "**/*.test.ts",
    "**/*.spec.ts",
  ],
  coverageDirectory: "coverage",
};

export default config;
