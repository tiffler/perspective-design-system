import type { StorybookConfig } from '@storybook/react-vite';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const storiesDir = join(here, '../src/stories');

// These stories import components that don't exist yet (./Icon, ./IconBrand, ./Table),
// which breaks the production build. Re-add them once the components exist.
const skip = new Set(['Icon.stories.tsx', 'IconBrand.stories.tsx', 'Table.stories.tsx']);
const stories = readdirSync(storiesDir)
  .filter((f) => /\.stories\.(js|jsx|mjs|ts|tsx)$/.test(f) && !skip.has(f))
  .map((f) => `../src/stories/${f}`);

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    ...stories
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/react-vite"
};
export default config;
