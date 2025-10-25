import type { PageCollectionItemBase } from '@nuxt/content'
import type { AsyncContentDataType } from '~~/types/main'

export function useContentDetailData<T = PageCollectionItemBase>(contentData: AsyncContentDataType) {
  const { t } = useI18n()

  const mainData = computed(() => {
    const content = contentData.value?.content
    if (!content) {
      return {} as T & { wordCount: number, readingTime: string }
    }

    const wordCount = content.body ? countWords(content.body) : 0

    return {
      ...content as T,
      wordCount,
      readingTime: useEstimateReadingTime(wordCount, t),
    }
  })

  const prevContent = computed(() => contentData.value?.surroundContent?.[0] ?? null)
  const nextContent = computed(() => contentData.value?.surroundContent?.[1] ?? null)

  return {
    mainData,
    prevContent,
    nextContent,
  }
}
