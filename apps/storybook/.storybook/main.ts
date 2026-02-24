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
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    return mergeConfig(config, {
      plugins: [tailwindcss()],
      optimizeDeps: {
        include: [
          "@base-ui/react/accordion",
          "@base-ui/react/alert-dialog",
          "@base-ui/react/avatar",
          "@base-ui/react/button",
          "@base-ui/react/checkbox",
          "@base-ui/react/collapsible",
          "@base-ui/react/combobox",
          "@base-ui/react/dialog",
          "@base-ui/react/drawer",
          "@base-ui/react/menu",
          "@base-ui/react/merge-props",
          "@base-ui/react/popover",
          "@base-ui/react/progress",
          "@base-ui/react/radio",
          "@base-ui/react/radio-group",
          "@base-ui/react/select",
          "@base-ui/react/slider",
          "@base-ui/react/switch",
          "@base-ui/react/tabs",
          "@base-ui/react/toast",
          "@base-ui/react/toggle",
          "@base-ui/react/toggle-group",
          "@base-ui/react/tooltip",
          "@base-ui/react/use-render",
          "@remixicon/react",
          "chrono-node",
          "class-variance-authority",
          "clsx",
          "cmdk",
          "country-data-list",
          "date-fns",
          "embla-carousel-autoplay",
          "embla-carousel-react",
          "embla-carousel-wheel-gestures",
          "input-otp",
          "libphonenumber-js",
          "lucide-react",
          "motion/react",
          "react-circle-flags",
          "react-day-picker",
          "react-icons/fa",
          "react-icons/si",
          "react-resizable-panels",
          "react-use-measure",
          "tailwind-merge",
        ],
      },
    });
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
