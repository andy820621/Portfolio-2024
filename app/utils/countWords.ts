import type { MarkdownRoot, MinimarkNode } from '@nuxt/content'

type ContentInput = MarkdownRoot | MinimarkNode | MinimarkNode[] | null | undefined

const TOKEN_REGEX = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]|[\p{L}\p{N}]+/gu

function countTextTokens(text: string): number {
  const tokens = text.match(TOKEN_REGEX)
  if (!tokens)
    return 0

  return tokens.length
}

/**
 * 計算內容中的單詞數量
 * @param content Markdown 內容節點
 * @returns 單詞數量
 */
export function countWords(content: ContentInput): number {
  if (content === null || content === undefined)
    return 0

  // 處理 MarkdownRoot (包含 type 和 value 屬性)
  if (typeof content === 'object' && !Array.isArray(content) && 'value' in content && Array.isArray(content.value)) {
    return content.value.reduce((count, child) => count + countWords(child), 0)
  }

  // 處理 MinimarkElement [tag, props, ...children]
  if (Array.isArray(content)) {
    if (content.length >= 2 && typeof content[0] === 'string') {
      // 忽略 style 標籤內容
      if (content[0] === 'style')
        return 0
      // 處理子節點（從索引 2 開始）
      return content.slice(2).reduce((count, child) => count + countWords(child as MinimarkNode), 0)
    }
    // 處理普通陣列
    return content.reduce((count, child) => count + countWords(child as MinimarkNode), 0)
  }

  // 處理 MinimarkText (字串)
  if (typeof content === 'string')
    return countTextTokens(content)

  return 0
}

/**
 * 計算 Nuxt Content 文檔中的單詞數量
 * @param doc Nuxt Content 文檔物件
 * @param doc.body Markdown 內容的 body
 * @returns 單詞數量
 */
export function countDocumentWords(doc: { body?: MarkdownRoot | null }): number {
  return doc?.body ? countWords(doc.body) : 0
}
