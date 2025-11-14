import { seoData } from '~~/data'

const MAX_RESULTS = 30

const CONTENT_SEARCH_SOURCES = [
  {
    type: 'post',
    indexKey: 'posts',
  },
  {
    type: 'project',
    indexKey: 'projects',
  },
] as const

const NAV_LINKS_CONFIG = [
  {
    id: 'home',
    path: '/',
    labelKey: 'home',
    descriptionKey: 'searchModal.navDescriptions.home',
    icon: 'ri:home-4-line',
  },
  {
    id: 'posts',
    path: '/posts',
    labelKey: 'Blog',
    descriptionKey: 'searchModal.navDescriptions.posts',
    icon: 'ri:article-line',
  },
  {
    id: 'projects',
    path: '/projects',
    labelKey: 'projects',
    descriptionKey: 'searchModal.navDescriptions.projects',
    icon: 'ri:projector-line',
  },
  {
    id: 'demos',
    path: '/demos',
    labelKey: 'demos',
    descriptionKey: 'searchModal.navDescriptions.demos',
    icon: 'mdi:monitor-dashboard',
  },
  {
    id: 'gallery',
    path: '/gallery',
    labelKey: 'gallery',
    descriptionKey: 'searchModal.navDescriptions.gallery',
    icon: 'ri:camera-3-line',
  },
] as const

const QUICK_ACTIONS_CONFIG = [
  {
    id: 'contact',
    url: `mailto:${seoData.email}`,
    labelKey: 'searchModal.actions.contact',
    descriptionKey: 'searchModal.actions.contactDescription',
    icon: 'ri:mail-send-line',
    external: true,
  },
  {
    id: 'github',
    url: seoData.githubLink,
    labelKey: 'searchModal.actions.github',
    descriptionKey: 'searchModal.actions.githubDescription',
    icon: 'ri:github-fill',
    external: true,
  },
  {
    id: 'instagram',
    url: seoData.instagramLink,
    labelKey: 'searchModal.actions.instagram',
    descriptionKey: 'searchModal.actions.instagramDescription',
    icon: 'ri:instagram-line',
    external: true,
  },
] as const

export type ResultType = 'post' | 'project' | 'nav' | 'link'

export interface GlobalSearchResult {
  id: string
  type: ResultType
  url: string
  documentTitle: string
  sectionTitle: string
  snippet: string
  documentTitleHtml: string
  sectionTitleHtml: string
  snippetHtml: string
  score: number
  icon?: string
  external?: boolean
}

export interface SearchSuggestionGroup {
  key: string
  label: string
  items: GlobalSearchResult[]
}

const RESULT_GROUP_ORDER: ResultType[] = ['post', 'project', 'nav', 'link']

const TYPE_META: Record<ResultType, { label: string, icon: string, badge: string }> = {
  post: {
    label: 'Posts',
    icon: 'ri:article-line',
    badge: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-200',
  },
  project: {
    label: 'Projects',
    icon: 'ri:projector-line',
    badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200',
  },
  nav: {
    label: 'Navigation',
    icon: 'ri:compass-3-line',
    badge: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200',
  },
  link: {
    label: 'Links',
    icon: 'ri:external-link-line',
    badge: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-200',
  },
}

interface ResultPayload {
  id: string
  type: ResultType
  url: string
  documentTitle: string
  sectionTitle?: string
  snippet?: string
  score?: number
  icon?: string
  external?: boolean
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function highlightText(text: string, keyword: string) {
  const safeText = escapeHtml(text)
  const trimmed = keyword.trim()
  if (!trimmed || trimmed.length < 2)
    return safeText

  const escapedKeyword = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escapedKeyword, 'gi')
  return safeText.replace(regex, match => `<mark>${match}</mark>`)
}

function buildSnippet(content: string, keyword: string) {
  if (!content)
    return ''

  const lowerContent = content.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()
  const index = lowerContent.indexOf(lowerKeyword)

  if (index === -1)
    return content.length > 140 ? `${content.slice(0, 140)}...` : content

  const start = Math.max(0, index - 40)
  const end = Math.min(content.length, index + keyword.length + 60)

  let snippet = content.slice(start, end)
  if (start > 0)
    snippet = `...${snippet}`
  if (end < content.length)
    snippet = `${snippet}...`
  return snippet
}

function createResultPayload(payload: ResultPayload, keyword: string): GlobalSearchResult {
  const sectionTitle = payload.sectionTitle ?? ''
  const snippet = payload.snippet ?? ''

  return {
    id: payload.id,
    type: payload.type,
    url: payload.url,
    documentTitle: payload.documentTitle,
    sectionTitle,
    snippet,
    documentTitleHtml: highlightText(payload.documentTitle, keyword),
    sectionTitleHtml: highlightText(sectionTitle, keyword),
    snippetHtml: highlightText(snippet, keyword),
    score: payload.score ?? 0,
    icon: payload.icon,
    external: payload.external,
  }
}

function mapContentSections(sections: ContentSearchSection[], type: ResultType, keyword: string) {
  return sections.map((section) => {
    const documentTitle = section.titles?.[0] || section.title
    const sectionTitle = section.title
    const snippet = buildSnippet(section.content || '', keyword)

    return createResultPayload({
      id: section.id,
      type,
      url: section.id,
      documentTitle,
      sectionTitle,
      snippet,
      score: section.score || 0,
    }, keyword)
  })
}

export async function useGlobalSearchData() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const { isDark: isDarkMode, toggleDark } = useTheme()

  const query = ref('')
  const results = ref<GlobalSearchResult[]>([])
  const isSearching = ref(false)

  const navLinks = computed(() =>
    NAV_LINKS_CONFIG.map((item) => {
      const title = t(item.labelKey)
      return {
        ...item,
        title,
        description: t(item.descriptionKey),
        url: localePath(item.path),
      }
    }),
  )

  const quickActions = computed(() =>
    QUICK_ACTIONS_CONFIG.map(action => ({
      ...action,
      title: t(action.labelKey),
      description: t(action.descriptionKey),
    })),
  )

  interface SearchSource {
    type: ResultType
    search: (keyword: string) => GlobalSearchResult[]
  }

  const contentSearchSources: SearchSource[] = await Promise.all(
    CONTENT_SEARCH_SOURCES.map(async (source) => {
      const { search } = await useContentSearchIndex(source.indexKey)
      return {
        type: source.type,
        search: (keyword: string) => mapContentSections(search(keyword), source.type, keyword),
      }
    }),
  )

  const navSearchSource: SearchSource = {
    type: 'nav',
    search: (keyword: string) => {
      const term = keyword.toLowerCase()
      return navLinks.value
        .filter(link => link.title.toLowerCase().includes(term) || link.description.toLowerCase().includes(term))
        .map(link => createResultPayload({
          id: `nav-${link.id}`,
          type: 'nav',
          url: link.url,
          documentTitle: link.title,
          sectionTitle: t('searchModal.suggestionTitles.navigation'),
          snippet: link.description,
          score: link.title.toLowerCase() === term ? 140 : 100,
          icon: link.icon,
        }, keyword))
    },
  }

  const actionSearchSource: SearchSource = {
    type: 'link',
    search: (keyword: string) => {
      const term = keyword.toLowerCase()
      return quickActions.value
        .filter(action => action.title.toLowerCase().includes(term) || action.description.toLowerCase().includes(term))
        .map(action => createResultPayload({
          id: `action-${action.id}`,
          type: 'link',
          url: action.url,
          documentTitle: action.title,
          sectionTitle: t('searchModal.suggestionTitles.actions'),
          snippet: action.description,
          score: 90,
          icon: action.icon,
          external: action.external,
        }, keyword))
    },
  }

  const searchSources: SearchSource[] = [...contentSearchSources, navSearchSource, actionSearchSource]

  function performSearch() {
    const keyword = query.value.trim()
    if (!keyword) {
      results.value = []
      return
    }

    isSearching.value = true
    try {
      const aggregatedResults = searchSources.flatMap(source => source.search(keyword))
      results.value = aggregatedResults
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_RESULTS)
    }
    finally {
      isSearching.value = false
    }
  }

  const debouncedSearch = useDebounceFn(performSearch, 200)

  const groupedResults = computed(() => {
    return RESULT_GROUP_ORDER.map(type => ({
      key: type,
      label: TYPE_META[type].label,
      items: results.value.filter(item => item.type === type),
    }))
  })

  const suggestions = computed<SearchSuggestionGroup[]>(() => {
    const navItems = navLinks.value.map(link => createResultPayload({
      id: `suggestion-nav-${link.id}`,
      type: 'nav',
      url: link.url,
      documentTitle: link.title,
      sectionTitle: t('searchModal.suggestionTitles.navigation'),
      snippet: link.description,
      icon: link.icon,
    }, ''))

    const actionItems = quickActions.value.map(action => createResultPayload({
      id: `suggestion-action-${action.id}`,
      type: 'link',
      url: action.url,
      documentTitle: action.title,
      sectionTitle: t('searchModal.suggestionTitles.actions'),
      snippet: action.description,
      icon: action.icon,
      external: action.external,
    }, ''))

    return [
      {
        key: 'navigation',
        label: t('searchModal.suggestionTitles.navigation'),
        items: navItems,
      },
      {
        key: 'actions',
        label: t('searchModal.suggestionTitles.actions'),
        items: actionItems,
      },
    ].filter(group => group.items.length > 0)
  })

  const hasSuggestions = computed(() => suggestions.value.some(group => group.items.length > 0))
  const hasResults = computed(() => results.value.length > 0)

  const hintKeys = computed(() => {
    if (import.meta.server)
      return 'Ctrl K'

    return /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent) ? '⌘ K' : 'Ctrl K'
  })

  const themeIcon = computed(() => (isDarkMode.value ? 'ri:sun-line' : 'ri:moon-line'))
  const themeLabel = computed(() => (isDarkMode.value ? t('searchModal.themeLight') : t('searchModal.themeDark')))
  const toggleTheme = (event?: MouseEvent) => {
    toggleDark(event)
  }

  return {
    query,
    results,
    groupedResults,
    suggestions,
    hasSuggestions,
    hasResults,
    hintKeys,
    isSearching,
    performSearch,
    debouncedSearch,
    typeMeta: TYPE_META,
    toggleTheme,
    themeIcon,
    themeLabel,
  }
}
