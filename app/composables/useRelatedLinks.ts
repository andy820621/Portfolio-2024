import type { MaybeRef } from 'vue'
import type { RelatedLinkInput, RelatedLinkResolved } from '~~/types/main'
import { computed, unref } from 'vue'

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function isExternalHref(href: string) {
  return /^[a-z][a-z\d+.-]*:/i.test(href)
}

export function normalizeRelatedLinks(value: unknown): RelatedLinkResolved[] {
  if (!Array.isArray(value))
    return []

  return value.flatMap((item) => {
    const title = normalizeText(item?.title)
    const href = normalizeText(item?.href)

    if (!title || !href)
      return []

    const note = normalizeText(item?.note)

    return [{
      title,
      href,
      note: note || undefined,
      isExternal: isExternalHref(href) && !href.startsWith('/'),
    }]
  })
}

export function useRelatedLinks(links: MaybeRef<RelatedLinkInput[] | null | undefined>) {
  const relatedLinks = computed(() => normalizeRelatedLinks(unref(links)))

  return { relatedLinks }
}
