import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [viteTsconfigPaths(), react()],
  test: {
    dir: "./__tests__",
    include: ["**/*.{spec,test}.{ts,tsx}"],
    coverage: {
      enabled: true,
      include: ["src/**"],
      exclude: [
        "src/app/**/*.{ts,tsx}",
        "src/backend/domain/**/*.{ts,tsx}",
        "src/backend/data/repositories/index.ts",
        "src/backend/presentation/protocols/index.ts",
        "src/frontend/**/*.{ts,tsx}",
      ],
    },
    fileParallelism: false,
    environment: "jsdom",
    silent: true,
    watch: false,
    passWithNoTests: true,
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});
