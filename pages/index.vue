<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  documentDriven: {
    page: false, // Keep page fetching enabled
    surround: false, // Disable surround fetching
  },
})

useHead({
  title: t('home'),
})
</script>

<template>
  <div>
    IndexPage
  </div>
</template>

<style scoped>

</style>
