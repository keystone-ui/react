import type { Preview } from "@storybook/react-vite";
import { themes } from "storybook/theming";
import "./preview.css";
import { Toaster } from "@keystoneui/react/toast";
import { withThemeByClassName } from "@storybook/addon-themes";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: themes.dark,
    },
    a11y: {
      // Axe runs against every story in the Vitest run. "todo" reports
      // violations without failing the suite; flip to "error" once the
      // existing stories are clean.
      test: "todo",
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
  tags: ["autodocs"],
};

export default preview;
