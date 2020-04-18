module.exports = {
    env: {
        es6: true,
        node: true,
    },
    extends: ['airbnb-base', 'prettier'],
    plugins: ['prettier', 'import-helpers'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        jest: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    rules: {
        'no-underscore-dangle': 'off',
        'import/prefer-default-export': 'off',
        'prettier/prettier': 'error',
        'class-methods-use-this': 'off',
        'no-param-reassign': 'off',
        camelcase: 'off',
        'no-use-before-define': 'off',
        'no-unused-vars': [
            'error',
            {
                argsIgnorePattern: 'next',
            },
        ],
        'import-helpers/order-imports': [
            'warn',
            {
                newlinesBetween: 'always',
                groups: ['module', ['parent', 'sibling', 'index']],
                alphabetize: { order: 'asc', ignoreCase: true },
            },
        ],
    },
};
