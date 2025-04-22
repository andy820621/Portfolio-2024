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
        class="border-b-none! flex items-center"
        target="_blank"
        :aria-label="tooltipContent || to"
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

<style scoped lang="scss">
/* Overrides Floating Vue */
.v-popper--theme-dropdown .v-popper__inner,
.v-popper--theme-tooltip .v-popper__inner {
  --at-apply: bg-base text-base text-base rounded border border-base shadow;
  box-shadow: 0 6px 30px #0000001a;
}

.v-popper--theme-tooltip .v-popper__arrow-inner,
.v-popper--theme-dropdown .v-popper__arrow-inner {
  visibility: visible;
  --at-apply: border-white dark-border-black;
}

.v-popper--theme-tooltip .v-popper__arrow-outer,
.v-popper--theme-dropdown .v-popper__arrow-outer {
  --at-apply: border-base;
}

.v-popper--theme-tooltip.v-popper--shown,
.v-popper--theme-tooltip.v-popper--shown * {
  transition: none !important;
}
</style>
