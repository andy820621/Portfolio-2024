import { useColorMode, useLocalStorage } from '@vueuse/core'

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    try {
      const colorMode = useColorMode()
      const storedColorMode = useLocalStorage<'light' | 'dark' | 'auto'>('vueuse-color-scheme', 'auto')

      // 監聽 storedColorMode 的變化
      watch(storedColorMode, (newValue) => {
        if (newValue === 'auto')
          colorMode.value = 'auto'
        else colorMode.value = newValue
      }, { immediate: true })

      // 根據 colorMode 更新 HTML 類
      watch(colorMode, (newValue) => {
        if (newValue === 'dark')
          document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      }, { immediate: true })
    }
    catch (error) {
      console.error('Error in dark-mode plugin:', error)
    }
  }
})
