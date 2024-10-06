import type { ParsedContent } from '@nuxt/content'

export type DateLike = Date | number | string | undefined

export interface BlogPost extends ParsedContent {
  title: string
  date: string
  description: string
  image: string
  alt: string
  ogImage: string
  tags: string[]
  published: boolean
  readingTime?: ComputedRef<string> | string
  wordCount?: number
}

export interface FormattedPost {
  path: string | undefined
  title: string
  description: string
  image: string
  alt: string
  ogImage: string
  date: string
  tags: string[]
  published: boolean
  wordCount: number
  readingTime: string | undefined
}
