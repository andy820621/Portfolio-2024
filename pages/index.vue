<script setup lang="ts">
const { t, locale } = useI18n()

defineOgImageComponent('NuxtSeo')

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
  <div class="prose m-auto ">
    <article>
      <ContentDoc path="/about" :locale="locale" />
    </article>
  </div>
</template>

<style scoped>

</style>
