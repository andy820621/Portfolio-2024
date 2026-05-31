---
title: Nuxt sitemap、robots.txt 與 noindex：內容型網站的索引控制實戰
date: 2026-05-25
updatedAt: 2026-06-01
description: 以雙語 Nuxt 內容網站為例，拆解 sitemap、robots.txt、X-Robots-Tag 與 noindex 的責任分工，整理動態內容、image sitemap 與多語系索引控制的實作方式。
seoTitle: "Nuxt Sitemap、robots.txt 與 noindex 實作"
seoDescription: "整理 Nuxt 內容型網站的 sitemap、robots.txt、X-Robots-Tag、image sitemap 與多語系索引控制策略。"
image: /blog-images/nuxt-seo-guide.webp
alt: Nuxt sitemap、robots.txt 與 noindex
ogImage:
  url: /blog-images/nuxt-seo-guide.webp
tags: ['Nuxt', 'SEO', 'Sitemap', 'robots.txt', 'noindex', 'i18n']
published: true
relatedPages:
  - path: /zh/posts/nuxt-seo-guide
  - path: /zh/posts/nuxt-canonical-i18n-internal-linking
  - path: /zh/posts/nitro-prerender-dynamic-routes-solution
  - path: /zh/posts/nuxt-content-v3-i18n-bilingual-site
relatedLinks:
  - title: "Nuxt SEO Learn: Sitemaps"
    href: https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/sitemaps
    note: 對照動態來源與 image sitemap 的設計方式。
  - title: "Nuxt SEO Learn: robots.txt"
    href: https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/robots-txt
    note: 用來區分 crawler policy 與 index policy。
  - title: "Nuxt SEO Learn: Robot Meta Tag"
    href: https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/meta-tags
    note: 補充逐頁 noindex / nofollow 的使用邊界。
  - title: "Nuxt SEO Learn: Dynamic Routes"
    href: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/dynamic-routes
    note: 幫助確認 sitemap 與真實動態內容來源一致。
sitemap:
  images:
    - loc: /page-cover/blog.webp
      title: "Nuxt sitemap 與 robots 實作"
      caption: "整理 sitemap、robots.txt、X-Robots-Tag 與多語系索引控制。"
---

當內容站開始有文章、專案、相簿、API route、預覽頁與雙語路徑之後，真正困難的不是「有沒有 sitemap」，而是搜尋引擎看到的索引面是否乾淨。這篇文章聚焦在索引控制，承接母文 [Nuxt 4 SEO 開發指南：系列總覽與實作地圖](/zh/posts/nuxt-seo-guide/) 裡最容易出問題的那一塊。

## 先分清 sitemap、robots.txt 與 noindex 各自負責什麼

這三者很常一起被提到，但責任完全不同：

- **sitemap**：主動告訴搜尋引擎哪些 URL 值得被發現。
- **robots.txt**：限制 crawler 能不能抓某些路徑。
- **noindex / X-Robots-Tag**：即使被抓到，也不要讓它進索引。

最常見的誤解是「我把頁面擋在 robots.txt，就等於 noindex」。不是。被 robots 擋住的頁面可能還是被其他地方連到，搜尋引擎仍然可能知道它存在，只是抓不到內容。真正要處理索引與否，仍然要靠 meta robots 或 header。

## 什麼時候自動 sitemap 不夠？

如果站點很小、內容型態單純，自動 sitemap 通常就夠了。但一旦你有下列情境，就值得用更明確的來源來生成 sitemap：

- 文章與專案來自不同 collection，發布條件不同
- 圖片有額外 metadata，想一起輸出 image sitemap
- 存在 `/zh/...` 這種語系前綴，需要確保不同 locale 都被列入
- 預覽頁、搜尋結果頁、API 路徑、未發布內容需要排除

這也是我把 sitemap 與 [Nitro hooks 的預渲染流程](/zh/posts/nitro-prerender-dynamic-routes-solution/) 放在一起思考的原因：它們都應該對同一份內容真相負責，而不是一個根據路由掃描、一個根據資料層判斷，最後互相飄移。

## 建立與內容來源一致的 sitemap 流程

對內容站來說，我比較偏好這樣的流程：

1. 內容 collection 先定義好 `published`、`updatedAt`、`image` 等欄位。
2. prerender 階段只輸出真正可公開的頁面。
3. sitemap handler 從同一份內容資料查詢出可索引頁面。
4. route rules 再補上 `/api/**`、preview route、deploy preview 的 noindex header。

簡化後的 sitemap handler 可以長這樣：

```ts
import type { SitemapUrl } from '#sitemap/types'

export default defineSitemapEventHandler(async (): Promise<SitemapUrl[]> => {
  const posts = await queryCollection('posts_zh')
    .where('published', '=', true)
    .select('path', 'updatedAt', 'image')
    .all()

  return posts.map(post => ({
    loc: post.path,
    lastmod: post.updatedAt,
    images: post.image
      ? [{ loc: post.image }]
      : undefined,
  }))
})
```

重點不是程式碼多漂亮，而是 **資料來源一致**。只要 sitemap 跟實際頁面使用不同條件，久了就一定會出現「頁面存在但不在 sitemap」或「sitemap 還列著已下架頁面」的漂移。

## image sitemap 與多語系路徑

對作品集或相簿站來說，image sitemap 很值得做，因為圖片往往就是搜尋入口本身。實務上我會注意三件事：

- 只放公開可被抓取的圖片 URL
- 代表圖與頁面語意一致，不要 sitemap 放 A 圖、頁面主視覺是 B 圖
- `/posts/...` 與 `/zh/posts/...` 都要用各自真實 URL，不要靠前端推測

如果你的雙語內容是靠 `@nuxt/content` collection 管理，語系前綴最好在 schema 或 sitemap hook 就明確處理，不要等到 template 層才補。這樣 sitemap、canonical、hreflang 才能使用同一套路徑規則。

## robots 與 noindex 什麼時候要一起用？

我通常這樣分：

- **不希望被抓取**：像 `/api/**`、內部工具頁、某些資源路徑，用 robots 或 route rules 擋掉。
- **可以被抓取但不希望進索引**：像 deploy preview、測試頁、分頁或特定內部路由，用 `noindex` 或 `X-Robots-Tag`。
- **應該被公開索引**：列進 sitemap，並且不要再用其他規則互相抵銷。

如果你發現自己在同一個 URL 上同時寫了 sitemap entry、robots block、noindex header，那通常代表規則在互相打架。

## 上線前要檢查什麼？

最小檢查項目如下：

- [ ] `/sitemap.xml` 或 sitemap index 能列出所有公開文章、專案與語系版本
- [ ] 草稿、API route、preview route 沒有出現在 sitemap
- [ ] deploy preview 或 staging 有正確的 `X-Robots-Tag: noindex`
- [ ] robots.txt 的 allow / disallow 與你的實際資源策略一致
- [ ] image sitemap 裡的圖片 URL 真能被抓取，沒有指向私有或不存在的資源

## 總結

索引控制最怕的不是少一個檔案，而是規則彼此矛盾。把 sitemap、robots、noindex、prerender 看成同一條內容供應鏈，比事後追查哪個 URL 為什麼沒進索引有效得多。接著如果你要處理搜尋結果與分享卡片，就可以往下一篇 [Nuxt Meta、OG 與 Schema.org：從 front matter 到分享預覽](/zh/posts/nuxt-meta-og-schema/) 走。
