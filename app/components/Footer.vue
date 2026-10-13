<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <div class="slide-enter prose m-auto mb-8 mt-0 flex animate-delay-1200!">
    <span class="text-sm op90"><NuxtLink :to="localePath('/license')" :aria-label="$t('license')" style="color:inherit">CC BY-NC-SA 4.0</NuxtLink> 2024-PRESENT © BarZ Hsieh</span>
    <div class="flex-auto" />
  </div>
</template>
