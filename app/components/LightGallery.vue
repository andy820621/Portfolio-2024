<script setup lang="ts">
import type { LightGallerySettings } from 'lightgallery/lg-settings'
import type { LightGallery } from 'lightgallery/lightgallery'
import type lgShareType from 'lightgallery/plugins/share'
import type lgThumbnailType from 'lightgallery/plugins/thumbnail'
import type lgZoomType from 'lightgallery/plugins/zoom'

const { images, title } = defineProps<{
  images: string[]
  title?: string
}>()

const lightGalleryContainer = useTemplateRef<HTMLDivElement>('lightGalleryContainer')
const lightGalleryInstance = shallowRef<LightGallery | null>(null)
const isLibraryLoaded = ref(false)

let lightGallery: ((el: HTMLElement, options?: LightGallerySettings) => LightGallery) | null = null
let lgThumbnail: typeof lgThumbnailType | null = null
let lgZoom: typeof lgZoomType | null = null
let lgShare: typeof lgShareType | null = null

const lightGalleryDynamicEl = computed(() =>
  images.map(src => ({
    src,
    thumb: src,
    subHtml: `<h4>${title || ''}</h4>`,
  })),
)

onMounted(async () => {
  // Dynamically import lightgallery and plugins
  const [
    lgModule,
    lgThumbnailModule,
    lgZoomModule,
    lgShareModule,
  ] = await Promise.all([
    import('lightgallery'),
    import('lightgallery/plugins/thumbnail'),
    import('lightgallery/plugins/zoom'),
    import('lightgallery/plugins/share'),
  ])

  lightGallery = lgModule.default
  lgThumbnail = lgThumbnailModule.default
  lgZoom = lgZoomModule.default
  lgShare = lgShareModule.default

  isLibraryLoaded.value = true
})

async function openLightGallery(startIndex: number) {
  // Ensure library is loaded
  if (!isLibraryLoaded.value || !lightGalleryContainer.value || !lightGallery || !lgThumbnail || !lgZoom || !lgShare)
    return

  lightGalleryInstance.value = lightGallery(lightGalleryContainer.value, {
    dynamic: true,
    dynamicEl: lightGalleryDynamicEl.value,
    index: startIndex,
    plugins: [lgThumbnail, lgZoom, lgShare],
    mode: 'lg-slide',
  })

  lightGalleryInstance.value.openGallery(startIndex)
}

onUnmounted(() => {
  if (lightGalleryInstance.value) {
    lightGalleryInstance.value.destroy()
    lightGalleryInstance.value = null
  }
})

defineExpose({
  openLightGallery,
})
</script>

<template>
  <div ref="lightGalleryContainer" />
</template>

<style>
/* LightGallery CSS will be loaded dynamically when needed */
@import 'lightgallery/css/lightgallery.css';
@import 'lightgallery/css/lg-thumbnail.css';
@import 'lightgallery/css/lg-zoom.css';
@import 'lightgallery/css/lg-share.css';
@import 'lightgallery/css/lg-transitions.css';

.lg-backdrop {
  background-color: color-mix(in oklab, var(--clr-black) 85%, transparent);
  backdrop-filter: blur(2.4px);
}

.lg-outer .lg-thumb-item {
  border-radius: 4px;
  border: 2px solid var(--clr-white);
  transition: border-color 0.25s ease;
}
.lg-outer .lg-thumb-item.active,
.lg-outer .lg-thumb-item:hover {
  border-color: var(--clr-active-border);
  outline: 1px solid var(--clr-active-border);
}
</style>
