import { seoData } from '~~/data'

export function useUrl() {
  const config = useRuntimeConfig()
  const route = useRoute()

  // 計算完整的規範連結
  const baseUrl = computed(() => trailingSlashUrlOrNot(config.public.i18n.baseUrl || seoData.mySite || ''))
  const fullPath = computed(() => trailingSlashUrlOrNot(baseUrl.value, false) + route.path)

  return {
    route,
    baseUrl,
    fullPath,
  }
}
