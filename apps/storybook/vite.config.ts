import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./"),
      "@keystone/ui": resolve(import.meta.dirname, "../../packages/ui/src"),
    },
    dedupe: ["react", "react-dom"],
  },
});
