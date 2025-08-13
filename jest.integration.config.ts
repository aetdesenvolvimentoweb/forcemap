import type { Config } from "jest";
import baseConfig from "./jest.config";

const config: Config = {
  ...baseConfig,
  testMatch: ["**/__tests__/**/*.test.ts"],
  displayName: "Integration Tests (.test.ts)",
};

export default config;
