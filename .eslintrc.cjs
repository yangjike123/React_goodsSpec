module.exports = {
  env: {
    "browser": true,
    "es2021": true,
    "node": true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh', "@typescript-eslint"],
  rules: {
    'react-refresh/only-export-components': 'warn',
  },

}
