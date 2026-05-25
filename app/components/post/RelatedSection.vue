<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <aside class="not-prose mt-12 border-t border-base/15 pt-6" :aria-label="label">
    <h2 class="text-sub/70 text-sm font-medium tracking-widest uppercase">
      {{ label }}
    </h2>

    <ul class="related-list m-0 mt-3 flex flex-col list-none gap-1.5 pl-0">
      <slot />
    </ul>
  </aside>
</template>
