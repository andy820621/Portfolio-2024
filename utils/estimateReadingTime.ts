export function estimateReadingTime(wordCount: number): string {
  // 假設平均閱讀速度為每分鐘 225 個單詞
  const wordsPerMinute = 225
  const minutes = Math.ceil(wordCount / wordsPerMinute)

  if (minutes < 1) {
    return 'less than 1 min'
  }
  else if (minutes === 1) {
    return '1 min'
  }
  else {
    return `${minutes} min`
  }
}
