import { defineEventHandler } from 'h3'

// Ensure event.context exists on all requests to avoid platform-specific
// access errors inside dependencies that read event.context.* (e.g., cloudflare)
export default defineEventHandler((event) => {
  // Some runtimes might not define context; make sure it's at least an object
  const e: any = event as any
  if (!e.context)
    e.context = {}
})
