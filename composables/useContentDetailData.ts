import type { PageCollectionItemBase } from '@nuxt/content'
import type { AsyncContentDataType } from '~/types/main'

export function useContentDetailData<T = PageCollectionItemBase>(contentData: AsyncContentDataType) {
  const { t } = useI18n()

  const { content, surroundContent } = toRefs(contentData.value!)

  const mainData = computed(() => {
    const wordCount = content.value.body ? countWords(content.value.body) : 0

    return {
      ...content.value as T,
      wordCount,
      readingTime: useEstimateReadingTime(wordCount, t),
    }
  })

  const prevContent = computed(() => surroundContent.value?.[0] ?? null)
  const nextContent = computed(() => surroundContent.value?.[1] ?? null)

  return {
    mainData,
    prevContent,
    nextContent,
  }
}
