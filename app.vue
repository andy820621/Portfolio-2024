<script setup lang="ts">
import './assets//variable.css'
import '@unocss/reset/tailwind.css'
import './assets//main.css'
import './assets//markdown.css'
import './assets//prose.css'

const { locale } = useI18n()
</script>

<template>
  <NuxtLoadingIndicator :throttle="0" />

  <!-- // TODO: Check what i can do more with this. -->
  <NuxtRouteAnnouncer />

  <NuxtLayout :key="locale">
    <NuxtPage />
  </NuxtLayout>
</template>
