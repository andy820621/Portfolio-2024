<script setup lang='ts'>
import { useTheme } from '~/composables/useTheme'

const { isDark, toggleDark } = useTheme()

const mounted = ref(false)

const iconName = computed(() => {
  if (!mounted.value)
    return 'i-ri-moon-line'

  return isDark.value ? 'i-ri-sun-line' : 'i-ri-moon-line'
})

onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <a class="select-none" title="Toggle Color Scheme" @click="toggleDark">
    <Icon :name="iconName" />
  </a>
</template>
