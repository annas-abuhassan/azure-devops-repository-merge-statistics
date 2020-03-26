module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    jest: true
  },
  extends: ['airbnb-base'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    'arrow-parens': 0,
    'comma-dangle': 0,
    'no-console': 0,
    'no-unused-expressions': [0, { 'allowTernary': true }],
    'no-shadow': [0, { 'builtinGlobals': false, 'hoist': 'functions', 'allow': ['id'] }],
    'linebreak-style': [0, ['windows']],
    'no-param-reassign': [0],
    'arrow-body-style': [0]
  }
};
