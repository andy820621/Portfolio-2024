---
title: Nuxt 4 SEO 開發指南
date: 2025/12/17
description: 以雙語 Nuxt 4 內容型網站為例，整理一套可落地的 SEO 實作：一致的 meta、OG image 生成、Schema.org（含圖片授權）、動態 sitemap endpoints，以及部署前後的驗證清單與常見陷阱。
image: /blog-images/nuxt-seo-guide.webp
alt: Nuxt 4 SEO：Meta、Schema.org 與 Sitemap
ogImage: /blog-images/nuxt-seo-guide.webp
tags: ['Nuxt', 'SEO', 'Schema.org', 'Sitemap', 'Open Graph', 'i18n']
categories: ['Nuxt', 'SEO']
published: true
schemaOrg:
  - "@type": "BlogPosting"
    headline: "Nuxt 4 SEO 開發指南"
    description: "以雙語 Nuxt 4 內容型網站為例，整理一套可落地的 SEO 實作：一致的 meta、OG image 生成、Schema.org（含圖片授權）、動態 sitemap endpoints，以及部署前後的驗證清單與常見陷阱。"
    author:
      "@type": "Person"
      name: "BarZ Hsieh"
    datePublished: "2025/12/17"
    dateModified: "2025/12/17"
    image: "/blog-images/nuxt-seo-guide.webp"
    keywords: ["Nuxt SEO", "Schema.org", "Sitemap", "Open Graph", "i18n"]
    articleSection: "TechArticle"

sitemap:
  lastmod: 2025-12-17
  changefreq: weekly
  priority: 0.8
  images:
    - loc: /page-cover/blog.webp
      title: "Nuxt 4 SEO 完整指南"
      caption: "Meta + Schema.org + sitemap + OG images（含驗證與常見陷阱）。"
---

大多數的網站中 SEO 會被當作行銷手段的一環，但個人覺得在作品集網站，SEO 更像是整個品質的一部分：讓每一頁都能被可靠地理解、預覽與分發。

## 為什麼作品集網站需要 SEO？

對前端開發者/設計師而言，作品集不只是展示作品的地方，更是：

- 讓潛在雇主/客戶能透過搜尋找到你
- 在社群媒體分享時有專業的預覽卡片（OG / Twitter Card）
- 考驗你對 Web 標準與內容結構化（Schema / Sitemap）的理解

但作品集的 SEO 挑戰也很明確：內容結構複雜（文章、專案、相簿）、常見多語系需求，並且需要在 SSG/SSR 環境下正確產生 canonical、OG、schema 與 sitemap。

## SEO 的三大支柱：Meta、Schema、Sitemap

- **Meta（含 OG/Twitter）**：控制 SERP 與分享預覽卡片，最容易「看得出差異」。
- **Schema.org**：讓搜尋引擎理解你的內容類型與關係（文章、清單、圖片、授權等）。
- **Sitemap**：讓爬蟲能穩定發現所有重要 URL，尤其是動態內容或多語系站點。

推薦的實作策略是：**集中預設值、自動推導、及早驗證**。把重複的 SEO 邏輯集中在一個地方，內容作者只要維護內容資料（title/description/tags…），其餘讓程式自動產生。

## 1) Page-level Meta：用 composable 統一管理

你可以建立一個 SEO composable，統一處理：

- title/description/keywords
- `og:*` / `twitter:*`（特別是 `og:url`、`og:image`）
- robots（例如 noindex）
- canonical / trailing slash 正規化（避免 `/about` 與 `/about/` 被視為不同頁面）

在開發過程中，我在 **base URL** 的部分有過採雷的經驗：需要確保在 production/preview 都有「同一個來源」能拿到正確的正確 URL（例如 `NUXT_PUBLIC_SITE_URL` 或 `I18N_BASE_URL`），否則 `og:url` / `og:image` 常會在 preview 環境失效。

```ts
interface PageSeoOptions {
  title: string
  description: string
  ogImage?: string
  keywords?: string | string[]
  noIndex?: boolean
}

export function usePageSeo(options: PageSeoOptions) {
  const route = useRoute()
  const config = useRuntimeConfig()

  const baseUrl = config.public.siteUrl // 例如 NUXT_PUBLIC_SITE_URL / I18N_BASE_URL
  const fullUrl = `${baseUrl}${route.path}` // 多語系前綴會自然出現在 route.path

  useSeoMeta({
    title: options.title,
    description: options.description,
    keywords: options.keywords,
    robots: options.noIndex ? 'noindex, nofollow' : 'index, follow',

    ogTitle: options.title,
    ogDescription: options.description,
    ogUrl: fullUrl,
    ogImage: options.ogImage,
    // twitterCard / twitterImage 等也可以在這裡統一補齊
  })
}
```

## 2) 內容頁的 SEO 自動化：從 front matter 推導

對內容型頁面（文章/專案）來說，最省力的做法是從 front matter（或 CMS 欄位）推導 SEO：

- 內容只需要維護 `title`、`description`、`cover/ogImage`、`tags`
- SEO composable 負責把 tags 合併成 keywords、補齊 `og:url`、處理 noindex（草稿/未發布）
- 需要額外資料（例如 `wordCount`、`readingTime`）時，建議在 build/parse 階段自動計算，避免作者手動維護

## 3) Schema.org 實戰

Schema.org 不只是文章。常見對應可以是：

- **首頁**：ProfilePage
- **清單頁（文章/專案/相簿）**：CollectionPage + ItemList
- **內容詳情頁**：WebPage + Article/BlogPosting
- **相簿頁**：WebPage + ItemList + `ImageObject`（每張圖片）

> 更多 Schema.org 類型與屬性，請參考 [Schema.org 官方文件](https://schema.org/WebPage)。

而像是相簿/作品圖，也可以把「圖片授權」也放進 schema。

- `ImageObject` 範例：

```ts
// Gallery 圖片的 Schema.org（含 licensing）
const { locale } = useI18n()

useSchemaOrg([
  defineImage({
    '@id': `${fullUrl}#image-${locale.value}`, // 避免多語系 @id 衝突
    '@type': 'ImageObject',
    'contentUrl': imageUrl,
    'url': imageUrl,

    // 授權資訊（關鍵亮點）
    'license': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    'acquireLicensePage': `${baseUrl}/license/`,
    'creditText': 'Photo by Your Name',
    'creator': {
      '@type': 'Person',
      'name': 'Your Name',
    },
  }),
])
```

> 小提醒：`@id` 盡量使用「絕對 URL + fragment」，並確保在多語系下不會重複（例如把 locale 放進 fragment 或直接使用 `fullUrl` 本身）。

## 4) Sitemap：動態內容 + 多語系 + image sitemap

### 為什麼需要自訂 sitemap endpoints？

Nuxt SEO / sitemap 模組可以自動生成 sitemap，但對「複雜的動態內容」常會需要更進一步的客製化，例如：

- 需要從資料層動態讀取相簿/分類/專案資料
- 需要為每個 entry 生成 image sitemap（封面或代表圖）
- 需要在多語系環境下正確處理 URL（前綴策略、hreflang 對應）

因此建議透過 **Nitro API routes** 來輸出 sitemap URLs，讓 sitemap 與你的真實資料來源保持一致。

以下是一個簡單的範例，展示如何為相簿頁面生成 sitemap URL（包含圖片資訊）：

```ts
import type { SitemapUrl } from '#sitemap/types'

export default defineSitemapEventHandler((): SitemapUrl[] => {
  return [
    {
      loc: '/gallery/album-1/',
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
      images: [
        {
          loc: '/gallery-images/album-1.webp',
          title: 'Album 1',
          caption: 'Cover image',
        },
      ],
    },
  ]
})
```

> 如果你有草稿/未發布內容，除了 build 階段避免輸出，也建議同步在 sitemap 層排除（例如在 front matter 設定 `sitemap: false` 或 `robots: false`）。

## 5) SEO 驗證 Checklist

內容型網站最怕「慢性退化」：壞連結越來越多、HTML 越寫越不合法、某次改動讓 sitemap/schema 靜默壞掉卻沒人發現。

### 開發階段

- [ ] HTML 驗證：dev 模式開啟 HTML validator 檢查
- [ ] 連結驗證：編譯時驗證 Markdown links（避免死連結）
- [ ] Meta 檢查：瀏覽器 DevTools 或 https://metatags.io

### 部署前

- [ ] Prerender 測試：確保所有動態路由都被預渲染/可被 crawler 發現
- [ ] Sitemap 檢查：打開 `/sitemap.xml`（或多 sitemap 的 index）確認內容完整
- [ ] Schema 驗證：Google Rich Results Test / Schema Markup Validator

### 部署後

- [ ] 壞連結掃描：定期跑 link checker 或 CI job
- [ ] Search Console：提交 sitemap、監控索引狀態與 coverage
- [ ] OG 預覽測試：LinkedIn/Twitter/Facebook 分享測試

## 總結

作品集/內容站的 SEO 成功關鍵，往往不是「每個頁面加一堆 meta」，而是把 Meta、Schema、Sitemap 做成可維護的系統：集中預設值、自動推導、加上 checklist 與監控，才不會在內容擴張後慢性退化。
