module.exports = {
  ...require('@sellio/config/eslint/base'),
  root: true,
  rules: {
    ...require('@sellio/config/eslint/base').rules,
    'import/no-unresolved': ['error', { ignore: ['^next/headers$'] }],
  },
};
