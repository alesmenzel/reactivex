module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:promise/recommended',
    'airbnb',
    'airbnb/hooks',
    'prettier',
  ],
  plugins: ['@typescript-eslint', '@babel', 'jest', 'promise'],
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
    "import/prefer-default-export": "off",
    // @babel rules
    "@babel/new-cap": "error",
    "@babel/no-invalid-this": "error",
    "@babel/no-unused-expressions": "error",
    // typescript
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "no-redeclare": "off", // to allow TS function overloading
    // overrides
    "no-shadow": "off",
    "no-unused-vars": "off",
    "no-underscore-dangle": "off",
    "no-param-reassign": "off",
    "class-methods-use-this": "off",
    "no-plusplus": "off"
  },
  overrides: [{
    files: ["./src/**/*.test.ts"],
    rules: {
      "import/no-extraneous-dependencies": "off"
    }
  }]
};
