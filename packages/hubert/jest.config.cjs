const baseConfig = require('../../jest.base-config.cjs');

const jestConfig = {
    ...baseConfig,
    coverageDirectory: './coverage/jest',
    coveragePathIgnorePatterns: [
        ...baseConfig.coveragePathIgnorePatterns,
        '/.storybook/',
        '/assets/',
        '.stories.ts$',
        '!src/test/util.tsx',
    ],
};

module.exports = jestConfig;
