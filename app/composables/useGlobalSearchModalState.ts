const GLOBAL_SEARCH_STATE_KEY = 'global-search-modal:is-open'

export function useGlobalSearchModalState() {
  const isOpen = useState<boolean>(GLOBAL_SEARCH_STATE_KEY, () => false)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
