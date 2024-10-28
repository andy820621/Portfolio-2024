export function useContentDetailData(contentData: Ref<any>) {
  const { t } = useI18n()

  const mainData = computed(() => {
    if (!contentData.value)
      return null

    const content = contentData.value[0]
    const wordCount = content.body ? countWords(content.body) : 0

    return {
      ...content,
      wordCount,
      readingTime: useEstimateReadingTime(wordCount, t),
    }
  })

  const prevContent = computed(() => contentData.value?.[1]?.[0])
  const nextContent = computed(() => contentData.value?.[1]?.[1])

  return {
    mainData,
    prevContent,
    nextContent,
  }
}
