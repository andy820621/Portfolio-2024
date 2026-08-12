<script setup lang="ts">
interface ProjectLink {
  label: string
  href: string
  icon?: string
}

const { links } = defineProps<{
  links: ProjectLink[]
}>()

const { trackOutboundClick } = useAnalyticsOutboundClick()

function handleLinkClick(href: string) {
  try {
    const destinationUrl = new URL(href)

    trackOutboundClick({
      destinationType: resolveOutboundDestinationType(destinationUrl),
      destinationUrl: destinationUrl.href,
      linkGroup: 'project_links',
      sourceComponent: 'project_links',
    })
  }
  catch {
    // Keep navigation intact if a caller bypasses content validation.
  }
}
</script>

<template>
  <nav v-if="links.length" class="not-prose project-links" aria-label="Project links">
    <a
      v-for="link in links"
      :key="`${link.href}:${link.label}`"
      :href="link.href"
      target="_blank"
      rel="noopener noreferrer"
      class="project-link"
      @click="handleLinkClick(link.href)"
    >
      <Icon v-if="link.icon" :name="link.icon" aria-hidden="true" />
      <span>{{ link.label }}</span>
    </a>
  </nav>
</template>

<style scoped>
.project-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  margin-block: 1.25rem 2rem;
}

.project-link {
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--clr-border);
  border-radius: 0.75rem;
  background: color-mix(in oklab, var(--clr-surface-1) 72%, transparent);
  color: var(--clr-text);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    transform 160ms ease;
}

.project-link:hover {
  border-color: color-mix(in oklab, var(--clr-primary-green) 45%, transparent);
  background: var(--clr-bg-accent);
  transform: translateY(-1px);
}

.project-link:focus-visible {
  outline: 2px solid var(--clr-primary-green);
  outline-offset: 3px;
}
</style>
