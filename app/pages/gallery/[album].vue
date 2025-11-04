<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import { useStableYear } from '~~/app/composables/useStableNow'
import { galleryGroups } from '~~/data/galleryData'

const LightGallery = defineAsyncComponent(() => import('@/components/LightGallery.vue'))

const route = useRoute()
const albumId = route.params.album as string

const album = computed(() =>
  galleryGroups.find(group => group.id === albumId),
)

// 動態獲取資料夾內的照片
const { getAlbumImages } = useGalleryImages()
const images = ref<string[]>([])
const error = ref<Error | null>(null)

onMounted(async () => {
  try {
    images.value = await getAlbumImages(albumId)
  }
  catch (err) {
    error.value = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to fetch gallery images:', err)
  }
})

watch(album, (newAlbum) => {
  if (!newAlbum) {
    console.error('Album not found:', albumId)
    navigateTo(useLocalePath()('/404'))
  }
}, { immediate: true })

watch(error, (newError) => {
  if (newError) {
    console.error('Fetch error:', newError)
    navigateTo(useLocalePath()('/404'))
  }
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
  keywords: [
    album.value?.title,
    'Gallery',
    '相簿',
    'BarZ',
    'Hsieh Yao Tsu',
    '攝影',
    '作品集',
    ...(album.value?.tags || []),
  ].filter(Boolean).join(', '),
})

// 將這段代碼放在 usePageSeo 之後
const { localeProperties, locale } = useI18n()
const { baseUrl, fullPath } = useUrl()
const { getBreadcrumbListSchema } = useBreadcrumb()
const localePath = useLocalePath()

const websiteId = `${baseUrl.value}#website`
const nowPageId = `${fullPath.value}#webpage`
const personId = `${baseUrl.value}#identity`

// 創意共享授權 URL
const licensePageUrl = locale.value === 'en'
  ? 'https://creativecommons.org/licenses/by/4.0/'
  : 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hant'

// 添加完整的 Schema.org 結構化資料
watchEffect(() => {
  if (album.value && images.value) {
    const imageDefinitions: any[] = []

    const itemListElement = images.value.map((src, index) => {
      const imageId = `${fullPath.value}#image-${index + 1}`

      // 為每張圖片創建 defineImage
      imageDefinitions.push(
        defineImage({
          '@id': imageId,
          '@type': 'ImageObject',
          'contentUrl': `${trailingSlashUrlOrNot(baseUrl.value, false)}${src}`,
          'url': `${trailingSlashUrlOrNot(baseUrl.value, false)}${src}`,
          'name': `${album.value!.title} - Image ${index + 1}`,
          'description': `${album.value!.title} gallery image ${index + 1}`,
          'representativeOfPage': index === 0,
          'encodingFormat': 'image/webp',
          'inLanguage': localeProperties.value.language,
          // 授權資訊
          'license': licensePageUrl,
          'acquireLicensePage': `${trailingSlashUrlOrNot(baseUrl.value, false)}${localePath('license')}`,
          'creditText': 'BarZ Hsieh',
          'creator': {
            '@type': 'Person',
            '@id': personId,
            'name': 'BarZ Hsieh',
          },
          'copyrightNotice': '2024-PRESENT © BarZ Hsieh',
          'copyrightYear': (() => {
            const stableYear = useStableYear()
            return stableYear.value
          })(),
          'copyrightHolder': {
            '@id': personId,
          },
        }),
      )

      return {
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@id': imageId,
        },
      }
    })

    useSchemaOrg([
      defineWebPage({
        '@id': nowPageId,
        '@type': 'WebPage',
        'name': album.value.title,
        'description': album.value.description,
        'url': fullPath.value,
        'inLanguage': localeProperties.value.language,
        'isPartOf': {
          '@id': websiteId,
        },
        'mainEntity': {
          '@id': `${fullPath.value}#imagelist`,
        },
      }),

      defineItemList({
        '@id': `${fullPath.value}#imagelist`,
        '@type': 'ItemList',
        'numberOfItems': images.value.length,
        itemListElement,
      }),

      defineBreadcrumb(getBreadcrumbListSchema(album.value.title)),

      // 所有圖片的授權資訊
      ...imageDefinitions,
    ])
  }
})
</script>

<template>
  <div v-if="album" class="max-w-10xl container mx-auto mt-8">
    <BreadcrumbList :custom-title="album.title" class="mb-6" />

    <h1 class="mb-24 text-center text-2xl font-bold">
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
            class="gallery-item translate-y-10 transform cursor-zoom-in opacity-0 transition-all duration-700 ease-out"
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
              class="h-auto w-full object-cover"
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

  <div v-else class="max-w-10xl container mx-auto mt-8">
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
    padding-left: 1.375rem !important;
    padding-right: 1.375rem !important;
  }
}
</style>
