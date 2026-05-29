import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  coverage: {
    provider: "v8",
    reporter: ["text", "html"],
    include: ["src/**/*.{ts,tsx}"],
    exclude: [
      "src/**/__tests__/**",
      "src/main.tsx",
      "src/vite-env.d.ts",
      "src/index.css",
      "src/app/router.tsx",
      "src/app/providers.tsx",
      "src/shared/components/ui/**",
    ],
  },
});
