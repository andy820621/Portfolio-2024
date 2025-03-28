<script setup lang="ts">
const { t } = useI18n()

// eslint-disable-next-line no-console
console.log('now in [...slug].vue page.')

// SEO 配置
usePageSeo({
  title: '404 - Page Not Found',
  description: t('errorPage.description', '您訪問的頁面不存在'),
  noIndex: true,
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
