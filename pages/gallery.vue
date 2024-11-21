<script setup lang="ts">
definePageMeta({
  documentDriven: {
    page: false, // Keep page fetching enabled
    surround: false, // Disable surround fetching
  },
})

onMounted(() => {
  useHead({
    title: 'gallery',
  })
})
</script>

<template>
  <article class="prose dark:prose-invert max-w-none">
    <ContentDoc path="/gallery" />

    <!-- <LightBox
      :photos="[
        {
          src: '/project-images/ti-ho-healthcare/home.webp',
          size: '656-400',
          title: '首頁',
          description: '這是首頁照片',
        },
        {
          src: '/project-images/ti-ho-healthcare/about.webp',
          size: '656-1420',
          title: '關於我們',
          description: '這是關於我們照片',
        },
      ]"
    /> -->
  </article>
</template>
