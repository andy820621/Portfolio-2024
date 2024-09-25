<script setup lang="ts">
import './assets//variable.css'
import '@unocss/reset/tailwind.css'
import './assets//main.scss'
import './assets//markdown.css'
import './assets//prose.css'
</script>

<template>
  <NuxtLoadingIndicator :throttle="0" />

  <!-- // TODO: Check what i can do more with this. -->
  <NuxtRouteAnnouncer />

  <NuxtLayout>
    <NuxtPage :key="$i18n.locale" />
  </NuxtLayout>
</template>
