/* eslint-disable node/prefer-global/process */
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
  // TODO: Try to think of if use Nuxt I18n Micro is better (https://s00d.github.io/nuxt-i18n-micro/)
  i18n: {
    baseUrl: process.env.I18N_BASE_URL,
    vueI18n: './i18n.config.ts',
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'zh', language: 'zh-TW', name: 'Chinese', file: 'zh.json' },
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
    future: {
      nativeSWR: true,
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
  icon: {
    customCollections: [
      {
        prefix: 'barz-icon',
        dir: './assets/svgIcons',
      },
    ],
  },
  build: {
    transpile: ['shiki'],
  },
  vite: {
    define: {
      'process.env': process.env,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Try to fix `useNitroApp` warning about circular dependency.
            if (id.includes('nitropack')) {
              return 'nitropack'
            }
          },
        },
      },
    },
    // optimizeDeps: {
    //   include: [
    //     '@nuxt/content',
    //     'shiki',
    //   ],
    // },
  },
})
