import { defineConfig } from 'oxlint';

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
  },
  ignorePatterns: ['dist/**/*', '.next/**/*', 'assets/vendor/**/*'],
  rules: {
    'no-debugger': 'error',
    'no-shadow-restricted-names': ['warn', { reportGlobalThis: false }],
  },
});
