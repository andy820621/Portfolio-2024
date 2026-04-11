import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { defineRobotsSchema } from '@nuxtjs/robots/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'
import { defineOgImageSchema } from 'nuxt-og-image/content'
import { defineSchemaOrgSchema } from 'nuxt-schema-org/content'

// SEO schema fields，取代已棄用的 asSeoCollection
const seoSchemaFields = {
  robots: defineRobotsSchema(),
  sitemap: defineSitemapSchema(),
  ogImage: defineOgImageSchema(),
  schemaOrg: defineSchemaOrgSchema(),
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
  ogImage: z.string().optional(),
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
  ogImage: z.string().optional(),
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
  order: z.number().int().positive(),
  title: z.string(),
  chTitle: z.string().optional(),
  coverImage: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()),
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
      schema: commonContentSchema.extend(seoSchemaFields),
    }),
    content_zh: defineCollection({
      type: 'page',
      source: {
        include: 'zh/**/*.md',
        exclude: ['zh/posts/*.md', 'zh/projects/*.md', 'zh/demos/*.md'],
        prefix: '',
      },
      schema: commonContentSchema.extend(seoSchemaFields),
    }),

    // Blog 集合
    posts_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/posts/*.md',
        prefix: '/posts',
      },
      schema: articleSchema.extend(seoSchemaFields),
    }),
    posts_zh: defineCollection({
      type: 'page',
      source: {
        include: 'zh/posts/*.md',
        prefix: '/zh/posts',
      },
      schema: articleSchema.extend(seoSchemaFields),
    }),

    // Projects 集合
    projects_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/projects/*.md',
        prefix: '/projects',
      },
      schema: projectSchema.extend(seoSchemaFields),
    }),
    projects_zh: defineCollection({
      type: 'page',
      source: {
        include: 'zh/projects/*.md',
        prefix: '/zh/projects',
      },
      schema: projectSchema.extend(seoSchemaFields),
    }),

    // Demos 集合
    demos_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/demos/*.md',
        prefix: '/demos',
      },
      schema: demoSchema.extend(seoSchemaFields),
    }),
    demos_zh: defineCollection({
      type: 'page',
      source: {
        include: 'zh/demos/*.md',
        prefix: '/zh/demos',
      },
      schema: demoSchema.extend(seoSchemaFields),
    }),

    gallery: defineCollection({
      type: 'data',
      source: 'gallery/*.yml',
      schema: gallerySchema,
    }),
  },
})
