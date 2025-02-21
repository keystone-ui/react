import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../**/*.stories.@(js|jsx|ts|tsx)", "../**/*.mdx"],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  typescript: {
    check: true,
  },
  addons: ["@storybook/addon-essentials", "storybook-dark-mode"],
  docs: {
    autodocs: true,
    defaultName: 'Documentation',
  },
};

export default config;
