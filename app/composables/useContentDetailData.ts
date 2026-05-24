import type { AsyncContentDataType, BasePostCollectionsKey } from '~~/types/main'

export type ContentDetailData = ReturnType<typeof useContentDetailData>

export function useContentDetailData(contentData: AsyncContentDataType, collection: BasePostCollectionsKey) {
  const mainData = computed(() => contentData.value?.content)

  const prevContent = computed(() => contentData.value?.surroundContent?.[0] ?? null)
  const nextContent = computed(() => contentData.value?.surroundContent?.[1] ?? null)

  return {
    mainData,
    prevContent,
    nextContent,
    collection,
  }
}
