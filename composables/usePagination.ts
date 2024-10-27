export function usePagination(filteredData: Ref<any[]>, elementPerPage: Ref<number>) {
  const pageNumber = ref(1)

  const totalPage = computed(() => {
    return Math.ceil(filteredData.value.length / elementPerPage.value)
  })

  const paginatedData = computed(() => {
    return filteredData.value.slice(
      (pageNumber.value - 1) * elementPerPage.value,
      pageNumber.value * elementPerPage.value,
    )
  })

  function onPreviousPageClick() {
    if (pageNumber.value > 1)
      pageNumber.value -= 1
  }

  function onNextPageClick() {
    if (pageNumber.value < totalPage.value)
      pageNumber.value += 1
  }

  return {
    pageNumber,
    totalPage,
    paginatedData,
    onPreviousPageClick,
    onNextPageClick,
  }
}
