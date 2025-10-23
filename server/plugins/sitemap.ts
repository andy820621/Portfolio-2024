import { defineNitroPlugin } from 'nitropack/runtime'
import { getSitemapDateFormat } from '~/utils/dayjs'

const lastmod = getSitemapDateFormat(Date.now())

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('sitemap:index-resolved', async (ctx) => {
    ctx.sitemaps.forEach((sitemap) => {
      sitemap.lastmod = lastmod
    })
  })
})
