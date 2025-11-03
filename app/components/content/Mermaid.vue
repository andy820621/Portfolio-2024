<script setup lang="ts">
const colorMode = useColorMode()
const { $mermaid } = useNuxtApp()
const mermaidContainer = ref<HTMLDivElement | null>(null)
const hasRenderedOnce = ref(false) // Track the initial render
let mermaidDefinition = ''
let observer: IntersectionObserver | null = null

const mermaidTheme = computed(() => {
  return colorMode.value === 'dark' ? 'dark' : 'default'
})

// Serialize the slot DOM back into a Mermaid definition string.
// Important: Convert actual <br> elements back to literal "<br/>" tokens so Mermaid can parse them
// when using htmlLabels. Strip other wrapper tags like <pre>/<code> by concatenating their children.
function serializeMermaidFromNode(root: Node): string {
  const TEXT_NODE = 3
  const ELEMENT_NODE = 1
  if (root.nodeType === TEXT_NODE) {
    return (root as Text).data
  }
  if (root.nodeType === ELEMENT_NODE) {
    const el = root as HTMLElement
    const tag = el.tagName?.toUpperCase()
    if (tag === 'BR')
      return '<br/>'
    let out = ''
    el.childNodes.forEach((child) => {
      out += serializeMermaidFromNode(child)
    })
    return out
  }
  return ''
}

async function renderMermaid() {
  if (!mermaidContainer.value || !mermaidDefinition)
    return

  try {
    mermaidContainer.value.removeAttribute('data-processed')
    mermaidContainer.value.textContent = mermaidDefinition
    await nextTick()

    $mermaid().initialize({
      startOnLoad: false,
      theme: mermaidTheme.value,
      securityLevel: 'antiscript',
      flowchart: { htmlLabels: true },
    })
    await $mermaid().run({
      nodes: [mermaidContainer.value],
    })
    hasRenderedOnce.value = true // Mark as rendered
  }
  catch (e) {
    console.error('Error running Mermaid:', e)
    if (mermaidContainer.value) {
      mermaidContainer.value.innerHTML = '⚠️ Mermaid Chart Syntax Error'
    }
  }
}

onMounted(() => {
  if (mermaidContainer.value) {
    // Prefer content inside a <pre> if present (nuxt/content often wraps code)
    const pre = mermaidContainer.value.querySelector('pre')
    const sourceNode = pre ?? mermaidContainer.value
    mermaidDefinition = serializeMermaidFromNode(sourceNode).trim()

    observer = new IntersectionObserver(
      (entries) => {
        // If the element is visible and we haven't rendered it yet
        if (entries[0]?.isIntersecting && !hasRenderedOnce.value) {
          renderMermaid()

          // Disconnect the observer after the first successful render
          if (observer) {
            observer.disconnect()
          }
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(mermaidContainer.value)
  }
})

// Clean up the observer when the component is unmounted
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

// Watch for theme changes and re-render only if it's already been rendered once
watch(mermaidTheme, () => {
  if (hasRenderedOnce.value) {
    renderMermaid()
  }
})
</script>

<template>
  <div ref="mermaidContainer" class="mermaid">
    <slot />
  </div>
</template>

<style lang="scss">
.mermaid:not([data-processed]) {
  color: transparent;
  min-height: 10px; /* Give it a minimum height so the observer can see it */
}
.mermaid {
  display: flex;
  justify-content: center;
}
/*
  Mermaid's generated label containers sometimes apply overflow: hidden and nowrap,
  which can clip long CJK text. Allow wrapping and visible overflow for node/edge labels.
*/
.mermaid .label,
.mermaid .nodeLabel,
.mermaid .edgeLabel {
  white-space: normal !important;
  overflow: visible !important;
}
/* In some themes, the foreignObject wrapper can also clip; make it visible. */
.mermaid foreignObject {
  overflow: visible !important;
}
</style>
