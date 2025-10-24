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
    <VTooltip class="h-fit w-fit">
      <NuxtLink
        :to="to"
        :title="tooltipContent"
        :aria-label="tooltipContent || to"
        class="flex items-center border-b-none!"
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
