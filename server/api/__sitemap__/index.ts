import type { H3Event } from 'h3'

export default defineSitemapEventHandler(async (_event: H3Event) => {
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
