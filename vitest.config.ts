import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,ts}"],
    exclude: ["node_modules", "dist", ".git"],
  },
});
