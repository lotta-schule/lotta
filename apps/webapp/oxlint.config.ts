import { defineConfig } from 'oxlint';
import baseConfig from '../../oxlint.config';

export default defineConfig({
  extends: [baseConfig],
  env: {
    ...baseConfig.env,
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        ...baseConfig.env,
        vitest: true,
      },
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      excludeFiles: ['**/*.unit.test.ts', '**/*.unit.test.tsx'],
      env: {
        plugins: [
          ...baseConfig.plugins,
          'react',
          'react-perf',
          'jsx-a11y',
          'nextjs',
        ],
        ...baseConfig.env,
        vitest: true,
        jsPlugins: ['eslint-plugin-react-compiler'],
        browser: true,
      },
    },
  ],
});
