import typescriptEslintParser from '@typescript-eslint/parser';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import noHardcodedSchemaFieldsRule from './eslint-rules/no-hardcoded-schema-fields.js';

/** @type {Linter.FlatConfig[]} */
const config = [
  {
    ignores: ['node_modules', 'dist', '.next', 'src/lib/@schema.d.ts', 'src/lib/schema.ts'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'custom': {
        rules: {
          'no-hardcoded-schema-fields': noHardcodedSchemaFieldsRule,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-namespace': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'prefer-const': 'warn',
      'jsx-a11y/alt-text': 'warn',
      // Custom rule to prevent hardcoded field strings
      'custom/no-hardcoded-schema-fields': 'error',
    },
  },
];

export default config;
