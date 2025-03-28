import type { CollectionItemBase, PageCollectionItemBase } from '@nuxt/content'

export type DateLike = Date | number | string | undefined

export interface BlogPost extends PageCollectionItemBase {
  date: string
  image: string
  alt: string
  ogImage: string
  tags: string[]
  published: boolean
  readingTime?: ComputedRef<string> | string
  wordCount?: number
}

// 擴展 CollectionItemBase 來創建我們需要的 DemoContent 類型
export interface DemoContent extends CollectionItemBase {
  file?: string
  path?: string
  tags?: string[]
  thumbnailType?: string
  draft?: boolean
  updatedAt?: string
  link?: string
  github?: string
  codepen?: string
  [key: string]: any
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
