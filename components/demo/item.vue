<script setup lang="ts">
const { content, baseName, thumbnailType } = defineProps<{
  content: any
  baseName: string
  thumbnailType: string
}>()

const updateDate = computed(() => content.updatedAt ? useFormatDate(content.updatedAt, false) : '')

const linkConfig = {
  link: { name: 'Demo', icon: 'mdi:link-variant' },
  github: { name: 'GitHub', icon: 'mdi:github' },
  codepen: { name: 'CodePen', icon: 'ri:codepen-fill' },
}

const contentLinks = computed(() =>
  Object.entries(linkConfig)
    .filter(([key]) => content[key])
    .map(([key, { name, icon }]) => ({
      href: content[key],
      name,
      icon,
    })),
)
</script>

<template>
  <article
    class="group"
    block of-hidden bg-base relative
    border="~ base rounded-lg"
    transition="all duration-500"
    hover="shadow-xl z-10 scale-102"
  >
    <div class="imageBox relative" role="img" :aria-label="content.title || baseName">
      <NuxtImg
        :src="`/demos/thumbnail/${baseName}.${thumbnailType}`"
        :alt="content.title || baseName"
        w-full border="b base"
        placeholder
      />
      <div class="overlay absolute inset-0 z-2 flex flex-col justify-center items-center p-6 rounded-lg" aria-hidden="true">
        <h2 class="article-title text-white mb-8 text-xl font-semibold text-center">
          {{ content.title || baseName }}
        </h2>
        <nav v-if="contentLinks.length" class="links flex flex-col gap-3" aria-label="Project links">
          <NuxtLink
            v-for="{ href, icon, name } in contentLinks"
            :key="href"
            :to="href"
            external
            text-white transition="all duration-500"
            hover="text-[var(--clr-primary-green)] scale-110 duration-500"
            flex="~ items-center"
            :aria-label="`Visit ${name} for ${content.title || baseName}`"
          >
            <div w-6 h-6 flex="~ items-center justify-center" aria-hidden="true">
              <Icon :name="icon" />
            </div>
            <span text-lg>{{ name }}</span>
          </NuxtLink>
        </nav>
      </div>
    </div>

    <div class="prose prose-sm p-4 m-0 pb-3">
      <ContentRenderer :value="content" />

      <div class="flex items-center justify-end text-sm pt-1 opacity-70">
        <div v-if="updateDate" class="flex items-center gap-1 mr-auto">
          <Icon name="mdi:update" />
          <time :datetime="content.updatedAt">
            {{ updateDate }}
          </time>
        </div>
        <div v-if="content.tags && content.tags.length" class="flex items-center gap-1">
          <Icon name="mdi:tag-multiple" />
          <span>{{ content.tags.join(', ') }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.imageBox {
  @apply overflow-hidden;
}

.overlay {
  @apply transform scale-108 opacity-0 transition-all duration-500 backdrop-filter backdrop-blur-0;
}

.overlay::before {
  content: '';
  @apply absolute inset-0 bg-black bg-opacity-70 opacity-0 transition-all duration-500 rounded-inherit;
}

.imageBox:hover .overlay {
  @apply scale-96 opacity-100 backdrop-blur;
}

.imageBox:hover .overlay::before {
  @apply opacity-100;
}

.article-title,
.links {
  @apply transform translate-y-5 transition-all duration-500 opacity-0;
}

.imageBox:hover .article-title,
.imageBox:hover .links {
  @apply translate-y-0 opacity-100;
}

.article-title {
  @apply text-center mb-8;
}

.links {
  @apply gap-2;
}
</style>
