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
  const docs = await queryContent('demos-data').sort({ _file: -1 }).find()

  return Promise.all(docs.map(async (doc) => {
    const fileName = doc._file!.split('/').pop()?.split('.')[0] || ''
    let video
    try {
      video = (await import(`~/content/demos-data/${fileName}.mp4`)).default
    }
    catch (e) {
      console.error(`Failed to import video for ${fileName}`, e)
    }
    return {
      date: fileName,
      content: doc,
      video,
    }
  }))
})

// console.log({ demoItems: demoItems.value })

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
        <!-- 遍歷parts數組，為每一列創建一個flex容器 -->
        <div v-for="(items, idx) in parts" :key="idx" flex="~ col gap-4">
          <!-- 遍歷每一列中的項目，動態渲染組件 -->
          <div v-for="item in items" :key="item.date">
            <DemoItem
              :video="item.video"
              :date="item.date"
              :content="item.content"
              class="slide-enter"
              :style="{
                '--enter-stage': idx + 1, // 設置入場動畫的階段
              }"
            />
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
