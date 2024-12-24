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
      const processedNodes = node
        .map((item) => {
          if (shouldTruncate)
            return null
          return processNode(item)
        })
        .filter((n): n is ProcessNode => n !== null)

      // 使用類型断言確保返回正確的類型
      return processedNodes.length > 0
        ? processedNodes as ProcessNode[]
        : null
    }

    if (node && typeof node === 'object') {
      const processedNode: any = { ...node }

      // 處理 children
      if (processedNode.children) {
        const processedChildren = processNode(processedNode.children)
        processedNode.children = processedChildren as MarkdownNode[] | null
      }

      // 處理 value
      if (processedNode.type === 'text' && processedNode.value) {
        const processedValue = processNode(processedNode.value)
        if (processedValue !== null) {
          processedNode.value = processedValue as string
        }
        else {
          return null
        }
      }

      return processedNode
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
