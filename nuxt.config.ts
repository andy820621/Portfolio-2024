/* eslint-disable node/prefer-global/process */
import type { LocaleObject } from '@nuxtjs/i18n'
import type { NitroConfig } from 'nitropack'
import { getSitemapDateFormat } from './app/utils/dayjs'
import { getKeywords, navbarData, seoData } from './data'
import { bundleIcons } from './data/bundleIcons'

type SupportedLocale = 'en' | 'zh'

// 使用明確類型定義 locales
const locales: LocaleObject<SupportedLocale>[] = [
  { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
  { code: 'zh', language: 'zh-TW', name: 'Chinese', file: 'zh.json' },
]

const lastmod = getSitemapDateFormat(Date.now())

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
    redirectToCanonicalSiteUrl: true,
  },
  linkChecker: {
    enabled: true,
    skipInspections: [
      'no-uppercase-chars',
      'no-non-ascii-chars',
      'no-baseless',
      'trailing-slash',
      'missing-hash',
    ],
    showLiveInspections: false,
    failOnError: false,
  },
  experimental: {
    // inlineRouteRules: true,
    defaults: {
      nuxtLink: {
        trailingSlash: 'append',
      },
    },
    payloadExtraction: true,
  },
  modules: [
    '~~/modules/content-hooks',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@nuxtjs/seo',
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
  ],
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
        { name: 'color-scheme', content: 'dark light' },
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
      mermaid: {
        importSource:
          process.env.MERMAID_IMPORT_SOURCE
          ?? 'https://cdn.jsdelivr.net/npm/mermaid@11.12.1/dist/mermaid.esm.min.mjs',
        init: {
          startOnLoad: false,
        },
      },
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
      '/api/__sitemap__',
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
    debug: process.env.NODE_ENV !== 'production',
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
    baseUrl: process.env.I18N_BASE_URL,
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
      cookieCrossOrigin: process.env.NODE_ENV === 'production',
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
        external: ['mermaid'],
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
      },
      sourcemap: process.env.NODE_ENV === 'development' ? true : 'hidden',
    },
  },
  nitro: {
    compressPublicAssets: true,
    debug: process.env.NODE_ENV !== 'production',
    preset: process.env.NETLIFY ? 'netlify' : undefined,
    plugins: ['~~/server/plugins/sitemap'],
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
      ],
      // 忽略 API 和內容查詢 endpoints,避免嘗試預渲染它們
      ignore: [
        '/api/_content',
        '/api/**',
        '/__nuxt_content/**',
        '/.well-known/**', // 忽略 Chrome DevTools 請求
      ],
    },
    hooks: {
      'prerender:routes': async function (routes: Set<string>) {
        // 動態添加所有內容路由
        try {
          const fs = await import('node:fs/promises')
          const path = await import('node:path')
          const { fileURLToPath } = await import('node:url')

          const __dirname = fileURLToPath(new URL('.', import.meta.url))
          const contentDir = path.join(__dirname, 'content')

          // 掃描 content 目錄獲取所有 .md 檔案
          async function scanContentDir(dir: string, locale: string, type: string): Promise<string[]> {
            try {
              const files = await fs.readdir(dir, { withFileTypes: true })
              const routes: string[] = []

              for (const file of files) {
                const fullPath = path.join(dir, file.name)
                if (file.isDirectory()) {
                  routes.push(...(await scanContentDir(fullPath, locale, type)))
                }
                else if (file.name.endsWith('.md')) {
                  // 將檔案路徑轉換為路由
                  const slug = file.name.replace(/\.md$/, '')
                  const routePath = locale === 'en'
                    ? `/${type}/${slug}`
                    : `/zh/${type}/${slug}`
                  routes.push(routePath)
                }
              }

              return routes
            }
            catch {
              return []
            }
          }

          // 掃描所有內容目錄
          const [postsEn, postsZh, projectsEn, projectsZh] = await Promise.all([
            scanContentDir(path.join(contentDir, 'en', 'posts'), 'en', 'posts'),
            scanContentDir(path.join(contentDir, 'zh', 'posts'), 'zh', 'posts'),
            scanContentDir(path.join(contentDir, 'en', 'projects'), 'en', 'projects'),
            scanContentDir(path.join(contentDir, 'zh', 'projects'), 'zh', 'projects'),
          ])

          const contentRoutes = [...postsEn, ...postsZh, ...projectsEn, ...projectsZh]

          for (const route of contentRoutes) {
            routes.add(route)
          }

          console.warn(`[Nitro Hooks] Added ${contentRoutes.length} content routes for prerendering`)
        }
        catch (error) {
          console.error('[Nitro Hooks] Failed to scan content routes:', error)
        }
      },
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
    '/posts': {
      prerender: true,
      headers: { 'cache-control': 'public, max-age=3600' },
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
      headers: { 'cache-control': 'public, max-age=86400' },
      robots: true,
      swr: false, // 強制使用預渲染，禁用 server-side rendering
    },

    '/demos': {
      prerender: true,
      headers: { 'cache-control': 'public, max-age=3600' },
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
      prerender: true,
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
      prerender: true,
      sitemap: { changefreq: 'daily', priority: 0.9 },
      robots: true,
      swr: false, // 強制使用預渲染，禁用 server-side rendering
    },

    '/gallery': {
      prerender: true,
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
      prerender: true,
      sitemap: { changefreq: 'daily', priority: 0.8 },
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
