/* eslint-disable node/prefer-global/process */
import type { LocaleObject } from '@nuxtjs/i18n'
import type { NitroConfig } from 'nitropack/types'
import type { NuxtPage } from 'nuxt/schema'
import { defineNuxtConfig } from 'nuxt/config'
import { createPersonIdentity, getKeywords, navbarData, seoData } from './data'
import { bundleIcons } from './data/bundleIcons'

type SupportedLocale = 'en' | 'zh'

// 使用明確類型定義 locales
const locales: LocaleObject<SupportedLocale>[] = [
  { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
  { code: 'zh', language: 'zh-TW', name: 'Chinese', file: 'zh.json' },
]

const chunkMap: Record<string, string> = {
  'nitropack': 'nitropack',
  '@iconify-json': 'iconify-icons',
  'lightgallery': 'lightgallery',
  'pixi.js': 'pixi',
  'ogl': 'ogl',
  'swiper': 'swiper',
  'minisearch': 'minisearch',
}

const DEFAULT_SITE_URL = seoData.mySite.replace(/\/$/, '')
const canonicalSiteUrl = (process.env.NUXT_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')
const isProduction = process.env.NODE_ENV === 'production'

const AI_SEARCH_BOTS = [
  'OAI-SearchBot',
  'Claude-SearchBot',
  'PerplexityBot',
]

const AI_USER_FETCH_BOTS = [
  'ChatGPT-User',
  'Claude-User',
]

const GALLERY_IMAGE_PATH_PREFIX = '/gallery-images/'

const AI_TRAINING_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
  'cohere-ai',
  'Diffbot',
  'FacebookBot',
  'Google-Extended',
  'ImagesiftBot',
  'OmigiliBot',
  'Omigili',
]

function stripSyntheticSitemapRoutes(pages: NuxtPage[], locales: LocaleObject[]): void {
  const localizedSitemapPaths = new Set<string>(['/sitemap.xml'])

  for (const locale of locales)
    localizedSitemapPaths.add(`/${locale.code}/sitemap.xml`)

  function prunePages(routePages: NuxtPage[]) {
    const retainedPages: NuxtPage[] = []

    for (const page of routePages) {
      if (page.children?.length)
        prunePages(page.children)

      if (!page.path || !localizedSitemapPaths.has(page.path))
        retainedPages.push(page)
    }

    routePages.splice(0, routePages.length, ...retainedPages)
  }

  prunePages(pages)
}

export default defineNuxtConfig({
  // debug: {
  //   hydration: true,
  // },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  router: {
    options: {
      strict: false,
    },
  },
  seo: {
    // Preserve intentional mixed-case content paths such as gallery album IDs.
    canonicalLowercase: false,
    redirectToCanonicalSiteUrl: true,
  },
  linkChecker: {
    enabled: !isProduction,
    skipInspections: [
      'no-uppercase-chars',
      'no-non-ascii-chars',
      'no-baseless',
      'trailing-slash',
      'missing-hash',
    ],
    showLiveInspections: false,
    failOnError: false,
    runOnBuild: !isProduction,
  },
  experimental: {
    // inlineRouteRules: true,
    defaults: {
      nuxtLink: {
        trailingSlash: 'append',
      },
    },
    // Avoid dev cache key collision at .nuxt/cache/nuxt/payload (file vs directory).
    // Keep extraction for production static output only.
    payloadExtraction: isProduction,
  },
  modules: [
    '@barzhsieh/nuxt-content-mermaid',
    '~~/modules/content-hooks',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@nuxtjs/seo',
    'nuxt-llms',
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@nuxt/icon',
    '@formkit/auto-animate',
    '@stefanobartoletti/nuxt-social-share',
    '@nuxt/image',
    '@nuxtjs/html-validator',
    'nuxt-delay-hydration',
    '@nuxt/fonts',
    '@netlify/nuxt',
    'nuxt-headlessui',
    'nuxt-gtag',
  ],
  gtag: {
    id: process.env.NUXT_PUBLIC_GTAG_ID,
    enabled: isProduction,
  },
  contentMermaid: {
    theme: {
      light: 'default',
      dark: 'dark',
    },
  },
  netlify: { database: { enabled: false } },
  // HTML optimization
  htmlValidator: {
    enabled: process.env.NODE_ENV !== 'production',
    options: {
      rules: {
        'long-title': 'off',
        'no-redundant-role': 'off',
        'prefer-native-element': 'off',
        'heading-level': 'off', // Allow flexible heading hierarchy
        'element-permitted-content': 'off', // Allow style tags in code blocks
        'no-implicit-close': 'off', // Allow implicit closing of elements
        'close-order': 'off', // Allow flexible tag closing order
        'no-redundant-aria-label': 'off',
      },
    },
  },

  delayHydration: {
    // enables nuxt-delay-hydration in dev mode for testing
    // NOTE: you should disable this once you've finished testing, it will break HMR
    debug: process.env.NODE_ENV !== 'production',
  },

  routeRules: generateRouteRules({
    locales,
  }),
  hooks: {
    'pages:resolved': (pages: NuxtPage[]) => {
      stripSyntheticSitemapRoutes(pages, locales)
    },
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width,initial-scale=1',
      title: navbarData.homeTitle,
      meta: [
        { name: 'author', content: `${navbarData.homeTitle} | Hsieh Yao Tsu | ヒカル` },
        { name: 'description', content: seoData.description },
        { name: 'keywords', content: getKeywords('en') },
        { name: 'theme-color', content: '#316064' },
        { name: 'color-scheme', content: 'dark light' },
        { name: 'twitter:site', content: seoData.twitterSite },
        { name: 'twitter:title', content: navbarData.homeTitle },
        { name: 'twitter:description', content: seoData.twitterDescription },
        { name: 'twitter:creator', content: seoData.twitterSite },
        { property: 'fb:app_id', content: seoData.fbAppId },
        // { name: 'fb:pages_id', content: seoData.fbPagesId },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: navbarData.homeTitle },
        { name: 'msapplication-TileColor', content: '#316064' },
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
    url: canonicalSiteUrl,
    name: navbarData.homeTitle,
    indexable: true,
    identity: {
      type: 'Person',
    },
    trailingSlash: true,
  },
  llms: {
    domain: canonicalSiteUrl,
    title: `${navbarData.homeTitle} Knowledge Map`,
    description: 'Portfolio content, technical posts, project breakdowns, and gallery albums by BarZ Hsieh (Hsieh, Yao- Tsu).',
    sections: [
      {
        title: 'Start Here',
        links: [
          { title: 'Home', href: '/' },
          { title: 'Posts', href: '/posts/' },
          { title: 'Projects', href: '/projects/' },
          { title: 'Gallery', href: '/gallery/' },
          { title: 'License', href: '/license/' },
        ],
      },
      {
        title: 'Featured Technical Content',
        links: [
          {
            title: 'Nuxt Content v3 i18n Bilingual Site',
            href: '/posts/nuxt-content-v3-i18n-bilingual-site/',
          },
          {
            title: 'Nuxt SEO Guide',
            href: '/posts/nuxt-seo-guide/',
          },
          {
            title: 'Nuxt Tips Collection',
            href: '/posts/nuxt-tips/',
          },
        ],
      },
      {
        title: 'Optional',
        links: [
          { title: 'Traditional Chinese Posts', href: '/zh/posts/' },
          { title: 'Traditional Chinese Projects', href: '/zh/projects/' },
          { title: 'Traditional Chinese Gallery', href: '/zh/gallery/' },
        ],
      },
    ],
  },
  sitemap: {
    xslTips: false,
    xsl: '/__sitemap__/style.xsl',
    xslColumns: [
      { label: 'URL', width: '55%' },
      { label: 'Last Modified', select: 'sitemap:lastmod', width: '25%' },
      { label: 'Images', select: 'count(image:image)', width: '10%' },
      // { label: 'First Image', select: 'substring(image:image[1]/image:loc, 1, 30)', width: '15%' },
      { label: 'Hreflangs', select: 'count(xhtml:link)', width: '10%' },
    ],
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
    autoI18n: true,
    // Build sitemap XML during production builds; keep runtime generation in dev for debugging.
    zeroRuntime: isProduction,
  },
  robots: {
    blockNonSeoBots: true,
    blockAiBots: false,
    groups: [
      {
        comment: ['Allow AI search bots'],
        userAgent: AI_SEARCH_BOTS,
        allow: ['/'],
        disallow: [GALLERY_IMAGE_PATH_PREFIX],
      },
      {
        comment: ['Allow user-triggered AI fetchers'],
        userAgent: AI_USER_FETCH_BOTS,
        allow: ['/'],
        disallow: [GALLERY_IMAGE_PATH_PREFIX],
      },
      {
        comment: ['Block AI training crawlers'],
        userAgent: AI_TRAINING_BOTS,
        disallow: ['/'],
      },
    ],
  },
  schemaOrg: {
    defaults: false,
    debug: process.env.NODE_ENV !== 'production',
    identity: {
      type: 'Person',
      ...createPersonIdentity({
        baseUrl: canonicalSiteUrl,
      }),
    },
  },
  ogImage: {
    debug: process.env.NODE_ENV !== 'production',
    zeroRuntime: isProduction,
    fontSubsets: ['latin', 'chinese-traditional', 'japanese'],
    buildCache: isProduction
      ? { base: '.cache/og-image' }
      : false,
  },
  fonts: {
    families: [
      {
        name: 'Inter',
        provider: 'google',
        weights: [400, 600, 700, 800],
        global: true,
      },
      {
        name: 'Noto Sans TC',
        provider: 'google',
        weights: [400, 500, 600, 700],
        global: true,
        preload: false,
      },
      {
        name: 'Noto Sans JP',
        provider: 'google',
        weights: [400, 500, 600, 700],
        global: true,
        preload: false,
      },
      {
        name: 'DM Mono',
        provider: 'google',
        weights: [400, 500, 700],
        global: true,
        preload: false,
      },
      {
        name: 'Roboto Condensed',
        provider: 'google',
        weights: [400, 700],
        global: true,
        preload: false,
      },
      {
        name: 'Bad Script',
        provider: 'google',
        weights: [400],
        global: true,
        preload: false,
      },
    ],
  },
  socialShare: {
    baseUrl: canonicalSiteUrl,
  },
  image: {
    format: ['avif', 'webp', 'jpg', 'png', 'gif'],
    quality: 81,
    // 使用 'none' provider 來完全禁用圖片優化,直接提供原始圖片
    // 這樣可以避免 IPX 的 URL 格式問題 // TODO: 等待 v2.0.1 或更高版本修正後考慮改成 IPX
    provider: 'none',
    // ipx: {
    //   modifiers: {
    //     format: 'webp',
    //     formats: ['webp', 'gif', 'jpg', 'png'],
    //   },
    // },
  },
  content: {
    renderer: {
      anchorLinks: { h2: true, h3: true, h4: true },
    },
    build: {
      markdown: {
        toc: {
          depth: 3, // include h3 headings
        },
        remarkPlugins: {
          'remark-gfm': {},
          'remark-validate-links': {},
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
    baseUrl: canonicalSiteUrl,
    locales,
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      // 避免將 Nuxt 內建錯誤路由 /__nuxt_error 也套用語系前綴，導致遞迴
      // 僅在根路徑觸發語系導向
      redirectOn: 'root',
      fallbackLocale: 'en',
      alwaysRedirect: false,
      // 僅在正式環境(HTTPS)啟用跨域 cookie，避免在本地/preview(HTTP) 寫入失敗
      cookieCrossOrigin: isProduction,
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
    //     prefix: 'my-icon',
    //     dir: './app/assets/my-icons',
    //   },
    // ],
  },
  build: {
    transpile: ['shiki', 'fsevents', 'globby', 'vite-plugin-checker'],
    analyze: {
      enabled: process.env.NODE_ENV !== 'production',
      open: process.env.NODE_ENV !== 'production',
    },
  },
  features: {
    inlineStyles: true,
  },
  vite: {
    optimizeDeps: {
      include: [
        'dayjs/locale/en', // CJS
        'dayjs/locale/zh', // CJS
        'dayjs/plugin/isToday.js', // CJS
        'dayjs/plugin/localizedFormat', // CJS
        'dayjs/plugin/timezone.js', // CJS
        'dayjs/plugin/utc.js', // CJS
        'dayjs/plugin/weekOfYear.js', // CJS
        'lightgallery',
        'lightgallery/plugins/share',
        'lightgallery/plugins/thumbnail',
        'lightgallery/plugins/zoom',
        'minisearch',
        'ogl',
        'pixi.js',
        'reka-ui',
        'simplex-noise',
        'swiper/modules',
        'swiper/vue',
      ],
    },
    build: {
      rollupOptions: {
        treeshake: true,
        output: {
          manualChunks(id: string) {
            if (!id.includes('node_modules'))
              return

            const entry = Object.entries(chunkMap).find(([key]) => id.includes(key))
            if (entry)
              return entry[1]
          },
          sourcemapExcludeSources: !(process.env.NODE_ENV === 'development'), // Set to false to include sources in sourcemaps
        },
      },
      sourcemap: process.env.NODE_ENV === 'development',
      chunkSizeWarningLimit: 2500,
    },
    server: {
      fs: {
        strict: !(process.env.NODE_ENV === 'development'),
      },
    },
  },
  nitro: {
    compressPublicAssets: true,
    debug: process.env.NODE_ENV !== 'production',
    preset: process.env.NETLIFY ? 'netlify' : undefined,
    publicAssets: [
      {
        dir: 'public',
      },
    ],
    prerender: {
      failOnError: process.env.NODE_ENV !== 'production', // 防止某些 404 錯誤中斷建置
      crawlLinks: true,
      // 確保所有靜態頁面和動態內容頁面都被預渲染
      routes: [
        '/',
        '/zh',
        '/posts',
        '/zh/posts',
        '/projects',
        '/zh/projects',
        '/gallery',
        '/zh/gallery',
      ],
      // 忽略 API 和內容查詢 endpoints,避免嘗試預渲染它們
      ignore: [
        '/api/_content',
        '/api/**',
        '/__nuxt_content/**',
        '/.well-known/**', // 忽略 Chrome DevTools 請求
      ],
    },
    minify: true,
    future: {
      nativeSWR: true,
    },
    // Let the target preset/package manager handle native module resolution
    // rollupConfig: {
    // },
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
      headers: { 'cache-control': 'public, max-age=3600' },
      sitemap: {
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
    '/posts': {
      prerender: true,
      headers: { 'cache-control': 'public, max-age=3600' },
      sitemap: {
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
      headers: { 'cache-control': 'public, max-age=86400' },
      robots: true,
      swr: false, // 強制使用預渲染，禁用 server-side rendering
    },

    '/demos': {
      prerender: true,
      headers: { 'cache-control': 'public, max-age=3600' },
      sitemap: {
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
      prerender: true,
      sitemap: {
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
      prerender: true,
      robots: true,
      swr: false, // 強制使用預渲染，禁用 server-side rendering
    },

    '/gallery': {
      prerender: true,
      sitemap: {
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
      prerender: true,
      robots: true,
    },

    // 靜態資源優化
    '/assets/**': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
      },
    },
    '/_nuxt/**': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
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
  const noIndexPaths = ['page-cover', 'project-images', 'opt']

  Object.assign(rules, {
    '/sitemap.xml': {
      prerender: true,
    },

    [`${GALLERY_IMAGE_PATH_PREFIX}**`]: {
      index: false,
      robots: {
        noindex: true,
        noai: true,
        noimageai: true,
      },
    },

    ...noIndexPaths.reduce((acc, dir) => ({
      ...acc,
      [`/${dir}/**`]: { index: false, robots: 'noindex' },
    }), {}),
  })

  return rules
}
