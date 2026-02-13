import type { Preview } from "@storybook/react-vite";
import { themes } from 'storybook/theming';
import "./preview.css";
import * as React from 'react';
import { DocsContainer } from 'storybook/blocks';
import { withThemeByClassName } from '@storybook/addon-themes';
import { Toaster } from '@keystone/ui/toast';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: themes.dark,
    }
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
  tags: ['autodocs']
};

export default preview;
