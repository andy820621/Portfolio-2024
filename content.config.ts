import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { defineRobotsSchema } from '@nuxtjs/robots/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'
// import { defineOgImageSchema } from 'nuxt-og-image/content'
import { defineSchemaOrgSchema } from 'nuxt-schema-org/content'

const baseSeoSchemaFields = {
  robots: defineRobotsSchema({ z }),
  // 當 @nuxt/content zod 升級到 v4 後，可以考慮用回 defineOgImageSchema 來定義 ogImage 的結構
  ogImage: z.object({
    url: z.string(),
  }).optional(),
  schemaOrg: defineSchemaOrgSchema({ z }),
}

function prependZhLocalePrefix(url: { loc: string }) {
  if (!url.loc.startsWith('/zh'))
    url.loc = `/zh${url.loc}`
}

function createSeoSchemaFields(name: string, onUrl?: (url: { loc: string }) => void) {
  return {
    ...baseSeoSchemaFields,
    sitemap: defineSitemapSchema({
      z,
      name,
      filter: entry => entry.published !== false,
      ...(onUrl ? { onUrl } : {}),
    }),
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
