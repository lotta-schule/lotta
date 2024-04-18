import baseConfig from '../../eslint.config.mjs';
import storybook from 'eslint-plugin-storybook';

/** @type {import("eslint/lib/config/config-file").ESLintConfig} */
const config = [
  {
    plugins: {
      storybook,
    },
  },
  ...baseConfig,
  ...storybook.configs.recommended.overrides,
];

export default config;
