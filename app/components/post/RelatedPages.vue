<script setup lang="ts">
import type { RelatedPageResolved } from '~~/types/main'

const { pages } = defineProps<{
  pages: RelatedPageResolved[]
}>()

const { t } = useI18n()
</script>

<template>
  <aside
    v-if="pages.length"
    class="not-prose mt-12 border-t border-base/15 pt-6"
    :aria-label="t('relatedPages')"
  >
    <h2 class="text-sub/70 text-sm font-medium tracking-widest uppercase">
      {{ t('relatedPages') }}
    </h2>

    <ul class="mt-3 flex flex-col gap-1.5">
      <li v-for="page in pages" :key="page.path">
        <NuxtLink
          :to="page.path"
          class="group inline-flex items-center gap-2 text-sm text-sub transition-colors duration-200 hover:text-primary md:text-base"
        >
          <span class="text-sub/40 inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          {{ page.title }}
        </NuxtLink>
      </li>
    </ul>
  </aside>
</template>
