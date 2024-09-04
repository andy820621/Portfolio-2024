<script setup lang='ts'>
import { useTheme } from '~/composables/useTheme'

const { isDark, toggleDark } = useTheme()
</script>

<template>
  <a class="select-none" title="Toggle Color Scheme" @click="toggleDark">
    <Icon :name="isDark ? 'i-ri-sun-line' : 'i-ri-moon-line'" />
  </a>
</template>
