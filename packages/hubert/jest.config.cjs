const baseConfig = require('../../jest.base-config.cjs');

const jestConfig = {
  ...baseConfig,
  coveragePathIgnorePatterns: [
    ...baseConfig.coveragePathIgnorePatterns,
    '/.storybook/',
    '/assets/',
    '.stories.ts$',
    '!src/test/util.tsx',
  ],
};

module.exports = jestConfig;
