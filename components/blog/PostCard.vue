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
  readingTime?: string
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
  published: false,
})
</script>

<template>
  <article class="group border dark:border-gray-800  m-2 rounded-xl overflow-hidden shadow-[var(--box-shadow)] text-[var(--clr-text)]">
    <NuxtLink :to="path" class="grid grid-cols-1 sm:grid-cols-10 gap-1">
      <div class="sm:col-span-3">
        <NuxtImg
          class="h-full w-full object-cover object-center rounded-t-2xl sm:rounded-l-2xl sm:rounded-t-none shadow-lg group-hover:scale-[1.02] transition-all duration-500"
          width="300"
          :src="image"
          :alt="alt"
        />
      </div>
      <div class="sm:col-span-7 p-5">
        <h2 class="text-xl font-semibold text-black dark:text-zinc-300   pb-1 group-hover:text-[var(--clr-primary-green)]">
          {{ title }}
        </h2>
        <p class="text-ellipsis line-clamp-2 dark:text-slate-400">
          {{ description }}
        </p>
        <div class="text-black dark:text-zinc-300 text-sm mt-2 mb-1 grid gap-1">
          <div class="flex gap-8 justify-between md:justify-initial">
            <div class="flex items-center gap-1 flex-wrap">
              <Icon name="ri:calendar-line" />
              <p> {{ useFormatDate(date, false) || '' }}</p>
            </div>

            <div v-if="wordCount" class="flex items-center gap-1 flex-wrap">
              <Icon name="ph:read-cv-logo" />
              <p>{{ wordCount }} words</p>
              <p v-if="readingTime">
                ({{ readingTime }})
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1 flex-wrap">
            <Icon name="ri:price-tag-3-line" />
            <p v-for="tag in tags" :key="tag" class="px-[8px] py-[2.4px] rounded bg-[var(--clr-bg-green)] text-gray-700 dark:text-gray-100">
              {{ tag }}
            </p>
          </div>
        </div>
        <div class="flex group-hover:underline text-[var(--clr-sub-green)] items-center pt-2">
          <p>Read More</p>
          <Icon name="ri:arrow-right-line" />
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
