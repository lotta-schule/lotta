import prettierRecommended from 'eslint-plugin-prettier/recommended';
import js from '@eslint/js';
import promise from 'eslint-plugin-promise';
import react from 'eslint-plugin-react';
import reactJsx from 'eslint-plugin-react/configs/jsx-runtime.js';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactHooks from 'eslint-plugin-react-hooks';
import testingLibrary from 'eslint-plugin-testing-library';
import reactCompiler from 'eslint-plugin-react-compiler';
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import ts from 'typescript-eslint';
import vitest from 'eslint-plugin-vitest';

/** @type {import('eslint').Linter['getConfigForFile']} */
const config = [
  { ignores: ['.next/**/*'] },
  js.configs.recommended,
  {
    ...prettierRecommended,
    rules: { ...prettierRecommended.rules, 'prettier/prettier': 'warn' },
  },
  ...ts.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    ...reactRecommended,
    plugins: {
      react,
      ...reactRecommended.plugins,
      'react-hooks': fixupPluginRules(reactHooks),
      'react-compiler': reactCompiler,
    },
    languageOptions: {
      ...reactRecommended.languageOptions,
      parserOptions: {
        ...reactRecommended.parserOptions,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    files: ['**/*.tsx', '**/*.jsx'],
    ...reactJsx,
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: { promise },
    rules: {
      ...react.configs['jsx-runtime'].rules,
      ...react.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
      'react-compiler/react-compiler': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.test.js',
      '**/*.test.jsx',
      '**/test/util.tsx',
    ],
    ...vitest.configs.recommended,
    ...testingLibrary.configs['flat/react'],
    plugins: {
      ...vitest.configs.recommended.plugins,
      ...fixupPluginRules(testingLibrary.configs['flat/react'].plugins),
    },
    rules: {
      ...vitest.configs.recommended.rules,
      ...fixupConfigRules(testingLibrary.configs['flat/react']).rules,
      'react-compiler/react-compiler': 'off',
    },
  },
];

export default config;
