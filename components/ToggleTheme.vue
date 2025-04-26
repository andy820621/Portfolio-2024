<script setup lang='ts'>
import { useTheme } from '~/composables/useTheme'

const { isDark, toggleDark } = useTheme()

const mounted = ref(false)

const iconName = computed(() => {
  if (!mounted.value)
    return 'i-ri-moon-line'

  return isDark.value ? 'i-ri-moon-line' : 'i-ri-sun-line'
})

onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <button
    type="button"
    class="inline-flex select-none"
    title="Toggle Color Scheme"
    aria-label="Toggle Color Scheme"
    @click="toggleDark"
  >
    <Icon :name="iconName" />
  </button>
</template>
