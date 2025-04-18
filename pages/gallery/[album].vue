<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import LightGallery from '~/components/LightGallery.vue'
import { galleryGroups } from '~/data/galleryData'

const route = useRoute()
const albumId = route.params.album as string

const album = computed(() =>
  galleryGroups.find(group => group.id === albumId),
)

// 動態獲取資料夾內的照片
const { data: images } = await useAsyncData(`gallery-${albumId}`, async () => {
  const imageModules = import.meta.glob('/public/gallery-images/**/*')

  return Object.keys(imageModules)
    .filter(path => path.includes(`/public/gallery-images/${albumId}/`))
    .map(path => path.replace('/public', ''))
})

const breakpoints = useBreakpoints(breakpointsTailwind)

// 根據斷點計算列數
const cols = computed(() => {
  if (breakpoints['2xl'].value)
    return 4
  if (breakpoints.xl.value || breakpoints.lg.value)
    return 3
  return 2
})

const parts = computed(() => {
  if (!images.value)
    return []

  return images.value.reduce((result, image, index) => {
    const col = index % cols.value
    if (!result[col])
      result[col] = []
    result[col].push(image)
    return result
  }, [] as string[][])
})

const lightGalleryRef = ref<InstanceType<typeof LightGallery> | null>(null)

function openLightGallery(startIndex: number) {
  lightGalleryRef.value?.openLightGallery(startIndex)
}

function calculateOriginalIndex(colIdx: number, rowIdx: number) {
  return rowIdx * cols.value + colIdx
}

// 追蹤可見圖片的響應式狀態
const visibleImages = ref<string[]>([])
const imageRefs = ref<HTMLElement[]>([])

// 創建一個方法來處理 ref 邏輯
function handleImageRef(el: HTMLElement | null) {
  if (el) {
    if (!imageRefs.value.includes(el)) {
      imageRefs.value.push(el)
    }
  }
}

// 計算轉場延遲
function getTransitionDelay(images: string[], image: string) {
  return `${images.indexOf(image) * 100}ms`
}

// 檢查是否可見的方法
function isImageVisible(image: string) {
  return visibleImages.value.includes(image)
}

let stop: (() => void) | undefined

watch(parts, (newParts) => {
  if (newParts.length > 0) {
    setTimeout(() => {
      const observerOptions = {
        threshold: 0.1,
      }

      const observerResult = useIntersectionObserver(
        imageRefs,
        (entries) => {
          entries.forEach((entry) => {
            const imageSrc = (entry.target as HTMLElement).dataset.imageSrc

            if (entry.isIntersecting) {
              if (imageSrc && !visibleImages.value.includes(imageSrc)) {
                nextTick(() => {
                  visibleImages.value.push(imageSrc)
                })
              }
            }
          })
        },
        observerOptions,
      )

      stop = observerResult.stop
    })
  }
}, { immediate: true })

onUnmounted(() => {
  if (stop)
    stop()
})

// 設定 SEO
usePageSeo({
  title: album.value?.title || 'Gallery',
  description: album.value?.description || 'Gallery\'s description',
  image: album.value?.coverImage,
})
</script>

<template>
  <div v-if="album" class="container max-w-10xl mx-auto mt-8">
    <h1 class="text-2xl font-bold mb-24 text-center">
      {{ album.title }}
    </h1>

    <ClientOnly>
      <LightGallery
        v-if="images && images.length"
        ref="lightGalleryRef"
        :images="images"
        :title="album.title"
      />

      <div
        v-if="images && images.length"
        grid="~ cols-2 sm:cols-2 lg:cols-3 2xl:cols-4 gap-1 sm:gap-2 lg:gap-[.55rem]"
        class="text-zinc-600"
      >
        <div v-for="(items, colIdx) in parts" :key="colIdx" flex="~ col gap-1 sm:gap-2 lg:gap-[.55rem]">
          <div
            v-for="(src, rowIdx) in items"
            :key="rowIdx"
            :ref="(el) => handleImageRef(el as HTMLElement)"
            :data-image-src="src"
            class="gallery-item opacity-0 transform translate-y-10 transition-all duration-700 ease-out cursor-zoom-in"
            :class="{
              'opacity-100 translate-y-0': isImageVisible(src),
            }"
            :style="{
              transitionDelay: getTransitionDelay(items, src),
            }"
            @click="openLightGallery(calculateOriginalIndex(colIdx, rowIdx))"
          >
            <NuxtImg
              :src="src"
              :alt="`${album.title} - 第 ${calculateOriginalIndex(colIdx, rowIdx) + 1} 张图片`"
              class="w-full h-auto object-cover"
              placeholder
              loading="lazy"
              format="webp"
              quality="24"
            />
          </div>
        </div>
      </div>
      <div v-else class="text-center">
        No images found
      </div>
    </ClientOnly>
  </div>

  <div v-else class="container max-w-10xl mx-auto mt-8">
    Loading...
  </div>
</template>

<style scoped>
.gallery-item {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.gallery-item.opacity-100.translate-y-0 {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 750px) {
  main {
    @apply !px-5.5;
  }
}
</style>
