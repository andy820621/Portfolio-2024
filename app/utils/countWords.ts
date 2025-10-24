import type { MinimarkNode, MinimarkTree } from '@nuxt/content'

// 擴展類型定義，包含 MarkdownRoot 類型
interface MarkdownRoot {
  type: string
  // children 在不同版本型別中可能不是必填，改為可選以避免型別不相容
  children: any[]
  props?: Record<string, any>
  toc?: any
  [key: string]: any
}

// 定義可能的內容節點類型
type ContentNode
  = | MinimarkTree
    | MinimarkNode
    | MinimarkNode[]
    | Record<string, unknown>
    | MarkdownRoot
    | string
    | null
    | undefined

/**
 * 計算內容中的單詞數量
 * @param content 內容節點或最小化樹
 * @returns 單詞數量
 */
export function countWords(content: ContentNode): number {
  // 處理 null 或 undefined
  if (content === null || content === undefined) {
    return 0
  }

  // 處理 MarkdownRoot 類型
  if (typeof content === 'object' && !Array.isArray(content) && content !== null
    && 'type' in content && 'children' in content) {
    // 處理 MarkdownRoot 的 children
    if (Array.isArray(content.children)) {
      return content.children.reduce((count, child) => {
        return count + countWords(child)
      }, 0)
    }
  }

  // 處理 MinimarkTree 類型
  if (typeof content === 'object' && !Array.isArray(content) && content !== null
    && 'type' in content && content.type === 'minimal' && 'value' in content) {
    // 安全地處理 value 屬性
    const value = content.value as ContentNode
    return countWords(value)
  }

  // 處理數組
  if (Array.isArray(content)) {
    // 如果是元素節點 [tag, props, ...children]
    if (content.length >= 2 && typeof content[0] === 'string') {
      // 忽略 style 標籤
      if (content[0] === 'style') {
        return 0
      }

      // 處理元素的子節點 (從索引 2 開始)
      return content.slice(2).reduce((count: number, child) => {
        return count + countWords(child)
      }, 0)
    }

    // 處理普通數組
    return content.reduce((count: number, child) => {
      return count + countWords(child)
    }, 0)
  }

  // 處理文本節點 (字符串)
  if (typeof content === 'string') {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  // 處理物件類型 (Record<string, unknown> 或其他物件)
  if (typeof content === 'object' && content !== null) {
    let count = 0

    // 處理 value 屬性
    if ('value' in content) {
      const value = content.value as ContentNode
      if (value !== undefined) {
        count += countWords(value)
      }
    }

    // 處理 children 屬性
    if ('children' in content) {
      const children = content.children as ContentNode
      if (children !== undefined) {
        count += countWords(children)
      }
    }

    // 處理 body 屬性
    if ('body' in content) {
      const body = content.body as ContentNode
      if (body !== undefined) {
        count += countWords(body)
      }
    }

    // 處理 text 屬性
    if ('text' in content) {
      const text = content.text as ContentNode
      if (text !== undefined) {
        count += countWords(text)
      }
    }

    // 安全地遍歷物件屬性
    try {
      // 使用 Object.entries 安全地遍歷物件
      for (const [key, value] of Object.entries(content)) {
        // 避免重複處理已處理的屬性
        if (!['value', 'children', 'type', 'body', 'text'].includes(key)) {
          count += countWords(value as ContentNode)
        }
      }
    }
    catch (error) {
      console.error('Error processing object properties:', error)
    }

    return count
  }

  // 其他情況返回 0
  return 0
}

/**
 * 計算 Nuxt Content 文檔中的單詞數量
 * @param doc Nuxt Content 文檔
 * @returns 單詞數量
 */
export function countDocumentWords(doc: any): number {
  // 檢查文檔是否有 body 屬性
  if (!doc || !doc.body) {
    return 0
  }

  return countWords(doc.body)
}
