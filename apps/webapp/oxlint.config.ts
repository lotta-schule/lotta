import { defineConfig } from 'oxlint';
import baseConfig from '../../oxlint.config.mts';

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
      plugins: [
        ...baseConfig.plugins,
        'react',
        'react-perf',
        'jsx-a11y',
        'nextjs',
      ],
      jsPlugins: ['eslint-plugin-react-compiler'],
      env: {
        ...baseConfig.env,
        vitest: true,
        browser: true,
      },
    },
  ],
});
