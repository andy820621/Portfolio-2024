import type { LocaleObject } from '@nuxtjs/i18n'
/* eslint-disable node/prefer-global/process */
import type { NitroConfig } from 'nitropack'
import { getKeywords, navbarData, seoData } from './data'
import { bundleIcons } from './data/bundleIcons'
import { getSitemapDateFormat } from './utils/dayjs'

type SupportedLocale = 'en' | 'zh'

// 使用明確類型定義 locales
const locales: LocaleObject<SupportedLocale>[] = [
  { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
  { code: 'zh', language: 'zh-TW', name: 'Chinese', file: 'zh.json' },
]

const lastmod = getSitemapDateFormat(Date.now())

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  router: {
    options: {
      strict: false,
    },
  },
  seo: {
    redirectToCanonicalSiteUrl: true,
  },
  experimental: {
    // inlineRouteRules: true,
    defaults: {
      nuxtLink: {
        trailingSlash: 'append',
      },
    },
  },
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@nuxtjs/seo',
    '@nuxt/content',
    '@nuxtjs/i18n',
    'floating-vue/nuxt',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    '@formkit/auto-animate',
    '@stefanobartoletti/nuxt-social-share',
    '@nuxt/image',
    '@nuxtjs/html-validator',
    'nuxt-delay-hydration',
  ],
  // HTML optimization
  htmlValidator: {
    enabled: process.env.NODE_ENV !== 'production',
    // options: {
    //   rules: {
    //     'element-required-attributes': [
    //       'error',
    //       {
    //         ignore: {
    //           th: ['scope'],
    //         },
    //       },
    //     ],
    //   },
    // },
  },

  delayHydration: {
    // enables nuxt-delay-hydration in dev mode for testing
    // NOTE: you should disable this once you've finished testing, it will break HMR
    debug: process.env.NODE_ENV === 'development',
  },

  routeRules: generateRouteRules({
    locales,
  }),
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width,initial-scale=1',
      title: navbarData.homeTitle,
      meta: [
        { name: 'author', content: `${navbarData.homeTitle} | Hsieh Yao Tsu | ヒカル` },
        { name: 'description', content: seoData.description },
        { name: 'keywords', content: getKeywords('en') },
        { name: 'theme-color', content: '#285658' },
        { name: 'twitter:site', content: seoData.twitterSite },
        { name: 'twitter:title', content: navbarData.homeTitle },
        { name: 'twitter:description', content: seoData.twitterDescription },
        { property: 'fb:app_id', content: seoData.fbAppId },
        // { name: 'fb:pages_id', content: seoData.fbPagesId },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: navbarData.homeTitle },
        { name: 'msapplication-TileColor', content: '#285658' },
        { name: 'msapplication-TileImage', content: '/apple-touch-icon/apple-touch-icon-144x144.png' },
        { name: 'google-site-verification', content: seoData.googleSiteVerification },
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
        // 優化字型載入速度
        { rel: 'preconnect', href: 'https://fonts.bunny.net', crossorigin: '' },
        { rel: 'dns-prefetch', href: 'https://fonts.bunny.net' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
  runtimeConfig: {
    public: {
      trailingSlash: true,
    },
  },
  site: {
    url: process.env.I18N_BASE_URL,
    name: navbarData.homeTitle,
    identity: {
      type: 'Person',
    },
    trailingSlash: true,
  },
  sitemap: {
    xslTips: false,
    xsl: '/__sitemap__/style.xsl',
    xslColumns: [
      { label: 'URL', width: '50%' },
      { label: 'Last Modified', select: 'sitemap:lastmod', width: '25%' },
      { label: 'Images', select: 'count(image:image)', width: '5%' },
      // { label: 'First Image', select: 'substring(image:image[1]/image:loc, 1, 30)', width: '15%' },
      { label: 'Hreflangs', select: 'count(xhtml:link)', width: '5%' },
      { label: 'Priority', select: 'sitemap:priority', width: '5%' },
      { label: 'Change Frequency', select: 'sitemap:changefreq', width: '10%' },
    ],
    defaults: {
      changefreq: 'weekly',
      priority: 1,
      lastmod,
    },
    discoverImages: true,
    discoverVideos: true,
    exclude: [
      /^\/demos\/[^/]+/, // 排除 /demos/xxx，但保留 /demos/ 本身
      /^\/en\/demos\/[^/]+/, // 排除 /en/demos/xxx
      /^\/zh\/demos\/[^/]+/, // 排除 /zh/demos/xxx
      '/about',
      '/en/about',
      '/zh/about',
    ],
    sources: [
      '/api/__sitemap__/gallery',
      '/api/__sitemap__/index',
    ],
    autoI18n: true,
  },
  robots: {
    blockNonSeoBots: true,
    blockAiBots: true,
  },
  schemaOrg: {
    defaults: false,
    debug: process.env.NODE_ENV !== 'production',
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
  socialShare: {
    baseUrl: process.env.I18N_BASE_URL,
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
    // experimental: {
    //   sqliteConnector: 'native',
    // },
  },
  i18n: {
    baseUrl: process.env.I18N_BASE_URL,
    locales,
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'en',
      // trying...
      alwaysRedirect: false,
      cookieCrossOrigin: true,
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
    analyze: {
      enabled: true,
      open: true,
    },
  },
  features: {
    inlineStyles: true,
  },
  vite: {
    build: {
      rollupOptions: {
        treeshake: true,
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Try to fix `useNitroApp` warning about circular dependency.
              if (id.includes('nitropack')) {
                return 'nitropack'
              }
              if (id.includes('@iconify-json')) {
                return 'iconify-icons'
              }
              return 'vendor'
            }
          },
          sourcemapExcludeSources: !(process.env.NODE_ENV === 'development'), // Set to false to include sources in sourcemaps
        },
        external: [
          'better-sqlite3',
        ],
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
    compressPublicAssets: true,
    debug: process.env.NODE_ENV !== 'production',
    preset: 'netlify',
    plugins: ['~/server/plugins/sitemap'],
    publicAssets: [
      {
        dir: 'public',
      },
    ],
    prerender: {
      // failOnError: false, // 防止 404 錯誤中斷建置
      crawlLinks: true,
      routes: ['/'],
      ignore: ['/api/_content'],
    },
    minify: true,
    future: {
      nativeSWR: true,
    },
    externals: {
      external: ['better-sqlite3'],
    },
    // experimental: {
    //   database: true
    // },
    // storage: {
    //   'content-sqlite': {
    //     driver: 'db0',
    //     connector: 'sqlite',  // 通過 connector 指定使用 SQLite
    //     database: '.data/db/content.db',
    //     options: {
    //       native: true // 使用原生 SQLite
    //     }
    //   }
    // }
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
      headers: { 'Cache-Control': 'public, max-age=3600' },
      sitemap: {
        lastmod,
        changefreq: 'daily',
        priority: 1,
        images: [
          {
            loc: '/page-cover/home.webp',
            title: 'home page image',
            caption: 'This is the home page image.',
          },
        ],
      },
      robots: true,
    },
    '/**': {
      ssr: true,
    },

    '/posts': {
      prerender: true,
      headers: { 'Cache-Control': 'public, max-age=3600' },
      sitemap: {
        lastmod,
        changefreq: 'daily',
        priority: 0.9,
        images: [
          {
            loc: '/page-cover/blog.webp',
            title: 'blog page image',
            caption: 'This is the blog page image.',
          },
        ],
      },
      robots: true,
    },
    '/posts/**': {
      prerender: true,
      headers: { 'Cache-Control': 'public, max-age=86400' },
      robots: true,
    },

    '/demos': {
      prerender: true,
      headers: { 'Cache-Control': 'public, max-age=3600' },
      sitemap: {
        lastmod,
        changefreq: 'daily',
        priority: 0.9,
        images: [
          {
            loc: '/page-cover/demos.webp',
            title: 'demos page image',
            caption: 'This is the demos page image.',
          },
        ],
      },
      robots: true,
    },

    '/projects': {
      swr: 21600, // 6小時
      cache: {
        maxAge: 3600, // 1小時
        staleMaxAge: 86400, // 24小時
      },
      sitemap: {
        lastmod,
        changefreq: 'daily',
        priority: 0.9,
        images: [
          {
            loc: '/page-cover/projects.webp',
            title: 'projects page image',
            caption: 'This is the projects page image.',
          },
        ],
      },
      robots: true,
    },
    '/projects/**': {
      swr: 21600,
      cache: {
        maxAge: 3600,
        staleMaxAge: 86400,
      },
      sitemap: { changefreq: 'daily', priority: 0.9 },
      robots: true,
    },

    '/gallery': {
      swr: 7200, // 2小時
      cache: {
        maxAge: 1800, // 30分鐘
        staleMaxAge: 21600, // 6小時
      },
      sitemap: {
        lastmod,
        changefreq: 'daily',
        priority: 0.9,
        images: [
          {
            loc: '/page-cover/gallery.webp',
            title: 'gallery page image',
            caption: 'This is the gallery page image.',
          },
        ],
      },
      robots: true,
    },
    '/gallery/**': {
      swr: 7200,
      cache: {
        maxAge: 1800,
        staleMaxAge: 21600,
      },
      sitemap: { changefreq: 'daily', priority: 0.8 },
      robots: true,
    },

    // 靜態資源優化
    '/assets/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  }

  Object.assign(rules, defaultRules)

  // 只為非預設語言生成帶前綴的路由規則
  locales.forEach((locale) => {
    // 跳過預設語言 (因為使用 prefix_except_default 策略)
    if (locale.code === 'en')
      return

    const prefix = `/${locale.code}`

    // 新增: 為不帶尾斜線的語言根路徑設定規則
    const rootRule = defaultRules['/']
    if (rootRule) {
      rules[prefix] = { ...rootRule }
    }

    // 原有的帶斜線路徑規則
    Object.entries(defaultRules).forEach(([path, rule]) => {
      rules[`${prefix}${path}`] = { ...rule }
    })
  })

  // Special routes and static assets
  const noIndexPaths = ['page-cover', 'gallery-images', 'project-images', 'opt']

  Object.assign(rules, {
    '/sitemap.xml': {
      prerender: true,
    },

    ...noIndexPaths.reduce((acc, dir) => ({
      ...acc,
      [`/${dir}/**`]: { index: false, robots: 'noindex' },
    }), {}),
  })

  return rules
}
