export function useEstimateReadingTime(wordCount: number) {
  const wordsPerMinute = 225
  const minutes = Math.ceil(wordCount / wordsPerMinute)

  return computed(() => {
    const { t } = useI18n()

    if (minutes < 1) {
      return `< 1 ${t('min')}`
    }
    else if (minutes === 1) {
      return `1 ${t('min')}`
    }
    else {
      return `${minutes} ${t('min')}`
    }
  })
}
