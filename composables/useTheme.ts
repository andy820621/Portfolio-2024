export function useTheme() {
  const isDark = useDark()

  function toggleDark(event: MouseEvent) {
    // 檢查瀏覽器是否支持 View Transitions API 且用戶沒有開啟減少動畫設置
    const isAppearanceTransition = document.startViewTransition
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!isAppearanceTransition) {
      isDark.value = !isDark.value // 如果不支持過渡效果,直接切換暗色模式
      return
    }

    // 計算動畫的起始點和結束半徑
    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )

    // 使用 View Transitions API 創建過渡效果
    const transition = document.startViewTransition!(async () => {
      isDark.value = !isDark.value
      await nextTick()
    })

    // 設置過渡動畫
    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`, // 起始圓形
        `circle(${endRadius}px at ${x}px ${y}px)`, // 結束圓形
      ]
      // 應用圓形遮罩動畫
      document.documentElement.animate(
        {
          clipPath: isDark.value
            ? [...clipPath].reverse() // 如果切換到暗色模式, 反轉動畫
            : clipPath,
        },
        {
          duration: 400,
          easing: 'ease-out',
          // 根據切換方向選擇不同的偽元素
          pseudoElement: isDark.value
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
  }

  return {
    isDark,
    toggleDark,
  }
}
