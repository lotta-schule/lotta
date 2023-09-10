const baseConfig = require('../../jest.base-config.cjs');

const jestConfig = {
  ...baseConfig,
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/packages'],

  collectCoverageFrom: [
    ...baseConfig.collectCoverageFrom,
    '!src/test/util.tsx',
  ],

  transform: {
    ...baseConfig.transform,
    '\\.(gql|graphql)$': '@graphql-tools/jest-transform',
  },
};

module.exports = jestConfig;
