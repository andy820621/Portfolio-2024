import { defineConfig, presetAttributify, presetIcons, presetMini, presetWebFonts, presetWind3, transformerDirectives } from 'unocss'

export default defineConfig({
  shortcuts: [
    {
      'bg-base': 'bg-[var(--clr-bg)]',
      'bg-primary': 'bg-[var(--clr-bg-green)]',
      'bg-primary-hover': 'bg-[var(--clr-hover-green)]',
      'bg-primary-green': 'bg-[var(--clr-primary-green)]',
      'text-base': 'text-[var(--clr-text)]',
      'text-primary': 'text-[var(--clr-primary-green)]',
      'text-sub': 'text-[var(--clr-sub-green)]',
      'border-base': 'border-[var(--clr-text)]',
      'shadow-base': 'shadow-[var(--box-shadow)]',
      'shadow-base-hover': 'shadow-[var(--box-shadow-hover)]',
      'base-btn': 'text-[var(--clr-btn-text)] bg-[var(--clr-btn)] rounded-lg hover:bg-[var(--clr-btn-hover)] transition duration-300',
      'base-btn-disabled': 'text-[var(--clr-btn-disabled)]',
      'base-focus': 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--clr-primary-green)]',
    },
    [/^btn-(\w+)$/, ([_, color]) => `op50 px2.5 py1 transition-all duration-200 ease-out no-underline! hover:(op100 text-${color} bg-${color}/10) border border-base! rounded`],
  ],
  rules: [
    [/^slide-enter-(\d+)$/, ([_, n]) => ({
      '--enter-stage': n,
    })],
    ['underline-base', {
      'text-decoration': 'underline 0.15em var(--clr-underline, rgba(0, 0, 0, 1))',
      'text-underline-offset': '0.2em',
      'transition': 'text-decoration-color 300ms, text-underline-offset 300ms',
    }],
    ['underline-base-hover', {
      'text-decoration-color': 'var(--clr-underline-hover, rgba(0, 0, 255, 1))',
      'text-underline-offset': '0.3em',
    }],
  ],
  presets: [
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    }),
    presetAttributify(),
    presetWind3(),
    presetMini({
      dark: 'class',
    }),
    presetWebFonts({
      provider: 'bunny',
      fonts: {
        sans: 'Inter:400,600,800',
        mono: 'DM Mono:400,600',
        condensed: 'Roboto Condensed',
        wisper: 'Bad Script',
      },
      timeouts: {
        warning: 800,
        failure: 5000,
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
  safelist: [
    'i-ri-menu-2-fill',
  ],
  content: {
    filesystem: [
      './content/**/*.md',
    ],
  },
})
