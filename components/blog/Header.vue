<script setup lang="ts">
interface Props {
  title: string
  image: string
  alt: string
  description: string
  date: string
  tags: Array<string>
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
    <p class="sm:text-xs sm:text-sm my-3 max-w-xl mx-auto text-zinc-600 dark:text-zinc-400">
      {{ description }}
    </p>
    <div class="flex w-full justify-end sm:text-xs md:text-base mt-2 mb-4">
      <div class="text-right md:flex text-black dark:text-zinc-300 content-center gap-8  sm:text-sm">
        <div class="flex justify-end items-center font-semibold gap-1 flex-wrap">
          <Icon name="ri:calendar-line" />
          <p class="m-0!">
            {{ useFormatDate(date, false) || '' }}
          </p>
        </div>
        <div class="flex items-center gap-1 flex-wrap my-2 md:my-5">
          <Icon name="ri:price-tag-3-line" />
          <template v-for="tag in tags" :key="tag">
            <span class="px-[8px] py-[2.4px] rounded bg-[var(--clr-bg-green)] text-gray-700 dark:text-gray-100 font-semibold">{{ tag }}</span>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
