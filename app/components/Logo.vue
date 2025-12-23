<script setup lang="ts">
// ====== 狀態與路徑設定 ======
const isHoverable = ref(false) // 是否可進入 hover 狀態
const isHovered = ref(false) // 是否處於 hover 狀態
const paths = ['#path1', '#path2', '#path3', '#path4', '#path5', '#circle'] // SVG 路徑 ID 陣列

// ====== 動畫時序控制變數 ======
let animationFrame: number // requestAnimationFrame 回傳 ID
let timelineStart: number // 動畫起始時間
let pauseStart: number | null = null // 暫停動畫時的時間點
let pausedDuration = 0 // 累計暫停時間

// ====== 動畫參數設定 ======
const baseParams = {
  drawDuration: 570, // 單一路徑繪製動畫基礎時間 (ms)
  fillDuration: 800, // 單一路徑填色動畫基礎時間 (ms)
  pathTotalDuration: 600, // 單一路徑總動畫基礎時間 (ms)
  pathOverlap: 0.45, // 路徑動畫重疊比例
  opacityDuration: 200, // 透明度漸變動畫時間 (ms)
  waitDuration: 4000, // 進場後可 hover 狀態維持時間 (ms)
  exitDuration: 360, // 單一路徑離場動畫基礎時間 (ms)
}

// 動畫增量參數（依路徑 index 微調，讓動畫更平滑）
const increments = {
  drawDuration: 8, // 路徑繪製動畫增量
  fillDuration: 35, // 路徑填色動畫增量
  pathTotalDuration: 15, // 路徑總動畫增量
}

// ====== 緩動函數 ======
function easeOutPower1(t: number): number {
  return 1 - (1 - t) ** 1
}
function easeInPower1(t: number): number {
  return t ** 1
}
function easeInOutPower5(t: number): number {
  return t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2
}
function easeOutSine(t: number): number {
  return Math.sin((t * Math.PI) / 2)
}
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

// ====== SVG 路徑元素與長度 ======
let elements: SVGPathElement[] // SVG 路徑元素陣列
let lengths: number[] // 對應路徑長度陣列

// 取得所有 SVG 路徑元素與其長度
function initElements() {
  elements = paths.map(id => document.querySelector(id) as SVGPathElement)
  lengths = elements.map(el => el.getTotalLength())
}

// 設定所有路徑的初始樣式（隱藏、透明）
function setInitialStyles() {
  if (!elements.length)
    return
  elements.forEach((el, i) => {
    el.style.strokeDasharray = `${lengths[i]}`
    el.style.strokeDashoffset = `${lengths[i]}`
    el.style.opacity = '0'
    el.style.fillOpacity = '0'
  })
}

// 根據路徑 index 計算動畫參數增量（讓動畫更自然）
function getIndexFactor(index: number): number {
  // index 3~4 之間曲線更平滑
  return Math.sqrt(index ** 2.5) * 0.8
}

// 取得路徑動畫重疊比例（path3/4 重疊較低，動畫更分明）
function getPathOverlap(index: number): number {
  if (index === 3 || index === 4) {
    return 0.48
  }
  return baseParams.pathOverlap
}

// ====== 主動畫邏輯 ======
function animate(time: number) {
  if (!timelineStart)
    timelineStart = time
  if (pauseStart !== null) {
    animationFrame = requestAnimationFrame(animate)
    return
  }

  const elapsed = time - timelineStart - pausedDuration

  // 進場動畫：依序繪製、顯示、填色
  let accumulatedTime = 0

  // 預先計算每個路徑的總動畫時間（含增量）
  const pathTimes = elements.map((_, index) => {
    const indexFactor = getIndexFactor(index)
    return baseParams.pathTotalDuration + indexFactor * increments.pathTotalDuration
  })

  elements.forEach((el, index) => {
    // 動態計算每個路徑的動畫參數
    const indexFactor = getIndexFactor(index)
    const drawDuration = baseParams.drawDuration + indexFactor * increments.drawDuration
    const fillDuration = baseParams.fillDuration + indexFactor * increments.fillDuration
    const pathTotalDuration = pathTimes[index]

    const drawStart = accumulatedTime
    const drawEnd = drawStart + drawDuration
    const fillStart = drawStart + drawDuration / 2
    const fillEnd = fillStart + fillDuration

    // 透明度動畫
    if (elapsed >= drawStart && elapsed <= drawStart + baseParams.opacityDuration) {
      el.style.opacity = `${(elapsed - drawStart) / baseParams.opacityDuration}`
    }
    else if (elapsed > drawStart + baseParams.opacityDuration) {
      el.style.opacity = '1'
    }

    // 路徑繪製動畫（依不同路徑選用不同緩動）
    if (elapsed >= drawStart && elapsed <= drawEnd) {
      let progress = (elapsed - drawStart) / drawDuration
      if (el.id === 'circle') {
        progress = easeOutSine(progress)
        if ((elapsed - drawStart) < 80)
          progress = 0 // 80ms 延遲
      }
      else if (el.id === 'path5') {
        progress = easeInOutPower5(progress)
      }
      else if (el.id === 'path3' || el.id === 'path4') {
        progress = easeInOutQuad(progress)
      }
      else {
        progress = easeOutPower1(progress)
      }
      const length = lengths[index] ?? 0
      el.style.strokeDashoffset = `${length * (1 - progress)}`
    }
    else if (elapsed > drawEnd) {
      el.style.strokeDashoffset = '0'
    }

    // 填色動畫（特殊處理 circle 與 path5）
    if (el.id === 'circle') {
      el.style.fillOpacity = '0'
      if (elapsed > drawStart + drawDuration * 1.5) {
        isHoverable.value = true
      }
    }
    else if (el.id === 'path5') {
      const oldTotalTime = drawDuration / 2 + fillDuration
      const newFillStart = drawStart + oldTotalTime - fillDuration
      if (elapsed >= newFillStart && elapsed <= newFillStart + fillDuration) {
        const progress = easeInPower1((elapsed - newFillStart) / fillDuration)
        el.style.fillOpacity = `${progress}`
      }
      else if (elapsed > newFillStart + fillDuration) {
        el.style.fillOpacity = '1'
      }
    }
    else {
      if (elapsed >= fillStart && elapsed <= fillEnd) {
        let progress = (elapsed - fillStart) / fillDuration
        if (el.id === 'path3' || el.id === 'path4') {
          progress = easeInOutQuad(progress)
        }
        else {
          progress = easeInPower1(progress)
        }
        el.style.fillOpacity = `${progress}`
      }
      else if (elapsed > fillEnd) {
        el.style.fillOpacity = '1'
      }
    }

    // 累加時間（依各路徑重疊比例）
    const overlap = getPathOverlap(index)
    if (pathTotalDuration !== undefined)
      accumulatedTime += pathTotalDuration * (1 - overlap)
  })

  // 進場結束後，進入可 hover 狀態
  const entranceDuration = accumulatedTime + baseParams.pathTotalDuration
  if (elapsed > entranceDuration && elapsed < entranceDuration + baseParams.waitDuration) {
    isHoverable.value = true
  }
  else if (elapsed > entranceDuration + baseParams.waitDuration) {
    isHoverable.value = false
    isHovered.value = false
  }

  // 離場動畫：路徑反向消失
  const exitStart = entranceDuration + baseParams.waitDuration
  if (elapsed > exitStart) {
    const exitElapsed = elapsed - exitStart

    // 預先計算離場動畫時間（含增量）
    const exitPathTimes = elements.map((_, i) => {
      return baseParams.exitDuration * (1 + Math.sqrt(i) * 0.1)
    })

    // 反向處理路徑（倒序）
    elements.slice().reverse().forEach((el, i) => {
      const exitPathDuration = exitPathTimes[i]
      if (exitPathDuration === undefined)
        return
      const exitFillDuration = exitPathDuration * 0.7

      // 計算每個路徑的離場開始時間（含重疊）
      let start = 0
      if (i > 0) {
        for (let j = 0; j < i; j++) {
          const prevEl = elements.slice().reverse()[j]
          const prevExitTime = exitPathTimes[j]
          if (prevEl && prevExitTime !== undefined) {
            const prevExitOverlap = (prevEl.id === 'path3' || prevEl.id === 'path4') ? 0.5 : 0.4
            start += prevExitTime * (1 - prevExitOverlap)
          }
        }
      }
      const end = start + exitPathDuration

      if (exitElapsed >= start && exitElapsed <= end) {
        let progress = (exitElapsed - start) / exitPathDuration
        // 離場緩動
        if (el.id === 'circle') {
          progress = easeOutSine(progress)
        }
        else if (el.id === 'path3' || el.id === 'path4') {
          progress = easeInOutQuad(progress)
        }
        else {
          progress = easeInPower1(progress)
        }
        const elementIndex = elements.indexOf(el)
        const length = lengths[elementIndex]
        if (length !== undefined)
          el.style.strokeDashoffset = `${length * progress}`

        // 填色淡出
        if (el.id !== 'circle') {
          let fillProgress = Math.min(1, (exitElapsed - start) / (exitFillDuration / 2))
          if (el.id === 'path3' || el.id === 'path4') {
            fillProgress = easeInOutQuad(fillProgress)
          }
          el.style.fillOpacity = `${1 - fillProgress}`
        }

        // 透明度淡出
        if (exitElapsed > end - baseParams.opacityDuration) {
          const opacityProgress = (exitElapsed - (end - baseParams.opacityDuration)) / baseParams.opacityDuration
          el.style.opacity = `${1 - opacityProgress}`
        }
      }
      else if (exitElapsed > end) {
        const elementIndex = elements.indexOf(el)
        const length = lengths[elementIndex]
        if (length !== undefined)
          el.style.strokeDashoffset = `${length}`

        el.style.fillOpacity = '0'
        el.style.opacity = '0'
      }
    })
  }

  // 計算總離場動畫時間（含重疊）
  let totalExitDuration = 0
  elements.slice().reverse().forEach((el, i) => {
    const exitPathDuration = baseParams.exitDuration * (1 + Math.sqrt(i) * 0.1)
    const exitOverlap = (el.id === 'path3' || el.id === 'path4') ? 0.5 : 0.4
    if (i === 0) {
      totalExitDuration += exitPathDuration
    }
    else {
      totalExitDuration += exitPathDuration * (1 - exitOverlap)
    }
  })

  // 動畫結束後重置時間線，循環播放（含短暫暫停）
  if (elapsed > exitStart + totalExitDuration + 800) {
    timelineStart = time
    pausedDuration = 0
  }

  animationFrame = requestAnimationFrame(animate)
}

// ====== 生命週期與互動事件 ======

// 元件掛載時初始化元素、樣式並啟動動畫
onMounted(() => {
  nextTick(() => {
    initElements()
    setInitialStyles()
    animationFrame = requestAnimationFrame(animate)
  })
})

// 元件卸載時取消動畫
onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
})

// 滑鼠進入：進入 hover 狀態並暫停動畫
function handleEnter() {
  if (isHoverable.value) {
    isHovered.value = true
    pauseStart = performance.now()
  }
}

// 滑鼠離開：恢復動畫並離開 hover 狀態
function handleLeave() {
  if (isHoverable.value && pauseStart !== null) {
    isHovered.value = false
    pausedDuration += performance.now() - pauseStart
    pauseStart = null
  }
}
</script>

<template>
  <svg
    id="logo"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 63.78 63.78"
    :class="{ hoverable: isHoverable, hovered: isHovered }"
    @mouseenter="handleEnter"
    @mouseleave="handleLeave"
  >
    <!-- 外圈圓形 -->
    <path
      id="circle"
      d="
        M 31.89, 31.89
        m 31.39, 0
        a 31.39,31.39 0 1,1 -62.78,0
        a 31.39,31.39 0 1,1  62.78,0
      "
      transform="rotate(-90 31.89 31.89)"
    />
    <!-- 其餘 logo 路徑 -->
    <path id="path1" d="M13.54,19.12h3.64v12.54s-2.77,1.62-3.64,3.91V19.12Z" />
    <path id="path2" d="M17.18,19.12h7.76s5.5-.09,6.07,5.88c-.06,5.82-5.14,6.22-7.33,6.76-2.77,.55-6.64,2.3-6.84,6.62,.18,4.88,4.96,5.37,6.39,5.09s3.58-1.55,4.02-4.31l.86,1.7s-.95,2.67-5.97,3.62c-5.13,1-7.46-1.73-8.15-4.44-.66-2.25,.54-6.93,7.18-8.73,6.56-.72,7.26-3.93,7.26-6.31-.12-2.54-2.33-5.09-5.56-5.09h-5.7v-.79Z" />
    <path id="path3" d="M24.02,32.74l1.87-.45s1-.23,1.41-.42l.41-.19,6.56,12.98h-4.21l-6.04-11.92Z" />
    <path id="path4" d="M49.77,28.34h-6.81c-2.74,0-5.72,.93-7.3,2-1.18,.74-3.1,2.74-3.39,6-.24,2.7,.12,4.63,.12,4.63l-2.52-4.98s.12-3.54,3.08-5.69c3.05-2.26,7.3-2.64,9.93-2.64h7.34" />
    <path id="path5" d="M46.91,28.34h2.85l-11.07,15.61h3.44c1.51,0,5.77-.69,8.1-2.46v3.18h-14.96l11.64-16.32Z" />
  </svg>
</template>

<style scoped lang="scss">
// 預設顏色、粗細、過渡
#path1,
#path2,
#path3,
#path4,
#path5,
#circle {
  stroke: var(--clr-text);
  stroke-width: 0.5;
  transition:
    stroke 0.3s,
    fill 0.3s;
}
svg #circle {
  stroke-width: 1;
}

#path1,
#path2,
#path3,
#path4,
#path5 {
  fill: var(--clr-text);
}

#circle {
  fill: none;
}

// 暗色模式
.dark {
  #path1,
  #path2,
  #path3,
  #path4,
  #path5,
  #circle {
    stroke: var(--clr-text);
  }

  #path1,
  #path2,
  #path3,
  #path4,
  #path5 {
    fill: var(--clr-text);
  }
}

// hover 狀態顏色
.hoverable.hovered {
  #path1,
  #path2,
  #path3,
  #path4,
  #path5,
  #circle {
    stroke: var(--clr-primary-green);
  }

  #path1,
  #path2,
  #path3,
  #path4,
  #path5 {
    fill: var(--clr-primary-green);
  }
}
</style>
