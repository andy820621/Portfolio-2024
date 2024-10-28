import { seoData } from '~/data'

export function useContentSEO(data: ComputedRef<any>) {
  useHead({
    title: data.value.title || '',
    meta: [
      { name: 'description', content: data.value.description },
      // ... 其他 meta 標籤
    ],
    link: [
      {
        rel: 'canonical',
        href: `${seoData.mySite}/${useRoute().path}`,
      },
    ],
  })

  defineOgImageComponent('Test', {
    headline: 'Greetings 👋',
    title: data.value.title || '',
    description: data.value.description || '',
    link: data.value.ogImage,
  })
}
