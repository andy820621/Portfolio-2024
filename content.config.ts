import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'

interface SitemapUrl {
  loc: string
}

const sitemapChangeFrequencySchema = z.union([
  z.literal('always'),
  z.literal('hourly'),
  z.literal('daily'),
  z.literal('weekly'),
  z.literal('monthly'),
  z.literal('yearly'),
  z.literal('never'),
])

const sitemapSchema = z.object({
  loc: z.string().optional(),
  lastmod: z.coerce.date().optional(),
  changefreq: sitemapChangeFrequencySchema.optional(),
  priority: z.number().optional(),
  images: z.array(z.object({
    loc: z.string(),
    caption: z.string().optional(),
    geo_location: z.string().optional(),
    title: z.string().optional(),
    license: z.string().optional(),
  })).optional(),
  videos: z.array(z.object({
    content_loc: z.string(),
    player_loc: z.string().optional(),
    duration: z.string().optional(),
    expiration_date: z.coerce.date().optional(),
    rating: z.number().optional(),
    view_count: z.number().optional(),
    publication_date: z.coerce.date().optional(),
    family_friendly: z.boolean().optional(),
    tag: z.string().optional(),
    category: z.string().optional(),
    restriction: z.object({
      relationship: z.literal('allow').optional(),
      value: z.string().optional(),
    }).optional(),
    gallery_loc: z.string().optional(),
    price: z.string().optional(),
    requires_subscription: z.boolean().optional(),
    uploader: z.string().optional(),
  })).optional(),
}).optional()

// TODO: When @nuxt/content and Nuxt SEO schema helpers resolve to the same Zod major,
// replace these local compatibility schemas with the official helpers:
// defineRobotsSchema(), defineOgImageSchema(), defineSchemaOrgSchema(), and
// use defineSitemapSchema()'s return value directly in createSeoSchemaFields().
const baseSeoSchemaFields = {
  robots: z.union([z.string(), z.boolean()]).optional(),
  ogImage: z.object({
    url: z.string().optional(),
    component: z.string().optional(),
    props: z.record(z.string(), z.any()).optional(),
  }).optional(),
  schemaOrg: z.union([
    z.record(z.string(), z.any()),
    z.array(z.record(z.string(), z.any())),
  ]).optional(),
}

function prependZhLocalePrefix(url: SitemapUrl) {
  if (!url.loc.startsWith('/zh'))
    url.loc = `/zh${url.loc}`
}

function registerSitemapCollection(name: string, onUrl?: (url: SitemapUrl) => void) {
  // TODO: Remove this typed bridge once defineSitemapSchema() returns a schema
  // compatible with @nuxt/content's exported Zod instance. The call is still kept
  // because Nuxt Sitemap registers collection filter/onUrl hooks as side effects.
  const register = defineSitemapSchema as unknown as (options: {
    filter: (entry: Record<string, unknown>) => boolean
    name: string
    onUrl?: (url: SitemapUrl) => void
    z: unknown
  }) => unknown

  register({
    z,
    name,
    filter: entry => entry.published !== false,
    ...(onUrl ? { onUrl } : {}),
  })
}

function createSeoSchemaFields(name: string, onUrl?: (url: SitemapUrl) => void) {
  registerSitemapCollection(name, onUrl)

  return {
    ...baseSeoSchemaFields,
    sitemap: sitemapSchema,
  }
}

// 通用內容模式
const commonContentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  date: z.coerce.date(),
  keywords: z.array(z.string()).optional(),
  updatedAt: z.coerce.date().optional(),
  published: z.boolean().default(true),
})

// Blogs 內容模式
const articleSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  date: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  cover: z.string().optional(),
  image: z.string().optional(),
  alt: z.string().optional(),
  tags: z.array(z.string()),
  categories: z.array(z.string()).optional(),
  published: z.boolean().default(true),
  rawbody: z.string(),
  imageClass: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  wordCount: z.number().optional(),
  readingTime: z.number().optional(),
})

// projects 內容模式
const projectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  date: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  cover: z.string().optional(),
  image: z.string().optional(),
  alt: z.string().optional(),
  tags: z.array(z.string()),
  categories: z.array(z.string()).optional(),
  published: z.boolean().default(true),
  rawbody: z.string(),
  imageClass: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  wordCount: z.number().optional(),
  readingTime: z.number().optional(),
})

// demos 內容模式
const demoSchema = z.object({
  link: z.string().optional(),
  github: z.string().optional(),
  codepen: z.string().optional(),
  thumbnailType: z.string().optional(),
  tags: z.array(z.string()),
  published: z.boolean().default(true),
  date: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  keywords: z.array(z.string()).optional(),
})

const gallerySchema = z.object({
  albumId: z.string(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  order: z.number().int().positive(),
  title: z.string(),
  chTitle: z.string().optional(),
  coverImage: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()),
  updatedAt: z.coerce.date().optional(),
  published: z.boolean().default(true),
})

export default defineContentConfig({
  collections: {
    content_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/**/*.md',
        exclude: ['en/posts/*.md', 'en/projects/*.md', 'en/demos/*.md'],
        prefix: '',
      },
      schema: commonContentSchema.extend(createSeoSchemaFields('content_en')),
    }),
    content_zh: defineCollection({
      type: 'page',
      source: {
        include: 'zh/**/*.md',
        exclude: ['zh/posts/*.md', 'zh/projects/*.md', 'zh/demos/*.md'],
        prefix: '',
      },
      schema: commonContentSchema.extend(createSeoSchemaFields('content_zh', prependZhLocalePrefix)),
    }),

    // Blog 集合
    posts_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/posts/*.md',
        prefix: '/posts',
      },
      schema: articleSchema.extend(createSeoSchemaFields('posts_en')),
    }),
    posts_zh: defineCollection({
      type: 'page',
      source: {
        include: 'zh/posts/*.md',
        prefix: '/zh/posts',
      },
      schema: articleSchema.extend(createSeoSchemaFields('posts_zh')),
    }),

    // Projects 集合
    projects_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/projects/*.md',
        prefix: '/projects',
      },
      schema: projectSchema.extend(createSeoSchemaFields('projects_en')),
    }),
    projects_zh: defineCollection({
      type: 'page',
      source: {
        include: 'zh/projects/*.md',
        prefix: '/zh/projects',
      },
      schema: projectSchema.extend(createSeoSchemaFields('projects_zh')),
    }),

    // Demos 集合
    demos_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/demos/*.md',
        prefix: '/demos',
      },
      schema: demoSchema.extend(createSeoSchemaFields('demos_en')),
    }),
    demos_zh: defineCollection({
      type: 'page',
      source: {
        include: 'zh/demos/*.md',
        prefix: '/zh/demos',
      },
      schema: demoSchema.extend(createSeoSchemaFields('demos_zh')),
    }),

    gallery: defineCollection({
      type: 'data',
      source: 'gallery/*.yml',
      schema: gallerySchema,
    }),
  },
})
