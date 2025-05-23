<script setup lang="ts">
const { t } = useI18n()

const route = useRoute()
// eslint-disable-next-line no-console
console.log(`now in [...slug].vue page, path: ${route.path}, preparing to throw 404 error.`)

// throw 404 Error, this will be handled by error.vue
throw createError({
  statusCode: 404,
  statusMessage: t('errorPage.description', '您訪問的頁面不存在'),
  message: t('errorPage.description', '您訪問的頁面不存在'),
  fatal: true,
})
</script>

<template>
  <div>
    This content will not be displayed. The error page (error.vue) will be shown instead.
  </div>
</template>
