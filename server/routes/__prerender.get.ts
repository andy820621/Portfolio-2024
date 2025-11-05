// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
/**
 * 此 API 提供所有需要 prerender 的內容路由
 * Nitro 在 build 時會自動呼叫此 endpoint
 */
export default defineEventHandler(async (event) => {
  try {
    // 查詢所有 collection 的內容
    const [postsEn, postsZh, projectsEn, projectsZh] = await Promise.all([
      queryCollection(event, 'posts_en').all(),
      queryCollection(event, 'posts_zh').all(),
      queryCollection(event, 'projects_en').all(),
      queryCollection(event, 'projects_zh').all(),
    ])

    // 收集所有路徑
    const routes = [
      ...postsEn.map((post: any) => post.path),
      ...postsZh.map((post: any) => post.path),
      ...projectsEn.map((project: any) => project.path),
      ...projectsZh.map((project: any) => project.path),
    ].filter(Boolean) as string[]

    return routes
  }
  catch (error) {
    console.error('[Prerender Routes] Failed to generate routes:', error)
    return []
  }
})
