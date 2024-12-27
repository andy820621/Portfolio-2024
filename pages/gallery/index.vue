<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import { galleryGroups } from '~/data/galleryData'

const { t } = useI18n()

definePageMeta({
  documentDriven: {
    page: false,
    surround: false,
  },
})

onMounted(() => {
  useHead({
    title: 'gallery',
  })
})

useSeoMeta({
  ogTitle: 'Gallery - BarZ Hsieh',
  description: t('galleryPage.description'),
  ogDescription: t('galleryPage.description'),
})

const searchText = ref('')
const selectedTags = ref<string[]>([])

// 所有標籤
const allTags = computed(() => {
  const tagSet = new Set<string>()
  galleryGroups.forEach((group) => {
    group.tags.forEach(tag => tagSet.add(tag))
  })
  return Array.from(tagSet)
})

// 過濾後的圖片組
const debouncedFilteredGroups = ref(galleryGroups)

const updateFilteredGroups = useDebounceFn(() => {
  debouncedFilteredGroups.value = galleryGroups.filter((group) => {
    const lowerTitle = group.title.toLocaleLowerCase()
    const titleMatch = lowerTitle.includes(searchText.value.toLocaleLowerCase())
    const tagMatch = selectedTags.value.length === 0
      || selectedTags.value.every(tag => group.tags.includes(tag))
    return titleMatch && tagMatch
  })
}, 400)

watch([searchText, selectedTags], updateFilteredGroups, { immediate: true })

const breakpoints = useBreakpoints(breakpointsTailwind)

// 根據斷點計算列數
const cols = computed(() => {
  if (breakpoints['2xl'].value)
    return 4
  if (breakpoints.xl.value || breakpoints.lg.value)
    return 3
  // 這裡改為預設2列
  return 2
})

const parts = computed(() => {
  const groups = debouncedFilteredGroups.value

  return groups.reduce((result, group, index) => {
    const col = index % cols.value
    if (!result[col])
      result[col] = []
    result[col].push(group)
    return result
  }, [] as Array<typeof groups>)
})

// 清除所有過濾器
function clearFilters() {
  searchText.value = ''
  selectedTags.value = []
}

// Generate OG Image
const siteData = useSiteConfig()

// 生成 OG 圖片
defineOgImage({
  props: {
    title: 'Gallery',
    description: t('galleryPage.description'),
    siteName: siteData.url,
  },
})
</script>

<template>
  <div>
    <div class="container max-w-5xl mx-auto mb-5 text-zinc-600">
      <PageHero
        :title="$t('galleryPage.title')"
        :description="$t('galleryPage.description')"
      />

      <TagsFilter
        v-model:selected-tags="selectedTags"
        :all-tags="allTags"
      />

      <ContentSearch v-model:search-test="searchText" />
    </div>

    <ClientOnly>
      <div
        v-if="debouncedFilteredGroups.length"
        grid="~ cols-2 sm:cols-2 lg:cols-3 2xl:cols-4 gap-4"
        class="container max-w-10xl mx-auto mt-10 text-zinc-600"
      >
        <div v-for="(groups, idx) in parts" :key="idx" flex="~ col gap-4">
          <div
            v-for="group in groups"
            :key="group.id"
            class="slide-enter"
            :style="{ '--enter-stage': idx + 1 }"
          >
            <NuxtLink :to="`/gallery/${group.id}`">
              <GalleryImageCard
                :title="group.title"
                :src="group.coverImage"
              />
            </NuxtLink>
          </div>
        </div>
      </div>

      <NoResults
        v-else
        :clear-filters="clearFilters"
        :description="$t('galleryPage.noResults')"
      />
    </ClientOnly>
  </div>
</template>
