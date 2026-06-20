import { defineConfig } from 'oxlint';

const isCI =
  !!process.env.CI && process.env.CI !== 'false' && process.env.CI !== '0';

export default defineConfig({
  plugins: [
    'eslint',
    'typescript',
    'typescript',
    'oxc',
    'import',
    'promise',
    'vitest',
  ],
  env: {
    builtin: true,
  },
  options: {
    typeAware: true,
    denyWarnings: isCI,
  },
  ignorePatterns: ['dist/**/*', '.next/**/*', 'assets/vendor/**/*'],
  rules: {
    'no-debugger': 'error',
    'no-shadow-restricted-names': ['warn', { reportGlobalThis: false }],
  },
});
