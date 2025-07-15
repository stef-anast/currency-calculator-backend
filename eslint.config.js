const tseslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = tseslint.config({
  files: ['**/*.ts'],
  extends: [...tseslint.configs.recommended],
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    prettier: prettier,
  },
  rules: {
    ...prettierConfig.rules,
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
});
