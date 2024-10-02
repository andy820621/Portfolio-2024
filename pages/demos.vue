<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'

definePageMeta({
  documentDriven: {
    page: false, // Keep page fetching enabled
    surround: false, // Disable surround fetching
  },
})

onMounted(() => {
  useHead({
    title: 'demos',
  })
})

useSeoMeta({
  title: 'Demos - BarZ Hsieh',
  ogTitle: 'Demos - BarZ Hsieh',
  description: 'Demonstration and experimentation of the project I am working on',
  ogDescription: 'Demonstration and experimentation of the project I am working on',
})

const { data: demoItems } = await useAsyncData('demos-data', async () => {
  // const docs = await queryContent('demos-data').sort({ _file: -1 }).find()
  const docs = await queryContent('demos-data').find()

  // console.log({ docs })

  return docs.map((doc) => {
    const fullFileName = doc._file!.split('/').pop() || ''
    const parts = fullFileName.split('.')
    const baseName = parts.length > 2 ? parts[1] : parts[0]
    return {
      baseName,
      content: doc,
      images: doc.images || [],
      videos: doc.videos || [],
      icons: doc.icons || {},
      thumbnailType: doc.thumbnailType || 'image',
    }
  })
})

const breakpoints = useBreakpoints(breakpointsTailwind)
// 根據斷點計算列數
const cols = computed(() => {
  if (breakpoints.xl.value)
    return 3
  if (breakpoints.lg.value)
    return 2
  return 1
})
// 將demoItems分配到不同的列中
const parts = computed(() => {
  const items = demoItems.value
  if (!items)
    return []

  return Array.from({ length: cols.value }, (_, i) =>
    items.filter((_, j) => j % cols.value === i))
})
</script>

<template>
  <div>
    <div class="prose m-auto mb-8">
      <h1 class="mb-0 slide-enter-50">
        Demos
      </h1>
      <p class="opacity-50 !-mt-6 italic slide-enter">
        Demonstration and experimentation of the project I am working on
      </p>
    </div>
    <!-- <article class="prose m-auto mb-8">
      <ContentDoc path="/demos" />
    </article> -->

    <ClientOnly>
      <div grid="~ cols-1 lg:cols-2 xl:cols-3 gap-4">
        <div v-for="(items, idx) in parts" :key="idx" flex="~ col gap-4">
          <div v-for="item in items" :key="item.baseName">
            <DemoItem
              :images="item.images"
              :videos="item.videos"
              :icons="item.icons"
              :base-name="item.baseName"
              :content="item.content"
              :thumbnail-type="item.thumbnailType"
              class="slide-enter"
              :style="{
                '--enter-stage': idx + 1,
              }"
            />
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
