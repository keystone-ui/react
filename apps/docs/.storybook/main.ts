import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../**/*.stories.@(js|jsx|ts|tsx)", "../**/*.mdx"],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  typescript: {
    check: true,
  },
  addons: [
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-vitest"),
  ],
  docs: {
    defaultName: "Documentation",
  },

  viteFinal: async (config) => {
    // Dynamic import required - static import causes ESM/CJS issues
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    return mergeConfig(config, {
      plugins: [tailwindcss()],
    });
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
