<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import { useStableYear } from '~~/app/composables/useStableNow'
import { createPersonReference } from '~~/data'
import { resolveGalleryAlbumRouteSegment } from '~/utils/galleryCollection'

const LightGallery = defineAsyncComponent(() => import('@/components/LightGallery.vue'))

const route = useRoute()
const localePath = useLocalePath()
const encodedRouteSegment = route.params.album as string
const routeSegment = decodeRouteParam(encodedRouteSegment)

const { data: album, error: albumError } = await useAsyncData(
  `gallery-album-${routeSegment}`,
  () => resolveGalleryAlbumRouteSegment(routeSegment),
  { default: () => null },
)

if (albumError.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Internal Server Error',
    message: albumError.value.message || 'Failed to fetch album data',
    fatal: false,
  })
}

if (!album.value) {
  console.error('Album not found:', routeSegment)
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    message: 'Album not found',
    fatal: false,
  })
}

const canonicalAlbumPath = encodeCanonicalPagePath(localePath(`/gallery/${album.value.slug}`))
if (encodeCanonicalPagePath(route.path) !== canonicalAlbumPath) {
  await navigateTo(canonicalAlbumPath, { redirectCode: 301 })
}

const hasHydrated = shallowRef(false)
onMounted(() => (hasHydrated.value = true))

// 動態獲取資料夾內的照片
const { getAlbumImages } = useGalleryImages()
const { data: images, pending: loading, error } = await useAsyncData(
  `gallery-images-${album.value.albumId}`,
  () => getAlbumImages(album.value!.albumId),
  { default: () => [] },
)

if (error.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Internal Server Error',
    message: error.value.message || 'Failed to fetch album images',
    fatal: false,
  })
}

const { localeProperties, locale } = useI18n()

const localizedAlbumTitle = computed(() => {
  if (locale.value === 'zh')
    return album.value?.chTitle || album.value?.title || 'Gallery'

  return album.value?.title || 'Gallery'
})

const pageSeoTitle = computed(() => {
  if (locale.value === 'zh') {
    if (localizedAlbumTitle.value.length > 12)
      return `BarZ Hsieh 攝影相簿：${localizedAlbumTitle.value}`

    return `BarZ Hsieh 攝影相簿：${localizedAlbumTitle.value} 影像故事紀錄`
  }

  return `Photo Gallery Album: ${localizedAlbumTitle.value}`
})

const pageModifiedTime = computed(() => album.value?.updatedAt)

const breakpoints = useBreakpoints(breakpointsTailwind)

// 根據斷點計算列數
const cols = computed(() => {
  if (!hasHydrated.value)
    return 2
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
  }, [] as GalleryImageAsset[][])
})

const galleryImageUrls = computed(() => images.value.map(image => image.src))

const lightGalleryRef = useTemplateRef<InstanceType<typeof LightGallery>>('lightGalleryRef')

function openLightGallery(startIndex: number) {
  lightGalleryRef.value?.openLightGallery(startIndex)
}

function calculateOriginalIndex(colIdx: number, rowIdx: number) {
  return rowIdx * cols.value + colIdx
}

// 追蹤可見圖片的響應式狀態
const visibleImages = ref<string[]>([])
const imageRefs = useTemplateRefsList<HTMLElement>()

// 計算轉場延遲
function getTransitionDelay(images: GalleryImageAsset[], image: GalleryImageAsset) {
  return `${images.findIndex(candidate => candidate.src === image.src) * 100}ms`
}

// 檢查是否可見的方法
function isImageVisible(image: GalleryImageAsset) {
  return visibleImages.value.includes(image.src)
}

useIntersectionObserver(
  imageRefs,
  (entries) => {
    entries.forEach((entry) => {
      const imageSrc = (entry.target as HTMLElement).dataset.imageSrc

      if (entry.isIntersecting) {
        if (imageSrc && !visibleImages.value.includes(imageSrc)) {
          visibleImages.value.push(imageSrc)
        }
      }
    })
  },
  { threshold: 0.1 },
)

// 設定 SEO
usePageSeo({
  title: pageSeoTitle.value,
  description: album.value?.description || 'Gallery\'s description',
  image: album.value?.coverImage,
  modifiedTime: pageModifiedTime.value,
  keywords: [
    album.value?.title,
    album.value?.chTitle,
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
const { baseUrl } = useUrl()
const { getBreadcrumbListSchema } = useBreadcrumb()
const albumData = album.value
const galleryImages = galleryImageUrls.value

const websiteId = buildSchemaNodeId(baseUrl.value, 'website')
const nowPageId = buildSchemaPageNodeId(baseUrl.value, route.path, 'webpage')
const imageListId = buildSchemaPageNodeId(baseUrl.value, route.path, 'imagelist')

// 創意共享授權 URL
const licensePageUrl = locale.value === 'en'
  ? 'https://creativecommons.org/licenses/by/4.0/'
  : 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hant'

const stableYear = useStableYear()
const imageDefinitions: any[] = []

const itemListElement = galleryImages.map((src, index) => {
  const imageId = buildSchemaPageNodeId(baseUrl.value, route.path, `image-${index + 1}`)

  imageDefinitions.push(
    defineImage({
      '@id': imageId,
      '@type': 'ImageObject',
      'contentUrl': resolveStaticOgImageUrl(baseUrl.value, src),
      'url': resolveStaticOgImageUrl(baseUrl.value, src),
      'name': `${albumData.title} - Image ${index + 1}`,
      'description': `${albumData.title} gallery image ${index + 1}`,
      'representativeOfPage': index === 0,
      'encodingFormat': 'image/webp',
      'inLanguage': localeProperties.value.language,
      'license': licensePageUrl,
      'acquireLicensePage': buildCanonicalSiteUrl(baseUrl.value, localePath('license')),
      'creditText': 'BarZ Hsieh',
      'creator': createPersonReference({ baseUrl: baseUrl.value }),
      'copyrightNotice': '2024-PRESENT © BarZ Hsieh',
      'copyrightYear': stableYear.value,
      'copyrightHolder': createPersonReference({ baseUrl: baseUrl.value }),
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
    'name': albumData.title,
    'description': albumData.description,
    'url': buildCanonicalSiteUrl(baseUrl.value, route.path),
    'inLanguage': localeProperties.value.language,
    'isPartOf': {
      '@id': websiteId,
    },
    'mainEntity': {
      '@id': imageListId,
    },
  }),

  defineItemList({
    '@id': imageListId,
    '@type': 'ItemList',
    'numberOfItems': galleryImages.length,
    itemListElement,
  }),

  defineBreadcrumb(getBreadcrumbListSchema(albumData.title)),

  ...imageDefinitions,
])
</script>

<template>
  <div>
    <RandomBackground :sources="['Silk', 'Universe']" />

    <div v-if="album" class="max-w-10xl container mx-auto mt-8">
      <BreadcrumbList :custom-title="album.title" />

      <h1 class="mb-24 text-center text-2xl font-bold">
        {{ album.title }}
      </h1>

      <ClientOnly>
        <LightGallery
          v-if="images && images.length"
          ref="lightGalleryRef"
          :images="galleryImageUrls"
          :title="album.title"
        />
      </ClientOnly>

      <!-- Loading 狀態 -->
      <div v-if="loading" class="min-h-[400px] flex items-center justify-center">
        <div class="text-center">
          <div class="mb-4 inline-block h-12 w-12 animate-spin border-4 border-current border-r-transparent rounded-full border-solid motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <p class="text-zinc-600 dark:text-zinc-400">
            Loading images...
          </p>
        </div>
      </div>

      <!-- 圖片網格 -->
      <div
        v-else-if="images && images.length"
        grid="~ cols-2 sm:cols-2 lg:cols-3 2xl:cols-4 gap-1 sm:gap-2 lg:gap-[.55rem]"
        class="text-zinc-600"
      >
        <div v-for="(items, colIdx) in parts" :key="colIdx" flex="~ col gap-1 sm:gap-2 lg:gap-[.55rem]">
          <div
            v-for="(image, rowIdx) in items"
            :key="rowIdx"
            :ref="imageRefs.set"
            :data-image-src="image.src"
            class="gallery-item translate-y-10 transform cursor-zoom-in opacity-0 transition-all duration-700 ease-out"
            :class="{
              'opacity-100 translate-y-0': isImageVisible(image),
            }"
            :style="{
              transitionDelay: getTransitionDelay(items, image),
            }"
            @click="openLightGallery(calculateOriginalIndex(colIdx, rowIdx))"
          >
            <NuxtImg
              :src="image.src"
              :alt="`${album.title} - 第 ${calculateOriginalIndex(colIdx, rowIdx) + 1} 张图片`"
              :width="image.width"
              :height="image.height"
              sizes="50vw lg:33vw 2xl:25vw"
              :preload="calculateOriginalIndex(colIdx, rowIdx) === 0 ? { fetchPriority: 'high' } : false"
              :loading="calculateOriginalIndex(colIdx, rowIdx) === 0 ? 'eager' : 'lazy'"
              class="h-auto w-full object-cover"
              placeholder
            />
          </div>
        </div>
      </div>

      <!-- 沒有圖片 -->
      <div v-else class="min-h-[400px] flex items-center justify-center">
        <div class="text-center text-zinc-600 dark:text-zinc-400">
          <p class="mb-2 text-lg font-medium">
            No images found
          </p>
          <p class="text-sm">
            This album appears to be empty.
          </p>
        </div>
      </div>
    </div>

    <div v-else class="max-w-10xl container mx-auto mt-8">
      Loading...
    </div>
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
