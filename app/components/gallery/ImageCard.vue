<script setup lang="ts">
const props = defineProps<{
  title: string
  src?: string
  albumId?: string
  width?: number
  height?: number
  priority?: boolean
}>()

const imageSrc = computed(() => {
  // 如果有 coverImage 直接使用
  if (props.src)
    return props.src

  // 如果沒有 coverImage，使用 albumId 生成圖片路徑
  if (props.albumId)
    return `/gallery-images/${props.albumId}.webp`

  // 如果都沒有，返回預設或空圖片
  return ''
})
</script>

<template>
  <article

    relative block of-hidden border-rounded-lg bg-base
    transition="all duration-500"
  >
    <div v-if="imageSrc" class="imageBox relative" role="img" :aria-label="title">
      <NuxtImg
        :src="imageSrc"
        :alt="title"
        :width="width"
        :height="height"
        sizes="50vw lg:33vw 2xl:25vw"
        :preload="priority ? { fetchPriority: 'high' } : false"
        :loading="priority ? 'eager' : 'lazy'"
        class="h-auto w-full object-cover"
        placeholder
      />

      <div
        class="overlay absolute inset-0 z-2 flex flex-col items-center justify-center rounded-lg p-4"
        aria-hidden="true"
      >
        <h2 class="text-2xl text-black font-semibold dark:text-zinc-300">
          {{ title }}
        </h2>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.imageBox {
  @apply overflow-hidden;
}

.overlay {
  @apply opacity-0 transition-all duration-500 backdrop-filter backdrop-blur-0;
}

.overlay::before {
  content: '';
  @apply absolute inset-0 bg-black bg-opacity-60 opacity-0 transition-all duration-500 rounded-inherit;
}

.imageBox:hover .overlay {
  @apply opacity-100 backdrop-blur-sm;
}

.imageBox:hover .overlay::before {
  @apply opacity-100;
}

.overlay h2 {
  @apply transform translate-y-5 opacity-0 transition-all duration-500;
}

.imageBox:hover .overlay h2 {
  @apply translate-y-0 opacity-100;
}
</style>
