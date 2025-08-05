import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactPlugin from 'eslint-plugin-react';

export default [
  // Globale Ignorierungen
  {
    ignores: [
      '**/node_modules/**',
      'dist/**',
      '**/*.config.js',
      '**/.eslintrc.*' // Falls alte Konfigurationen existieren
    ]
  },

  // JavaScript/JSX-Regeln
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...js.configs.recommended.rules,
      
      // React-spezifische Regeln
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],

      // Erweiterte Regeln
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true
        }
      ],
      'no-console': 'warn',
      'quotes': ['error', 'single'],
      'jsx-quotes': ['error', 'prefer-single']
    }
  },

  // Optional: TypeScript-Unterstützung (falls verwendet)
  /*
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      'plugin:@typescript-eslint/recommended'
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ]
    }
  }
  */
];