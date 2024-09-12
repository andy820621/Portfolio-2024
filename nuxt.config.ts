import { navbarData, seoData } from './data'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  app: {
    head: {
      charset: 'utf-16',
      viewport: 'width=device-width,initial-scale=1',
      title: navbarData.homeTitle,
      titleTemplate: `%s - ${navbarData.homeTitle}`,
      meta: [
        { name: 'author', content: navbarData.homeTitle },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
  sitemap: {
    strictNuxtContentPaths: true,
  },
  site: {
    url: seoData.mySite,
    identity: {
      type: 'Person',
    },
    twitter: seoData.twitterHandle,
  },
  content: {
    documentDriven: {
      injectPage: false,
    },
    experimental: {
      search: {},
    },
    highlight: {
      theme: {
        default: 'vitesse-light',
        dark: 'vitesse-dark',
        sepia: 'monokai',
      },
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
      ],
    },
  },
  colorMode: {
    classSuffix: '',
    // preference: 'dark',
    // fallback: 'light',
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
    '@nuxt/content',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-og-image',
    '@formkit/auto-animate',
    '@stefanobartoletti/nuxt-social-share',
  ],
  unocss: {
    nuxtLayers: true,
  },
  // vite: {
  //   optimizeDeps: {
  //     include: [
  //       '@nuxt/image',
  //       'nuxt-og-image',
  //     ],
  //   },
  // },
})
