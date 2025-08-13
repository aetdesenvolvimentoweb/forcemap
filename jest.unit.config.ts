import type { Config } from "jest";
import baseConfig from "./jest.config";

const config: Config = {
  ...baseConfig,
  testMatch: ["**/__tests__/**/*.spec.ts"],
  displayName: "Unit Tests (.spec.ts)",
};

export default config;
