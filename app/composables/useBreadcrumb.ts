// Composable for generating BreadcrumbList structured data with NuxtSEO integration
interface BreadcrumbItem {
  name: string
  item: string
  position: number
}

export function useBreadcrumb() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const { baseUrl, fullPath } = useUrl()
  const route = useRoute()

  // Generate breadcrumb items based on current route
  function getBreadcrumbItems(customTitle?: string): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = []

    // 首頁
    breadcrumbs.push({
      name: t('home'),
      item: localePath('/'),
      position: 1,
    })

    // 解析路徑段落 & 移除語言前綴
    const pathSegments = route.path.split('/').filter(segment =>
      segment && segment !== 'en' && segment !== 'zh',
    )

    if (!pathSegments.length)
      return breadcrumbs // 如果沒有路徑段落，返回僅包含首頁的導覽標記

    let position = 2

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      if (!segment)
        continue // 跳過 undefined 或空字串

      // 生成當前路徑
      let currentPath: string

      if (i === 0) {
        currentPath = localePath(`/${segment}`) // 第一層路徑（如 /posts, /projects）
      }
      else {
        // 深層路徑（如 /posts/article-name）
        const basePath = pathSegments.slice(0, i + 1).join('/')
        currentPath = localePath(`/${basePath}`)
      }

      // 最後一個段落（當前頁面）
      if (i === pathSegments.length - 1) {
        const isDetailPage = ['[post]', '[project]', '[album]'].some(pattern =>
          typeof route.name === 'string' && route.name.includes(pattern.replace(/[[\]]/g, '')),
        )

        if (isDetailPage && customTitle) {
          // 詳情頁面：使用文章/專案的實際標題
          breadcrumbs.push({
            name: customTitle,
            item: route.path,
            position,
          })
        }
        else {
          // 列表頁面或其他頁面
          breadcrumbs.push({
            name: getBreadcrumbName(segment),
            item: currentPath,
            position,
          })
        }
      }
      else {
        // 中間段落（列表頁面）
        breadcrumbs.push({
          name: getBreadcrumbName(segment),
          item: currentPath,
          position,
        })
      }

      position++
    }

    return breadcrumbs
  }

  // Get localized name for breadcrumb segment
  function getBreadcrumbName(segment: string): string {
    const nameMap: Record<string, string> = {
      posts: t('posts'),
      projects: t('projects'),
      demos: t('demos'),
      gallery: t('gallery'),
      about: t('about'),
    }

    return nameMap[segment] || segment
  }

  // Generate Schema.org BreadcrumbList structured data for NuxtSEO
  function getBreadcrumbListSchema(customTitle?: string) {
    const breadcrumbs = getBreadcrumbItems(customTitle)

    return {
      '@type': 'BreadcrumbList' as const,
      '@id': `${fullPath.value}#breadcrumblist`,
      'itemListElement': breadcrumbs.map(breadcrumb => ({
        '@type': 'ListItem' as const,
        'position': breadcrumb.position,
        'name': breadcrumb.name,
        'item': `${trailingSlashUrlOrNot(baseUrl.value, false)}${breadcrumb.item}`,
      })),
    }
  }

  return {
    getBreadcrumbListSchema,
    getBreadcrumbItems,
  }
}
