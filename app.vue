<script setup lang="ts">
import './assets//variable.css'
import '@unocss/reset/tailwind.css'
import './assets//main.css'
import './assets//prose.css'
import './assets//markdown.css'
</script>

<template>
  <NuxtLoadingIndicator :throttle="0" />

  <!-- // TODO: Check what i can do more with this. -->
  <NuxtRouteAnnouncer />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(0.24rem) grayscale(0.8);
}

.layout-enter-active,
.layout-leave-active {
  transition: all 0.4s;
}
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
  filter: blur(0.24rem) grayscale(0.8);
}
</style>
