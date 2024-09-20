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
  </article>
</template>
