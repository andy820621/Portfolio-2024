import type { SearchResult } from 'minisearch'
import type { BasePostCollectionsKey } from '~~/types/main'

import MiniSearch from 'minisearch'

const miniSearchCache = new Map<string, MiniSearch<ContentSearchSection>>()
const pendingLoads = new Map<string, Promise<void>>()

export type ContentSearchSection = SearchResult & {
  id: string
  title: string
  titles: string[]
  level: number
  content: string
  documentPath: string // 不帶錨點的 path: 用來對應列表
}

export type SearchSectionsFn = (query: string) => ContentSearchSection[]

// Lazy search index: sections are cached in useState, MiniSearch instances live in module memory.
export function useContentSearchIndex(folderName = 'projects') {
  const { locale } = useI18n()

  const collection = computed<BasePostCollectionsKey>(
    () => `${folderName}_${locale.value}` as BasePostCollectionsKey,
  )

  const sectionsStore = useState<Record<string, ContentSearchSection[]>>(
    'content-search-sections',
    () => ({}),
  )
  const readyStore = useState<Record<string, boolean>>(
    'content-search-ready',
    () => ({}),
  )
  const errorStore = useState<Record<string, string | null>>(
    'content-search-errors',
    () => ({}),
  )

  const sections = computed(() => sectionsStore.value[collection.value] ?? [])
  const error = computed(() => errorStore.value[collection.value] || null)
  const isReady = computed(() => Boolean(readyStore.value[collection.value]))

  // Fetch sections once per collection, with a simple in-flight dedupe.
  async function loadSections(key: BasePostCollectionsKey) {
    if (sectionsStore.value[key]?.length)
      return
    if (pendingLoads.has(key)) {
      await pendingLoads.get(key)
      return
    }

    const task = (async () => {
      try {
        const result = await queryCollectionSearchSections(key)
          .where('published', '=', true)

        sectionsStore.value[key] = result.map(section => ({
          ...section,
          documentPath: normalizePath(section.id.split('#')[0] || ''),
        })) as ContentSearchSection[]
        errorStore.value[key] = null
      }
      catch (err) {
        console.error(`Error fetching search sections for ${folderName}:`, err)
        errorStore.value[key] = err instanceof Error ? err.message : String(err)
        sectionsStore.value[key] = []
      }
    })()

    pendingLoads.set(key, task)
    await task
    pendingLoads.delete(key)
  }

  // Build a MiniSearch index from prepared sections.
  function buildIndex(documents: ContentSearchSection[]) {
    const instance = new MiniSearch<ContentSearchSection>({
      idField: 'id',
      fields: ['title', 'titles', 'content'],
      storeFields: ['id', 'title', 'titles', 'level', 'content', 'documentPath'],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
      },
    })

    if (documents.length)
      instance.addAll(documents)

    return instance
  }

  // Client-only lazy initialization; no-op on server to avoid SSR payload bloat.
  async function prepare() {
    if (import.meta.server)
      return

    const key = collection.value
    if (readyStore.value[key] && miniSearchCache.has(key))
      return

    await loadSections(key)

    if (!miniSearchCache.has(key))
      miniSearchCache.set(key, buildIndex(sectionsStore.value[key] ?? []))

    readyStore.value[key] = true
  }

  // Search the current locale collection; returns empty until prepared.
  function search(query: string): ContentSearchSection[] {
    const normalizedQuery = query.trim()
    const instance = miniSearchCache.get(collection.value)
    if (!normalizedQuery || !instance)
      return []

    return instance.search(normalizedQuery) as ContentSearchSection[]
  }

  return {
    prepare,
    search,
    sections,
    error,
    isReady,
  }
}
