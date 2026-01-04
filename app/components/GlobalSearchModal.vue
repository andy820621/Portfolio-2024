<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

const {
  query,
  results,
  groupedResults,
  suggestions,
  hasSuggestions,
  hasResults,
  hintKeys,
  isSearching,
  performSearch,
  ensureContentSearchReady,
  debouncedSearch,
  typeMeta,
} = await useGlobalSearchData()

const { isOpen, open: openModal, close } = useGlobalSearchModalState()
const selectedResult = ref<GlobalSearchResult | null>(null)
const inputRef = ref<ComponentPublicInstance | HTMLInputElement | null>(null)

function closeModal() {
  close()
  query.value = ''
  results.value = []
  selectedResult.value = null
}

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
}

const displayQuery = () => query.value

function focusSearchInput() {
  nextTick(() => {
    const element = inputRef.value

    if (!element)
      return
    const target = ('$el' in element ? element.$el : element) as HTMLInputElement | null
    target?.focus()
  })
}

watch(query, () => {
  if (!isOpen.value)
    return
  debouncedSearch()
})

watch(isOpen, async (value) => {
  if (value) {
    focusSearchInput()
    await ensureContentSearchReady()
    if (query.value)
      performSearch()
  }
})

const router = useRouter()
const route = useRoute()

function isExternalLink(item: GlobalSearchResult) {
  return Boolean(item.external) || item.url.startsWith('http') || item.url.startsWith('mailto:')
}

function isNowPageItem(item: GlobalSearchResult) {
  const normalize = (value: string) => value.replace(/\/$/, '')
  return normalize(route.fullPath) === normalize(item.url)
}

watch(selectedResult, async (item) => {
  if (!item)
    return

  if (item.onSelect) {
    await item.onSelect()
    selectedResult.value = null
    if (item.closeOnSelect !== false)
      closeModal()
    return
  }

  if (isExternalLink(item))
    window.open(item.url, '_blank', 'noopener')
  else
    await router.push(item.url)

  closeModal()
})

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
                    :placeholder="$t('searchModal.placeholder')"
                    @input="onInput"
                  />
                  <span class="border border-zinc-200 rounded-md px-2 py-1 text-xs text-zinc-500 dark:border-slate-700 dark:text-zinc-300">
                    {{ hintKeys }}
                  </span>
                </div>

                <div class="max-h-[480px] overflow-y-auto scroll-smooth px-2 py-2">
                  <!-- 建議列表（無搜尋時） -->
                  <HeadlessComboboxOptions v-if="!query && hasSuggestions" hold static>
                    <template v-for="(group, index) in suggestions" :key="group.key">
                      <div
                        v-if="group.items.length"
                        class="py-3"
                        :class="index < suggestions.length - 1 ? 'border-b border-zinc-100 dark:border-slate-800' : ''"
                      >
                        <p class="px-3 pb-3 pt-1 text-xs text-zinc-400 font-semibold tracking-wide uppercase">
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
                            class="flex cursor-pointer items-start gap-4 rounded-lg px-2 py-3 text-left"
                            :class="[
                              active ? 'bg-zinc-50 dark:bg-slate-800/70' : '',
                              isNowPageItem(item) ? 'outline outline-1 outline-emerald-200 dark:outline-emerald-400/50' : '',
                            ]"
                            :aria-current="isNowPageItem(item) ? 'true' : undefined"
                          >
                            <div class="flex flex-none items-center gap-2 text-xs text-zinc-500 font-medium dark:text-zinc-300">
                              <Icon :name="item.icon || typeMeta[item.type].icon" size="16" class="text-zinc-400" />
                              <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="typeMeta[item.type].badge">
                                {{ typeMeta[item.type].label }}
                              </span>
                            </div>
                            <div class="flex flex-1 flex-col gap-1 overflow-hidden">
                              <p class="min-w-0 flex flex-wrap items-center gap-2 text-sm text-zinc-800 font-semibold dark:text-zinc-100">
                                <span class="truncate" v-html="item.documentTitleHtml" />
                                <template v-if="item.sectionTitle">
                                  <span class="text-zinc-300 dark:text-slate-600">›</span>
                                  <span class="truncate" v-html="item.sectionTitleHtml" />
                                </template>
                                <span v-if="isNowPageItem(item)" class="text-xs text-emerald-600 font-semibold dark:text-emerald-300">
                                  {{ $t('searchModal.activePage') }}
                                </span>
                              </p>
                              <p v-if="item.snippet" class="truncate text-xs text-zinc-400 dark:text-zinc-500" v-html="item.snippetHtml" />
                            </div>
                          </li>
                        </HeadlessComboboxOption>
                      </div>
                    </template>
                  </HeadlessComboboxOptions>

                  <!-- 空狀態 -->
                  <p v-else-if="!query" class="px-3 py-6 text-sm text-zinc-400">
                    {{ $t('searchModal.placeholder') }}
                  </p>

                  <!-- 無結果 -->
                  <p v-else-if="!hasResults && !isSearching" class="px-3 py-6 text-sm text-zinc-400">
                    {{ $t('searchModal.noResults') }}
                  </p>

                  <!-- 搜尋結果 -->
                  <HeadlessComboboxOptions v-else hold static>
                    <template v-for="(group, index) in groupedResults" :key="group.key">
                      <div
                        v-if="group.items.length"
                        class="py-3"
                        :class="index < groupedResults.length - 1 ? 'border-b border-zinc-100 dark:border-slate-800' : ''"
                      >
                        <p class="px-3 pb-3 pt-1 text-xs text-zinc-400 font-semibold tracking-wide uppercase">
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
                            class="flex cursor-pointer items-start gap-4 rounded-lg px-2 py-3 text-left"
                            :class="[
                              active ? 'bg-zinc-50 dark:bg-slate-800/70' : '',
                              isNowPageItem(item) ? 'outline outline-1 outline-emerald-200 dark:outline-emerald-400/50' : '',
                            ]"
                            :aria-current="isNowPageItem(item) ? 'true' : undefined"
                          >
                            <div class="flex flex-none items-center gap-2 text-xs text-zinc-500 font-medium dark:text-zinc-300">
                              <Icon :name="item.icon || typeMeta[item.type].icon" size="16" class="text-zinc-400" />
                              <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="typeMeta[item.type].badge">
                                {{ typeMeta[item.type].label }}
                              </span>
                            </div>
                            <div class="flex flex-1 flex-col gap-1 overflow-hidden">
                              <p class="min-w-0 flex flex-wrap items-center gap-2 text-sm text-zinc-800 font-semibold dark:text-zinc-100">
                                <span class="truncate" v-html="item.documentTitleHtml" />
                                <template v-if="item.sectionTitle">
                                  <span class="text-zinc-300 dark:text-slate-600">›</span>
                                  <span class="truncate" v-html="item.sectionTitleHtml" />
                                </template>
                                <span v-if="isNowPageItem(item)" class="text-xs text-emerald-600 font-semibold dark:text-emerald-300">
                                  {{ $t('searchModal.activePage') }}
                                </span>
                              </p>
                              <p v-if="item.snippet" class="truncate text-xs text-zinc-400 dark:text-zinc-500" v-html="item.snippetHtml" />
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
