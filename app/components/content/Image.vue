<script setup lang="ts">
interface Props {
  imgSrc: string
  alt?: string
  width?: number | string
  height?: number | string
  sizes?: string
  loading?: 'lazy' | 'eager'
}

const {
  imgSrc,
  alt,
  width,
  height,
  sizes,
  loading,
} = defineProps<Props>()
</script>

<template>
  <NuxtImg
    :src="imgSrc"
    :alt="alt"
    :width="width"
    :height="height"
    :sizes="sizes"
    :loading="loading"
    class="h-auto w-full"
  />
</template>
