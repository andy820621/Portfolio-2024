import type { ParsedContentv2 } from '@nuxt/content'
import type { MDCNode, MDCRoot } from '@nuxtjs/mdc'

// 擴展處理節點類型，包含 minimal 格式
type ProcessNode = MDCRoot | MDCNode | string | { type: string, value: any, [key: string]: any }

// 定義內容類型的基本接口
interface ContentBase {
  body?: Record<string, unknown> | null
  [key: string]: any
}

/**
 * 截斷內容函數 - 泛型版本
 * @param content 任何包含 body 屬性的內容對象
 * @param maxChars 最大字符數
 * @returns 截斷後的內容和是否被截斷的標誌
 */
export function truncateContent<T extends ContentBase>(content: T, maxChars: number): { content: T, isTruncated: boolean } {
  let charCount = 0 // 已處理的字符數
  let shouldTruncate = false

  // 遞迴處理 Markdown 內容的每個節點
  function processNode(node: ProcessNode | ProcessNode[] | null): ProcessNode | ProcessNode[] | null {
    if (shouldTruncate)
      return null

    // 處理字符串節點
    if (typeof node === 'string') {
      if (charCount + node.length > maxChars) {
        // 如果加上當前節點會超過最大字符數，進行截斷
        const remainingChars = maxChars - charCount
        node = `${node.slice(0, remainingChars)}...`
        charCount = maxChars
        shouldTruncate = true
      }
      else {
        charCount += node.length
      }
      return node
    }

    // 處理數組節點
    if (Array.isArray(node)) {
      // 處理 [tag, props, ...children] 格式的數組 (minimal 格式的子節點)
      if (node.length >= 2 && typeof node[0] === 'string') {
        const tag = node[0]
        const props = node[1]

        // 處理子節點 (從索引 2 開始)
        const processedChildren = node.slice(2).map((child) => {
          if (shouldTruncate)
            return null
          return processNode(child)
        }).filter(n => n !== null)

        // 重建節點
        return [tag, props, ...processedChildren] as ProcessNode[]
      }

      // 處理普通數組
      const processedNodes = node
        .map((item) => {
          if (shouldTruncate)
            return null
          return processNode(item)
        })
        .filter((n): n is ProcessNode => n !== null)

      return processedNodes.length > 0
        ? processedNodes as ProcessNode[]
        : null
    }

    // 處理對象節點
    if (node && typeof node === 'object') {
      const processedNode: any = { ...node }

      // 處理 minimal 格式
      if (processedNode.type === 'minimal' && 'value' in processedNode) {
        const processedValue = processNode(processedNode.value)
        if (processedValue !== null) {
          processedNode.value = processedValue
        }
        else {
          return null
        }
        return processedNode
      }

      // 處理 children
      if ('children' in processedNode && processedNode.children) {
        const processedChildren = processNode(processedNode.children)
        processedNode.children = processedChildren
        if (processedChildren === null && processedNode.type !== 'root') {
          return null
        }
      }

      // 處理 value (文本節點)
      if ('value' in processedNode && typeof processedNode.value === 'string') {
        const processedValue = processNode(processedNode.value)
        if (processedValue !== null) {
          processedNode.value = processedValue
        }
        else {
          return null
        }
      }

      return processedNode
    }

    return node
  }

  // 如果內容沒有 body 屬性，直接返回原始內容
  if (!content.body) {
    return {
      content,
      isTruncated: false,
    }
  }

  // 複製 body 以避免修改原始對象
  const bodyClone = JSON.parse(JSON.stringify(content.body))

  // 處理 body
  const truncatedBody = processNode(bodyClone as ProcessNode)

  // 確保返回的 body 是對象或 null
  const finalBody = truncatedBody && typeof truncatedBody !== 'string' && !Array.isArray(truncatedBody)
    ? truncatedBody as Record<string, unknown>
    : null

  // 檢查是否截斷了內容
  const isTruncated = shouldTruncate

  return {
    content: {
      ...content,
      body: finalBody,
    } as T,
    isTruncated,
  }
}
