import type { LocaleObject } from '@nuxtjs/i18n'
/* eslint-disable node/prefer-global/process */
import type { NitroConfig } from 'nitropack'
import { navbarData, seoData } from './data'
import { bundleIcons } from './data/bundleIcons'

type SupportedLocale = 'en' | 'zh'

// 使用明確類型定義 locales
const locales: LocaleObject<SupportedLocale>[] = [
  { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
  { code: 'zh', language: 'zh-TW', name: 'Chinese', file: 'zh.json' },
]

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@nuxtjs/seo',
    '@nuxt/content',
    '@nuxtjs/i18n',
    'floating-vue/nuxt',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    '@nuxtjs/fontaine',
    '@formkit/auto-animate',
    'nuxt-swiper',
    '@stefanobartoletti/nuxt-social-share',
    '@nuxt/image',
  ],
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
  runtimeConfig: {
    postgresUrl: process.env.POSTGRES_URL, // 確保環境變量可用
  },
  site: {
    url: process.env.I18N_BASE_URL,
    name: navbarData.homeTitle,
    identity: {
      type: 'Person',
    },
    twitter: seoData.twitterLink,
  },
  sitemap: {
    sources: [
      '/api/__sitemap__/posts',
      '/api/__sitemap__/gallery',
      '/api/__sitemap__/projects',
    ],
    autoI18n: {
      locales: [
        {
          code: 'en',
          _sitemap: 'en',
          _hreflang: 'en',
        },
        {
          code: 'zh-TW',
          _sitemap: 'zh-TW',
          _hreflang: 'zh-TW',
        },
      ],
      defaultLocale: 'en',
      strategy: 'prefix_and_default',
    },
  },
  robots: {
    allow: ['/', '/en/', '/zh/', '/api/__sitemap__/'],
    disallow: [
      '/admin',
      '/private',
      '/api/(?!__sitemap__/).*', // 阻擋除了 __sitemap__ 以外的所有 API 路徑
    ],
    sitemap: process.env.I18N_BASE_URL,
    blockAiBots: true,
  },
  schemaOrg: {
    defaults: false,
    identity: {
      type: 'Person',
      name: navbarData.homeTitle,
      url: process.env.I18N_BASE_URL,
      // image: '/profile-photo.jpg',
      description: seoData.description,
      email: 'andy820621@gmail.com',
      sameAs: [
        'https://www.twitter.com/BarZ3064',
        'https://www.instagram.com/andy820621',
        'https://github.com/andy820621',
      ],
      inLanguage: ['en', 'en-US', 'zh-TW'],
    },
  },
  ogImage: {
    debug: true,
    defaults: {
      props: {
        title: seoData.ogTitle,
        description: seoData.description,
        url: process.env.I18N_BASE_URL,
        twitterSite: seoData.twitterLink,
        siteName: seoData.ogTitle,
      },
    },
    fonts: [
      'Noto+Sans+SC:400',
    ],
  },
  image: {
    format: ['webp', 'gif', 'jpg', 'png'],
    ipx: {
      modifiers: {
        format: 'webp',
        formats: ['webp', 'gif', 'jpg', 'png'],
      },
    },
  },
  content: {
    build: {
      markdown: {
        toc: {
          depth: 3, // include h3 headings
        },
        rehypePlugins: {
          'rehype-external-links': {
            target: '_blank',
            rel: ['nofollow', 'noopener', 'noreferrer'],
          },
        },
        highlight: {
          theme: {
            default: 'vitesse-light',
            dark: 'vitesse-dark',
            sepia: 'monokai',
          },
        },
      },
    },
    experimental: {
      nativeSqlite: false,
    },
  },
  i18n: {
    baseUrl: process.env.I18N_BASE_URL,
    locales,
    strategy: 'prefix_and_default',
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root', // recommended
      fallbackLocale: 'en',
    },
    bundle: {
      optimizeTranslationDirective: false,
    },
  },
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
  colorMode: {
    classSuffix: '',
    // preference: 'dark',
    // fallback: 'light',
  },
  build: {
    transpile: ['shiki', 'fsevents', 'globby', 'vite-plugin-checker'],
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
          sourcemapExcludeSources: !(process.env.NODE_ENV === 'development'), // Set to false to include sources in sourcemaps
        },
      },
      sourcemap: process.env.NODE_ENV === 'development' ? true : 'hidden',
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
  nitro: {
    // compressPublicAssets: true,
    // debug: process.env.NODE_ENV !== 'production',
    debug: true,
    preset: 'netlify',
    publicAssets: [
      {
        dir: 'public',
      },
    ],
    prerender: {
      // failOnError: false, // 防止 404 錯誤中斷建置
      crawlLinks: true,
      routes: [
        '/',
        // '/en',
        // '/zh',
        // '/gallery',
        // '/demos',
        // '/posts',
        // '/projects',
        // '/sitemap.xml',
      ],
      ignore: ['/api/_content'],
    },
    future: {
      nativeSWR: true,
    },
  },
})

type RouteRules = NitroConfig['routeRules']

interface GenerateRouteRulesOptions {
  locales: LocaleObject[]
}

function generateRouteRules({ locales }: GenerateRouteRulesOptions): RouteRules {
  const rules: RouteRules = {}

  // 為預設語言生成無前綴的路由規則
  const defaultRules: RouteRules = {
    '/': {
      prerender: true,
      // TODO: 檢查為什麼加了 cache 會有問題
      // cache: {
      //   maxAge: 3600,
      //   staleMaxAge: 86400,
      // },
    },
    '/**': {
      prerender: true,
      //   maxAge: 3600,
      //   staleMaxAge: 86400,
      // },
    },
    '/posts': { prerender: true },
    '/posts/**': { prerender: true },
    '/demos': { prerender: true },
    '/gallery': { isr: 21600 },
    '/gallery/**': {
      isr: 21600,
      cache: {
        maxAge: 21600,
      },
    },
    '/projects': { isr: 21600 },
    '/projects/**': { isr: 21600 },
  }

  Object.assign(rules, defaultRules)

  // 定義不需要語言前綴的路徑
  const excludedPaths = ['/gallery', '/gallery/**']

  // 為所有語言（包括預設語言）生成帶前綴的路由規則，但排除指定路徑
  locales.forEach((locale) => {
    const prefix = `/${locale.code}`
    Object.entries(defaultRules).forEach(([path, rule]) => {
      // 只有不在排除列表中的路徑才生成帶前綴的規則
      if (!excludedPaths.includes(path)) {
        rules[`${prefix}${path}`] = { ...rule }
      }
    })
  })

  return rules
}
