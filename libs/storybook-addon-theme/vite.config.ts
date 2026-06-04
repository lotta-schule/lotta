import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,
    // environment: 'jsdom',
    environment: 'node',

    retry: 0,

    include: ['src/**/*.test.{ts,tsx}'],
    reporters: process.env.GITHUB_ACTIONS
      ? ['default', 'junit', 'github-actions']
      : ['default'],
    outputFile: 'coverage/junit.xml',

    coverage: {
      enabled: !!process.env.CI,
      clean: true,
      reportsDirectory: 'coverage',
      provider: 'istanbul',
      reporter: ['json'],
    },
  },
});
