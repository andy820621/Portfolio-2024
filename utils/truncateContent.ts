import type { MarkdownNode, MarkdownRoot, ParsedContent } from '@nuxt/content'

type ProcessNode = MarkdownRoot | MarkdownNode | string

// 用於截斷 Markdown 內容
export function truncateContent(content: ParsedContent, maxChars: number): { content: ParsedContent, isTruncated: boolean } {
  let charCount = 0 // 已處理的字符數
  let shouldTruncate = false

  // 遞迴處理 Markdown 內容的每個節點
  function processNode(node: ProcessNode | ProcessNode[] | null): ProcessNode | ProcessNode[] | null {
    if (shouldTruncate)
      return null

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

    if (Array.isArray(node)) {
      return node.map(processNode).filter(n => n !== null) as ProcessNode[]
    }

    if (typeof node === 'object' && node !== null) {
      const result: any = {}
      for (const [key, value] of Object.entries(node)) {
        const processed = processNode(value)
        if (processed !== null) {
          result[key] = processed
        }
      }
      return Object.keys(result).length > 0 ? result : null
    }

    return node
  }

  const truncatedBody = processNode(content.body) as MarkdownRoot

  return {
    content: {
      ...content,
      body: truncatedBody,
    },
    isTruncated: shouldTruncate,
  }
}
