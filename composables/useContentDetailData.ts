export function useContentDetailData(contentData: Ref<any> | any) {
  const { t } = useI18n()

  // 檢查 contentData 是否為 Ref，如果不是，則將其包裝為 Ref
  const contentDataRef = isRef(contentData) ? contentData : ref(contentData)

  const mainData = computed(() => {
    if (!contentDataRef.value)
      return null

    const content = contentDataRef.value[0]
    const wordCount = content.body ? countWords(content.body) : 0

    return {
      ...content,
      wordCount,
      readingTime: useEstimateReadingTime(wordCount, t),
    }
  })

  
  const prevContent = computed(() => contentDataRef.value?.[1]?.[0])
  const nextContent = computed(() => contentDataRef.value?.[1]?.[1])
  
  return {
    mainData,
    prevContent,
    nextContent,
  }
}
