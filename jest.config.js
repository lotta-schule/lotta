// Sync object
// /** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
    moduleNameMapper: {
        '\\.(scss|sass|css)$': 'identity-obj-proxy',
    },
    transform: {
        '\\.(gql|graphql)$': 'jest-transform-graphql',
        '.*': 'babel-jest',
    },
    roots: ['<rootDir>/src'],
    reporters: ['default'],
    moduleDirectories: ['node_modules', '<rootDir>/src'],
    testEnvironment: 'jsdom',
};
