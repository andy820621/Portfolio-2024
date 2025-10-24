export function useEstimateReadingTime(wordCount: number, t: (key: string) => string) {
  const wordsPerMinute = 225
  const minutes = Math.ceil(wordCount / wordsPerMinute)

  if (minutes < 1) {
    return `< 1 ${t('min')}`
  }
  else if (minutes === 1) {
    return `1 ${t('min')}`
  }
  else {
    return `${minutes} ${t('min')}`
  }
}
