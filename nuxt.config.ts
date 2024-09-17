import { navbarData, seoData } from './data'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  app: {
    head: {
      charset: 'utf-16',
      viewport: 'width=device-width,initial-scale=1',
      title: navbarData.homeTitle,
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
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    documentDriven: {
      injectPage: false,
    },
    experimental: {
      // clientDB: true,
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
  i18n: {
    baseUrl: 'http://localhost:3000',
    // vueI18n: './i18n.config.ts',
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'zh', iso: 'zh-TW', name: 'Chinese', file: 'zh.json' },
    ],
    langDir: 'langs',
    strategy: 'prefix_and_default',
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root', // recommended
      fallbackLocale: 'en',
    },
    // lazy: true,
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        // '/sitemap.xml',
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
    '@nuxt/icon',
    '@nuxt/content',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-og-image',
    '@formkit/auto-animate',
    '@stefanobartoletti/nuxt-social-share',
    '@nuxtjs/i18n',
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
