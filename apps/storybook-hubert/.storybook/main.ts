import { resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
    '@storybook/addon-themes',
    {
      name: '@storybook/addon-storysource',
      options: {
        rule: {
          test: [/\.stories\.tsx?$/],
          include: [resolve(import.meta.dirname, '../src')],
        },
        loaderOptions: {
          prettierConfig: {
            printWidth: 80,
            singleQuote: true,
            semi: true,
            trailingComma: 'all',
          },
        },
      },
    },
    '@lotta-schule/storybook-addon-theme',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {},
};
export default config;
