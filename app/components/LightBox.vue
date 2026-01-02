<script setup lang="ts">
import type { LightGallery } from 'lightgallery/lightgallery'
import type { Swiper as SwiperClass, SwiperModule } from 'swiper/types'
import 'swiper/css'
import 'swiper/css/navigation'

export interface Photo {
  src: string
  size?: string
  title?: string
  description?: string
}

const {
  photos,
  mode = 'lg-tube',
  showTitle = true,
  showDescription = false,
} = defineProps<{
  photos: Photo[]
  mode?: 'lg-slide' | 'lg-fade' | 'lg-zoom-in' | 'lg-zoom-in-big' | 'lg-zoom-out' | 'lg-zoom-out-big' | 'lg-zoom-out-in' | 'lg-zoom-in-out' | 'lg-soft-zoom' | 'lg-scale-up' | 'lg-slide-circular' | 'lg-slide-circular-vertical' | 'lg-slide-vertical' | 'lg-slide-vertical-growth' | 'lg-slide-skew-only' | 'lg-slide-skew-only-rev' | 'lg-slide-skew-only-y' | 'lg-slide-skew-only-y-rev' | 'lg-slide-skew' | 'lg-slide-skew-rev' | 'lg-slide-skew-cross' | 'lg-slide-skew-cross-rev' | 'lg-slide-skew-ver' | 'lg-slide-skew-ver-rev' | 'lg-slide-skew-ver-cross' | 'lg-slide-skew-ver-cross-rev' | 'lg-lollipop' | 'lg-lollipop-rev' | 'lg-rotate' | 'lg-rotate-rev' | 'lg-tube' // 如果 lightgallery 之後有匯出的話可以直接用
  showTitle?: boolean
  showDescription?: boolean
}>()

// Lazy-load Swiper components
const Swiper = defineAsyncComponent(() =>
  import('swiper/vue').then(m => m.Swiper),
)
const SwiperSlide = defineAsyncComponent(() =>
  import('swiper/vue').then(m => m.SwiperSlide),
)

const swiper = shallowRef<typeof Swiper>()
const popup = shallowRef<LightGallery>()
const activeIndex = ref(0)
const lightBoxBtn = ref<HTMLButtonElement>()
const Navigation = shallowRef<SwiperModule | null>(null)
const isReady = ref(false)

const deBounceHandleWheel = useDebounceFn(handleWheel, 16)

onMounted(async () => {
  if (!photos.length)
    return

  // Dynamically import lightgallery and plugins only when needed
  const [
    { default: lightGallery },
    { default: lgThumbnail },
    { default: lgZoom },
    { default: lgShare },
    swiperModules,
  ] = await Promise.all([
    import('lightgallery'),
    import('lightgallery/plugins/thumbnail'),
    import('lightgallery/plugins/zoom'),
    import('lightgallery/plugins/share'),
    import('swiper/modules'),
  ])

  Navigation.value = swiperModules.Navigation
  isReady.value = true

  const plugins = [
    lgThumbnail,
    lgZoom,
    lgShare,
  ]

  const dynamicEl = photos.map(
    (sliderImg) => {
      return {
        src: sliderImg.src,
        thumb: sliderImg.src,
        subHtml: `
          <h4>${sliderImg.title}</h4>
          <p>${sliderImg.description}</p>
        `,
      }
    },
  )

  if (lightBoxBtn.value) {
    popup.value = lightGallery(lightBoxBtn.value, {
      mode,
      dynamic: true,
      dynamicEl,
      plugins,
    })

    if (popup.value) {
      watch(() => popup.value!.lgOpened, (newVal) => {
        if (newVal) {
          document.addEventListener('wheel', deBounceHandleWheel, { passive: false })
        }
        else {
          document.removeEventListener('wheel', deBounceHandleWheel)
        }
      })
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('wheel', deBounceHandleWheel)
})

function handleWheel(e: WheelEvent) {
  if (!popup.value)
    return

  const lg = popup.value as LightGallery
  if (!lg.lgOpened)
    return

  const plugins = lg.plugins
  const zoomInstance = plugins.find(plugin =>
    plugin.scale !== undefined
    && typeof plugin.zoomImage === 'function',
  )
  if (!zoomInstance)
    return

  e.preventDefault()

  const currentScale = zoomInstance.scale || 1
  const scaleStep = 0.1

  if (e.deltaY < 0) {
    const newScale = currentScale + scaleStep
    zoomInstance.zoomImage(newScale, scaleStep, true, false)
  }
  else {
    const newScale = Math.max(1, currentScale - scaleStep)
    zoomInstance.zoomImage(newScale, -scaleStep, true, false)
  }
}

function openGallery(index: number) {
  popup.value?.openGallery(index)
}

function onSlideChange(_swiper: SwiperClass) {
  activeIndex.value = _swiper.activeIndex
}
</script>

<template>
  <div v-if="photos && photos.length" class="photo-gallery">
    <button
      ref="lightBoxBtn"
      type="button"
      title="Open Light Gallery"
      aria-label="Open Light Gallery"
      class="rounded-bl-[5px] rounded-tr-[10px]"

      absolute right-0 z-100 h-8 w-8 bg-hex-8883 transition duration-300 print:hidden hover-bg-hex-888381 hover:op100
      @click="openGallery(activeIndex)"
    >
      <span i-iconoir:expand />
    </button>

    <ClientOnly>
      <Swiper
        v-if="isReady && Navigation"
        ref="swiper"
        :modules="[Navigation]"
        :slides-per-view="1"
        navigation
        normalize-slide-index
        class="custom-swiper"
        @slide-change="onSlideChange"
      >
        <SwiperSlide
          v-for="(photo, index) in photos"
          :key="index"
          @click="openGallery(index)"
        >
          <NuxtImg class="photo" :src="photo.src" :alt="photo.description" placeholder />

          <div v-if="showTitle && photo.title" class="photo-title">
            <div class="title">
              {{ photo.title }}
            </div>
            <div v-if="showDescription" class="description">
              <span>{{ photo.description }}</span>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </ClientOnly>
  </div>
</template>

<style>
@import 'lightgallery/css/lightgallery.css';
@import 'lightgallery/css/lg-thumbnail.css';
@import 'lightgallery/css/lg-zoom.css';
@import 'lightgallery/css/lg-share.css';
@import 'lightgallery/css/lg-transitions.css';
/* @import 'lightgallery/css/lg-vedio.css'; */

.lg-backdrop {
  background-color: color-mix(in oklab, var(--clr-black) 81%, transparent);
  backdrop-filter: blur(8px);
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

<style scoped lang="scss">
.photo-gallery {
  width: 100%;
  max-width: 800px;
  margin: auto;
  position: relative;

  .photo {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    cursor: pointer;
  }

  :deep(.custom-swiper) {
    height: 450px;
    overflow: hidden;
    border-radius: 0.8rem;
    background-color: color-mix(in oklab, var(--clr-lightblack) 24%, transparent);

    .photo-title {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.2rem;
      padding-left: 0.8rem;
      background-color: color-mix(in oklab, var(--clr-lightblack) 45%, transparent);
      backdrop-filter: blur(8px);
      color: var(--clr-white);
      font-size: 0.8rem;
      text-align: left;
      transition:
        opacity 0.3s ease,
        height 0.3s ease,
        max-height 0.3s ease;
      // transition: all 0.3s ease;
      display: grid;
      .description {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.3s ease;
        span {
          font-size: 0.6rem;
          overflow: hidden;
        }
      }
      &:hover .description {
        grid-template-rows: 1fr;
      }
    }
  }

  :deep(.swiper-slide) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    --swiper-navigation-color: var(--swiper-navBtn);
    --swiper-navigation-size: 24px;
    --swiper-navigation-sides-offset: 8px;

    transition: all 0.3s ease;
    z-index: 2;

    // 指標控制
    pointer-events: initial;
    &.swiper-button-disabled,
    &.swiper-button-disabled {
      cursor: not-allowed;
    }
    &:not(.swiper-button-disabled):hover {
      --swiper-navigation-color: var(--swiper-navBtnHover);
      --swiper-navigation-sides-offset: 0.24rem;

      &::after {
        background-color: var(--swiper-navBtnHoverBg);
      }
    }

    &::after {
      transition: background-color 0.3s ease;
      padding: 0.24rem;
    }

    &.swiper-button-prev::after {
      padding-right: 0.4rem;
      border-radius: 0 0.24rem 0.24rem 0;
    }
    &.swiper-button-next::after {
      padding-left: 0.4rem;
      border-radius: 0.24rem 0 0 0.24rem;
    }
  }
}
</style>
