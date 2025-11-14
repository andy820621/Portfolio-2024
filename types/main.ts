import type { Collections, ContentEnCollectionItem, ContentNavigationItem, ContentZhCollectionItem, DemosEnCollectionItem, DemosZhCollectionItem, PageCollectionItemBase, PostsEnCollectionItem, PostsZhCollectionItem, ProjectsEnCollectionItem, ProjectsZhCollectionItem } from '@nuxt/content'

export type ContentDataReturn = Awaited<ReturnType<typeof useContentData>>
export type AsyncContentDataType = ContentDataReturn['contentData']
export interface ContentDetailDataReturn<T = PageCollectionItemBase> {
  mainData: globalThis.ComputedRef<T | null>
  prevContent: globalThis.ComputedRef<ContentNavigationItem | null>
  nextContent: globalThis.ComputedRef<ContentNavigationItem | null>
}

export type AllCollectionItem = ContentEnCollectionItem & ContentZhCollectionItem & PostsEnCollectionItem & PostsZhCollectionItem & ProjectsEnCollectionItem & ProjectsZhCollectionItem & DemosEnCollectionItem & DemosZhCollectionItem

export type DateLike = Date | number | string | undefined

export type ContentCollectionItem = ContentEnCollectionItem | ContentZhCollectionItem
export type PostsCollectionItem = PostsEnCollectionItem | PostsZhCollectionItem
export type ProjectsCollectionItem = ProjectsEnCollectionItem | ProjectsZhCollectionItem
export type DemoCollectionItem = DemosEnCollectionItem | DemosZhCollectionItem

// Collection Keys 類型定義
export type BasePostCollections = Pick<Collections, 'projects_en' | 'projects_zh' | 'posts_en' | 'posts_zh'>
export type BasePostCollectionsKey = keyof BasePostCollections

export type DemoCollections = Pick<Collections, 'demos_en' | 'demos_zh'>
export type DemoCollectionsKey = keyof DemoCollections

export type ContentCollections = Pick<Collections, 'content_en' | 'content_zh'>
export type ContentCollectionsKey = keyof ContentCollections

// 所有內容 collection 的聯集
export type AllContentCollections = BasePostCollections & DemoCollections & ContentCollections
export type AllContentCollectionsKey = keyof AllContentCollections
