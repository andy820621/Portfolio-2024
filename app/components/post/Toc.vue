<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const { links, isSublistShown = true } = defineProps<{
  links: TocLink[]
  isSublistShown?: boolean
}>()

const route = useRoute()
const activeTocIds = ref(new Set<string>())
const lastVisibleHeading = ref('')

/**
 * 觸發區域設定：-80% 代表標題進入視窗上方 20% 區域時視為 active
 * 這是為了符合使用者的閱讀習慣（通常關注標題下方的內容）
 */
const TOC_ROOT_MARGIN = '0px 0px -80% 0px'

onMounted(() => {
  const elements = Array.from(document.querySelectorAll('h2, h3')) as HTMLElement[]

  useIntersectionObserver(
    elements,
    (entries) => {
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
    },
    {
      rootMargin: TOC_ROOT_MARGIN,
      threshold: [0, 0.25, 0.5, 0.75, 1],
    },
  )
})

// 檢查標題是否活躍
function isHeadingActive(id: string): boolean {
  return activeTocIds.value.has(id) || id === lastVisibleHeading.value
}
</script>

<template>
  <div class="hidden justify-self-end lg:col-span-3 lg:block">
    <div class="sticky top-10 overflow-y-auto">
      <div class="glass-effect rounded-xl px-4 py-3 shadow-sm">
        <div class="toc-header" mb-3 flex items-center border-b pb-2 space-x-2>
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
                class="toc-link block text-xs hover:underline"
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
                    class="toc-link block text-xs hover:underline"
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

<style lang="scss" scoped>
.glass-effect {
  /* 抽取 magic number */
  --toc-min-width: 200px;
  min-width: var(--toc-min-width);

  --border-width: 1px;
  --border-start: color-mix(in oklab, var(--clr-primary-green) 50%, transparent);
  --border-end: color-mix(in oklab, var(--clr-primary-green) 10%, transparent);
  --background-color: color-mix(in oklab, var(--clr-primary-green) 10%, transparent);

  position: relative;
  background-color: var(--background-color);
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  border: none;

  :global(.dark &) {
    --border-start: color-mix(in oklab, var(--clr-text) 24%, transparent);
    --border-end: color-mix(in oklab, var(--clr-text) 5%, transparent);
    --background-color: color-mix(in oklab, var(--clr-dark-green) 30%, transparent);
  }
}

.glass-effect::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: var(--border-width) solid transparent;
  background: linear-gradient(135deg, var(--border-start), var(--border-end)) border-box;
  -webkit-mask:
    linear-gradient(#fff 0 0) padding-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) padding-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 2;
}

.toc-header {
  border-color: var(--clr-border);
}

.toc-link {
  transition: color 0.15s ease;

  &:hover {
    color: var(--clr-text-accent);
  }
}

.text-active {
  color: var(--clr-sub-green);
  @apply font-bold;
}
</style>
