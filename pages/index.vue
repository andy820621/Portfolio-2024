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
      <ContentDoc :key="locale" path="/about" :locale="locale">
        <template #empty>
          <h1>Document is empty</h1>
        </template>
        <template #not-found>
          <h1>Document not found</h1>
        </template>
      </ContentDoc>
    </article>
  </div>
</template>

<style scoped>

</style>
