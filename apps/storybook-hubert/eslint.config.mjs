import baseConfig from '../../eslint.config.mjs';
import storybook from 'eslint-plugin-storybook';

/** @type {import("eslint/lib/config/config-file").ESLintConfig} */
const config = [
  ...baseConfig,
  {
    plugins: {
      storybook,
    },
  },
  {
    files: ['**/*.stories.@(js|jsx|ts|tsx)'],
    rules: {
      ...storybook.configs.recommended.overrides[0].rules,
    },
  },
  {
    files: ['**/.storybook/main.@(js|jsx|ts|tsx)'],
    rules: {
      ...storybook.configs.recommended.overrides[1].rules,
    },
  },
];

export default config;
