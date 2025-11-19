<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  icon?: string
}>(), {
  icon: 'i-lucide-search',
})

const emit = defineEmits<{
  (event: 'click', payload: MouseEvent): void
}>()

const { isOpen, open } = useGlobalSearchModalState()
const { t } = useI18n()

const buttonLabel = computed(() => props.label || t('filtersBar.Search'))

function handleClick(event: MouseEvent) {
  emit('click', event)
  open()
}
</script>

<template>
  <button
    type="button"
    class="inline-flex select-none items-center justify-center text-[1.3rem] opacity-60 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:opacity-100!"
    :aria-label="buttonLabel"
    :data-state="isOpen ? 'open' : 'closed'"
    data-slot="base"
    v-bind="$attrs"
    @click="handleClick"
  >
    <Icon :name="props.icon" aria-hidden="true" />
    <span class="sr-only">
      {{ buttonLabel }}
    </span>
  </button>
</template>
