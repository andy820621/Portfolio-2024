import { defineNuxtModule } from '@nuxt/kit'
import { countWords } from '~/utils/countWords'

export default defineNuxtModule({
  meta: {
    name: 'content-reading-time',
  },
  setup(_, nuxt) {
    // 註冊 content:file:afterParse hook
    nuxt.hook('content:file:afterParse', async (ctx: any) => {
      const { file, content } = ctx

      console.warn({ file, content })

      // 只處理 markdown 文件
      if (file.extension !== '.md' || (!file.id.startsWith('posts') && !file.id.startsWith('projects')))
        return

      const wordCount = countWords(content.body)

      // 根據路徑判斷語言
      const isZh = content.path?.includes('/zh/')
      const wordsPerMinute = isZh ? 326 : 183
      const readingTime = Math.ceil(wordCount / wordsPerMinute)

      // 設定到 content 物件
      content.wordCount = wordCount
      content.readingTime = readingTime

      console.warn({
        filePath: file.id,
        content,
      })
    })
  },
})
