import antfu from '@antfu/eslint-config'

export default antfu(
  {
    markdown: false,
    unocss: true,
    formatters: true,
  },
  {
    rules: {
      'pnpm/json-prefer-workspace-settings': 'off',
      'pnpm/json-enforce-catalog': 'off',
      'pnpm/yaml-enforce-settings': 'off',
    },
  },
)
