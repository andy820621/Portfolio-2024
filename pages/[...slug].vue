<script setup lang="ts">
definePageMeta({
  documentDriven: {
    page: false, // Keep page fetching enabled
    surround: false, // Disable surround fetching
  },
})

useHead({
  title: '404',
  meta: [
    { name: 'description', content: 'Page not found' },
  ],
})

defineOgImageComponent('NuxtSeo', {
  headline: 'Wrong Path',
  title: '404',
  description: 'Page Not Found',
})

const localePath = useLocalePath()
</script>

<template>
  <div class="py-5">
    <div class="container max-w-xl mx-auto ">
      <Logo404 />

      <div grid justify-center>
        <NuxtLink
          :to="localePath('/')"
          class="inline-block px-6 py-3 text-lg font-semibold base-btn transition duration-300 ease-in-out hover:-translate-y-1
          shadow-base hover:shadow-base-hover"
        >
          {{ $t('backToHome') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
