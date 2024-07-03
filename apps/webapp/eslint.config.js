import baseConfig from '../../eslint.config.mjs';
import next from '@next/eslint-plugin-next';

/** @type {import('eslint').Linter['getConfigForFile']} */
const config = [
  ...baseConfig,
  {
    plugins: {
      '@next/next': next,
    },
  },
  {
    files: ['**/*.@(mjs|cjs|js|jsx|mts|cts|ts|tsx)'],
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'off',
      '@next/next/no-duplicate-head': 'off',
      '@next/next/no-page-custom-font': 'off',
    },
  },
];

export default config;
