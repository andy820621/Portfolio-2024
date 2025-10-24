<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="relative border border-base rounded-lg">
    <span class="absolute left-3 bg-base px-1 text-base -top-[.9rem]">
      {{ label }}
    </span>
    <div class="px-6 py-3">
      <!-- <ContentSlot :use="$slots.default" unwrap="span" /> -->
      <slot mdc-unwrap="span" />
    </div>
  </div>
</template>
