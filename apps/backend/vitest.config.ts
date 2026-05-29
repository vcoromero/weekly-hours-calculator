import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    reporters: ["default"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  coverage: {
    provider: "v8",
    reporter: ["text", "html"],
    include: ["src/**/*.ts"],
    exclude: [
      "src/**/__tests__/**",
      "src/server.ts",
      "src/infrastructure/http/container.ts",
      "src/infrastructure/http/routes.ts",
      "src/infrastructure/http/app.ts",
      "src/infrastructure/persistence/**",
    ],
  },
});
