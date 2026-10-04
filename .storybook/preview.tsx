import type { Preview } from '@storybook/react-vite'
import React from 'react'
import '../src/styles/primitives.css'
import '../src/styles/component-tokens.css'
import './preview.css'

// Every file in src/styles/themes/ is a theme. Drop one in and it shows up in the toolbar.
const themeFiles = import.meta.glob(
  ['../src/styles/themes/*.css', '!../src/styles/themes/_*.css'],
  { eager: true },
)
const themeNames = Object.keys(themeFiles).map((path) =>
  path.split('/').pop()!.replace('.css', ''),
)

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Brand theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'Default' },
          ...themeNames.map((name) => ({ value: name, title: name })),
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Light or dark mode',
      toolbar: {
        title: 'Mode',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun',  title: 'Light' },
          { value: 'dark',  icon: 'moon', title: 'Dark'  },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    theme: 'default',
    mode: 'light',
  },

  decorators: [
    (Story, context) => {
      const { theme, mode } = context.globals;
      const root = document.documentElement;
      if (theme && theme !== 'default') root.setAttribute('data-theme', theme);
      else root.removeAttribute('data-theme');
      root.setAttribute('data-mode', mode ?? 'light');
      return <Story />;
    },
  ],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
