import type { MarkdownParsedContent, MarkdownRoot } from '@nuxt/content'

export function truncateContent(content: MarkdownParsedContent, maxChars: number): { truncated: MarkdownParsedContent, needsTruncation: boolean } {
  let charCount = 0
  let needsTruncation = false
  let shouldTruncate = false

  function processNode(node: any): any {
    if (shouldTruncate) {
      return null
    }

    if (typeof node === 'string') {
      if (charCount + node.length > maxChars) {
        const remainingChars = maxChars - charCount
        node = `${node.slice(0, remainingChars)}...`
        charCount = maxChars
        shouldTruncate = true
        needsTruncation = true
      }
      else {
        charCount += node.length
      }
      return node
    }

    if (Array.isArray(node)) {
      return node.map(processNode).filter(n => n !== null)
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
    truncated: {
      ...content,
      body: truncatedBody,
    },
    needsTruncation,
  }
}
