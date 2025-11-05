import type { Collections } from '@nuxt/content'

interface UsePostDataOptions {
  basePageName: string // 如 'posts' 或 'projects'
  paramName: string // 路由參數名稱，如 'post' 或 'project'
}

export async function useContentData({ basePageName, paramName }: UsePostDataOptions) {
  const route = useRoute()
  const { locale } = useI18n()
  const localePath = useLocalePath()

  const contentPath = route.params[paramName]
  // 根據當前語言和基礎頁面名稱選擇正確的集合
  const collection = (`${basePageName}_${locale.value}`) as keyof Collections

  const fullPath = trailingSlashUrlOrNot(
    localePath(`/${basePageName}/${contentPath}`),
    false,
  )

  // 使用更穩定的 cache key: 基於內容路徑而非 route.path
  const cacheKey = `${basePageName}-${locale.value}-${contentPath}`

  const { data: contentData, error } = await useAsyncData(
    cacheKey,
    async () => {
      try {
        // 獲取主要內容
        const content = await queryCollection(collection).path(fullPath).first()

        if (!content)
          throw new Error(`No content found for ${fullPath}.`)

        // 獲取周圍內容
        const surroundContent = await queryCollectionItemSurroundings(collection, fullPath, {
          fields: ['title', 'description', 'path', 'date', 'id'],
        }).order('date', 'DESC')

        return { content, surroundContent }
      }
      catch (error) {
        console.error('Error fetching content data:', error)
        return null
      }
    },
    {
      // 監聽語言變化，自動重新取得內容
      watch: [locale],
      // 確保在預渲染時正確提取數據 (需要配合 nuxt.config.ts 的 payloadExtraction: true)
      getCachedData: (key, nuxtApp) => {
        // 使用 Nuxt 預設的快取策略
        // hydrating 時從 payload.data 讀取，否則從 static.data 讀取
        return nuxtApp.isHydrating
          ? nuxtApp.payload.data[key]
          : nuxtApp.static.data[key]
      },
    },
  )

  return {
    contentData,
    error,
  }
}
