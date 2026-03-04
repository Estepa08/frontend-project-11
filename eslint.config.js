import globals from 'globals'
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

export default [
  // 👇 ИГНОРИРУЕМ СБОРКУ
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'public/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          semi: false,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
          printWidth: 100,
          endOfLine: 'auto',
        },
      ],
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
    },
  },
  prettier,
]
