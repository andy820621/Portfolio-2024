import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'
// import { asOgImageCollection } from 'nuxt-og-image/content'

// 通用內容模式
const commonContentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
})

// Blogs 內容模式
const articleSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  updatedAt: z.string().optional(),
  image: z.string().optional(),
  alt: z.string().optional(),
  ogImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  rawbody: z.string(),
})

// projects 內容模式
const projectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  image: z.string().optional(),
  alt: z.string().optional(),
  ogImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  rawbody: z.string(),
})

// demos 內容模式
const demoSchema = z.object({
  link: z.string().optional(),
  github: z.string().optional(),
  codepen: z.string().optional(),
  thumbnailType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  date: z.string().optional(),
})

export default defineContentConfig({
  collections: {
    // 主要內容集合（不包括特定子目錄）
    content_en: defineCollection(
      asSeoCollection({
        type: 'page',
        source: {
          include: 'en/**/*.md',
          exclude: ['en/posts/*.md', 'en/projects/*.md', 'en/demos/*.md'],
          prefix: '',
        },
        schema: commonContentSchema,
      }),
    ),
    content_zh: defineCollection(
      asSeoCollection({
        type: 'page',
        source: {
          include: 'zh/**/*.md',
          exclude: ['zh/posts/*.md', 'zh/projects/*.md', 'zh/demos/*.md'],
          prefix: '',
        },
        schema: commonContentSchema,
      }),
    ),

    // Blog 集合
    posts_en: defineCollection(
      asSeoCollection({
        type: 'page',
        source: {
          include: 'en/posts/*.md',
          prefix: '/posts',
        },
        schema: articleSchema,
      }),
    ),
    posts_zh: defineCollection(
      asSeoCollection({
        type: 'page',
        source: {
          include: 'zh/posts/*.md',
          prefix: '/zh/posts',
        },
        schema: articleSchema,
      }),
    ),

    // Projects集合
    projects_en: defineCollection(
      asSeoCollection({
        type: 'page',
        source: {
          include: 'en/projects/*.md',
          prefix: '/projects',
        },
        schema: projectSchema,
      }),
    ),
    projects_zh: defineCollection(
      asSeoCollection({
        type: 'page',
        source: {
          include: 'zh/projects/*.md',
          prefix: '/zh/projects',
        },
        schema: projectSchema,
      }),
    ),

    // Demos 集合
    demos_en: defineCollection(
      {
        type: 'page',
        source: {
          include: 'en/demos/*.md',
          prefix: '/demos',
        },
        schema: demoSchema,
      },
    ),
    demos_zh: defineCollection(
      {
        type: 'page',
        source: {
          include: 'zh/demos/*.md',
          prefix: '/zh/demos',
        },
        schema: demoSchema,
      },
    ),
  },
})
