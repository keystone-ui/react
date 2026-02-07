import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@keystone/ui': resolve(__dirname, '../../packages/ui/src'),
      '@keystone/theme': resolve(__dirname, '../../packages/theme/src/index.css'),
    },
    dedupe: ['react', 'react-dom']
  },
});