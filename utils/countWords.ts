import type { MarkdownNode, MarkdownRoot } from '@nuxt/content'

export function countWords(node: MarkdownRoot | MarkdownNode): number {
  // 去除 style 相關標籤
  if (node.type !== 'root' && 'tag' in node && node.tag === 'style')
    return 0

  // 如果有 children => 遞迴計算
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.reduce((count, child) => count + countWords(child), 0)
  }

  // 如果是 MarkdownNode 且有 value 屬性
  if (node.type === 'text' && typeof node.value === 'string') {
    return node.value.trim().split(/\s+/).length // 將文本分割成單詞並計算數量
  }

  return 0
}
