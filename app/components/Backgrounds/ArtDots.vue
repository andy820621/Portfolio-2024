<script setup lang="ts">
import type { Texture } from 'pixi.js'
import { Application, Graphics, Particle, ParticleContainer } from 'pixi.js'
import { createNoise3D } from 'simplex-noise'

const el = useTemplateRef('el')

// 以目前視窗大小作為網格鋪點範圍（初始值）。
let w = window.innerWidth
let h = window.innerHeight

const SCALE = 200 // 控制噪聲取樣座標的縮放比例（越大→噪聲變化越「平滑、大片」）
const LENGTH = 5 // 每個點從原位移動的最大幅度(px)
const SPACING = 15 // 格點之間的間距(px)

const noise3d = createNoise3D() // 回值範圍大約在 [-1, 1] 之間，用來計算流動方向或位移長度

// 用來記錄「已經建立過」的格點（以字串 id 表示）
const existingPoints = new Set<string>() // 在視窗放大時新範圍需要「補點」時，避免於相同座標的重複建立。
let dotTexture: Texture | null = null

interface PointState {
  x: number
  y: number
  opacity: number
  particle: Particle
  offsetX: number
  offsetY: number
  velocityX: number
  velocityY: number
  baseScale: number
  pushIntensity: number
}

const points: PointState[] = []

const SPRING_STIFFNESS = 0.08 // 控制回彈速度
const SPRING_DAMPING = 0.24 // 阻尼比例，越接近 1 越慢停下
const POINTER_RADIUS = 81 // 控制影響半徑
const POINTER_RADIUS_SQUARED = POINTER_RADIUS * POINTER_RADIUS
const POINTER_STRENGTH = 81 // 每次推開時注入的動量
const POINTER_MIN_PUSH_RATIO = 0 // 距離邊界時的最小推力比例（0 表示完全不推）
const POINTER_DISTANCE_POWER = 1.15 // 控制距離衰減曲線（>1 越接近滑鼠越有力）
const POINTER_OUTWARD_VELOCITY_LIMIT = 1.25 // 粒子沿著放射方向移動達到此速度後，推力會被完全抑制
const POINTER_OUTWARD_SUPPRESSION = 0.81 // 抑制比例，越接近 1 代表已向外移動的粒子幾乎不再被推
const POINTER_INFLUENCE_DURATION = 180 // ms，滑鼠停止後保留影響的時間
const MIN_POINTER_DELTA = 0.24
const POINTER_SPEED_SMOOTHING = 0.81 // 速度平滑係數，0~1
const POINTER_SPEED_DECAY = 0.81 // 沒偵測到移動時，速度會慢慢降低
const POINTER_SPEED_NORMALIZER = 81 // 將滑鼠移動量正規化為 0~1 的基準值
const POINTER_MIN_SPEED_FACTOR = 0.24 // 滑鼠很慢時仍保留的推力下限
const POINTER_DIRECTION_FLOOR = 0.66 // 滑鼠方向與粒子方向不一致時仍保留的最小對齊係數
const PUSH_BRIGHTNESS_STRENGTH = 0.81 // 決定推力越大就能增亮多少
const PUSH_BRIGHTNESS_DECAY = 0.81 // 每幀亮度回復比例，越小拖尾越短
const PUSH_SCALE_STRENGTH = 0.81 // 被推動時放大的幅度，1 表示最多放大 100%

// 追蹤滑鼠最新座標與是否仍在移動，提供推力判斷
const pointerState = {
  x: 0,
  y: 0,
  dirX: 1,
  dirY: 0,
  speed: 0,
  active: false,
  initialized: false,
  lastMove: 0,
}

function handlePointerMove(event: PointerEvent) {
  const { clientX, clientY } = event
  const now = performance.now()
  if (!pointerState.initialized) {
    pointerState.x = clientX
    pointerState.y = clientY
    pointerState.initialized = true
    pointerState.lastMove = now
    return
  }

  const dx = clientX - pointerState.x
  const dy = clientY - pointerState.y
  const len = Math.hypot(dx, dy)
  pointerState.x = clientX
  pointerState.y = clientY

  if (len > MIN_POINTER_DELTA) {
    pointerState.dirX = dx / len
    pointerState.dirY = dy / len
    pointerState.speed = pointerState.speed * (1 - POINTER_SPEED_SMOOTHING) + len * POINTER_SPEED_SMOOTHING
    pointerState.active = true
    pointerState.lastMove = now
  }
  else {
    pointerState.speed *= POINTER_SPEED_DECAY
    pointerState.active = false
  }
}

function handlePointerLeave() {
  pointerState.active = false
  pointerState.speed = 0
  pointerState.lastMove = 0
}

// 計算「某個格點在流場下的方向角（弧度）」。
// 這裡把 3D 噪聲的輸出（約 -1~1）平移/縮放成 [-π, π] 範圍，
// 代表該點在此刻時間 z 下的「流動方向」。
function getForceOnPoint(x: number, y: number, z: number) {
  return (noise3d(x / SCALE, y / SCALE, z) - 0.5) * 2 * Math.PI
}

const mountedScope = effectScope() // 便於自動解除監聽與執行清理

// 建立「單一顆小圓點」的 Texture。所有粒子共享同一張貼圖
function createDotTexture(app: Application) {
  if (dotTexture != null)
    return dotTexture
  const g = new Graphics().circle(0, 0, 1).fill(0xBBBBBB)
  dotTexture = app.renderer.generateTexture(g)
  g.destroy()
  return dotTexture
}

// 依據目前 w/h 與 SPACING，將格點鋪滿畫面，並為「新格點」建立粒子
// 使用 ParticleContainer 來批次渲染，提升大量物件的效能
function addPoints({ dotTexture, particleContainer }: { dotTexture: Texture, particleContainer: ParticleContainer }) {
  for (let x = -SPACING / 2; x < w + SPACING; x += SPACING) {
    for (let y = -SPACING / 2; y < h + SPACING; y += SPACING) {
      const id = `${x}-${y}`
      if (existingPoints.has(id))
        continue
      existingPoints.add(id)

      const particle = new Particle(dotTexture)
      // 將粒子錨點置中，位移時以點中心為基準
      particle.anchorX = 0.5
      particle.anchorY = 0.5
      const scale = Math.random() * 0.5 + 0.75
      particle.scaleX = scale
      particle.scaleY = scale
      particleContainer.addParticle(particle)

      const opacity = Math.random() * 0.5 + 0.5 // 0.5 ~ 1
      points.push({
        x,
        y,
        opacity,
        particle,
        offsetX: 0,
        offsetY: 0,
        velocityX: 0,
        velocityY: 0,
        baseScale: scale,
        pushIntensity: 0,
      })
    }
  }
}

// 初始化 Pixi Application、建立場景、鋪點、啟動動畫更新。
async function setup() {
  if (el.value == null)
    return

  const app = new Application()
  await app.init({
    background: '#ffffff',
    antialias: true, // 抗鋸齒：讓斜線/邊緣更平滑
    resolution: window.devicePixelRatio, // 解析度：使用裝置像素倍率（Retina 螢幕更清晰）
    resizeTo: el.value, // 跟著 el 的大小自動調整畫布尺寸
    eventMode: 'none', // 關閉互動事件
    autoDensity: true, // 在高 DPI 下自動密度調整
  })
  el.value.appendChild(app.canvas)

  // 建立高效能的粒子容器
  const particleContainer = new ParticleContainer({ dynamicProperties: { position: true, color: true, vertex: true } })
  app.stage.addChild(particleContainer)

  // 生成單顆點的貼圖，並依照網格鋪滿所有點
  const sharedDotTexture = createDotTexture(app)
  addPoints({ dotTexture: sharedDotTexture, particleContainer })

  function tickerCallback() {
    const lastTime = app.ticker.lastTime || performance.now()
    const t = lastTime / 10000
    const now = performance.now()
    // pointerActive 只在最近一次移動時間內為 true，避免停住時仍推力
    const pointerActive = pointerState.active && (now - pointerState.lastMove) < POINTER_INFLUENCE_DURATION
    const pointerSpeedFactor = pointerActive ? Math.min(pointerState.speed / POINTER_SPEED_NORMALIZER, 1) : 0
    const speedMultiplier = pointerActive
      ? POINTER_MIN_SPEED_FACTOR + (1 - POINTER_MIN_SPEED_FACTOR) * pointerSpeedFactor
      : 0
    if (!pointerActive)
      pointerState.speed *= POINTER_SPEED_DECAY

    for (const p of points) {
      const { x, y, opacity, particle } = p

      // 方向角（弧度）：由 3D 噪聲決定在 (x,y,t) 的流向
      const rad = getForceOnPoint(x, y, t)
      // 位移長度：使用 t*2 讓頻率略不同，把 [-1,1] 映射到 [0,1]，再乘上 LENGTH 取得振幅。
      const len = (noise3d(x / SCALE, y / SCALE, t * 2) + 0.5) * LENGTH
      // 根據方向角與振幅，算出最終偏移位置
      const nx = x + Math.cos(rad) * len
      const ny = y + Math.sin(rad) * len

      if (pointerActive && speedMultiplier > 0) {
        // 以滑鼠為圓心計算距離，距離越近 → 推力越大
        const actualX = nx + p.offsetX
        const actualY = ny + p.offsetY
        const dxPointer = actualX - pointerState.x
        const dyPointer = actualY - pointerState.y
        const distSquared = dxPointer * dxPointer + dyPointer * dyPointer
        if (distSquared < POINTER_RADIUS_SQUARED && distSquared > 0.0001) {
          const dist = Math.sqrt(distSquared)
          const falloff = 1 - dist / POINTER_RADIUS
          const distanceFactor = falloff ** POINTER_DISTANCE_POWER
          const radialX = dxPointer / dist
          const radialY = dyPointer / dist
          const basePush = (POINTER_MIN_PUSH_RATIO + (1 - POINTER_MIN_PUSH_RATIO) * distanceFactor) * POINTER_STRENGTH
          const alignment = Math.max(0, pointerState.dirX * radialX + pointerState.dirY * radialY)
          const directionBoost = POINTER_DIRECTION_FLOOR + (1 - POINTER_DIRECTION_FLOOR) * alignment
          const radialVelocity = p.velocityX * radialX + p.velocityY * radialY
          let suppression = 1
          if (radialVelocity > 0) {
            const outwardRatio = Math.min(radialVelocity / POINTER_OUTWARD_VELOCITY_LIMIT, 1)
            suppression = 1 - outwardRatio * POINTER_OUTWARD_SUPPRESSION
          }
          const push = basePush * speedMultiplier * directionBoost * suppression
          if (push > 0) {
            p.velocityX += radialX * push
            p.velocityY += radialY * push
          }
          // pushIntensity 作為亮度/縮放的時間衰減指標
          p.pushIntensity = Math.max(p.pushIntensity, distanceFactor * speedMultiplier)
        }
      }

      p.velocityX += -p.offsetX * SPRING_STIFFNESS
      p.velocityY += -p.offsetY * SPRING_STIFFNESS
      p.velocityX *= SPRING_DAMPING
      p.velocityY *= SPRING_DAMPING
      p.offsetX += p.velocityX
      p.offsetY += p.velocityY

      // 實際更新 Pixi 粒子的位置與透明度。
      particle.x = nx + p.offsetX
      particle.y = ny + p.offsetY
      p.pushIntensity *= PUSH_BRIGHTNESS_DECAY
      const clampedIntensity = Math.min(1, p.pushIntensity)
      const brightFactor = 1 + clampedIntensity * PUSH_BRIGHTNESS_STRENGTH
      const baseAlpha = (Math.abs(Math.cos(rad)) * 0.8 + 0.2) * opacity
      particle.alpha = Math.min(1, baseAlpha * brightFactor)
      const scaleFactor = 1 + clampedIntensity * PUSH_SCALE_STRENGTH
      particle.scaleX = p.baseScale * scaleFactor
      particle.scaleY = p.baseScale * scaleFactor
    }
  }
  app.ticker.add(tickerCallback)

  // effectScope 用來統一管理 pointer resize 事件與 Pixi 銷毀
  mountedScope.run(() => {
    const stopPointerMove = useEventListener(window, 'pointermove', handlePointerMove, { passive: true })
    const stopPointerLeave = useEventListener(window, 'pointerleave', handlePointerLeave)
    const stopResize = useEventListener(window, 'resize', useDebounceFn(() => {
      // 視窗改變大小時，更新鋪點範圍並「補上」新可視區域需要的點
      w = window.innerWidth
      h = window.innerHeight
      addPoints({ dotTexture: sharedDotTexture, particleContainer })
    }, 300))
    onScopeDispose(() => {
      stopPointerMove?.()
      stopPointerLeave?.()
      stopResize?.()
      app.ticker.remove(tickerCallback)
      try {
        app?.destroy(true, { children: true, texture: true, textureSource: true }) // 嘗試完整銷毀 Pixi Application 與其資源
        dotTexture?.destroy(true)
        dotTexture = null
      }
      catch (error) {
        console.error(error)
      }
    })
  })
}

// 當 Vue 元件掛載到 DOM 後，初始化 Pixi 場景。
onMounted(async () => {
  await setup()
})

onUnmounted(() => mountedScope.stop())
</script>

<template>
  <div ref="el" pointer-events-none fixed bottom-0 left-0 right-0 top-0 z--1 size-screen dark:invert />
</template>

<style>
.test {
  color: #a5a5a5;
}
</style>
