<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
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
  return Array.from({ length: cols.value }, (_, i) =>
    images.filter((_, j) => j % cols.value === i))
})

useSeoMeta({
  title: album.value?.title,
  ogTitle: album.value?.title,
})
</script>

<template>
  <div v-if="album" class="container max-w-10xl mx-auto mt-8">
    <h1 class="text-2xl font-bold mb-24 text-center">
      {{ album.title }}
    </h1>

    <ClientOnly>
      <div
        grid="~ cols-1 sm:cols-2 lg:cols-3 2xl:cols-4 gap-[.55rem]"
        class="text-zinc-600"
      >
        <div v-for="(items, idx) in parts" :key="idx" flex="~ col gap-[.55rem]">
          <div
            v-for="(src, imageIdx) in items"
            :key="imageIdx"
            class="slide-enter"
            :style="{ '--enter-stage': idx + 1 }"
          >
            <NuxtImg
              :src="src"
              :alt="`${album.title} - Image ${imageIdx + 1}`"
              class="w-full h-auto object-cover"
            />
            <!-- <img :src="src" alt=""> -->
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
