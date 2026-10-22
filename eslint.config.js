import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

// Libraries that may only be imported inside src/adapters (the adapter principle).
const ADAPTER_ONLY_LIBRARIES = [
  'axios',
  'react-router-dom',
  '@tanstack/react-query',
  'yup',
  'uuid',
  'sonner',
  'react-icons',
  'react-icons/*',
  'pdfjs-dist',
  'pdfjs-dist/*',
  'mammoth',
  'mammoth/*',
];

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}', 'vite.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'off',
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      // Boundaries: third-party libs only in adapters, UI library only in common/components,
      // and a module is only ever imported through its own index.js.
      'no-restricted-imports': [
        'error',
        {
          paths: ADAPTER_ONLY_LIBRARIES.map((name) => ({
            name,
            message: 'Import this library only inside src/adapters, and consume it through its adapter.',
          })).concat([
            { name: '@chakra-ui/react', message: 'Use the wrapped components from @/common/components.' },
          ]),
          patterns: [
            {
              group: ['@/modules/*/pages/*', '@/modules/*/controllers/*', '@/modules/*/components/*', '@/modules/*/store/*'],
              message: "Import from the module's index.js instead (e.g. '@/modules/checks'), not a deep path.",
            },
            { group: ['../*', './../*'], message: 'Use the @/ alias instead of relative parent imports.' },
          ],
        },
      ],
    },
  },
  // Adapters are the one place third-party libraries may be imported.
  {
    files: ['src/adapters/**/*.{js,jsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },
  // The wrapped UI components are the one place the UI library may be imported.
  {
    files: ['src/common/components/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['../*', './../*'], message: 'Use the @/ alias instead of relative parent imports.' }] },
      ],
    },
  },
  // Modules legitimately import their own internals directly (the boundary applies to OTHER modules).
  {
    files: ['src/modules/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ADAPTER_ONLY_LIBRARIES.map((name) => ({ name, message: 'Import libraries only inside src/adapters.' })).concat([
            { name: '@chakra-ui/react', message: 'Use the wrapped components from @/common/components.' },
          ]),
        },
      ],
    },
  },
];
