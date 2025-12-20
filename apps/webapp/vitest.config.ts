import { defineConfig } from 'vitest/config';
import { Plugin } from 'vite';
import { playwright } from '@vitest/browser-playwright';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import graphql from '@rollup/plugin-graphql';

export default defineConfig({
  root: __dirname,
  cacheDir: '.vite',

  plugins: [tsconfigPaths(), react(), graphql() as Plugin],
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
    globals: true,
    browser: {
      provider: playwright(),
      enabled: true,
      instances: [{ browser: 'chromium', headless: !!process.env.CI }],
      viewport: { width: 1280, height: 720 },
    },

    setupFiles: ['./test.setup.ts'],
    retry: process.env.GITHUB_ACTIONS ? 2 : 0,
    include: ['src/**/*.test.{ts,tsx}'],

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
