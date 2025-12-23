<script setup lang="ts">
const { customTitle } = defineProps<{
  customTitle?: string
}>()

const localePath = useLocalePath()
const { getBreadcrumbItems } = useBreadcrumb()

const breadcrumbs = computed(() => getBreadcrumbItems(customTitle))
</script>

<template>
  <nav
    v-if="breadcrumbs.length > 1"
    class="breadcrumb-nav not-prose mb-6"
    aria-label="Breadcrumb navigation"
  >
    <ol
      class="breadcrumb-list flex flex-wrap items-center gap-2 text-sm text-sub"
    >
      <li
        v-for="(item, index) in breadcrumbs"
        :key="item.position"
        class="breadcrumb-item flex items-center"
      >
        <!-- 分隔符號 -->
        <span
          v-if="index > 0"
          class="breadcrumb-separator mx-2 text-xs opacity-60"
          aria-hidden="true"
        >
          /
        </span>
        <!-- 導覽連結 -->
        <NuxtLink
          v-if="index < breadcrumbs.length - 1"
          :to="localePath(item.item)"
          class="breadcrumb-link transition-colors duration-200 hover:underline hover:text-[var(--clr-grey)]!"
          :aria-label="`Navigate to ${item.name || 'Untitled'}`"
        >
          {{ item.name || 'Untitled' }}
        </NuxtLink>
        <!-- 當前頁面（不可點擊） -->
        <span
          v-else
          class="breadcrumb-current text-base font-medium dark:text-[var(--clr-lightgrey)]!"
          aria-current="page"
        >
          {{ item.name || 'Untitled' }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb-nav {
  /* 重置所有可能的 prose 樣式 */
  ul,
  ol,
  li {
    margin: 0 !important;
    padding: 0 !important;
    list-style: none !important;
  }

  li::before,
  li::after {
    display: none !important;
    content: none !important;
  }

  ol::before,
  ol::after {
    display: none !important;
    content: none !important;
  }
}

.breadcrumb-link {
  color: var(--c-text-light, var(--clr-grey));
}

.breadcrumb-link:hover {
  color: var(--c-text, var(--clr-text));
}

.breadcrumb-current {
  color: var(--c-text, var(--clr-text));
}

@media (max-width: 640px) {
  .breadcrumb-list {
    font-size: 0.75rem;
  }

  .breadcrumb-separator {
    margin-left: 0.375rem;
    margin-right: 0.375rem;
  }
}
</style>
