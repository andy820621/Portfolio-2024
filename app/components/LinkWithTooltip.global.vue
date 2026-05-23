<script setup lang="ts">
type IconSource
  = {
    icon: string
    url?: string
  }
  | {
    icon?: string
    url: string
  }

type LinkWithTooltipProps = {
  to: string
  tooltipContent?: string
  iconClass?: string
  size?: string | number
  linkGroup?: string
} & IconSource

const props = withDefaults(defineProps<LinkWithTooltipProps>(), {
  size: '24',
})

const { to, tooltipContent, iconClass } = toRefs(props)
const { trackOutboundClick } = useAnalyticsOutboundClick()
const size = computed(() => String(props.size)) // 將 size 統一轉為字串方便處理單位

const REMOTE_URL_REGEX = /^(?:https?:)?\/\//
const HTTP_URL_REGEX = /^https?:\/\//i
const UNIT_ONLY_REGEX = /^\d+$/
const isRemoteSource = (value?: string) => !!value && REMOTE_URL_REGEX.test(value)

// 判斷 icon 是否為本地 iconify 名稱（非 URL）
const iconName = computed(() => (props.icon && !isRemoteSource(props.icon) ? props.icon : ''))

// 決定要使用的圖片 URL（優先使用 url，其次使用遠端 icon）
const iconUrl = computed(() => {
  if (props.url)
    return props.url
  if (props.icon && isRemoteSource(props.icon))
    return props.icon
  return ''
})

// 與 Icon 預設大小對齊；使用 px 為主要單位，若傳入已帶單位則直接套用
const ensureUnit = (val: string) => (UNIT_ONLY_REGEX.test(val) ? `${val}px` : val)
const resolvedImgSize = computed(() => ensureUnit(size.value))
const imageSizeStyle = computed(() => ({
  width: resolvedImgSize.value,
  height: resolvedImgSize.value,
  margin: 0,
}))

function resolveDestinationType(destinationUrl: URL): 'github' | 'npm' | 'tool' {
  const hostname = destinationUrl.hostname.toLowerCase()

  if (hostname === 'github.com' || hostname.endsWith('.github.com'))
    return 'github'

  if (hostname === 'npmjs.com' || hostname.endsWith('.npmjs.com'))
    return 'npm'

  return 'tool'
}

function trackLinkOutboundClick() {
  if (!HTTP_URL_REGEX.test(props.to))
    return

  try {
    const destinationUrl = new URL(props.to)

    trackOutboundClick({
      destinationType: resolveDestinationType(destinationUrl),
      destinationUrl: destinationUrl.href,
      linkGroup: props.linkGroup,
      sourceComponent: 'link_with_tooltip',
    })
  }
  catch {
    // Ignore malformed URL props and avoid breaking navigation behavior.
  }
}

// 若同時缺少 icon/url 會造成空內容，開發模式下提示一次
if (import.meta.env.DEV && !iconName.value && !iconUrl.value) {
  console.warn('[LinkWithTooltip] Missing both icon and url props; nothing will be rendered inside link.')
}
</script>

<template>
  <MyTooltip v-if="tooltipContent" :text="tooltipContent">
    <template #default>
      <NuxtLink
        :to="to"
        :title="tooltipContent"
        :aria-label="tooltipContent || to"
        class="flex items-center border-b-none!"
        target="_blank"
        rel="noopener noreferrer"
        @click="trackLinkOutboundClick"
      >
        <Icon v-if="iconName" :name="iconName" :class="iconClass" :size="size" aria-hidden="true" />
        <NuxtImg
          v-else-if="iconUrl"
          :src="iconUrl"
          :class="iconClass"
          :style="imageSizeStyle"
          aria-hidden="true"
          loading="lazy"
          placeholder
        />
        <span class="sr-only">{{ tooltipContent || to }}</span>
      </NuxtLink>
    </template>
  </MyTooltip>

  <NuxtLink
    v-else
    :to="to"
    :title="tooltipContent"
    :aria-label="tooltipContent || to"
    class="flex items-center border-b-none!"
    target="_blank"
    rel="noopener noreferrer"
    @click="trackLinkOutboundClick"
  >
    <Icon v-if="iconName" :name="iconName" :class="iconClass" :size="size" aria-hidden="true" />
    <img
      v-else-if="iconUrl"
      :src="iconUrl"
      :class="iconClass"
      :style="imageSizeStyle"
      aria-hidden="true"
      loading="lazy"
    >
    <span class="sr-only">{{ tooltipContent || to }}</span>
  </NuxtLink>
</template>
