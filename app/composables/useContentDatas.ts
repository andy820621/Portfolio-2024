import type { BasePostCollectionsKey } from '~~/types/main'

export type FormattedPost = Awaited<ReturnType<typeof useContentDatas>>['formattedData']['value'][number]

export async function useContentDatas(folderName = 'projects') {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()

  // 根據當前語言選擇正確的集合
  const collection = `${folderName}_${locale.value}` as BasePostCollectionsKey

  const { data: contentDatas, error } = await useAsyncData(
    `list-${folderName}-${locale.value}`,
    async () => {
      try {
        // 使用新的 API 查詢內容

        const contents = await queryCollection(collection)
          .where('published', '=', true)
          .select(
            'path',
            'title',
            'description',
            'cover',
            'image',
            'alt',
            'ogImage',
            'date',
            'updatedAt',
            'tags',
            'published',
            'imageClass',
            'wordCount',
            'readingTime',
          )
          .all()

        return contents
      }
      catch (e) {
        console.error(`Error fetching ${folderName}:`, e)
        return []
      }
    },
  )

  // 列表頁不導向 /404，保留頁面並顯示空清單或 NoResults
  watchEffect(() => {
    if (error.value)
      console.error('Fetch error:', error.value)
  })

  const formattedData = computed(() => {
    const list = contentDatas.value ?? []

    // 轉成 timestamp，無效就回 0（會排到最後）
    const toTs = (v?: string | Date) => {
      if (!v)
        return 0
      const d = typeof v === 'string' ? new Date(v) : v
      const ts = d.getTime()
      return Number.isFinite(ts) ? ts : 0
    }

    return [...list]
      .sort((a, b) => {
        const aTs = toTs(a.updatedAt || a.date)
        const bTs = toTs(b.updatedAt || b.date)
        return bTs - aTs
      })
      .map(content => ({
        path: content.path,
        title: content.title || 'no-title available',
        description: content.description || 'no-description available',
        cover: content.cover || undefined,
        image: content.image || '/not-found.jpg',
        alt: content.alt || 'no alter data available',
        ogImage: content.ogImage || '/not-found.jpg',
        date: content.date || undefined,
        updatedAt: content.updatedAt || undefined,
        tags: content.tags || [],
        published: content.published ?? true,
        wordCount: content.wordCount || 0,
        readingTime: content.readingTime || undefined,
        imageClass: content.imageClass || '',
      }))
  })

  return {
    t,
    locale,
    localePath,
    error,
    formattedData,
  }
}
