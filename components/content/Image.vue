<script setup lang="ts">
const { imgSrc, alt } = defineProps<{
  imgSrc: string
  alt?: string
}>()
</script>

<template>
  <nuxt-img :src="imgSrc" :alt="alt" />
</template>
