<script setup lang="ts">
const isHoverable = ref(false)
const isHovered = ref(false)
const paths = ['#path1', '#path2', '#path3', '#path4', '#path5', '#circle']

let animationFrame: number
let timelineStart: number
let pauseStart: number | null = null
let pausedDuration = 0
const durations = {
  draw: 500,
  fill: 800,
  opacity: 200,
  wait: 5000,
  exit: 500,
}

let elements: SVGPathElement[]
let lengths: number[]

function initElements() {
  elements = paths.map(id => document.querySelector(id) as SVGPathElement)
  lengths = elements.map(el => el.getTotalLength())
}

function setInitialStyles() {
  if (!elements.length)
    return
  console.log('setInitialStyles work!!')

  elements.forEach((el, i) => {
    el.style.strokeDasharray = `${lengths[i]}`
    el.style.strokeDashoffset = `${lengths[i]}`
    el.style.opacity = '0'
    el.style.fillOpacity = '0'
  })
}

function animate(time: number) {
  if (!timelineStart)
    timelineStart = time
  if (pauseStart !== null) {
    animationFrame = requestAnimationFrame(animate)
    return
  }

  const elapsed = time - timelineStart - pausedDuration

  // 進場動畫
  let accumulatedTime = 0
  elements.forEach((el, i) => {
    const drawStart = accumulatedTime
    const drawEnd = drawStart + durations.draw
    const fillStart = drawStart + durations.draw / 2
    const fillEnd = fillStart + durations.fill

    // opacity 進場
    if (elapsed >= drawStart && elapsed <= drawStart + durations.opacity) {
      el.style.opacity = `${(elapsed - drawStart) / durations.opacity}`
    }
    else if (elapsed > drawStart + durations.opacity) {
      el.style.opacity = '1'
    }

    // stroke 繪製
    if (elapsed >= drawStart && elapsed <= drawEnd) {
      const progress = (elapsed - drawStart) / durations.draw
      el.style.strokeDashoffset = `${lengths[i] * (1 - progress)}`
    }
    else if (elapsed > drawEnd) {
      el.style.strokeDashoffset = '0'
    }

    // 填色動畫
    if (el.id !== 'circle') {
      if (elapsed >= fillStart && elapsed <= fillEnd) {
        const progress = (elapsed - fillStart) / durations.fill
        el.style.fillOpacity = `${progress}`
      }
      else if (elapsed > fillEnd) {
        el.style.fillOpacity = '1'
      }
    }
    else {
      el.style.fillOpacity = '0'
    }

    accumulatedTime += durations.draw * 0.8
  })

  // 進場結束後可 hover
  if (elapsed > accumulatedTime && elapsed < accumulatedTime + durations.wait) {
    isHoverable.value = true
  }
  else {
    isHoverable.value = false
    isHovered.value = false
  }

  // 離場動畫
  const exitStart = accumulatedTime + durations.wait
  if (elapsed > exitStart) {
    const exitElapsed = elapsed - exitStart
    elements.slice().reverse().forEach((el, i) => {
      const start = i * durations.exit * 0.6
      const end = start + durations.exit

      if (exitElapsed >= start && exitElapsed <= end) {
        const progress = (exitElapsed - start) / durations.exit
        el.style.strokeDashoffset = `${lengths[elements.indexOf(el)] * progress}`
        el.style.fillOpacity = `${1 - progress}`
        el.style.opacity = `${1 - progress}`
      }
      else if (exitElapsed > end) {
        el.style.strokeDashoffset = `${lengths[elements.indexOf(el)]}`
        el.style.fillOpacity = '0'
        el.style.opacity = '0'
      }
    })
  }

  // 完成後重置時間線
  if (elapsed > exitStart + durations.exit * elements.length) {
    timelineStart = time
    pausedDuration = 0
  }

  animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  initElements()

  setInitialStyles()
  animationFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
})

function handleEnter() {
  if (isHoverable.value) {
    isHovered.value = true
    pauseStart = performance.now()
  }
}

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
