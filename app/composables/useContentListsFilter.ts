export function useContentListsFilter(formattedData: Ref<FormattedPost[]>) {
  const searchText = ref('')
  const selectedTags = ref<string[]>([])
  const filteredData = ref<FormattedPost[]>([])

  // 獲取所有唯一標籤
  const allTags = computed(() => {
    const tags = new Set<string>()
    formattedData.value.forEach((post) => {
      post.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
  })

  function updateFilteredData() {
    const normalizedQuery = searchText.value.trim().toLocaleLowerCase()

    filteredData.value = formattedData.value.filter((data) => {
      const lowerTitle = data.title.toLocaleLowerCase()
      const lowerDescription = data.description.toLocaleLowerCase()

      const tagsMatch = selectedTags.value.length === 0
        || selectedTags.value.every(tag => data.tags.includes(tag))

      if (!tagsMatch)
        return false

      if (!normalizedQuery)
        return true

      return lowerTitle.includes(normalizedQuery)
        || lowerDescription.includes(normalizedQuery)
    })
  }

  const debouncedUpdate = useDebounceFn(updateFilteredData, 300)

  updateFilteredData()

  watch([searchText, selectedTags, formattedData], debouncedUpdate)

  function clearFilters() {
    searchText.value = ''
    selectedTags.value = []
    updateFilteredData()
  }

  return {
    searchText,
    selectedTags,
    filteredData,
    allTags,
    clearFilters,
  }
}
