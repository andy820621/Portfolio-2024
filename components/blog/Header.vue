<script setup lang="ts">
interface Props {
  title: string
  image: string
  alt: string
  description: string
  date: string
  tags: Array<string>
  wordCount?: number
  readingTime?: ComputedRef<string> | string
}

withDefaults(defineProps<Props>(), {
  title: 'no-title',
  image: '#',
  alt: 'no-img',
  description: 'no description',
  date: 'no-date',
  tags: () => ([]),
})
</script>

<template>
  <header>
    <h1 class="text-xl dark:text-zinc-300 md:text-3xl lg:text-4xl font-bold">
      {{ title || '' }}
    </h1>
    <NuxtImg
      :src="image || ''"
      :alt="alt || ''"
      width="600"
      class="m-auto rounded-lg shadow-lg h-32 md:h-72 w-full h-full max-h-[24vh] content-center object-cover"
    />
    <p class="text-xs sm:text-sm my-2! max-w-xl mx-auto text-zinc-600 dark:text-zinc-400">
      {{ description }}
    </p>
    <div class="flex w-full sm:text-xs md:text-base mb-4 md:mt-3 md:mb-[4rem]">
      <div class="w-full text-right md:flex md:justify-between md:items-start text-black dark:text-zinc-300 content-center gap-8 sm:text-sm">
        <div class="flex justify-between md:flex-col md:justify-initial">
          <div class="flex items-center font-semibold gap-1 flex-wrap">
            <Icon name="ri:calendar-line" />
            <p class="m-0!">
              {{ useFormatDate(date, false) || '' }}
            </p>
          </div>

          <div v-if="wordCount" class="flex items-center gap-1 flex-wrap mr-1">
            <Icon name="ph:read-cv-logo" />
            <p class="m-0!">
              {{ wordCount }} words
            </p>
            <p v-if="readingTime" class="m-0!">
              ({{ readingTime }})
            </p>
          </div>
        </div>

        <div class="flex gap-1 my-2 md:my-0 md:max-w-[70%]">
          <Icon class="flex-shrink-0 mt-[0.45rem]" name="ri:price-tag-3-line" />
          <div class="flex gap-1 flex-wrap">
            <template v-for="tag in tags" :key="tag">
              <span class="px-[8px] py-[2.4px] rounded bg-primary text-gray-700 dark:text-gray-100 font-semibold">{{ tag }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
