import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/main.js",
      name: "EquAlly",
      fileName: "equally",
      formats: ["iife"], //
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
