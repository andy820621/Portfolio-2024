<script setup lang="ts">
defineProps<{
  links: any[]
  activeId: string
}>()

const route = useRoute()
</script>

<template>
  <div class="lg:col-span-3 hidden lg:block justify-self-end">
    <div class="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto">
      <div class="border dark:border-gray-800 p-3 rounded-md min-w-[200px] dark:bg-slate-900">
        <div flex items-center mb-3 border-b dark:border-gray-800 pb-2 space-x-2>
          <Icon name="i-ri-menu-2-fill" />
          <h1 class="text-sm font-bold">
            {{ $t('Table Of Content') }}
          </h1>
        </div>
        <NuxtLink
          v-for="link in links"
          :key="link.id"
          :to="{ path: route.path, hash: `#${link.id}` }"
          class="block text-xs mb-3 hover:underline"
          :class="{ 'text-active': activeId === link.id }"
        >
          {{ link.text }}
        </NuxtLink>
      </div>
    </div>
  </div>

  <!-- <div class="lg:col-span-3 sticky top-28 h-96 hidden lg:block justify-self-end">
    <div class="border dark:border-gray-800 p-3 rounded-md min-w-[200px] dark:bg-slate-900">
      <h1 class="text-sm font-bold mb-3 border-b dark:border-gray-800 pb-2">
        Table Of Content
      </h1>
      <NuxtLink
        v-for="link in links"
        :key="link.id"
        :to="{ path: route.path, hash: `#${link.id}` }"
        class="block text-xs mb-3 hover:underline"
        :class="{ 'text-active': activeId === link.id }"
      >
        {{ link.text }}
      </NuxtLink>
    </div>
  </div> -->
</template>

<style>
.text-active {
  color: var(--clr-sub-green);
  @apply font-bold;
}
</style>
