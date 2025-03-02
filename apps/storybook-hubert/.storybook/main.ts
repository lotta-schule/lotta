import { dirname, join, resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-themes'),
    {
      name: getAbsolutePath('@storybook/addon-storysource'),
      options: {
        rule: {
          test: [/\.stories\.tsx?$/],
          include: [resolve(__dirname, '../src')],
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
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  docs: {},
};
export default config;
