import { seoData } from '~/data'

export function useContentSEO(data: ComputedRef<any>) {
  useSeoMeta({
    title: data.value.title || '',
    description: data.value.description || '',
    ogTitle: data.value.title || '',
    ogDescription: data.value.description || '',
  })

  defineOgImage({
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
    ],
  })
}
