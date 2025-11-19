<script setup lang='ts'>
import { useTheme } from '~/composables/useTheme'

const { isDark, isTransitioning, toggleDark } = useTheme()
const { locale } = useI18n()

const buttonTitle = computed(() => {
  return locale.value === 'en'
    ? `Enable ${isDark.value ? 'Light' : 'Dark'} Mode`
    : `切換至${isDark.value ? '亮色' : '暗色'}模式`
})
</script>

<template>
  <ClientOnly>
    <button
      type="button"
      class="group inline-flex select-none hover:text-gray-700 dark:hover:text-gray-200"
      :class="{ 'cursor-not-allowed opacity-80': isTransitioning }"
      :title="buttonTitle"
      aria-label="Toggle Color Scheme"
      @click="toggleDark"
    >
      <MyTooltip :text="buttonTitle">
        <span class="icon-container">
          <!-- 暗色模式圖標 -->
          <template v-if="isDark">
            <Icon
              name="i-line-md-moon"
              class="icon icon-static"
              :class="[{ 'icon-hide': isTransitioning }]"
            />
            <Icon
              name="i-line-md-moon-twotone"
              class="icon icon-animated"
              :class="[{ 'icon-show': isTransitioning }]"
            />
          </template>
          <!-- 亮色模式圖標 -->
          <template v-else>
            <Icon
              name="i-line-md-sunny-outline"
              class="icon icon-static"
              :class="[{ 'icon-hide': isTransitioning }]"
            />
            <Icon
              name="i-line-md-sunny-outline-twotone-loop"
              class="icon icon-animated"
              :class="[{ 'icon-show': isTransitioning }]"
            />
          </template>
        </span>
      </MyTooltip>
    </button>
    <template #fallback>
      <div h="[1.4em]" w="[1.4em]" inline-flex items-center justify-center>
        <Icon name="i-line-md-moon" class="icon" />
      </div>
    </template>
  </ClientOnly>
</template>

<style scoped>
.icon-container {
  position: relative;
  width: 1.4em;
  height: 1.4em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 1.4em;
  height: 1.4em;
  color: currentColor;
  will-change: opacity;
  transition: opacity 0.4s ease;
}

.icon-animated {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
}

.icon-static {
  opacity: 1;
}

/* 動畫狀態 */
.icon-hide {
  opacity: 0;
}

.icon-show {
  opacity: 1;
}

/* Hover 效果 */
.group:hover .icon-static:not(.icon-hide) {
  opacity: 0.5;
}

.group:hover .icon-animated:not(.icon-show) {
  opacity: 0.5;
}
</style>
