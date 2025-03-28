import type { Collections } from '@nuxt/content'
import type { BlogPost } from '~/types/main'

export async function useContentDatas<T extends BlogPost>(folderName: string = 'projects') {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()

  // 根據當前語言選擇正確的集合
  const collection = (`${folderName}_${locale.value}`) as keyof Collections

  const { data: contentDatas, error } = await useAsyncData(
    `list-${folderName}-${locale.value}`,
    async () => {
      try {
        // 使用新的 API 查詢內容

        const contents = await queryCollection(collection)
          .where('published', '=', true)
          .order('date', 'DESC') // 使用 order 替代 sort
          .all() as BlogPost[]

        // console.log({contents});

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
    {
      watch: [locale], // 當語言變更時重新獲取資料
    },
  )

  watchEffect(() => {
    if (error.value) {
      console.error('Fetch error:', error.value)
      navigateTo(localePath('/404'))
    }
  })

  const processedContents = computed(() => {
    if (!contentDatas.value)
      return []

    return contentDatas.value.map((content) => {
      const wordCount = content.body ? countWords(content.body) : 0
      return {
        ...content,
        wordCount,
        readingTime: useEstimateReadingTime(wordCount, t),
      }
    })
  })

  const formattedData = computed(() => {
    return processedContents.value?.map(content => ({
      path: content.path,
      title: content.title || 'no-title available',
      description: content.description || 'no-description available',
      image: content.image || '/not-found.jpg',
      alt: content.alt || 'no alter data available',
      ogImage: content.ogImage || '/not-found.jpg',
      date: content.date || 'not-date-available',
      tags: content.tags || [],
      published: content.published || false,
      wordCount: content.wordCount || 0,
      readingTime: content.readingTime || undefined,
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
