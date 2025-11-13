import type { Collections } from '@nuxt/content'

export type FormattedPost = Awaited<ReturnType<typeof useContentDatas>>['formattedData']['value'][number]

export async function useContentDatas(folderName = 'projects') {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()

  // 根據當前語言選擇正確的集合
  const collection = `${folderName}_${locale.value}` as keyof Pick<Collections, 'projects_en' | 'projects_zh' | 'posts_en' | 'posts_zh'>

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
            'image',
            'alt',
            'ogImage',
            'date',
            'tags',
            'published',
            'body',
            'imageClass',
          )
          .order('date', 'DESC')
          .all()

        return contents.map((content) => {
          const wordCount = content.body ? countWords(content.body) : 0
          return {
            ...content,
            wordCount,
            readingTime: useEstimateReadingTime(wordCount, t),
          }
        })
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
    if (!contentDatas.value)
      return []

    return contentDatas.value.map(content => ({
      path: content.path,
      title: content.title || 'no-title available',
      description: content.description || 'no-description available',
      image: content.image || '/not-found.jpg',
      alt: content.alt || 'no alter data available',
      ogImage: content.ogImage || '/not-found.jpg',
      date: content.date || undefined,
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
