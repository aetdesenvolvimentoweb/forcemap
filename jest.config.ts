import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  passWithNoTests: true,
};

export default config;
