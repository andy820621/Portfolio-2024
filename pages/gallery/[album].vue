<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import LightGallery from '~/components/LightGallery.vue'
import { galleryGroups } from '~/data/galleryData'

definePageMeta({
  documentDriven: {
    page: false,
    surround: false,
  },
})

const route = useRoute()
const albumId = route.params.album as string

const album = computed(() =>
  galleryGroups.find(group => group.id === albumId),
)

const breakpoints = useBreakpoints(breakpointsTailwind)

// 根據斷點計算列數
const cols = computed(() => {
  if (breakpoints['2xl'].value)
    return 4
  if (breakpoints.xl.value || breakpoints.lg.value)
    return 3
  if (breakpoints.md.value || breakpoints.sm.value)
    return 2
  if (breakpoints.smaller('sm'))
    return 1
  return 1
})

const parts = computed(() => {
  if (!album.value)
    return []

  const images = album.value.images
  return images.reduce((result, image, index) => {
    const col = index % cols.value
    if (!result[col])
      result[col] = []
    result[col].push(image)
    return result
  }, [] as string[][])
})

useSeoMeta({
  title: album.value?.title,
  ogTitle: album.value?.title,
})

const lightGalleryRef = ref<InstanceType<typeof LightGallery> | null>(null)

function openLightGallery(startIndex: number) {
  lightGalleryRef.value?.openLightGallery(startIndex)
}

function calculateOriginalIndex(colIdx: number, rowIdx: number) {
  return rowIdx * cols.value + colIdx
}
</script>

<template>
  <div v-if="album" class="container max-w-10xl mx-auto mt-8">
    <h1 class="text-2xl font-bold mb-24 text-center">
      {{ album.title }}
    </h1>

    <ClientOnly>
      <LightGallery
        ref="lightGalleryRef"
        :images="album.images"
        :title="album.title"
      />

      <div
        grid="~ cols-1 sm:cols-2 lg:cols-3 2xl:cols-4 gap-[.55rem]"
        class="text-zinc-600"
      >
        <div v-for="(items, colIdx) in parts" :key="colIdx" flex="~ col gap-[.55rem]">
          <div
            v-for="(src, rowIdx) in items"
            :key="rowIdx"
            class="slide-enter cursor-pointer"
            :style="{ '--enter-stage': colIdx + 1 }"
            @click="openLightGallery(calculateOriginalIndex(colIdx, rowIdx))"
          >
            <NuxtImg
              :src="src"
              :alt="`${album.title} - 第 ${calculateOriginalIndex(colIdx, rowIdx) + 1} 张图片`"
              class="w-full h-auto object-cover"
              placeholder
              loading="lazy"
              format="webp"
              quality="24"
            />
            <!-- <img
              :src="src"
              :alt="`${album.title} - Image ${rowIdx + 1}`"
              class="w-full h-auto object-cover"
            > -->
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>

  <div v-else class="container max-w-10xl mx-auto mt-8">
    <!-- <NotFound /> -->
    Loading...
  </div>
</template>
