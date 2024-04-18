import prettierRecommended from 'eslint-plugin-prettier/recommended';
import js from '@eslint/js';
import promise from 'eslint-plugin-promise';
import react from 'eslint-plugin-react';
import reactJsx from 'eslint-plugin-react/configs/jsx-runtime.js';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactHooks from 'eslint-plugin-react-hooks';
import ts from 'typescript-eslint';
import vitest from 'eslint-plugin-vitest';

/** @type {import('eslint').Linter['getConfigForFile']} */
const config = [
  js.configs.recommended,
  prettierRecommended,
  ...ts.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    ...reactRecommended,
    plugins: { react, 'react-hooks': reactHooks, ...reactRecommended.plugins },
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
    },
  },
  {
    ...vitest.configs.recommended,
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.test.js', '**/*.test.jsx'],
  },
];

export default config;
