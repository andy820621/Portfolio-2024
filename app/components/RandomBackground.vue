<script setup lang="ts">
interface RandomBackgroundProps {
  /**
   * 可選的背景來源，傳入陣列時會隨機挑選其中之一；傳入單一字串時永遠載入該背景。
   * 若未提供或找不到對應背景，則會從所有背景中隨機挑選。
   */
  sources?: string | string[] | null
}

const props = withDefaults(defineProps<RandomBackgroundProps>(), {
  sources: null,
})

type BackgroundModule = () => Promise<{ default: Component }>

interface BackgroundSource {
  name: string
  normalized: string
  loader: BackgroundModule
}

const backgroundImporters = import.meta.glob<{ default: Component }>('~/components/Backgrounds/*.vue')

const backgroundSources: BackgroundSource[] = Object.entries(backgroundImporters).map(([path, loader]) => {
  const name = path.split('/').pop()?.replace(/\.vue$/i, '') ?? path
  return {
    name,
    normalized: normalizeIdentifier(name),
    loader: loader as BackgroundModule,
  }
})

const resolvedComponent = shallowRef<Component | null>(null)

let loadId = 0

function pickRandomSource(list: BackgroundSource[]): BackgroundSource | null {
  if (!list.length)
    return null
  const index = Math.floor(Math.random() * list.length)
  return list[index] ?? null
}

function findSourceByIdentifier(identifier: string): BackgroundSource | undefined {
  const normalized = normalizeIdentifier(identifier)
  return backgroundSources.find(source => source.normalized === normalized)
}

function resolveCandidates() {
  if (!props.sources || (Array.isArray(props.sources) && !props.sources.length)) {
    return {
      items: backgroundSources,
      exactMatch: false,
    }
  }

  const requestedList = Array.isArray(props.sources) ? props.sources : [props.sources]

  const resolved = requestedList
    .map(value => value?.trim())
    .filter((value): value is string => Boolean(value))
    .map(value => findSourceByIdentifier(value))
    .filter((source): source is BackgroundSource => Boolean(source))

  if (!resolved.length) {
    console.warn('[RandomBackground] 無法根據 props.sources 找到對應背景，將改用全部背景。', props.sources)
    return {
      items: backgroundSources,
      exactMatch: false,
    }
  }

  return {
    items: resolved,
    exactMatch: true,
  }
}

async function loadBackgroundComponent() {
  if (!backgroundSources.length) {
    resolvedComponent.value = null
    console.warn('[RandomBackground] 找不到任何背景元件。')
    return
  }

  const { items, exactMatch } = resolveCandidates()
  if (!items.length) {
    resolvedComponent.value = null
    return
  }

  const shouldStickToFirst = exactMatch && typeof props.sources === 'string' && !!props.sources?.trim()
  const targetSource = shouldStickToFirst ? items[0] : pickRandomSource(items)

  if (!targetSource) {
    resolvedComponent.value = null
    return
  }

  const currentLoadId = ++loadId
  try {
    const mod = await targetSource.loader()
    if (currentLoadId === loadId)
      resolvedComponent.value = mod.default
  }
  catch (error) {
    if (currentLoadId === loadId)
      resolvedComponent.value = null
    console.error('[RandomBackground] 載入背景元件失敗：', error)
  }
}

if (import.meta.client) {
  watch(() => props.sources, () => {
    loadBackgroundComponent()
  }, { immediate: true, deep: true })
}

function normalizeIdentifier(value: string) {
  return value
    .replace(/\.vue$/i, '')
    .split(/[\\/]/)
    .pop()
    ?.replace(/[\s_-]+/g, '')
    .toLowerCase() || ''
}
</script>

<template>
  <ClientOnly>
    <template #default>
      <BackgroundsPortal v-if="resolvedComponent">
        <component :is="resolvedComponent" />
      </BackgroundsPortal>
    </template>
  </ClientOnly>
</template>
