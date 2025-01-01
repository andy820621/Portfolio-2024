import { seoData } from '~/data'

export function useContentSEO(data: ComputedRef<any>) {
  useSeoMeta({
    title: data.value.title || '',
    description: data.value.description || '',
    ogTitle: data.value.title || '',
    ogDescription: data.value.description || '',
  })

  defineOgImage({
    url: seoData.mySite,
    props: {
      title: data.value.title || '',
      description: data.value.description || '',
      image: data.value.ogImage || data.value.image,
    },
  })

  useHead({
    link: [
      {
        rel: 'canonical',
        href: `${seoData.mySite}${useRoute().path}`,
      },
      {
        rel: 'alternate',
        hreflang: 'en-US',
        href: `${seoData.mySite}/en${useRoute().path}`,
      },
      {
        rel: 'alternate',
        hreflang: 'zh-TW',
        href: `${seoData.mySite}/zh${useRoute().path}`,
      },
    ],
  })
}
