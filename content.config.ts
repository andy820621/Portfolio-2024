import { defineCollection, defineContentConfig } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'
import { z } from 'zod/v4'
// import { asOgImageCollection } from 'nuxt-og-image/content'

// 通用內容模式
const commonContentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.coerce.date(),
  keywords: z.array(z.string()).optional(),
  updatedAt: z.coerce.date().optional(),
})

// Blogs 內容模式
const articleSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  image: z.string().optional(),
  alt: z.string().optional(),
  ogImage: z.string().optional(),
  tags: z.array(z.string()),
  categories: z.array(z.string()).optional(),
  published: z.boolean().default(true),
  rawbody: z.string(),
  imageClass: z.string().optional(),
  keywords: z.array(z.string()).optional(),
})

// projects 內容模式
const projectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  image: z.string().optional(),
  alt: z.string().optional(),
  ogImage: z.string().optional(),
  tags: z.array(z.string()),
  categories: z.array(z.string()).optional(),
  published: z.boolean().default(true),
  rawbody: z.string(),
  imageClass: z.string().optional(),
  keywords: z.array(z.string()).optional(),
})

// demos 內容模式
const demoSchema = z.object({
  link: z.string().optional(),
  github: z.string().optional(),
  codepen: z.string().optional(),
  thumbnailType: z.string().optional(),
  tags: z.array(z.string()),
  published: z.boolean().default(true),
  date: z.coerce.date(),
  keywords: z.array(z.string()).optional(),
})

export default defineContentConfig({
  collections: {
    // 主要內容集合（不包括特定子目錄）
    content_en: defineCollection({
      ...asSeoCollection({
        type: 'page',
        source: {
          include: 'en/**/*.md',
          exclude: ['en/posts/*.md', 'en/projects/*.md', 'en/demos/*.md'],
          prefix: '',
        },
      }),
      schema: commonContentSchema,
    }),
    content_zh: defineCollection({
      ...asSeoCollection({
        type: 'page',
        source: {
          include: 'zh/**/*.md',
          exclude: ['zh/posts/*.md', 'zh/projects/*.md', 'zh/demos/*.md'],
          prefix: '',
        },
      }),
      schema: commonContentSchema,
    }),

    // Blog 集合
    posts_en: defineCollection({
      ...asSeoCollection({
        type: 'page',
        source: {
          include: 'en/posts/*.md',
          prefix: '/posts',
        },
      }),
      schema: articleSchema,
    }),
    posts_zh: defineCollection({
      ...asSeoCollection({
        type: 'page',
        source: {
          include: 'zh/posts/*.md',
          prefix: '/zh/posts',
        },
      }),
      schema: articleSchema,
    }),

    // Projects集合
    // 將 SEO 增強與自訂 schema 分離，避免 Zod 實例不一致導致欄位未建立
    projects_en: defineCollection({
      ...asSeoCollection({
        type: 'page',
        source: {
          include: 'en/projects/*.md',
          prefix: '/projects',
        },
      }),
      schema: projectSchema,
    }),
    projects_zh: defineCollection({
      ...asSeoCollection({
        type: 'page',
        source: {
          include: 'zh/projects/*.md',
          prefix: '/zh/projects',
        },
      }),
      schema: projectSchema,
    }),

    // Demos 集合
    demos_en: defineCollection({
      ...asSeoCollection({
        type: 'page',
        source: {
          include: 'en/demos/*.md',
          prefix: '/demos',
        },
      }),
      schema: demoSchema,
    }),
    demos_zh: defineCollection({
      ...asSeoCollection({
        type: 'page',
        source: {
          include: 'zh/demos/*.md',
          prefix: '/zh/demos',
        },
      }),
      schema: demoSchema,
    }),
  },
})
