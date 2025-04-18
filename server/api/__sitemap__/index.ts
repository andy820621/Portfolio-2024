// server/api/__sitemap__/index.ts
import { defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async (event) => {
  // 獲取當前日期作為最後修改日期
  const lastmod = new Date().toISOString()

  return [
    {
      loc: '/__sitemap__/en-US.xml',
      lastmod,
    },
    {
      loc: '/__sitemap__/zh-TW.xml',
      lastmod,
    },
  ]
})
