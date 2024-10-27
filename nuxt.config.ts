import type { LocaleObject } from '@nuxtjs/i18n'
/* eslint-disable node/prefer-global/process */
import { navbarData, seoData } from './data'
import { bundleIcons } from './data/bundleIcons'

const locales = [
  { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
  { code: 'zh', language: 'zh-TW', name: 'Chinese', file: 'zh.json' },
]

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  routeRules: generateRouteRules({
    locales,
  }),
  app: {
    head: {
      charset: 'utf-16',
      viewport: 'width=device-width,initial-scale=1',
      title: navbarData.homeTitle,
      meta: [
        { name: 'author', content: navbarData.homeTitle },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'shortcut icon', type: 'image/vnd.microsoft.icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/gif', href: '/animated_favicon.gif' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon/apple-touch-icon.png' },
        { rel: 'apple-touch-icon', sizes: '57x57', href: '/apple-touch-icon/apple-touch-icon-57x57.png' },
        { rel: 'apple-touch-icon', sizes: '72x72', href: '/apple-touch-icon/apple-touch-icon-72x72.png' },
        { rel: 'apple-touch-icon', sizes: '76x76', href: '/apple-touch-icon/apple-touch-icon-76x76.png' },
        { rel: 'apple-touch-icon', sizes: '114x114', href: '/apple-touch-icon/apple-touch-icon-114x114.png' },
        { rel: 'apple-touch-icon', sizes: '120x120', href: '/apple-touch-icon/apple-touch-icon-120x120.png' },
        { rel: 'apple-touch-icon', sizes: '144x144', href: '/apple-touch-icon/apple-touch-icon-144x144.png' },
        { rel: 'apple-touch-icon', sizes: '152x152', href: '/apple-touch-icon/apple-touch-icon-152x152.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon/apple-touch-icon-180x180.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
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
  // image: {
  //   ipx: {
  //     modifiers: {
  //       format: 'webp',
  //       formats: ['webp', 'gif', 'jpg', 'png'],
  //     },
  //   },
  // },
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
    locales,
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
    // compressPublicAssets: true,
    prerender: {
      failOnError: false, // 防止 404 錯誤中斷建置
      crawlLinks: true,
      routes: [
        '/',
        '/en',
        '/zh',
        '/gallery',
        '/demos',
        '/posts',
        '/projects',
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
    serverBundle: 'remote',
    clientBundle: {
      icons: bundleIcons,
      scan: true,
      includeCustomCollections: true,
      sizeLimitKb: 1024,
    },
    // customCollections: [
    //   {
    //     prefix: 'barz-icon',
    //     dir: './assets/svgIcons',
    //   },
    // ],
  },
  build: {
    transpile: ['shiki', 'fsevents', 'globby'],
  },
  vite: {
    define: {
      'process.env': process.env,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Try to fix `useNitroApp` warning about circular dependency.
              if (id.includes('nitropack')) {
                return 'nitropack'
              }
              if (id.includes('gsap')) {
                return 'gsap'
              }
              if (id.includes('@iconify-json')) {
                return 'iconify-icons'
              }
              return 'vendor'
            }
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        '@nuxt/vite-builder',
        // 'fsevents',
        // '@nuxt/content',
        // 'shiki',
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler', // or "modern"
        },
      },
    },
  },
})

interface RouteRule {
  prerender?: boolean
  isr?: number
  swr?: boolean
}

interface RouteRules {
  [key: string]: RouteRule
}

interface GenerateRouteRulesOptions {
  locales: LocaleObject[]
}

function generateRouteRules({ locales }: GenerateRouteRulesOptions): RouteRules {
  const rules: RouteRules = {}

  // 為預設語言生成無前綴的路由規則
  const defaultRules: RouteRules = {
    '/': { prerender: true },
    '/posts': { isr: 3600 },
    '/posts/**': { isr: 86400 },
    '/demos': { prerender: true },
    '/gallery': { isr: 21600 },
    '/projects': { isr: 86400 },
  }

  Object.assign(rules, defaultRules)

  // 為所有語言（包括預設語言）生成帶前綴的路由規則
  locales.forEach((locale) => {
    const prefix = `/${locale.code}`
    Object.entries(defaultRules).forEach(([path, rule]) => {
      rules[`${prefix}${path}`] = { ...rule }
    })
  })

  // 動態路由
  rules['/**'] = { swr: true }

  return rules
}
