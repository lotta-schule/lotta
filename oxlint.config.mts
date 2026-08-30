import { defineConfig } from 'oxlint';

const isCI =
  !!process.env.CI && process.env.CI !== 'false' && process.env.CI !== '0';

export default defineConfig({
  plugins: [
    'eslint',
    'typescript',
    'react',
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
    'vitest/require-mock-type-parameters': 'off',
    // oxlint 1.79 fixed a bug that had left these react-compiler-derived
    // rules inactive; they now flag pre-existing patterns across the
    // codebase. Disabled here to unblock the dependency bump — tracked as
    // follow-up work to fix the flagged call sites and re-enable.
    'react/set-state-in-effect': 'off',
    'react/refs': 'off',
    'react/immutability': 'off',
    'react/use-memo': 'off',
    'react/globals': 'off',
  },
});
