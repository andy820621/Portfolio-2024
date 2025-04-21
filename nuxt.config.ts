import type { LocaleObject } from '@nuxtjs/i18n'
/* eslint-disable node/prefer-global/process */
import type { NitroConfig } from 'nitropack'
import { navbarData, seoData } from './data'
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
  // experimental: {
  //   inlineRouteRules: true,
  // },
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
      charset: 'utf-8',
      viewport: 'width=device-width,initial-scale=1',
      title: navbarData.homeTitle,
      meta: [
        { name: 'author', content: `${navbarData.homeTitle} | Hsieh Yao Tsu | ヒカル` },
        { name: 'description', content: seoData.description },
        { name: 'keywords', content: seoData.keywords },
        { name: 'theme-color', content: '#285658' },
        { name: 'twitter:site', content: seoData.twitterSite },
        { name: 'twitter:title', content: navbarData.homeTitle },
        { name: 'twitter:description', content: seoData.twitterDescription },
        { name: 'fb:app_id', content: seoData.fbAppId },
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
      /^\/demos\/.*/,
      /^\/en\/demos\/.*/,
      /^\/zh\/demos\/.*/,
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
    // sitemap: process.env.I18N_BASE_URL,
    blockAiBots: true,
  },
  schemaOrg: {
    defaults: false,
    debug: process.env.NODE_ENV !== 'production',
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
    plugins: ['~/server/plugins/sitemap'],
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
      sitemap: {
        lastmod,
        changefreq: 'daily',
        priority: 1,
        images: [
          {
            url: '/page-cover/home.webp',
            title: 'home page image',
            caption: 'This is the home page image.',
          },
        ],
      },
      robots: true,
      // TODO: 檢查為什麼加了 cache 會有問題
      // cache: {
      //   maxAge: 3600,
      //   staleMaxAge: 86400,
      // },
    },
    '/**': { prerender: true },
    '/posts': {
      prerender: true,
      sitemap: {
        lastmod,
        changefreq: 'daily',
        priority: 0.9,
        images: [
          {
            url: '/page-cover/blog.webp',
            title: 'blog page image',
            caption: 'This is the blog page image.',
          },
        ],
      },
      robots: true,
    },
    '/posts/**': { prerender: true, robots: true },
    '/demos': {
      prerender: true,
      sitemap: {
        lastmod,
        changefreq: 'daily',
        priority: 0.9,
        images: [
          {
            url: '/page-cover/demos.webp',
            title: 'demos page image',
            caption: 'This is the demos page image.',
          },
        ],
      },
      robots: true,
    },
    '/gallery': {
      isr: 21600,
      sitemap: {
        lastmod,
        changefreq: 'daily',
        priority: 0.9,
        images: [
          {
            url: '/page-cover/gallery.webp',
            title: 'gallery page image',
            caption: 'This is the gallery page image.',
          },
        ],
      },
      robots: true,
    },
    '/gallery/**': {
      isr: 21600,
      cache: {
        maxAge: 21600,
      },
      sitemap: { changefreq: 'daily', priority: 0.8 },
      robots: true,
    },
    '/projects': {
      isr: 21600,
      sitemap: {
        lastmod,
        changefreq: 'daily',
        priority: 0.9,
        images: [
          {
            url: '/page-cover/projects.webp',
            title: 'projects page image',
            caption: 'This is the projects page image.',
          },
        ],
      },
      robots: true,
    },
    '/projects/**': { isr: 21600, sitemap: { changefreq: 'daily', priority: 0.9 }, robots: true },
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

  rules['sitemap.xml'] = {
    prerender: true,
  }

  return rules
}
