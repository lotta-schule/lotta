import { defineConfig } from 'vitest/config';
import { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import graphql from '@rollup/plugin-graphql';

export default defineConfig({
  root: __dirname,
  cacheDir: '.vite',

  plugins: [tsconfigPaths(), react(), graphql() as Plugin],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test.setup.ts'],
    reporters: process.env.GITHUB_ACTIONS
      ? ['default', 'github-actions']
      : ['default'],

    coverage: {
      clean: true,
      reportsDirectory: 'coverage',
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
  },
});
