module.exports = {
  extends: ['@vexip-ui/eslint-config'],
  root: true,
  rules: {
    '@typescript-eslint/no-use-before-define': 'off',
    'vue/no-textarea-mustache': 'off'
  },
  overrides: [
    {
      files: ['docs/**'],
      globals: {
        __ROLLBACK_LANG__: 'readonly'
      }
    },
    {
      files: ['dev-server/**'],
      globals: {
        __DEMOS__: 'readonly',
        __TARGET__: 'readonly',
        __THEME__: 'readonly'
      }
    },
    {
      files: ['scripts/**'],
      rules: {
        'no-sequences': 'off',
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ],
  globals: {
    __VERSION__: 'readonly'
  }
}
