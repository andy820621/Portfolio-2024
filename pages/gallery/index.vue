<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import { galleryGroups } from '~/data/galleryData'

const { t } = useI18n()

// 設置 SEO
usePageSeo({
  title: 'Gallery',
  description: t('galleryPage.description'),
  noIndex: false,
})

// 搜索文本和選中的標籤
const searchText = ref('')
const selectedTags = ref<string[]>([])

// 計算所有唯一標籤
const allTags = computed(() => {
  const tagSet = new Set<string>()
  galleryGroups.forEach((group) => {
    group.tags.forEach(tag => tagSet.add(tag))
  })
  return Array.from(tagSet)
})

// 防抖過濾後的圖片組
const debouncedFilteredGroups = ref(galleryGroups)

const updateFilteredGroups = useDebounceFn(() => {
  debouncedFilteredGroups.value = galleryGroups.filter((group) => {
    const lowerTitle = group.title.toLocaleLowerCase()
    const titleMatch = lowerTitle.includes(searchText.value.toLocaleLowerCase())

    // 標籤篩選
    const tagMatch = selectedTags.value.length === 0
      || selectedTags.value.every(tag => group.tags.includes(tag))

    return titleMatch && tagMatch
  })
}, 400)

// 監聽搜索文本和選中標籤的變化
watch([searchText, selectedTags], updateFilteredGroups, { immediate: true })

// 使用斷點檢測
const breakpoints = useBreakpoints(breakpointsTailwind)
// 根據斷點動態計算列數
const cols = computed(() => {
  if (breakpoints['2xl'].value)
    return 4
  if (breakpoints.xl.value || breakpoints.lg.value)
    return 3
  return 2
})

// 將圖片組按列均勻分佈
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

// 清除所有篩選器
function clearFilters() {
  searchText.value = ''
  selectedTags.value = []
}

// 追蹤可見圖片組的響應式狀態
const visibleGroups = ref<string[]>([])
const groupRefs = ref<HTMLElement[]>([])

// 創建一個方法來處理 ref 邏輯
function handleGroupRef(el: HTMLElement | null) {
  if (el) {
    if (!groupRefs.value.includes(el)) {
      groupRefs.value.push(el)
    }
  }
}

// 計算轉場延遲
function getTransitionDelay(groups: any[], group: any) {
  return `${groups.indexOf(group) * 100}ms`
}

// 檢查是否可見的方法
function isGroupVisible(group: any) {
  return visibleGroups.value.includes(group.id)
}

onMounted(() => {
  const observerOptions = {
    threshold: 0.1, // 當元素 10% 可見時觸發
  }

  // 使用交叉觀察器實現延遲加載和淡入效果
  const { stop } = useIntersectionObserver(
    groupRefs,
    (entries) => {
      entries.forEach((entry) => {
        // 當元素進入可視區域
        if (entry.isIntersecting) {
          const groupId = (entry.target as HTMLElement).dataset.groupId
          // 避免重複添加
          if (groupId && !visibleGroups.value.includes(groupId)) {
            nextTick(() => {
              visibleGroups.value.push(groupId)
            })
          }
        }
      })
    },
    observerOptions,
  )

  onUnmounted(stop)
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
        grid="~ cols-2 sm:cols-2 lg:cols-3 2xl:cols-4 gap-1 sm:gap-2 lg:gap-[.55rem]"
        class="container max-w-10xl mx-auto mt-10 text-zinc-600"
      >
        <div
          v-for="(groups, idx) in parts"
          :key="idx"
          flex="~ col gap-1 sm:gap-2 lg:gap-[.55rem]"
        >
          <div
            v-for="(group) in groups"
            :key="group.id"
            :ref="(el) => handleGroupRef(el as HTMLElement)"
            :data-group-id="group.id"
            class="gallery-item opacity-0 transform translate-y-10 transition-all duration-700 ease-out"
            :class="{
              'opacity-100 translate-y-0': isGroupVisible(group),
            }"
            :style="{
              transitionDelay: getTransitionDelay(groups, group),
            }"
          >
            <NuxtLink :to="`/gallery/${group.id}`">
              <GalleryImageCard
                :id="group.id"
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

<style scoped>
/* 圖片組動畫效果 */
.gallery-item {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.gallery-item.opacity-100.translate-y-0 {
  opacity: 1;
  transform: translateY(0);
}
</style>
