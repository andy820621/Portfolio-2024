import type { FormattedPost } from '~/types/main'

export function useContentListsFilter(formattedData: Ref<FormattedPost[]>) {
  const searchText = ref('') // 搜索關鍵字
  const selectedTags = ref<string[]>([]) // 選中的標籤
  const filteredData = ref<FormattedPost[]>([])

  // 獲取所有唯一標籤
  const allTags = computed(() => {
    const tags = new Set<string>()
    formattedData.value.forEach((post) => {
      post.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
  })

  const updateFilteredData = useDebounceFn(() => {
    filteredData.value = formattedData.value.filter((data) => {
      const lowerTitle = data.title.toLocaleLowerCase()
      const titleMatch = lowerTitle.includes(searchText.value.toLocaleLowerCase())
      const tagMatch = selectedTags.value.length === 0
        || selectedTags.value.every(tag => data.tags.includes(tag))
      return titleMatch && tagMatch
    })
  }, 400)

  watch([searchText, selectedTags, formattedData], updateFilteredData, { immediate: true })

  function clearFilters() {
    searchText.value = ''
    selectedTags.value = []
  }

  return {
    searchText,
    selectedTags,
    filteredData,
    allTags,
    clearFilters,
  }
}
