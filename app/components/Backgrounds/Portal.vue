<script setup lang="ts">
interface BackgroundsPortalProps {
  class?: string
}

const props = defineProps<BackgroundsPortalProps>()
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-0 z--1" :class="props.class">
      <slot />
    </div>
  </Teleport>
</template>
