<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content'

const props = defineProps<{
  type?: string
  extra?: Post[]
}>()

const { englishOnly } = useEnglishOnly()

// 定義 Post 類型
interface Post extends ParsedContent {
  title: string
  date: string
  lang?: string
  duration?: string
  recording?: boolean
  upcoming?: boolean
  redirect?: string
  place?: string
  type?: string
}

// 使用 queryContent 獲取文章列表
const { data: contentPosts } = await useAsyncData('posts', () => queryContent<Post>('posts')
  .where({ draft: { $ne: true } })
  .sort({ date: -1 })
  .find())

// 合併 contentPosts 和 extra posts，並進行排序和過濾
const posts = computed(() => {
  const allPosts = [...(contentPosts.value || []), ...(props.extra || [])]
    .filter(post => !props.type || (post.type || 'blog').split('+').includes(props.type))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(i => !englishOnly.value || i.lang !== 'zh')

  return allPosts
})

const getYear = (a: Date | string | number) => new Date(a).getFullYear()
const isFuture = (a?: Date | string | number) => a && new Date(a) > new Date()
const isSameYear = (a?: Date | string | number, b?: Date | string | number) => a && b && getYear(a) === getYear(b)

function isSameGroup(a: Post, b?: Post) {
  return (isFuture(a.date) === isFuture(b?.date)) && isSameYear(a.date, b?.date)
}

function getGroupName(p: Post) {
  if (isFuture(p.date))
    return 'Upcoming'
  return getYear(p.date)
}
</script>

<template>
  <ul>
    <template v-if="!posts.length">
      <div py2 op50>
        { nothing here yet }
      </div>
    </template>

    <template v-for="post, idx in posts" :key="post._path">
      <div
        v-if="!isSameGroup(post, posts[idx - 1])"
        select-none relative h20 pointer-events-none slide-enter
        :style="{
          '--enter-stage': idx - 2,
          '--enter-step': '60ms',
        }"
      >
        <span text-8em color-transparent absolute left--3rem top--2rem font-bold text-stroke-2 text-stroke-hex-aaa op10>{{ getGroupName(post) }}</span>
      </div>
      <div
        class="slide-enter"
        :style="{
          '--enter-stage': idx,
          '--enter-step': '60ms',
        }"
      >
        <NuxtLink
          :to="post.redirect || post._path"
          :external="post.redirect?.includes('://')"
          class="item block font-normal mb-6 mt-2 no-underline"
        >
          <li class="no-underline" flex="~ col md:row gap-2 md:items-center">
            <div class="title text-lg leading-1.2em" flex="~ gap-2 wrap">
              <span
                v-if="post.lang === 'zh'"
                align-middle flex-none
                class="text-xs bg-zinc:15 text-zinc5 rounded px-1 py-0.5 ml--12 mr2 my-auto hidden md:block"
              >中文</span>
              <span align-middle>{{ post.title }}</span>
              <span
                v-if="post.redirect"
                align-middle op50 flex-none text-xs ml--1.5
                i-carbon-arrow-up-right
                title="External"
              />
            </div>

            <div flex="~ gap-2 items-center">
              <span
                v-if="post.inperson"
                align-middle op50 flex-none
                i-ri:group-2-line
                title="In person"
              />
              <span
                v-if="post.recording || post.video"
                align-middle op50 flex-none
                i-ri:film-line
                title="Provided in video"
              />
              <span
                v-if="post.radio"
                align-middle op50 flex-none
                i-ri:radio-line
                title="Provided in radio"
              />

              <span text-sm op50 ws-nowrap>
                {{ useFormatDate(post.date, true) }}
              </span>
              <span v-if="post.duration" text-sm op40 ws-nowrap>· {{ post.duration }}</span>
              <span v-if="post.platform" text-sm op40 ws-nowrap>· {{ post.platform }}</span>
              <span v-if="post.place" text-sm op40 ws-nowrap md:hidden>· {{ post.place }}</span>
              <span
                v-if="post.lang === 'zh'"
                align-middle flex-none
                class="text-xs bg-zinc:15 text-zinc5 rounded px-1 py-0.5 my-auto md:hidden"
              >中文</span>
            </div>
          </li>
          <div v-if="post.place" op50 text-sm hidden mt--2 md:block>
            {{ post.place }}
          </div>
        </NuxtLink>
      </div>
    </template>
  </ul>
</template>
