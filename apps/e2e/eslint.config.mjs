import baseConfig from '../../eslint.config.mjs';

/** @type {import("eslint/lib/config/config-file").ESLintConfig} */
const config = [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'react-compiler/react-compiler': 'off',
      'react-hooks/rules-of-hooks': 'off',
    },
  },
];

export default config;
