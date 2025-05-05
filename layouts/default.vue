<script setup>
import { navbarData } from '~/data'

const localeHead = useLocaleHead({
  dir: true, // old: addDirAttributes
  key: 'hid', // old: identifierAttribute
  seo: true, // old: addSeoAttributes
})

// const { t } = useI18n()

useHead({
  htmlAttrs: localeHead.value.htmlAttrs,
  // `%s` means The current page title., `%separator` defaults to a pipe character `|`
  titleTemplate: `%s %separator %siteName`,
  templateParams: {
    separator: '-',
    siteName: navbarData.homeTitle,
  },
  link: [...(localeHead.value.link || [])],
  meta: [...(localeHead.value.meta || [])],
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
