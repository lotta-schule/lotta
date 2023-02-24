// Sync object
// /** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
    moduleNameMapper: {
        '\\.(scss|sass|css)$': 'identity-obj-proxy',
        '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$':
            '<rootDir>/__mocks__/fileMock.js',
        /* Handle image imports
        https://jestjs.io/docs/webpack#handling-static-assets */
        '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$':
            '<rootDir>/__mocks__/fileMock.js',
    },
    transform: {
        '\\.(gql|graphql)$': 'jest-transform-graphql',
        /* Use babel-jest to transpile tests with the next/babel preset
        https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object */
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
    },
    transformIgnorePatterns: [
        'node_modules/(?!@lotta-schule)',
        '^.+\\.module\\.(css|sass|scss)$',
    ],
    roots: ['<rootDir>/src'],
    reporters: process.env.CI ? ['default'] : ['default', 'jest-junit'],
    moduleDirectories: ['node_modules', '<rootDir>/src'],
    testEnvironment: 'jsdom',
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/stories/**',
        '!**/*.d.ts',
        '!**/node_modules/**',
    ],
};
