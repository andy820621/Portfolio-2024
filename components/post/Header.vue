<script setup lang="ts">
interface Props {
  title?: string
  image?: string
  ogImage?: string
  alt?: string
  description?: string
  date?: string
  tags?: Array<string>
  wordCount?: number
  readingTime?: ComputedRef<string> | string
}

const {
  title,
  image = '/not-found.jpg',
  alt = 'no-img',
} = defineProps<Props>()
</script>

<template>
  <header>
    <h1 class="text-xl font-bold lg:text-4xl md:text-3xl dark:text-zinc-300">
      {{ title || $t('no article found') }}
    </h1>
    <NuxtImg
      :src="image || ''"
      :alt="alt || ''"
      width="600"
      class="m-auto h-32 h-full max-h-[24vh] w-full content-center rounded-lg object-cover shadow-lg md:h-72"
      placeholder
    />
    <p v-if="description" class="mx-auto max-w-xl text-xs text-zinc-600 my-2! sm:text-sm dark:text-zinc-400">
      {{ description }}
    </p>
    <div v-if="date" class="mb-4 w-full flex md:text-base md:mb-[4rem] md:mt-3 sm:text-xs">
      <div class="w-full content-center gap-8 text-right text-black md:flex md:items-start md:justify-between sm:text-sm dark:text-zinc-300">
        <div class="flex justify-between md:flex-col md:justify-initial">
          <div class="flex flex-wrap items-center gap-1 font-semibold">
            <Icon name="ri:calendar-line" />
            <p class="m-0!">
              {{ useFormatDate(date, false) || '' }}
            </p>
          </div>

          <div v-if="wordCount" class="mr-1 flex flex-wrap items-center gap-1">
            <Icon name="ph:read-cv-logo" />
            <p class="m-0!">
              {{ wordCount }} words
            </p>
            <p v-if="readingTime" class="m-0!">
              ({{ readingTime }})
            </p>
          </div>
        </div>

        <div class="my-2 flex gap-1 md:my-0 md:max-w-[70%]">
          <Icon class="mt-[0.45rem] flex-shrink-0" name="ri:price-tag-3-line" />
          <div class="flex flex-wrap gap-1">
            <template v-for="tag in tags" :key="tag">
              <span class="rounded bg-primary px-[8px] py-[2.4px] text-gray-700 font-semibold dark:text-gray-100">{{ tag }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
