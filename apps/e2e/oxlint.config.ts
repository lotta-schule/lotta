import { defineConfig } from 'oxlint';
import baseConfig from '../../oxlint.config.mts';

export default defineConfig({
  extends: [baseConfig],
  plugins: [...baseConfig.plugins],
  jsPlugins: ['eslint-plugin-playwright'],
  rules: {
    ...baseConfig.rules,
    // An un-awaited `expect(locator)` never fails the test.
    'typescript/no-floating-promises': 'error',
    'playwright/missing-playwright-await': 'error',
  },
});
