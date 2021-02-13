module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:promise/recommended',
    'plugin:unicorn/recommended',
    'airbnb',
    'airbnb/hooks',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/babel',
    'prettier/react',
  ],
  plugins: ['@typescript-eslint', '@babel', 'jest', 'promise', 'unicorn'],
  settings: {
    // Setup import plugin to work with typescript
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.js', '.jsx', '.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
      },
    ],
    // @babel rules
    "@babel/new-cap": "error",
    "@babel/no-invalid-this": "error",
    "@babel/no-unused-expressions": "error",
    // unicorn
    "unicorn/no-null": "off",
    "unicorn/no-reduce": "off",
    "unicorn/prevent-abbreviations": "off",
    "unicorn/no-array-for-each": "off",
    "unicorn/no-array-reduce": "off",
    // typescript
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-unused-vars": "error",
    // overrides
    "no-shadow": "off",
    "no-unused-vars": "off",
  },
};
