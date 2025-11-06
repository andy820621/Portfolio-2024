import type { Collections } from '@nuxt/content'
import type { BlogPost } from '~~/types/main'

export async function useContentDatas<T extends BlogPost>(folderName: string = 'projects') {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()

  // 根據當前語言選擇正確的集合
  const collection = (`${folderName}_${locale.value}`) as keyof Collections

  const { data: contentDatas, error } = await useAsyncData(
    () => `list-${folderName}-${locale.value}`,
    async () => {
      try {
        // 使用新的 API 查詢內容

        const contents = await queryCollection(collection)
          .where('published', '=', true)
          .order('date', 'DESC')
          .all() as unknown as T[]

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
      date: content.date || 'not-date-available',
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
    contentDatas: contentDatas as unknown as T[],
    error,
    formattedData,
  }
}
