import type { BlogPost } from '~/types/main'

interface UsePostDataOptions {
  basePageName: string // 如 'posts' 或 'projects'
  paramName: string // 路由參數名稱，如 'post' 或 'project'
}

export async function useContentData({ basePageName, paramName }: UsePostDataOptions) {
  const { path, params } = useRoute()
  const { locale } = useI18n()

  const contentPath = params[paramName]
  const truePath = `/${basePageName}/${contentPath}`

  const { data: contentData, error } = await useAsyncData(`${paramName}-${path}`, async () => {
    try {
      const result = await Promise.all([
        queryContent<BlogPost>('/').where({ _locale: locale.value, _path: truePath }).findOne(),
        queryContent<BlogPost>(basePageName)
          .locale(locale.value)
          .where({
            navigation: { $ne: false },
            draft: { $ne: true },
          })
          .only(['_path', 'title', 'description'])
          .sort({ date: -1 })
          .findSurround(truePath),
      ])

      if (!result[0])
        throw new Error('No data found')

      return result
    }
    catch (error) {
      console.error('Error fetching data:', error)
      return null
    }
  })

  return {
    contentData,
    error,
  }
}
