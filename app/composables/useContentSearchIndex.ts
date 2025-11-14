import type { SearchResult } from 'minisearch'
import type { BasePostCollectionsKey } from '~~/types/main'

import MiniSearch from 'minisearch'

export type ContentSearchSection = SearchResult & {
  id: string
  title: string
  titles: string[]
  level: number
  content: string
  documentPath: string // 不帶錨點的 path: 用來對應列表
}

export type SearchSectionsFn = (query: string) => ContentSearchSection[]

export async function useContentSearchIndex(folderName = 'projects') {
  const { locale } = useI18n()

  const collection = computed<BasePostCollectionsKey>(
    () => `${folderName}_${locale.value}` as BasePostCollectionsKey,
  )

  const { data: sections, error } = await useAsyncData(
    () => `search-sections-${collection.value}`,
    async () => {
      try {
        const result = await queryCollectionSearchSections(collection.value)
          .where('published', '=', true)

        return result.map(section => ({
          ...section,
          documentPath: normalizePath(section.id.split('#')[0] || ''),
        })) as ContentSearchSection[]
      }
      catch (err) {
        console.error(`Error fetching search sections for ${folderName}:`, err)
        return []
      }
    },
    {
      watch: [collection],
    },
  )

  watchEffect(() => {
    if (error.value)
      console.error('Search sections fetch error:', error.value)
  })

  const miniSearch = shallowRef<MiniSearch<ContentSearchSection> | null>(null)

  // 一旦 sections 更新（例如語系切換）就重建 MiniSearch 索引
  watch(
    sections,
    (documents) => {
      const instance = new MiniSearch<ContentSearchSection>({
        idField: 'id',
        fields: ['title', 'titles', 'content'],
        storeFields: ['id', 'title', 'titles', 'level', 'content', 'documentPath'],
        searchOptions: {
          prefix: true,
          fuzzy: 0.2,
        },
      })

      if (documents?.length)
        instance.addAll(documents)

      miniSearch.value = instance
    },
    { immediate: true },
  )

  function search(query: string): ContentSearchSection[] {
    const normalizedQuery = query.trim()
    if (!normalizedQuery || !miniSearch.value)
      return []

    return miniSearch.value.search(normalizedQuery) as ContentSearchSection[]
  }

  return {
    search,
    sections,
    error,
  }
}
