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
  {
    files: ['**/.storybook/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/*.stories.@(js|jsx|ts|tsx)'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];

export default config;
