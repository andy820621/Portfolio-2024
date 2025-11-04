<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const { links, isSublistShown = true } = defineProps<{
  links: TocLink[]
  isSublistShown?: boolean
}>()

const route = useRoute()
const activeTocIds = ref(new Set<string>())
const lastVisibleHeading = ref('')

onMounted(() => {
  const observer = new IntersectionObserver(callback, {
    root: null,
    rootMargin: '0px 0px -80% 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1],
  })

  const elements = document.querySelectorAll('h2, h3')

  for (const element of elements)
    observer.observe(element)

  onBeforeUnmount(() => {
    for (const element of elements)
      observer.unobserve(element)
  })

  function callback(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      const id = entry.target.id

      if (entry.isIntersecting) {
        lastVisibleHeading.value = id
        activeTocIds.value.add(id)
      }
      else {
        activeTocIds.value.delete(id)
      }
    })
  }
})

// 檢查標題是否活躍
function isHeadingActive(id: string): boolean {
  return activeTocIds.value.has(id) || id === lastVisibleHeading.value
}
</script>

<template>
  <div class="hidden justify-self-end lg:col-span-3 lg:block">
    <div class="sticky top-10 overflow-y-auto">
      <div class="min-w-[200px] border rounded-md p-3 dark:border-gray-800 dark:bg-slate-900">
        <div mb-3 flex items-center border-b pb-2 space-x-2 dark:border-gray-800>
          <Icon name="i-ri-menu-2-fill" aria-hidden="true" />
          <h2
            id="toc-title"
            class="text-sm font-bold"
            role="heading"
            aria-level="2"
          >
            {{ $t('Table Of Content') }}
          </h2>
        </div>

        <!-- 主目錄項目清單 -->
        <nav aria-labelledby="toc-title" role="navigation">
          <ul role="list" class="mt-2">
            <li
              v-for="link in links"
              :key="link.id"
              role="listitem"
              class="mb-3"
              :aria-expanded="isSublistShown && link.children && link.children.length ? 'true' : 'false'"
            >
              <!-- 主項目標題 -->
              <NuxtLink
                :to="{ path: route.path, hash: `#${link.id}` }"
                class="block text-xs hover:underline"
                :class="{ 'text-active': isHeadingActive(link.id) }"
                :aria-label="`${link.text}的錨點連結`"
                :title="`${link.text}的錨點連結`"
                role="link"
                :aria-current="isHeadingActive(link.id) ? 'location' : undefined"
              >
                {{ link.text }}
              </NuxtLink>

              <!-- 子項目清單 (如果存在且 isSublistShown 為 true) -->
              <ul
                v-if="isSublistShown && link.children && link.children.length"
                class="mt-2 pl-3"
                role="list"
                :aria-label="`${link.text}的子標題`"
              >
                <li
                  v-for="sublink in link.children"
                  :key="sublink.id"
                  class="mb-2"
                  role="listitem"
                >
                  <NuxtLink
                    :to="{ path: route.path, hash: `#${sublink.id}` }"
                    class="block text-xs hover:underline"
                    :class="{ 'text-active': isHeadingActive(sublink.id) }"
                    :aria-label="`${sublink.text}'s anchor link`"
                    :title="`${sublink.text}'s anchor link`"
                    role="link"
                    :aria-current="isHeadingActive(sublink.id) ? 'location' : undefined"
                  >
                    {{ sublink.text }}
                  </NuxtLink>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<style>
.text-active {
  color: var(--clr-sub-green);
  @apply font-bold;
}
</style>
