<script setup>
import { navbarData } from '~/data'

const localeHead = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true,
})

const { t } = useI18n()

useHead({
  htmlAttrs: {
    lang: localeHead.value.htmlAttrs.lang,
    dir: localeHead.value.htmlAttrs.dir,
  },
  titleTemplate: title => `${t(title) ?? title} - ${navbarData.homeTitle}`,
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
