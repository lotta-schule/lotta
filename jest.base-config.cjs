/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

/**
 * @type {import('@jest/types').Config.InitialOptions}
 * @see https://jestjs.io/docs/configuration
 **/
const jestConfig = {
  clearMocks: true,

  reporters: ['default', 'jest-junit'],
  testResultsProcessor: 'jest-junit',

  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'node_modules/**',
    '!**/*.d.ts',
  ],
  coverageDirectory: './coverage/jest/',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageProvider: 'babel',
  coverageReporters: ['text', 'cobertura'],

  moduleFileExtensions: [
    'js',
    'mjs',
    'cjs',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node',
  ],

  moduleNameMapper: {
    '\\.(scss|sass|css)$': 'identity-obj-proxy',
    '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/fileMock.js',
  },
  roots: ['<rootDir>/src'],
  moduleDirectories: ['node_modules', 'src'],

  setupFilesAfterEnv: ['./jest.setup.ts'],

  testEnvironment: 'jsdom',

  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
          ['@babel/preset-env', { targets: { node: 'current' } }],
        ],
      },
    ],
  },

  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};

module.exports = jestConfig;
