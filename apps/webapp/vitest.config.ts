import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import graphql from '@rollup/plugin-graphql';
import { browserCommands } from './src/test/commands';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '.vite',

  plugins: [tsconfigPaths(), react(), graphql({}), browserCommands()],

  define: {
    'process.env': JSON.stringify({}),
  },

  resolve: {
    conditions: ['module', 'browser', 'development|production|test'],
  },

  ssr: {
    resolve: {
      conditions: ['module', 'node', 'development|production|test'],
    },
  },
  test: {
    projects: [
      {
        extends: true,
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
});
