import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    ignores: ['node_modules', 'dist'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'], // opcional, se quiser type-aware rules
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'unused-imports': require('eslint-plugin-unused-imports'),
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],

       // variáveis não utilizadas
      '@typescript-eslint/no-unused-vars': [
        'error',
      //   { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // imports não utilizados
      'unused-imports/no-unused-imports': 'error',
      // 'unused-imports/no-unused-vars': [
      //   'warn',
      //   {
      //     vars: 'all',
      //     varsIgnorePattern: '^_',
      //     args: 'after-used',
      //     argsIgnorePattern: '^_',
      //   },
      // ],

      // bloquear it.only, test.only, describe.only
      'no-restricted-properties': [
        'error',
           {
          object: 'it',
          property: 'only',
          message: 'Não use it.only – remova antes de commitar!',
        },
        {
          object: 'test',
          property: 'only',
          message: 'Não use test.only – remova antes de commitar!',
        },
        {
          object: 'describe',
          property: 'only',
          message: 'Não use describe.only – remova antes de commitar!',
        },
      ],
    },
  },
])
