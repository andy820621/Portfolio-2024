<script setup lang="ts">
const { imgSrc, alt } = defineProps<{
  imgSrc: string
  alt?: string
}>()
</script>

<template>
  <NuxtImg :src="imgSrc" :alt="alt" />
</template>
