<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

defineProps<{
  prev: ContentNavigationItem | undefined
  next: ContentNavigationItem | undefined
}>()

const localePath = useLocalePath()
</script>

<template>
  <ul mt4 py2 grid="~ cols-[1fr_1fr] gap-4">
    <li>
      <div
        v-if="prev && prev.path"
        flex="~ col"
        class="flex-1 p4"
        border="~ base rounded-lg hover:primary"
        relative block h-full
      >
        <Icon class="pointer-events-none mb4 h-7 w-7 inline-flex flex-none items-center text-lg text-primary" name="ri:arrow-left-line" />
        <div class="my-0 text-lg font-semibold">
          {{ prev.title }}
        </div>
        <div class="line-clamp line-clamp-2 mb-0 mt-1 text-[14px] op50">
          {{ prev.description }}
          <slot />
        </div>
        <NuxtLink :to="localePath(prev.path)" class="absolute inset-0" />
      </div>
    </li>

    <li>
      <div
        v-if="next && next.path"
        flex="~ col"
        class="flex-1 p4"
        border="~ base rounded-lg hover:primary"
        relative block h-full items-end text-right
      >
        <Icon class="pointer-events-none mb4 h-7 w-7 inline-flex flex-none items-center text-lg text-primary" name="ri:arrow-right-line" />
        <div class="my-0 text-lg font-semibold">
          {{ next.title }}
        </div>
        <div class="line-clamp line-clamp-2 mb-0 mt-1 text-[14px] op50">
          {{ next.description }}
          <slot />
        </div>
        <NuxtLink :to="localePath(next.path)" class="absolute inset-0" />
      </div>
    </li>
  </ul>
</template>
