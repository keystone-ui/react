import type { Preview } from "@storybook/react";
import { themes } from '@storybook/theming';
import "./preview.css";
import * as React from 'react';
import { DocsContainer } from '@storybook/addon-docs';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

// Get the channel to listen for dark mode changes
const channel = addons.getChannel();

// Custom docs container that responds to dark mode changes
const CustomDocsContainer = (props) => {
  const [isDark, setDark] = React.useState(false);

  React.useEffect(() => {
    // Listen to dark mode toggle events
    channel.on(DARK_MODE_EVENT_NAME, setDark);
    return () => channel.removeListener(DARK_MODE_EVENT_NAME, setDark);
  }, []);

  return (
    <DocsContainer
      {...props}
      theme={isDark ? themes.dark : themes.normal}
    />
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    darkMode: {
      dark: { ...themes.dark },
      light: { ...themes.normal },
      current: 'light',
      classTarget: 'html',
      darkClass: 'dark',
      lightClass: 'light',
      stylePreview: true
    },
    docs: {
      container: CustomDocsContainer,
      theme: themes.normal,
      darkTheme: themes.dark
    }
  },
};

export default preview; 