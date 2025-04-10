<script setup>
import { navbarData } from '~/data'

const localeHead = useLocaleHead({
  dir: true, // old: addDirAttributes
  key: 'id', // old: identifierAttribute
  seo: true, // old: addSeoAttributes
})

// const { t } = useI18n()

useHead({
  htmlAttrs: {
    lang: localeHead.value.htmlAttrs.lang,
    dir: localeHead.value.htmlAttrs.dir,
  },
  titleTemplate: (title) => {
  // 如果 title 是一個有效的翻譯鍵，則翻譯它，否則直接使用
    // const translatedTitle = title && typeof title === 'string' && t(title) !== title ? t(title) : title
    return `${title} - ${navbarData.homeTitle}`
  },
  link: [...(localeHead.value.link || [])],
  meta: [...(localeHead.value.meta || [])],
  // options: {
  //   addSeoAttributes: true,
  // },
  // script: [
  //   { src: 'https://platform.twitter.com/widgets.js', async: true, charset: 'utf-8' },
  // ],
})
</script>

<template>
  <div class="gd-container">
    <NavBar />

    <main class="px-7 py-10">
      <slot />
    </main>

    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.gd-container {
  // @apply overflow-x-hidden;
  display: grid;
  grid-template-rows: min-content auto;
  min-height: 100vh;
}
</style>
