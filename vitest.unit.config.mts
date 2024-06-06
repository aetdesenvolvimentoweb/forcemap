import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [viteTsconfigPaths(), react()],
  test: {
    dir: "./__tests__",
    include: ["**/*.spec.{ts,tsx}"],
    environment: "jsdom",
    silent: true,
    watch: true,
    passWithNoTests: true,
    hookTimeout: 20000,
    testTimeout: 20000,
  },
});
