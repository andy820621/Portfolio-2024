import type { FileBeforeParseHook } from '@nuxt/content'
import { defineNuxtModule } from '@nuxt/kit'
import { countWords } from '~/utils/countWords'

const MERMAID_CODE_BLOCK_REGEX = /```mermaid([\s\S]*?)```/gi

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function transformMermaidCodeBlocks(body: string) {
  return body.replace(MERMAID_CODE_BLOCK_REGEX, (_, rawCode = '') => {
    const code = rawCode.trim()
    if (!code)
      return _

    const escaped = escapeHtml(code)
    return `<Mermaid>
<pre><code>${escaped}
</code></pre>
</Mermaid>`
  })
}

export default defineNuxtModule({
  meta: {
    name: 'content-reading-time',
  },
  setup(_, nuxt) {
    nuxt.hook('content:file:beforeParse', (ctx: FileBeforeParseHook) => {
      const { file } = ctx

      if (!file.id?.endsWith('.md'))
        return

      if (!file.body.toLowerCase().includes('```mermaid'))
        return

      file.body = transformMermaidCodeBlocks(file.body)
    })

    // 註冊 content:file:afterParse hook
    nuxt.hook('content:file:afterParse', async (ctx: any) => {
      const { file, content } = ctx

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

      // console.warn({
      //   filePath: file.id,
      //   content,
      // })
    })
  },
})
