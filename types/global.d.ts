// 擴展 startViewTransition 不是每個瀏覽器都支持
interface Document {
  startViewTransition?: (callback: () => Promise<void> | void) => {
    ready: Promise<void>
  }
}
