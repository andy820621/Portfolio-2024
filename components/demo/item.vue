<script setup lang="ts">
defineProps<{
  content: any
  video?: string
  date: string
}>()
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
      <video
        v-if="video"
        :src="video"
        w-full autoplay loop muted playsinline border="b base"
      />

      <div class="prose prose-sm p4 m0 pb3">
        <ContentRenderer :value="content" />
        <div op50 text-sm pt2>{{ useFormatDate(date, false) || '' }}</div>
      </div>
    </a>
  </div>
</template>
