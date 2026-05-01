import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { browserCommands } from './src/test/commands.jsx';
import react from '@vitejs/plugin-react';
import graphql from '@rollup/plugin-graphql';

export default defineConfig({
  root: import.meta.dirname,

  plugins: [react(), graphql({}), browserCommands()],

  define: {
    'process.env': JSON.stringify({}),
  },

  resolve: {
    conditions: ['module', 'browser', 'development|production|test'],
    dedupe: ['react', 'react-dom'],
    tsconfigPaths: true,
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
            provider: playwright({
              contextOptions: { locale: 'de-DE', timezoneId: 'Europe/Berlin' },
            }),
            enabled: true,
            instances: [{ browser: 'chromium', headless: !!process.env.CI }],
            testerHtmlPath: 'src/test/browser-tester.html',
            viewport: { width: 1280, height: 720 },
            screenshotDirectory: '.test-reports/screenshots',
            trace: {
              mode: 'retain-on-failure',
              tracesDir: '.test-reports/traces',
            },
          },

          setupFiles: ['./src/test/component.setup.ts'],
          retry: process.env.CI ? 3 : 1,
          fileParallelism: !process.env.CI,
          maxConcurrency: process.env.CI ? 1 : 5,
          include: [
            'src/**/*.test.{ts,tsx}',
            '!src/**/*.{unit,rsc}.test.{ts,tsx}',
          ],
          exclude: [
            '.vitest/**/*',
            '.next/**/*',
            '.test-reports/**/*',
            '.vitest-attachments/**/*',
            'coverage',
            'dist',
            'node_modules',
          ],
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
    printConsoleTrace: true,
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
