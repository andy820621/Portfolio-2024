import type { BasePostCollectionsKey, RelatedPageInput, RelatedPageResolved } from '~~/types/main'

type RelatedPageSection = 'posts' | 'projects'
type SupportedRelatedLocale = 'en' | 'zh'

const RELATED_COLLECTIONS = {
  posts: {
    en: 'posts_en',
    zh: 'posts_zh',
  },
  projects: {
    en: 'projects_en',
    zh: 'projects_zh',
  },
} satisfies Record<RelatedPageSection, Record<SupportedRelatedLocale, BasePostCollectionsKey>>

const RELATED_COLLECTION_KEYS = new Set<BasePostCollectionsKey>(
  Object.values(RELATED_COLLECTIONS).flatMap(collections => Object.values(collections)),
)

// --- 型別守衛（Type Guards）---
function isRelatedPageSection(value: string | undefined): value is RelatedPageSection {
  return value === 'posts' || value === 'projects'
}
function isSupportedRelatedLocale(value: string | undefined): value is SupportedRelatedLocale {
  return value === 'en' || value === 'zh'
}
function isBasePostCollectionKey(value: string): value is BasePostCollectionsKey {
  return RELATED_COLLECTION_KEYS.has(value as BasePostCollectionsKey)
}

// --- 工具函式 ---
// 移除 URL 中的 query string 和 hash（#/? 後的部分），並去除結尾斜線
function toLookupPath(path: string) {
  const basePath = path.split(/[?#]/)[0] || path
  return trailingSlashUrlOrNot(basePath, false)
}

// 確保 title 是乾淨的字串，非字串值一律回傳空字串
function normalizeTitle(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

// 從 collection 名稱解析語系代碼
function resolveCollectionLocale(collection: BasePostCollectionsKey): SupportedRelatedLocale | undefined {
  const locale = collection.split('_').at(-1)
  return isSupportedRelatedLocale(locale) ? locale : undefined
}

export function useRelatedPages(
  pages: MaybeRef<RelatedPageInput[] | null | undefined>,
  collection: MaybeRef<BasePostCollectionsKey>,
) {
  const { locale, locales } = useI18n()
  const localePath = useLocalePath()

  // 從 i18n 設定中收集所有合法的語系代碼（如 ['en', 'zh']）
  const localeCodes = computed(() => {
    return locales.value.reduce<string[]>((codes, locale) => {
      const code = typeof locale === 'string' ? locale : locale.code
      if (typeof code === 'string' && code.length > 0)
        codes.push(code)
      return codes
    }, [])
  })

  // 過濾輸入資料：排除空值與沒有 path 的項目
  const normalizedInput = computed(() => {
    const raw = unref(pages)
    if (!Array.isArray(raw))
      return [] as RelatedPageInput[]
    return raw.filter((item): item is RelatedPageInput => {
      return !!item && typeof item.path === 'string' && item.path.trim().length > 0
    })
  })

  // 判斷路徑開頭是否含有語系前綴（如 /zh/posts/...）
  // 若有則分離出語系與剩餘路徑段；若無則語系為 undefined
  function stripLocalePrefix(path: string) {
    const segments = toLookupPath(path).split('/').filter(Boolean)
    const firstSegment = segments[0]

    if (firstSegment && localeCodes.value.includes(firstSegment)) {
      return { locale: firstSegment, segments: segments.slice(1) }
    }
    return { locale: undefined, segments }
  }

  // 若路徑已有語系前綴則原樣回傳；否則用 localePath() 加上當前語系前綴
  function resolveLocalizedPath(path: string) {
    const normalizedPath = toLookupPath(path)
    const { locale: pathLocale } = stripLocalePrefix(normalizedPath)
    if (pathLocale)
      return normalizedPath
    return toLookupPath(localePath(normalizedPath) || normalizedPath)
  }

  // 根據路徑推導出應查詢的 collection
  // 優先從路徑的區塊（posts/projects）和語系判斷；無法判斷時使用 fallback
  function resolveCollectionFromPath(path: string) {
    const fallbackCollection = unref(collection)
    const fallbackLocale = resolveCollectionLocale(fallbackCollection)
    const { locale: pathLocale, segments } = stripLocalePrefix(path)
    const section = segments[0] // 第一個路徑段，如 'posts'

    if (!isRelatedPageSection(section))
      return fallbackCollection

    // 路徑有語系 → 用路徑語系；否則沿用 collection 推導出的語系
    const targetLocale = isSupportedRelatedLocale(pathLocale) ? pathLocale : fallbackLocale
    if (!targetLocale)
      return fallbackCollection

    const targetCollection = RELATED_COLLECTIONS[section][targetLocale]
    return isBasePostCollectionKey(targetCollection) ? targetCollection : fallbackCollection
  }

  async function resolveRelatedPage(item: RelatedPageInput): Promise<RelatedPageResolved | null> {
    const localizedPath = resolveLocalizedPath(item.path.trim())
    const lookupPath = toLookupPath(localizedPath)
    const title = normalizeTitle(item.title)

    if (title)
      return { path: lookupPath, title }

    const targetCollection = resolveCollectionFromPath(lookupPath)
    const record = await queryCollection(targetCollection)
      .where('published', '=', true)
      .path(lookupPath)
      .select('title')
      .first() as { title?: string } | null

    const resolvedTitle = normalizeTitle(record?.title)

    if (!resolvedTitle) {
      if (import.meta.dev)
        console.warn(`[relatedPages] Unable to resolve title for path: ${item.path}`)
      return null
    }

    return { path: lookupPath, title: resolvedTitle }
  }

  // 產生唯一 cache key：collection 名稱 + 當前語系 + 所有輸入路徑與 title
  const relatedPagesKey = computed(() => {
    const inputKey = normalizedInput.value
      .map(item => `${item.path.trim()}:${normalizeTitle(item.title)}`)
      .join('|')
    return `related-pages:${unref(collection)}:${locale.value}:${inputKey}`
  })

  const { data: relatedPages } = useAsyncData(
    relatedPagesKey,
    async () => {
      if (!normalizedInput.value.length)
        return [] as RelatedPageResolved[]
      const results = await Promise.all(normalizedInput.value.map(resolveRelatedPage))
      return results.filter((item): item is RelatedPageResolved => !!item)
    },
    {
      default: () => [],
      watch: [normalizedInput, computed(() => unref(collection)), locale],
    },
  )

  return { relatedPages }
}
