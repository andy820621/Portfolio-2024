export function useTheme() {
  const isDark = useDark()
  const isTransitioning = ref(false)

  async function toggleDark(event: MouseEvent) {
    // 如果正在過渡中，不做任何操作
    if (isTransitioning.value)
      return null

    isTransitioning.value = true

    try {
      // 檢查瀏覽器支持
      const isAppearanceTransition = 'startViewTransition' in document
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (!isAppearanceTransition) {
        isDark.value = !isDark.value // 不支持過渡時直接切換
        return null
      }

      // 計算動畫參數
      const x = event?.clientX ?? window.innerWidth / 2
      const y = event?.clientY ?? window.innerHeight / 2
      const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y),
      )

      // 創建過渡效果
      const transition = document.startViewTransition!(async () => {
        isDark.value = !isDark.value
        await nextTick()
      })

      // 設置過渡動畫
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: isDark.value
              ? [...clipPath].reverse()
              : clipPath,
          },
          {
            duration: 400,
            easing: 'ease-out',
            pseudoElement: isDark.value
              ? '::view-transition-old(root)'
              : '::view-transition-new(root)',
          },
        )
      })

      // 等待動畫完成
      await transition.finished

      return transition
    }
    catch (error) {
      console.error('Theme transition failed:', error)
      return null
    }
    finally {
      setTimeout(() => {
        isTransitioning.value = false
      }, 0) // 小延遲確保所有視覺效果完成
    }
  }

  return {
    isDark,
    isTransitioning,
    toggleDark,
  }
}
