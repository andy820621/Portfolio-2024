<script setup lang="ts">
import type { RelatedLinkResolved } from '~~/types/main'

const { links } = defineProps<{
  links: RelatedLinkResolved[]
}>()

const { t } = useI18n()
</script>

<template>
  <aside
    v-if="links.length"
    class="not-prose mt-12 border-t border-base/15 pt-6"
    :aria-label="t('relatedLinks')"
  >
    <h2 class="text-sub/70 text-sm font-medium tracking-widest uppercase">
      {{ t('relatedLinks') }}
    </h2>

    <ul class="mt-3 flex flex-col gap-3">
      <li
        v-for="link in links"
        :key="link.href"
        class="border-b border-base/10 pb-3 last:border-b-0 last:pb-0"
      >
        <NuxtLink
          v-if="!link.isExternal"
          :to="link.href"
          class="group inline-flex items-center gap-2 text-sm text-sub transition-colors duration-200 hover:text-primary md:text-base"
        >
          <span class="text-sub/40 inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          {{ link.title }}
        </NuxtLink>

        <a
          v-else
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-2 text-sm text-sub transition-colors duration-200 hover:text-primary md:text-base"
        >
          <span class="text-sub/40 inline-block transition-transform duration-200 group-hover:translate-x-0.5">↗</span>
          {{ link.title }}
        </a>

        <p v-if="link.note" class="text-sub/65 mt-1 pl-5 text-sm">
          {{ link.note }}
        </p>
      </li>
    </ul>
  </aside>
</template>
