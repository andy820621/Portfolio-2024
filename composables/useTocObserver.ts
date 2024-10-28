export function useTocObserver() {
  const activeId = ref('')

  onMounted(() => {
    const observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '-24% 0px -24% 0px',
      threshold: 0.24,
    })

    const elements = document.querySelectorAll('h2, h3')

    for (const element of elements)
      observer.observe(element)

    onBeforeUnmount(() => {
      for (const element of elements)
        observer.unobserve(element)
    })
  })

  function callback(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        activeId.value = entry.target.id
        break
      }
    }
  }

  return {
    activeId,
  }
}
