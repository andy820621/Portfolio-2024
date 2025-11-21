<script setup lang="ts">
/**
 * FlickeringGrid 背景動畫元件
 * ------------------------------------------------------------
 * 使用 Pixi.js 在螢幕上建立大量方形粒子組成的網格，
 * 透過 simplex noise + 隨機閃爍機制週期性改變透明度，營造細微呼吸/抖動效果。
 *
 * 流程概覽：
 * 1. setup() 建立 Pixi Application 並根據容器尺寸生成粒子網格 (rebuildGrid)。
 * 2. 每個粒子保存自身狀態：座標、noise 偏移、flicker 強度、目前 alpha。
 * 3. ticker 每幀使用 3D simplex noise + flicker 衰減計算 target alpha，線性插值平滑更新。
 * 4. resize / prop 改變：延遲排程重建網格；顏色改變只更新 tint，避免全量重建。
 * 5. 元件卸載時完整釋放資源避免記憶體洩漏。
 */
import type { Texture } from 'pixi.js'
import { Application, Graphics, Particle, ParticleContainer } from 'pixi.js'
import { createNoise3D } from 'simplex-noise'

// 元件可調整參數
interface FlickeringGridProps {
  squareSize?: number // 單一方塊邊長
  gridGap?: number // 方塊間距
  flickerChance?: number // 每顆粒子每秒被觸發閃爍的機率基礎值
  color?: string // 方塊顏色 (tint) 字串格式 (#RGB / rgb())
  width?: number // 強制寬度 (不填則跟隨容器寬)
  height?: number // 強制高度 (不填則跟隨容器高)
  class?: string
  maxOpacity?: number // 透明度上限(粒子亮度最大值)
}

// 預設值設定
const props = withDefaults(defineProps<FlickeringGridProps>(), {
  squareSize: 4,
  gridGap: 8,
  flickerChance: 0.15,
  color: '#00ff81',
})

// 取得可觀察的 refs 方便 watch
const { squareSize, gridGap, flickerChance, color, maxOpacity, width, height } = toRefs(props)

// 容器 DOM 引用
const el = useTemplateRef('el')

// 若傳入 width/height 則套用 style；否則讓 Pixi 跟隨容器自動 resize
const containerStyle = computed(() => ({
  width: width.value ? `${width.value}px` : undefined,
  height: height.value ? `${height.value}px` : undefined,
}))

// 僅在 client 啟動 Pixi
const isClient = import.meta.client
const colorMode = useColorMode()
// 建立 3D simplex noise 實例：輸入 (x,y,time)
const noise3d = createNoise3D()

// 單一粒子(方塊)狀態描述
interface SquareState {
  particle: Particle // Pixi 粒子實體
  baseX: number // 初始 X（不做位移動畫）
  baseY: number // 初始 Y
  noiseOffset: number // 時間偏移，避免全部同相位
  flicker: number // 當前閃爍強度 (0~1) 逐步衰減
  alpha: number // 平滑後的目前 alpha 值（用於插值）
  shade: number // 顏色明暗變化參數 (-1 ~ 1)
}

interface RGBColor {
  r: number
  g: number
  b: number
}

// 粒子集合
const squares: SquareState[] = []
// 解析色彩為 rgb 物件，供 tint 計算
const baseColor = computed(() => colorToRgb(color.value))
const resolvedMaxOpacity = computed(() => {
  if (typeof maxOpacity.value === 'number')
    return maxOpacity.value
  return colorMode.value === 'dark' ? 0.16 : 0.35
})
const SHADE_VARIATION_MIN = -0.45
const SHADE_VARIATION_MAX = 0.3

// Pixi 相關資源與狀態
let app: Application | null = null
let particleContainer: ParticleContainer | null = null
let squareTexture: Texture | null = null
let lastTextureSize = squareSize.value
let tickerCallback: (() => void) | null = null
let resizeObserver: ResizeObserver | null = null
let scheduledRebuild = false // 防止重複排程 rebuild
let lastTickTime = isClient ? performance.now() : 0 // 儲存上一幀時間做 delta 計算

// 將 CSS 色彩字串轉為 RGB 結構
function colorToRgb(value: string | undefined): RGBColor {
  const hex = (value || '').trim()
  if (hex.startsWith('#')) {
    const cleaned = hex.slice(1)
    const normalized = cleaned.length === 3
      ? cleaned.split('').map(char => char + char).join('')
      : cleaned
    const num = Number.parseInt(normalized || '000000', 16)
    return {
      r: (num >> 16) & 0xFF,
      g: (num >> 8) & 0xFF,
      b: num & 0xFF,
    }
  }

  const rgbMatch = hex.match(/rgba?\(([^)]+)\)/i)
  if (rgbMatch && rgbMatch[1]) {
    const values = rgbMatch[1].split(',')
      .map(token => Number.parseFloat(token.trim()))
      .filter((_value, index) => index < 3)
    const [r = 0, g = 0, b = 0] = values
    return {
      r: clampChannel(r),
      g: clampChannel(g),
      b: clampChannel(b),
    }
  }

  return { r: 0, g: 0, b: 0 }
}

// 把單一色頻道限制在 0~255
function clampChannel(value: number) {
  if (Number.isNaN(value))
    return 0
  return Math.min(255, Math.max(0, Math.round(value)))
}

function shadeChannel(channel: number, variation: number) {
  const clamped = Math.min(1, Math.max(-1, variation))
  if (clamped >= 0)
    return clampChannel(channel + (255 - channel) * clamped)
  return clampChannel(channel * (1 + clamped))
}

function createTintFromBase(base: RGBColor, variation: number) {
  const r = shadeChannel(base.r, variation)
  const g = shadeChannel(base.g, variation)
  const b = shadeChannel(base.b, variation)
  return (r << 16) | (g << 8) | b
}

function randomShade() {
  return SHADE_VARIATION_MIN + Math.random() * (SHADE_VARIATION_MAX - SHADE_VARIATION_MIN)
}

// 確保方塊貼圖存在：squareSize 改變時重建
function ensureSquareTexture(): Texture {
  if (!app)
    throw new Error('Pixi application is not ready.')
  if (squareTexture && lastTextureSize === squareSize.value)
    return squareTexture

  squareTexture?.destroy(true)

  const g = new Graphics().rect(0, 0, squareSize.value, squareSize.value).fill(0xFFFFFF)
  squareTexture = app.renderer.generateTexture(g)
  g.destroy()
  lastTextureSize = squareSize.value
  return squareTexture
}

// 取得應用目前應該使用的寬高（優先 prop，再容器，最後視窗）
function resolveSize() {
  const fallbackWidth = isClient ? window.innerWidth : 0
  const fallbackHeight = isClient ? window.innerHeight : 0
  const resolvedWidth = width.value ?? el.value?.clientWidth ?? fallbackWidth
  const resolvedHeight = height.value ?? el.value?.clientHeight ?? fallbackHeight
  return {
    width: Math.max(1, Math.floor(resolvedWidth)),
    height: Math.max(1, Math.floor(resolvedHeight)),
  }
}

// 重新建立整個粒子網格（尺寸或參數改變時呼叫）
function rebuildGrid() {
  if (!app)
    return

  const { width: resolvedWidth, height: resolvedHeight } = resolveSize()
  if (!resolvedWidth || !resolvedHeight)
    return

  // 銷毀舊容器避免殘留
  if (particleContainer) {
    app.stage.removeChild(particleContainer)
    particleContainer.destroy({ children: true })
    particleContainer = null
  }

  // 建立新的 ParticleContainer，僅啟用必要動態屬性
  particleContainer = new ParticleContainer({
    dynamicProperties: {
      position: false,
      rotation: false,
      vertex: false,
      uvs: false,
      color: true, // 只需要動態調整 tint / alpha
    },
  })
  app.stage.addChild(particleContainer)

  const texture = ensureSquareTexture()
  const stride = squareSize.value + gridGap.value // 方塊 + 間距
  const columns = Math.ceil((resolvedWidth + squareSize.value) / stride)
  const rows = Math.ceil((resolvedHeight + squareSize.value) / stride)

  squares.length = 0 // 清空舊狀態
  const tintBase = baseColor.value

  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < rows; row++) {
      const particle = new Particle(texture)
      particle.anchorX = 0
      particle.anchorY = 0
      particle.x = col * stride
      particle.y = row * stride
      const shade = randomShade()
      particle.tint = createTintFromBase(tintBase, shade)
      const alpha = Math.random() * resolvedMaxOpacity.value // 初始亮度隨機
      particle.alpha = alpha
      particleContainer.addParticle(particle)

      squares.push({
        particle,
        baseX: particle.x,
        baseY: particle.y,
        noiseOffset: Math.random() * 10, // 個別時間偏移
        flicker: Math.random(), // 初始 flicker（也可設為 0）
        alpha,
        shade,
      })
    }
  }
}

// 排程在下一幀重建（防止頻繁呼叫）
function scheduleRebuildGrid() {
  if (!isClient || !app || scheduledRebuild)
    return
  scheduledRebuild = true
  requestAnimationFrame(() => {
    scheduledRebuild = false
    rebuildGrid()
  })
}

// 只更新顏色 tint，不重建粒子結構
function updateTint(color: RGBColor) {
  for (const square of squares)
    square.particle.tint = createTintFromBase(color, square.shade)
}

// 初始化 ticker：控制 alpha 動態
function setupTicker() {
  if (!app || tickerCallback)
    return

  const NOISE_SCALE = 110 // 空間縮放：越大 => 變化更平緩
  const TIME_SCALE = 0.00025 // 時間推進速度
  const FLICKER_DECAY = 2.8 // flicker 每秒衰退速度
  const SMOOTH_MULTIPLIER = 7 // alpha 插值因子（大 => 快速貼近目標）

  tickerCallback = () => {
    if (!app)
      return
    const now = performance.now()
    const deltaTime = Math.max(0.001, (now - lastTickTime) / 1000)
    lastTickTime = now
    const time = now * TIME_SCALE

    for (const square of squares) {
      // 取樣 noise：將 base 座標映射到 noise 空間 + 時間偏移
      const noiseValue = noise3d(square.baseX / NOISE_SCALE, square.baseY / NOISE_SCALE, time + square.noiseOffset)
      const normalized = (noiseValue + 1) * 0.5 // [-1,1] -> [0,1]
      const baseAlpha = normalized * resolvedMaxOpacity.value * 0.7 // 基礎亮度 (保留一些暗部)

      // 隨機觸發 flicker：機率按 deltaTime 縮放（刷新率獨立）
      if (Math.random() < flickerChance.value * deltaTime)
        square.flicker = 1

      // 衰減 flicker 強度
      square.flicker = Math.max(0, square.flicker - FLICKER_DECAY * deltaTime)
      const flickerBoost = square.flicker * resolvedMaxOpacity.value
      const targetAlpha = Math.min(resolvedMaxOpacity.value, baseAlpha + flickerBoost)
      const lerpFactor = Math.min(1, deltaTime * SMOOTH_MULTIPLIER)
      square.alpha += (targetAlpha - square.alpha) * lerpFactor
      square.particle.alpha = square.alpha
    }
  }

  app.ticker.add(tickerCallback)
}

// 建立 Pixi Application + 初始網格 + 監聽 resize
async function setup() {
  if (!isClient || !el.value || app)
    return

  app = new Application()
  await app.init({
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
    resizeTo: el.value,
    eventMode: 'none', // 不需要事件
  })
  el.value.appendChild(app.canvas)

  rebuildGrid()
  setupTicker()

  resizeObserver = new ResizeObserver(() => scheduleRebuildGrid())
  resizeObserver.observe(el.value)
}

// 卸載：清除所有觀察與 Pixi 資源
function cleanup() {
  resizeObserver?.disconnect()
  resizeObserver = null

  if (app && tickerCallback)
    app.ticker.remove(tickerCallback)
  tickerCallback = null

  particleContainer?.destroy({ children: true })
  particleContainer = null

  if (app) {
    try {
      app.canvas?.remove?.()
      app.destroy(true, { children: true, texture: true, textureSource: true })
    }
    catch (error) {
      console.error(error)
    }
  }
  app = null

  squareTexture?.destroy(true)
  squareTexture = null
  squares.length = 0
}

// watchers：尺寸與顏色
let stopPropWatch: (() => void) | undefined
let stopColorWatch: (() => void) | undefined

if (isClient) {
  stopPropWatch = watch([squareSize, gridGap, width, height], () => {
    scheduleRebuildGrid()
  })
  stopColorWatch = watch(baseColor, tint => updateTint(tint), { deep: true })
}

// 生命週期：掛載 & 卸載
onMounted(async () => {
  await setup()
})

onUnmounted(() => {
  stopPropWatch?.()
  stopColorWatch?.()
  cleanup()
})
</script>

<template>
  <div
    ref="el"
    class="pointer-events-none fixed bottom-0 left-0 right-0 top-0 z--1 size-screen" :class="[props.class]"
    :style="containerStyle"
  />
</template>
