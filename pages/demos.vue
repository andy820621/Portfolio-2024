<script setup lang="ts">
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
</script>

<template>
  <article class="prose dark:prose-invert max-w-none">
    <ContentDoc path="/demos" />
  </article>
</template>
