<script setup lang="ts">
import { navbarData, seoData } from '~~/data'

const props = withDefaults(defineProps<{
  description?: string
  siteName?: string
  title?: string
}>(), {
  description: seoData.description,
  siteName: navbarData.homeTitle,
  title: navbarData.homeTitle,
})
const PROTOCOL_REGEX = /^https?:\/\//
const TRAILING_SLASH_REGEX = /\/$/

const displayTitle = computed(() =>
  props.title.length > 72 ? `${props.title.slice(0, 69)}...` : props.title,
)

const displayDescription = computed(() =>
  props.description.length > 170 ? `${props.description.slice(0, 167)}...` : props.description,
)

const siteDomain = computed(() =>
  seoData.mySite.replace(PROTOCOL_REGEX, '').replace(TRAILING_SLASH_REGEX, ''),
)
</script>

<template>
  <div class="relative h-full w-full overflow-hidden bg-[#091215] text-white">
    <div
      class="absolute inset-0"
      style="background:
        radial-gradient(circle at top left, rgba(110, 231, 183, 0.24), transparent 42%),
        radial-gradient(circle at bottom right, rgba(34, 211, 238, 0.18), transparent 36%),
        linear-gradient(135deg, #071013 0%, #0f1f23 48%, #081215 100%);"
    />
    <div class="absolute top-14 h-72 w-72 border border-white/10 rounded-full bg-[#6ee7b71a] blur-3xl -right-24" />

    <div class="relative h-full w-full flex flex-col justify-between px-20 py-16">
      <div class="flex items-center gap-8">
        <div class="relative h-22 w-22 flex shrink-0 items-center justify-center">
          <div class="absolute inset-0 border border-white/10 rounded-[28px] bg-white/6" />
          <div class="relative h-12 w-12 flex items-center justify-center border border-white/10 rounded-[18px] bg-white/8 p-2">
            <img src="/apple-touch-icon/apple-touch-icon.png" alt="" class="h-full w-full rounded-[12px] object-cover">
          </div>
        </div>

        <div class="flex flex-col justify-center gap-2 pt-1">
          <p class="m-0 text-[20px] text-[#8ce6c2] font-semibold tracking-[0.32em] uppercase">
            {{ siteName }}
          </p>
          <p class="m-0 text-[18px] text-white/60">
            {{ seoData.ogHeadline }}
          </p>
        </div>
      </div>

      <div class="w-full flex flex-col items-start gap-8">
        <h1 class="m-0 block w-full text-[76px] font-semibold leading-[1.02] tracking-[-0.04em]">
          {{ displayTitle }}
        </h1>
        <p class="m-0 block w-full text-[30px] text-white/74 leading-[1.34]">
          {{ displayDescription }}
        </p>
      </div>

      <div class="w-full flex items-center justify-between text-[22px] text-white/58">
        <span>{{ siteDomain }}</span>
        <span class="border border-white/10 rounded-full bg-white/6 px-6 py-3 text-[18px] text-white/68 tracking-[0.28em] uppercase">
          Open Graph
        </span>
      </div>
    </div>
  </div>
</template>
