import mermaid from 'mermaid'

// Disable Mermaid's default DOMContentLoaded auto-render to avoid SSR hydration race.
mermaid.initialize({
  startOnLoad: false,
})

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('mermaid', () => mermaid)
})
