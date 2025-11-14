<script setup lang="ts">
const CONTENT_SEARCH_SOURCES = [
  {
    type: 'post',
    label: 'Posts',
    icon: 'ri:article-line',
    badge: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-200',
    indexKey: 'posts',
  },
  {
    type: 'project',
    label: 'Projects',
    icon: 'ri:projector-line',
    badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200',
    indexKey: 'projects',
  },
] as const

type ContentSearchSource = typeof CONTENT_SEARCH_SOURCES[number]
type ResultType = ContentSearchSource['type']

interface GlobalSearchResult {
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
}

const typeMeta = CONTENT_SEARCH_SOURCES.reduce(
  (acc, source) => {
    acc[source.type] = {
      label: source.label,
      icon: source.icon,
      badge: source.badge,
    }
    return acc
  },
  {} as Record<ResultType, { label: string, icon: string, badge: string }>,
)

type SearchSourceWithIndex = ContentSearchSource & { search: SearchSectionsFn }

const searchSources = await Promise.all(
  CONTENT_SEARCH_SOURCES.map(async (source) => {
    const { search } = await useContentSearchIndex(source.indexKey)
    return {
      ...source,
      search,
    }
  }),
) as SearchSourceWithIndex[]

const MAX_RESULTS = 30

const isOpen = ref(false)
const query = ref('')
const results = ref<GlobalSearchResult[]>([])
const selectedResult = ref<GlobalSearchResult | null>(null)
const isSearching = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const hintKeys = computed(() => {
  if (import.meta.server)
    return 'Ctrl K'

  return /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent) ? '⌘ K' : 'Ctrl K'
})

const groupedResults = computed(() => {
  const bucket: Partial<Record<ResultType, GlobalSearchResult[]>> = {}
  for (const item of results.value) {
    if (!bucket[item.type])
      bucket[item.type] = []
    bucket[item.type]!.push(item)
  }

  return CONTENT_SEARCH_SOURCES.map(source => ({
    key: source.type,
    label: source.label,
    items: bucket[source.type] || [],
  }))
})

const hasResults = computed(() => results.value.length > 0)

function openModal() {
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
  query.value = ''
  results.value = []
  selectedResult.value = null
}

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
}

const displayQuery = () => query.value

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
  if (trimmed.length < 2)
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

function mapResults(sections: ContentSearchSection[], type: ResultType, keyword: string) {
  return sections.map((section) => {
    const documentTitle = section.titles?.[0] || section.title
    const sectionTitle = section.title
    const snippet = buildSnippet(section.content || '', keyword)

    return {
      id: section.id,
      type,
      url: section.id,
      documentTitle,
      sectionTitle,
      snippet,
      documentTitleHtml: highlightText(documentTitle, keyword),
      sectionTitleHtml: highlightText(sectionTitle, keyword),
      snippetHtml: highlightText(snippet, keyword),
      score: section.score || 0,
    }
  })
}

function performSearch() {
  const keyword = query.value.trim()
  if (!keyword) {
    results.value = []
    return
  }

  isSearching.value = true
  try {
    const aggregatedResults = searchSources.flatMap(source =>
      mapResults(source.search(keyword), source.type, keyword),
    )

    results.value = aggregatedResults
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
  }
  finally {
    isSearching.value = false
  }
}

const debouncedSearch = useDebounceFn(performSearch, 200)

watch(query, () => {
  if (!isOpen.value)
    return
  debouncedSearch()
})

watch(isOpen, (value) => {
  if (value) {
    nextTick(() => inputRef.value?.focus())
    if (query.value)
      performSearch()
  }
})

const router = useRouter()
watch(selectedResult, async (item) => {
  if (!item)
    return
  await router.push(item.url)
  closeModal()
})

const route = useRoute()
watch(() => route.fullPath, () => {
  if (isOpen.value)
    closeModal()
})

if (import.meta.client) {
  useEventListener(window, 'keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      openModal()
    }
    else if (event.key === 'Escape' && isOpen.value) {
      event.preventDefault()
      closeModal()
    }
  })
}
</script>

<template>
  <HeadlessTransitionRoot :show="isOpen" as="template">
    <HeadlessDialog as="div" class="relative z-[120]" :open="isOpen" @close="closeModal">
      <HeadlessTransitionChild
        as="template"
        enter="duration-150 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <HeadlessDialogOverlay class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </HeadlessTransitionChild>

      <div class="fixed inset-0 overflow-y-auto px-4 py-10 sm:px-6">
        <div class="mx-auto max-w-3xl w-full flex items-start justify-center">
          <HeadlessTransitionChild
            as="template"
            enter="duration-150 ease-out"
            enter-from="opacity-0 translate-y-2"
            enter-to="opacity-100 translate-y-0"
            leave="duration-100 ease-in"
            leave-from="opacity-100 translate-y-0"
            leave-to="opacity-0 translate-y-2"
          >
            <HeadlessDialogPanel class="w-full rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/10">
              <HeadlessCombobox v-model="selectedResult" nullable>
                <div class="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-slate-800">
                  <Icon name="mdi:magnify" size="20" class="text-zinc-400" />
                  <HeadlessComboboxInput
                    ref="inputRef"
                    :display-value="displayQuery"
                    class="flex-1 border-0 bg-transparent text-base text-zinc-800 outline-none dark:text-zinc-50 placeholder:text-zinc-400"
                    placeholder="Search posts and projects..."
                    @input="onInput"
                  />
                  <span class="border border-zinc-200 rounded-md px-2 py-1 text-xs text-zinc-500 dark:border-slate-700 dark:text-zinc-300">
                    {{ hintKeys }}
                  </span>
                </div>

                <div class="max-h-[480px] overflow-y-auto px-2 py-2">
                  <p v-if="!query" class="px-3 py-6 text-sm text-zinc-400">
                    {{ $t('searchModal.placeholder') }}
                  </p>

                  <p v-else-if="!hasResults && !isSearching" class="px-3 py-6 text-sm text-zinc-400">
                    {{ $t('searchModal.noResults') }}
                  </p>

                  <HeadlessComboboxOptions v-else static>
                    <template v-for="(group, index) in groupedResults" :key="group.key">
                      <div
                        v-if="group.items.length"
                        class="py-3"
                        :class="index < groupedResults.length - 1 ? 'border-b border-zinc-100 dark:border-slate-800' : ''"
                      >
                        <p class="px-3 py-1 text-xs text-zinc-400 font-semibold tracking-wide uppercase">
                          {{ group.label }}
                        </p>
                        <HeadlessComboboxOption
                          v-for="item in group.items"
                          :key="item.id"
                          v-slot="{ active }"
                          :value="item"
                          as="template"
                        >
                          <li
                            class="flex cursor-pointer items-start gap-4 rounded-lg px-2 py-3 text-left transition"
                            :class="active ? 'bg-zinc-50 dark:bg-slate-800/70' : ''"
                          >
                            <div class="flex flex-none items-center gap-2 text-xs text-zinc-500 font-medium dark:text-zinc-300">
                              <Icon :name="typeMeta[item.type].icon" size="16" class="text-zinc-400" />
                              <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="typeMeta[item.type].badge">
                                {{ typeMeta[item.type].label }}
                              </span>
                            </div>
                            <div class="flex flex-1 flex-col gap-1 overflow-hidden">
                              <p class="min-w-0 flex items-center gap-2 text-sm text-zinc-800 font-semibold dark:text-zinc-100">
                                <span class="truncate" v-html="item.documentTitleHtml" />
                                <span class="text-zinc-300 dark:text-slate-600">›</span>
                                <span class="truncate" v-html="item.sectionTitleHtml" />
                              </p>
                              <p class="truncate text-xs text-zinc-400 dark:text-zinc-500" v-html="item.snippetHtml" />
                            </div>
                          </li>
                        </HeadlessComboboxOption>
                      </div>
                    </template>
                  </HeadlessComboboxOptions>
                </div>
              </HeadlessCombobox>
            </HeadlessDialogPanel>
          </HeadlessTransitionChild>
        </div>
      </div>
    </HeadlessDialog>
  </HeadlessTransitionRoot>
</template>
