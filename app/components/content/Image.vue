<script setup lang="ts">
interface Props {
  imgSrc: string
  alt?: string
  width?: number | string
  height?: number | string
  sizes?: string
}

const {
  imgSrc,
  alt,
  width,
  height,
  sizes,
} = defineProps<Props>()
</script>

<template>
  <NuxtImg
    :src="imgSrc"
    :alt="alt"
    :width="width"
    :height="height"
    :sizes="sizes"
    class="h-auto w-full"
  />
</template>
