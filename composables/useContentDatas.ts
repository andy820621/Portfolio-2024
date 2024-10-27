import type { BlogPost } from '~/types/main'

export async function useContentDatas<T extends BlogPost>(folderName: string = 'projects') {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()

  const { data: contentDatas, error } = await useAsyncData(
    `list-${folderName}-${locale.value}`,
    async () => {
      try {
        const contents = await queryContent<T>(folderName)
          .locale(locale.value)
          .where({ draft: { $ne: true } })
          .sort({ date: -1 })
          .find()

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
      path: content._path,
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
    })) || []
  })

  return {
    t,
    locale,
    localePath,
    contentDatas,
    error,
    formattedData,
  }
}
