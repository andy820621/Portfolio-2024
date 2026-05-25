<script setup lang="ts">
import type { RelatedLinkResolved } from '~~/types/main'

const { links } = defineProps<{
  links: RelatedLinkResolved[]
}>()

const { t } = useI18n()
const { trackOutboundClick } = useAnalyticsOutboundClick()

const activeMobileNoteHref = ref<string | null>(null)
const noteTriggerClass = 'text-sub/45 hover:text-primary focus-visible:text-primary -my-2 -mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/35'

function resolveDestinationType(destinationUrl: URL) {
  const hostname = destinationUrl.hostname.toLowerCase()

  if (hostname === 'github.com' || hostname.endsWith('.github.com'))
    return 'github' as const

  if (hostname === 'npmjs.com' || hostname.endsWith('.npmjs.com'))
    return 'npm' as const

  return 'tool' as const
}

function handleRelatedLinkClick(href: string) {
  try {
    const destinationUrl = new URL(href)

    trackOutboundClick({
      destinationType: resolveDestinationType(destinationUrl),
      destinationUrl: destinationUrl.href,
      linkGroup: 'related_links',
      sourceComponent: 'post_related_links',
    })
  }
  catch {
    // Ignore malformed content and keep navigation behavior intact.
  }
}

function getNoteId(href: string) {
  return `related-link-note-${href.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

function isMobileNoteOpen(href: string) {
  return activeMobileNoteHref.value === href
}

function toggleMobileNote(href: string) {
  activeMobileNoteHref.value = isMobileNoteOpen(href) ? null : href
}

function getNoteTriggerLabel(title: string) {
  return `${t('relatedLinkNote')}: ${title}`
}
</script>

<template>
  <PostRelatedSection v-if="links.length" :label="t('relatedLinks')">
    <li v-for="link in links" :key="link.href" class="list-none">
      <div class="inline-flex items-center gap-1">
        <a
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-2 text-sm text-sub transition-colors duration-200 focus-visible:text-primary hover:text-primary md:text-base"
          @click="handleRelatedLinkClick(link.href)"
        >
          <span class="text-sub/40 inline-block shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">↗</span>
          <span class="min-w-0">{{ link.title }}</span>
        </a>

        <div v-if="link.note" class="shrink-0">
          <div class="hidden md:block">
            <MyTooltip side="top" align="start">
              <template #default>
                <button
                  type="button"
                  :class="noteTriggerClass"
                  :aria-label="getNoteTriggerLabel(link.title)"
                >
                  <Icon name="ri:information-line" size="16" aria-hidden="true" />
                </button>
              </template>

              <template #content>
                <p class="max-w-[18rem] whitespace-normal text-[0.8125rem] font-medium leading-relaxed">
                  {{ link.note }}
                </p>
              </template>
            </MyTooltip>
          </div>

          <button
            type="button"
            class="md:hidden"
            :class="noteTriggerClass"
            :aria-controls="getNoteId(link.href)"
            :aria-expanded="isMobileNoteOpen(link.href)"
            :aria-label="getNoteTriggerLabel(link.title)"
            @click="toggleMobileNote(link.href)"
          >
            <Icon name="ri:information-line" size="16" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        v-if="link.note && isMobileNoteOpen(link.href)"
        :id="getNoteId(link.href)"
        class="md:hidden"
      >
        <p class="mt-1 border border-base/15 rounded-md bg-base/95 px-3 py-2 text-[0.8125rem] text-sub font-medium leading-relaxed shadow-base">
          {{ link.note }}
        </p>
      </div>
    </li>
  </PostRelatedSection>
</template>
