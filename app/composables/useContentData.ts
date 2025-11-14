import type { BasePostCollectionsKey } from '~~/types/main'

interface UsePostDataOptions {
  basePageName: 'posts' | 'projects'
  paramName: 'post' | 'project'
}

export async function useContentData({ basePageName, paramName }: UsePostDataOptions) {
  const route = useRoute()
  const { locale } = useI18n()
  const localePath = useLocalePath()

  const contentPath = route.params[paramName]
  // 根據當前語言和基礎頁面名稱選擇正確的集合
  const collection = (`${basePageName}_${locale.value}`) as BasePostCollectionsKey

  const fullPath = trailingSlashUrlOrNot(
    localePath(`/${basePageName}/${contentPath}`),
    false,
  )

  // 使用函式型 key 維持與語言、內容路徑的反應式綁定

  const { data: contentData, error } = await useAsyncData(
    `${basePageName}-${locale.value}-${contentPath}`,
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
  )

  return {
    contentData,
    error,
  }
}
