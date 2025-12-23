interface PaginationQuerySyncOptions {
  pageNumber: Ref<number>
  totalPage: Ref<number>
  queryKey?: string
}

type LocationQueryValue = import('vue-router').LocationQueryValue

export function usePaginationQuerySync({
  pageNumber,
  totalPage,
  queryKey = 'page',
}: PaginationQuerySyncOptions) {
  const route = useRoute()
  const router = useRouter()

  function resolvePageFromQuery(value: LocationQueryValue | LocationQueryValue[] | undefined) {
    const rawValue = Array.isArray(value)
      ? value.find(item => item !== null) ?? null
      : value
    const parsed = rawValue ? Number.parseInt(rawValue, 10) : 1
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  }

  function normalizePageNumber(value: number) {
    const maxPage = Math.max(totalPage.value, 1)
    return Math.min(Math.max(value, 1), maxPage)
  }

  const routePage = computed(() => resolvePageFromQuery(route.query[queryKey]))

  function syncPageFromRoute() {
    const nextPage = normalizePageNumber(routePage.value)
    if (nextPage !== pageNumber.value)
      pageNumber.value = nextPage
  }

  syncPageFromRoute()

  watch([routePage, totalPage], syncPageFromRoute)

  if (import.meta.client) {
    watch(pageNumber, (value) => {
      const normalized = normalizePageNumber(value)

      if (normalized !== value) {
        pageNumber.value = normalized
        return
      }

      const hasPageQuery = route.query[queryKey] !== undefined
      if (routePage.value === normalized && (normalized !== 1 || !hasPageQuery))
        return

      router.replace({
        query: {
          ...route.query,
          [queryKey]: normalized === 1 ? undefined : String(normalized),
        },
      })
    })
  }
}
