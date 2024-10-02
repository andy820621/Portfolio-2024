<script setup lang="ts">
const { content, icons, baseName, thumbnailType } = defineProps<{
  content: any
  images: string[]
  videos: string[]
  icons: Record<string, string>
  baseName: string
  thumbnailType: string
}>()

const date = computed(() => useFormatDate(content.date, false) || '')
</script>

<template>
  <div>
    <a
      border="~ base rounded-lg" block of-hidden
      class="group"
      hover="scale-101 shadow-xl z-10" transition-all duration-500 bg-base relative
      :href="content.link"
      target="_blank"
    >
      <NuxtImg
        :src="`/demos/thumbnail/${baseName}.${thumbnailType}`"
        :alt="baseName"
        w-full border="b base"
      />

      <div class="prose prose-sm p4 m0 pb3">
        <ContentRenderer :value="content" />
        <div v-if="date" op50 text-sm pt2>{{ date }}</div>

        <!-- 顯示圖標 -->
        <div v-if="icons" class="flex gap-2 mt-2">
          <img
            v-for="(iconPath, iconName) in icons"
            :key="iconName"
            :src="iconPath"
            :alt="iconName"
            class="w-6 h-6"
          >
        </div>
      </div>
    </a>
  </div>
</template>
