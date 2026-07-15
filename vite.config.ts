import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, "index.html"),
        solar: resolve(__dirname, "solar/index.html"),
      },
    },
  },
});
