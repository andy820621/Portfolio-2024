import { useStorage } from '@vueuse/core'

export function useEnglishOnly() {
  const englishOnly = useStorage('barz-english-only', false)

  return {
    englishOnly,
  }
}
