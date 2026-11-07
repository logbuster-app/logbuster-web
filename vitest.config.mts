import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/features/**", "src/shared/**"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/**/types.ts", "src/**/index.ts"],
      reporter: ["text", "lcov"],
      // Cobertura mínima exigida no CI. Ajuste aqui se o time definir outro valor.
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
  },
});
