// Configurazione minima: l'obiettivo è trovare bug veri (variabili non
// definite, hook usati in modo scorretto, importazioni morte) senza
// imporre uno stile — il codice esistente non è stato scritto pensando
// a un linter, quindi le regole puramente estetiche produrrebbero solo
// rumore su ~21.000 righe senza aiutare nessuno.
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'worker/**', 'test/**', 'public/**'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        __BUILD_ID__: 'readonly', // iniettato da Vite via `define` (vite.config.js)
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off', // niente PropTypes nel progetto: non è TypeScript, non serve introdurlo ora
      'react/react-in-jsx-scope': 'off', // JSX runtime automatico (Vite + React 18)
      'react/no-unescaped-entities': 'off', // testi in italiano pieni di apostrofi: la regola darebbe migliaia di falsi positivi
      'react/display-name': 'off',
      'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-constant-condition': ['error', { checkLoops: false }],
    },
    settings: { react: { version: '18.3' } },
  },
];
