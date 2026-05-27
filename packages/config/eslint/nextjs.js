/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...require('./base'),
  extends: [
    'next/core-web-vitals',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/no-autofocus': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
  },
  overrides: [
    {
      // The card builder uses a dense canvas-like editing surface. These remain
      // warnings until the editor controls are migrated to semantic primitives.
      files: ['src/components/cards/card-form.tsx'],
      rules: {
        'jsx-a11y/click-events-have-key-events': 'warn',
        'jsx-a11y/no-autofocus': 'warn',
        'jsx-a11y/no-static-element-interactions': 'warn',
      },
    },
  ],
  settings: {
    react: { version: 'detect' },
  },
};
