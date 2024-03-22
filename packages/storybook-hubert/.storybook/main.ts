import type { StorybookConfig } from '@storybook/react-webpack5';

import { join, dirname } from 'path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-a11y'),
    '@lotta-schule/storybook-addon-theme',
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },
  docs: {
    autodocs: true,
  },
  webpackFinal: async (config) => {
    const rules = config.module?.rules || [];
    rules.push({
      test: /\.(js|ts)x?$/,
      loader: '@jsdevtools/coverage-istanbul-loader',
      enforce: 'post',
      include: join(process.cwd(), 'src'),
      exclude: [/node_modules/],
    });

    config.module = config.module || {};
    config.module.rules = rules;

    return config;
  },

  babel: async (config) => {
    config.presets ||= [];
    config.presets.push(['@babel/preset-typescript']);
    config.presets.push([
      '@babel/preset-env',
      { targets: { node: 'current' } },
    ]);

    return config;
  },
};
export default config;
