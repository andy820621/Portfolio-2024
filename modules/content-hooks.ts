import type { MarkdownRoot } from '@nuxt/content'
import { defineNuxtModule } from '@nuxt/kit'
import { countWords } from '~/utils/countWords'

export default defineNuxtModule({
  meta: {
    name: 'content-reading-time',
  },
  setup(_, nuxt) {
    // @ts-expect-error `content:file:afterParse` hook is provided by @nuxt/content but not typed in NuxtHooks
    nuxt.hook('content:file:afterParse', async (ctx: { file: { id: string, extension: string }, content: Record<string, unknown> }) => {
      const { file, content } = ctx

      // 只處理 markdown 文件
      if (file.extension !== '.md' || (!file.id.startsWith('posts') && !file.id.startsWith('projects')))
        return

      const wordCount = countWords(content.body as MarkdownRoot)

      // 根據路徑判斷語言
      const isZh = (content.path as string | undefined)?.includes('/zh/')
      const wordsPerMinute = isZh ? 326 : 183
      const readingTime = Math.ceil(wordCount / wordsPerMinute)

      // 設定到 content 物件
      content.wordCount = wordCount
      content.readingTime = readingTime

      // console.warn({
      //   filePath: file.id,
      //   content,
      // })
    })
  },
})
