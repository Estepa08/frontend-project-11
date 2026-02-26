import js from '@eslint/js';
import globals from 'globals';

export default [
  // Игнорируем папку dist
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  
  js.configs.recommended,
  
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
    },
  },
];