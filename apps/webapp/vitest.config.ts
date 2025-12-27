import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { browserCommands } from './src/test/commands';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import graphql from '@rollup/plugin-graphql';

export default defineConfig({
  root: import.meta.dirname,

  plugins: [tsconfigPaths(), react(), graphql({}), browserCommands()],

  define: {
    'process.env': JSON.stringify({}),
  },

  resolve: {
    conditions: ['module', 'browser', 'development|production|test'],
    dedupe: ['react', 'react-dom'],
  },

  ssr: {
    resolve: {
      conditions: ['module', 'node', 'development|production|test'],
    },
  },
  test: {
    projects: [
      // TODO: react server components testing project
      // with probably jsdom and special resolve rule
      // https://github.com/apollographql/apollo-client-integrations/issues/353
      {
        extends: true,
        cacheDir: '.vitest/browser-cache',
        test: {
          name: { label: 'component', color: 'cyan' },
          browser: {
            provider: playwright(),
            enabled: true,
            instances: [{ browser: 'chromium', headless: !!process.env.CI }],
            testerHtmlPath: 'src/test/browser-tester.html',
            viewport: { width: 1280, height: 720 },
            screenshotDirectory: '.test-reports/screenshots',
            trace: {
              mode: 'on-first-retry',
              tracesDir: '.test-reports/traces',
            },
          },

          setupFiles: ['./src/test/component.setup.ts'],
          retry: process.env.GITHUB_ACTIONS ? 3 : 1,
          include: ['src/**/*.test.{ts,tsx}', '!src/**/*.unit.test.{ts,tsx}'],
          testTimeout: 30_000, // default is 5000ms, increase for browser tests
        },
      },
      {
        extends: true,
        cacheDir: '.vitest/unit-cache',
        test: {
          name: { label: 'unit', color: 'green' },
          environment: 'node',
          setupFiles: ['./src/test/unit.setup.ts'],
          include: ['src/**/*.unit.test.{ts,tsx}'],
        },
      },
    ],

    globals: true,

    reporters: process.env.GITHUB_ACTIONS
      ? ['default', 'junit', 'github-actions']
      : ['default'],
    outputFile: 'coverage/junit.xml',
    coverage: {
      clean: true,
      reportsDirectory: 'coverage',
      enabled: !!process.env.CI,
      provider: 'istanbul',
      reporter: ['json'],
      include: ['src/**/*'],
      exclude: [
        'src/**/*.test.*',
        '**/*.d.ts',
        '**/*.scss',
        '**/*.css',
        '**/*.graphql',
        '**/*.png',
        '**/*.svg',
        '**/*.jpg',
        '**/*.jpeg',
        '**/*.gif',
        '**/*.webp',
        '**/*.svg',
      ],
    },

    env: {
      TZ: 'Europe/Berlin',
      LOCALE: 'de_DE.UTF-8',
      LANGUAGE: 'de_DE:de',
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: ['./src/styles/util', '../../libs/hubert/src/theme'],
      },
    },
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@testing-library/react',
      '@testing-library/user-event',
      '@testing-library/jest-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@apollo/client',
      '@apollo/client/testing',
      '@apollo/client-integration-nextjs',
      'react-chartjs-2',
      'chart.js',
    ],
  },
});
