<script setup lang="ts">
import type { RelatedPageResolved } from '~~/types/main'

const { pages } = defineProps<{
  pages: RelatedPageResolved[]
}>()

const { t } = useI18n()
</script>

<template>
  <PostRelatedSection v-if="pages.length" :label="t('relatedPages')">
    <li v-for="page in pages" :key="page.path" class="list-none">
      <NuxtLink
        :to="page.path"
        class="group inline-flex items-center gap-2 text-sm text-sub transition-colors duration-200 hover:text-primary md:text-base"
      >
        <span class="text-sub/40 inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        {{ page.title }}
      </NuxtLink>
    </li>
  </PostRelatedSection>
</template>
