<script lang="ts" setup>
interface Props {
  path?: string
  title?: string
  date?: string
  description?: string
  image?: string
  alt?: string
  ogImage?: string
  tags?: Array<string>
  published?: boolean
  wordCount?: number
  readingTime?: ComputedRef<string> | string
  imageClass?: string
}

withDefaults(defineProps<Props>(), {
  path: '/',
  title: 'no-title',
  date: 'no-date',
  description: 'no-description',
  image: '/blog-images/blog.jpg',
  alt: 'no-alt',
  ogImage: '/blog-images/blog.jpg',
  tags: () => [],
  published: true,
})
</script>

<template>
  <article class="group m-2 overflow-hidden border-base rounded-xl text-base shadow-base transition-shadow duration-300 hover:shadow-base-hover">
    <NuxtLink :to="path" class="grid grid-cols-1 gap-1 sm:grid-cols-10">
      <div class="sm:col-span-3">
        <NuxtImg
          class="h-full w-full rounded-t-2xl object-cover object-center shadow-lg transition-transform duration-300 group-hover:scale-[1.02] sm:rounded-l-2xl sm:rounded-t-none"
          :class="imageClass ? imageClass : undefined"
          width="300"
          :src="image"
          :alt="alt"
          placeholder
        />
      </div>

      <div class="p-5 sm:col-span-7">
        <h2 class="pb-1 text-xl text-base font-semibold transition-color duration-300 group-hover:text-primary">
          {{ title }}
        </h2>
        <p class="line-clamp-2 text-ellipsis dark:text-slate-400">
          {{ description }}
        </p>

        <div class="grid mb-1 mt-2 gap-1 text-sm text-black dark:text-zinc-300">
          <div class="flex justify-between gap-8 md:justify-initial">
            <div class="flex flex-wrap items-center gap-1">
              <Icon name="ri:calendar-line" />
              <p> {{ useFormatDate(date, false) || '' }}</p>
            </div>

            <div v-if="wordCount" class="flex flex-wrap items-center gap-1">
              <!-- <Icon name="ph:read-cv-logo" /> -->
              <Icon name="ri:time-line" />
              <p>{{ wordCount }} {{ $t('words') }} </p>
              <p v-if="readingTime">
                ({{ readingTime }})
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-1">
            <Icon name="ri:price-tag-3-line" />
            <p v-for="tag in tags" :key="tag" class="rounded bg-primary px-[8px] py-[2.4px] text-base">
              {{ tag }}
            </p>
          </div>
        </div>
        <div
          class="custom-btn-underline w-fit flex items-center pt-2 text-sub transition-all duration-300 underline-base group-hover:underline-base-hover"
        >
          <p>{{ $t('read more') }}</p>
          <Icon name="ri:arrow-right-line" />
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
