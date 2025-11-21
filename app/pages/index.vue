<script setup lang="ts">
import type { ContentCollectionsKey } from '~~/types/main'
import ProseTh from '~/components/content/ProseTh.vue'

const { t, locale, localeProperties } = useI18n()

// 使用 useAsyncData 獲取內容
const { data: content, error } = await useAsyncData(
  `content-${locale.value}`,
  async () => {
    try {
      const collection = `content_${locale.value}` as ContentCollectionsKey

      const result = await queryCollection(collection)
        .path('/about')
        .first()

      return result
    }
    catch (e) {
      console.error('Error fetching content:', e)
      return null
    }
  },
)

// 錯誤處理
watchEffect(() => {
  if (error.value) {
    console.error('Fetch error:', error.value)
  }
})

const pageTitle = computed(() => t('home'))

usePageSeo({
  title: pageTitle.value || 'home',
  description: content.value?.description || t('homePage.description') || '',
  keywords: [
    'BarZ',
    'Hsieh Yao Tsu',
    'Portfolio',
    'Frontend',
    'Developer',
    'Nuxt',
    'Vue',
    'About Me',
    'BarZ Hsieh',
    t('home'),
  ],
})

const { baseUrl } = useUrl()

const webpageId = `${baseUrl.value}#webpage`
const websiteId = `${baseUrl.value}#website`
const personId = `${baseUrl.value}#identity`

useSchemaOrg([
  defineWebPage({
    '@id': webpageId,
    '@type': 'ProfilePage',
    'description': t('homePage.description') || 'BarZ Hsieh\'s Portfolio',
    'name': 'BarZ Hsieh\'s Personal Portfolio Website',
    'url': baseUrl.value,
    // 'about':  NodeRelation<Organization>,
    'mainEntity': {
      '@id': personId,
    },
    'inLanguage': localeProperties.value.language,
    'isPartOf': {
      '@id': websiteId,
    },
  }),
])

// 動態載入背景元件
const backgroundImporters = import.meta.glob('~/components/Backgrounds/*.vue')
const randomBackgroundComponent = shallowRef<Component | null>(null)

onMounted(async () => {
  const keys = Object.keys(backgroundImporters)
  if (!keys.length)
    return
  const pickedIndex = Math.floor(Math.random() * keys.length)
  const picked = keys[pickedIndex]!
  try {
    const mod = await (backgroundImporters[picked]! as () => Promise<{ default: Component }>)()
    randomBackgroundComponent.value = mod.default
  }
  catch (e) {
    console.error('Failed to load background component:', e)
  }
})
</script>

<template>
  <div class="relative">
    <ClientOnly v-if="randomBackgroundComponent">
      <BackgroundsPortal>
        <component :is="randomBackgroundComponent" />
      </BackgroundsPortal>
    </ClientOnly>

    <div class="prose m-auto">
      <article>
        <ContentRenderer v-if="content" :value="content" :components="{ th: ProseTh }" />

        <div v-else-if="error" class="grid h-[80vh] w-[80vw] items-center justify-center">
          <h1>{{ t('error.occurred') }}</h1>
          <p>{{ error.message }}</p>
        </div>

        <div v-else class="grid h-[80vh] w-[80vw] items-center justify-center">
          <h1>{{ t('loading') }}</h1>
          <Icon name="mdi:loading" class="animate-spin" size="81" />
        </div>
      </article>
    </div>
  </div>
</template>
