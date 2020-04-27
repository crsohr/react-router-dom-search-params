module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'plugin:jest/recommended',
    'prettier',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'react/jsx-filename-extension': [1, {
      'extensions': ['.js', '.jsx'],
    }],
    'react/jsx-props-no-spreading': [2, {
      'exceptions': ['WrappedComponent', 'Link'],
    }],
    'react/forbid-prop-types': [0, {}],
  },
  overrides: [
    {
      files: ["src/*.test.js"],
      rules: {
        'react/prop-types': [0],
      },
    }
  ],
};
