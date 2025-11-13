import type { ContentEnCollectionItem, ContentNavigationItem, ContentZhCollectionItem, DemosEnCollectionItem, DemosZhCollectionItem, PageCollectionItemBase, PostsEnCollectionItem, PostsZhCollectionItem, ProjectsEnCollectionItem, ProjectsZhCollectionItem } from '@nuxt/content'

export type ContentDataReturn = Awaited<ReturnType<typeof useContentData>>
export type AsyncContentDataType = ContentDataReturn['contentData']
export interface ContentDetailDataReturn<T = PageCollectionItemBase> {
  mainData: globalThis.ComputedRef<T & {
    wordCount: number
    readingTime: string
  }>
  prevContent: globalThis.ComputedRef<ContentNavigationItem | null>
  nextContent: globalThis.ComputedRef<ContentNavigationItem | null>
}

export type AllCollectionItem = ContentEnCollectionItem & ContentZhCollectionItem & PostsEnCollectionItem & PostsZhCollectionItem & ProjectsEnCollectionItem & ProjectsZhCollectionItem & DemosEnCollectionItem & DemosZhCollectionItem

export type DateLike = Date | number | string | undefined

export type DemoCollectionItem = DemosEnCollectionItem | DemosZhCollectionItem
