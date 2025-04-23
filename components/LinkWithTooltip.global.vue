<script setup lang="ts">
const {
  to,
  icon = '',
  tooltipContent = '',
  iconClass = '',
  size = '24',
} = defineProps<{
  to: string
  icon?: string
  tooltipContent?: string
  iconClass?: string
  size?: string
}>()
</script>

<template>
  <ClientOnly>
    <VTooltip class="w-fit h-fit">
      <NuxtLink
        :to="to"
        :title="tooltipContent"
        :aria-label="tooltipContent || to"
        class="border-b-none! flex items-center"
        target="_blank"
      >
        <Icon :name="icon" :class="iconClass" :size="size" aria-hidden="true" />
        <span class="sr-only">{{ tooltipContent || to }}</span>
      </NuxtLink>

      <template #popper>
        {{ tooltipContent }}
      </template>
    </VTooltip>
  </ClientOnly>
</template>
