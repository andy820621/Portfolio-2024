<script setup lang="ts">
const isHoverable = ref(false)
const isHovered = ref(false)
let tl: gsap.core.Timeline
let waitTween: gsap.core.Timeline

onMounted(async () => {
  const { gsap } = await import('gsap')

  tl = gsap.timeline({ repeat: -1 })
  const paths = ['#path1', '#path2', '#path3', '#path4', '#path5', '#circle']

  // 基礎進場動畫參數
  const baseEntranceParams = {
    drawDuration: 0.5,
    fillDuration: 0.8,
    pathTotalDuration: 0.6,
    pathOverlap: 0.35,
    opacityDuration: 0.2,
  }

  // 每次進場動畫增加的時間基數
  const DRAW_DURATION_INCREMENT = 0.01
  const FILL_DURATION_INCREMENT = 0.045
  const PATH_TOTAL_DURATION_INCREMENT = 0.02

  // 保持顯示狀態的時間
  const WAIT_DURATION = 5

  // 離場動畫參數
  const exitParams = {
    drawDuration: 0.4,
    fillDuration: 0.35,
    pathTotalDuration: 0.5,
    pathOverlap: 0.4,
    opacityDuration: 0.2,
  }

  // 初始化所有路徑的 opacity 為 0
  tl.set(paths, { opacity: 0 })

  // 進場動畫
  let accumulatedTime = 0
  paths.forEach((path, index) => {
    // 為每個路徑計算新的參數
    const entranceParams = {
      drawDuration: baseEntranceParams.drawDuration + Math.sqrt(index ** 3) * DRAW_DURATION_INCREMENT,
      fillDuration: baseEntranceParams.fillDuration + Math.sqrt(index ** 3) * FILL_DURATION_INCREMENT,
      pathTotalDuration: baseEntranceParams.pathTotalDuration + Math.sqrt(index ** 3) * PATH_TOTAL_DURATION_INCREMENT,
      pathOverlap: baseEntranceParams.pathOverlap,
      opacityDuration: baseEntranceParams.opacityDuration,
    }

    const startTime = accumulatedTime
    const length = (document.querySelector(path) as SVGPathElement).getTotalLength()

    tl!.to(path, { opacity: 1, duration: entranceParams.opacityDuration }, startTime)

    if (path === '#circle') {
      const C_DELAY = 0.08

      tl!.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: entranceParams.drawDuration * 1.5, ease: 'sine.out', onComplete: () => {
        isHoverable.value = true
      } }, startTime + C_DELAY)
    }
    else if (path === '#path5') {
      const oldTotalTime = entranceParams.drawDuration / 2 + entranceParams.fillDuration
      const newDrawDuration = oldTotalTime * 0.9
      const newStartTime = startTime + oldTotalTime - entranceParams.fillDuration

      tl!.fromTo(path, { strokeDasharray: length, strokeDashoffset: length, fillOpacity: 0 }, { strokeDashoffset: 0, duration: newDrawDuration, ease: 'power5.inOut' }, startTime).to(path, { fillOpacity: 1, duration: entranceParams.fillDuration, ease: 'power1.in' }, newStartTime,
      )
    }
    else {
      tl!.fromTo(path, { strokeDasharray: length, strokeDashoffset: length, fillOpacity: 0 }, { strokeDashoffset: 0, duration: entranceParams.drawDuration, ease: 'power1.out' }, startTime).to(path, { fillOpacity: 1, duration: entranceParams.fillDuration, ease: 'power1.in' }, `${startTime + entranceParams.drawDuration / 2}`,
      )
    }

    accumulatedTime += entranceParams.pathTotalDuration - entranceParams.pathOverlap
  })

  // 計算總進場動畫時間
  const entranceDuration = accumulatedTime + baseEntranceParams.pathTotalDuration

  // 保持顯示狀態
  waitTween = tl.to({}, { duration: WAIT_DURATION, onComplete: () => {
    isHoverable.value = false
    isHovered.value = false
  } })

  // 離場動畫
  paths.slice().reverse().forEach((path, index) => {
    const startTime = entranceDuration + WAIT_DURATION + index * (exitParams.pathTotalDuration - exitParams.pathOverlap)
    const length = (document.querySelector(path) as SVGPathElement).getTotalLength()

    if (path === '#circle') {
      tl!.to(path, { strokeDashoffset: length, duration: exitParams.drawDuration }, startTime)
    }
    else {
      tl!.to(path, { fillOpacity: 0, duration: exitParams.fillDuration / 2 }, startTime).to(path, { strokeDashoffset: length, duration: exitParams.drawDuration }, `${startTime + exitParams.fillDuration / 4}`)
    }

    tl!.to(path, { opacity: 0, duration: exitParams.opacityDuration }, `${startTime + exitParams.pathTotalDuration - exitParams.opacityDuration}`)
  })

  // 計算總的離場動畫時間
  const exitDuration = paths.length * (exitParams.pathTotalDuration - exitParams.pathOverlap)

  // 在整個動畫序列結束後添加一個短暫的暫停
  tl.to({}, { duration: 0.8 }, entranceDuration + WAIT_DURATION + exitDuration)
})

function handleEnter() {
  if (isHoverable.value) {
    isHovered.value = true
    if (tl && waitTween) {
      const currentTime = tl.time()
      const waitTweenStartTime = waitTween.startTime()
      const waitTweenEndTime = waitTweenStartTime + waitTween.duration()

      if (currentTime >= waitTweenStartTime && currentTime <= waitTweenEndTime) {
        tl.pause()
      }
    }
  }
}

function handleLeave() {
  if (isHoverable.value) {
    isHovered.value = false
    if (tl) {
      tl.resume()
    }
  }
}
</script>

<template>
  <svg
    id="container"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 63.78 63.78"
    :class="{ hoverable: isHoverable, hovered: isHovered }"
    @mouseenter="handleEnter"
    @mouseleave="handleLeave"
  >
    <!-- <circle id="circle" cx="31.89" cy="31.89" r="31.39" transform="rotate(-90 31.89 31.89)" /> -->
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

    <path id="path1" d="M13.54,19.12h3.64v12.54s-2.77,1.62-3.64,3.91V19.12Z" />
    <path id="path2" d="M17.18,19.12h7.76s5.5-.09,6.07,5.88c-.06,5.82-5.14,6.22-7.33,6.76-2.77,.55-6.64,2.3-6.84,6.62,.18,4.88,4.96,5.37,6.39,5.09s3.58-1.55,4.02-4.31l.86,1.7s-.95,2.67-5.97,3.62c-5.13,1-7.46-1.73-8.15-4.44-.66-2.25,.54-6.93,7.18-8.73,6.56-.72,7.26-3.93,7.26-6.31-.12-2.54-2.33-5.09-5.56-5.09h-5.7v-.79Z" />
    <path id="path3" d="M24.02,32.74l1.87-.45s1-.23,1.41-.42l.41-.19,6.56,12.98h-4.21l-6.04-11.92Z" />
    <path id="path4" d="M49.77,28.34h-6.81c-2.74,0-5.72,.93-7.3,2-1.18,.74-3.1,2.74-3.39,6-.24,2.7,.12,4.63,.12,4.63l-2.52-4.98s.12-3.54,3.08-5.69c3.05-2.26,7.3-2.64,9.93-2.64h7.34" />
    <path id="path5" d="M46.91,28.34h2.85l-11.07,15.61h3.44c1.51,0,5.77-.69,8.1-2.46v3.18h-14.96l11.64-16.32Z" />
  </svg>
</template>

<style scoped lang="scss">
#path1,
#path2,
#path3,
#path4,
#path5,
#circle {
  stroke: #303030;
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
  fill: #303030;
}

#circle {
  fill: none;
}

.dark {
  #path1,
  #path2,
  #path3,
  #path4,
  #path5,
  #circle {
    stroke: #fdfdfd;
  }

  #path1,
  #path2,
  #path3,
  #path4,
  #path5 {
    fill: #fdfdfd;
  }
}

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
