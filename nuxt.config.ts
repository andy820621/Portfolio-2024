// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  app: {
    head: {
      title: 'BarZ Hsieh',
      meta: [
        { name: 'author', content: 'BarZ Hsieh' },
      ],
    },
  },
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@nuxtjs/fontaine',
    '@unocss/nuxt',
    'floating-vue/nuxt',
    'dayjs-nuxt',
    '@nuxt/icon',
  ],
  unocss: {
    nuxtLayers: true,
  },
  // vite: {
  //   optimizeDeps: {
  //     include: [
  //       'vue',
  //       '@vueuse/core',
  //       'dayjs',
  //     ],
  //   },
  // }
})
