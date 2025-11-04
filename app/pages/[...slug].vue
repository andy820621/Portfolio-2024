<script setup lang="ts">
const { t } = useI18n()

const route = useRoute()

// 若進入到（被 i18n 加上前綴的）Nuxt 內建錯誤路由，
// 直接導向非前綴版的 /__nuxt_error，避免被本頁再次攔截而造成遞迴。
if (route.path.includes('/__nuxt_error')) {
  const suffix = route.fullPath.split('/__nuxt_error')[1] || ''
  if (import.meta.server) {
    await navigateTo(`/__nuxt_error${suffix}`, { redirectCode: 307 })
  }
  else {
    await navigateTo(`/__nuxt_error${suffix}`, { external: true, replace: true })
  }
}
else {
  // 其餘未匹配到的路由，拋出 404 讓 app/error.vue 處理
  throw createError({
    statusCode: 404,
    statusMessage: t('errorPage.description', '您訪問的頁面不存在'),
    message: t('errorPage.description', '您訪問的頁面不存在'),
    fatal: true,
  })
}
</script>

<template>
  <div>
    This content will not be displayed. The error page (error.vue) will be shown instead.
  </div>
</template>
