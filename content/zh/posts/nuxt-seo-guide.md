---
title: 2026 Nuxt 4 SEO 優化指南：從架構到內容索引
date: 2025-12-17
updatedAt: 2026-06-01
description: 本篇文章將以個人的雙語內容網站為例，你將會學到如何在 Nuxt4 做好 SEO。這會是一系列的文章，本篇先注重於架構原則，再進一步的給出其他深度文章，並會不定期的更新更多實作細節。
seoTitle: "2026 Nuxt 4 SEO 優化指南：從架構到內容索引"
seoDescription: "本篇文章將以個人的雙語內容網站為例，你將會學到如何在 Nuxt4 做好 SEO。這會是一系列的文章，本篇先注重於架構原則，再進一步的給出其他深度文章，並會不定期的更新更多實作細節。"
image: /blog-images/nuxt-seo-guide.webp
alt: Nuxt 4 SEO 系列總覽與實作地圖
ogImage:
  url: /blog-images/nuxt-seo-guide.webp
tags: ['Nuxt', 'SEO', 'Schema.org', 'Sitemap', 'Open Graph', 'i18n']
published: true
relatedPages:
  - path: /zh/posts/nuxt-sitemaps-robots-indexing
  - path: /zh/posts/nuxt-meta-og-schema
  - path: /zh/posts/nuxt-canonical-i18n-internal-linking
  - path: /zh/posts/nuxt-content-v3-i18n-bilingual-site
relatedLinks:
  - title: "Nuxt SEO Learn: SEO Checklist"
    href: https://nuxtseo.com/learn-seo/checklist
    note: 用來建立上線前後的驗證節奏。
  - title: "Nuxt SEO Learn: Sitemaps"
    href: https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/sitemaps
    note: 對照這個系列的 sitemap 深文。
  - title: "Nuxt SEO Learn: Schema.org"
    href: https://nuxtseo.com/learn-seo/nuxt/mastering-meta/schema-org
    note: 對照 metadata 與結構化資料篇。
  - title: "Nuxt SEO Learn: Canonical URLs"
    href: https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/canonical-urls
    note: 對照 canonical / i18n / 互鏈篇。
  - title: "Nuxt SEO Learn: Internal Linking"
    href: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/internal-linking
    note: 用來設計這組文章的 hub-and-spoke 架構。
sitemap:
  images:
    - loc: /blog-images/nuxt-seo-guide.webp
      title: "2026 Nuxt 4 SEO 優化指南：從架構到內容索引"
      caption: "從系列 Hub 出發，拆解 sitemap、meta、schema 與 canonical。"
---

## SEO 在 2026 年的真實面貌

SEO 已經不只是「讓 Google 找到你」這件事了。

如今的搜尋結果頁面同時會有有傳統的連結，還會有 AI 摘要。除了傳統搜尋引擎，部分 AI 回答引擎與搜尋型 AI 服務也會透過公開網頁、搜尋索引或自家爬蟲理解網站內容。換句話說，**你現在有兩種讀者需要同時服務：真實使用者和 AI 代理**。

這帶來了一個具體的問題：如果你的網站結構讓搜尋引擎或 AI 爬蟲看不懂，你的內容對它們來說就不存在。不是排名低——是根本不會出現在任何地方。

2026 年，技術 SEO 的健康狀態等於你在網路上的可信度。以下這幾個常見問題，會靜默地傷害你的排名和 AI 引用機會：

- **錯誤的內部連結**：對 AI 訓練爬蟲來說是低品質訊號
- **網站內容身分不一致**：讓搜尋引擎無法把你的品牌和內容連在一起
- **缺少 Schema.org**：搜尋引擎與 AI 系統仍可能理解頁面，但你少了一層明確描述文章類型、作者、日期與主圖的結構化訊號。
- **Hydration 延遲**：過重的客戶端 JavaScript 可能拖慢互動回應，影響 INP，而 Core Web Vitals 是 Google 頁面體驗訊號的一部分。

---

## Nuxt 4 的 SEO 挑戰

Nuxt 帶來了很多效能優勢，但也帶來了幾個特殊的 SEO 複雜性，是其他純靜態網站不需要面對的：

**混合渲染的一致性問題**
Nuxt 4 支援 SSR、SSG 和 SWR，一個站裡可以同時存在不同的渲染策略。但如果沒有統一的 SEO 設定層，不同頁面的 canonical、meta tags 和 sitemap 收錄狀態很容易互相矛盾。

**Hydration 與 INP**
Google 現在用「Interaction to Next Paint (INP)」評估互動性能。如果你的 Vue 水合過程太慢，使用者點了連結但頁面沒有反應，這個延遲就會被計入排名因子。Nuxt Islands 讓你可以標記哪些元件不需要客戶端 JS，直接輸出純 HTML，是解決這個問題的關鍵工具。

**AI 爬蟲管理**
GPTBot、ClaudeBot、PerplexityBot 這些 AI 爬蟲的行為和 Googlebot 不同。你需要明確在 `robots.txt` 裡告訴它們哪些內容可以抓、哪些不行。這件事現在已經是基本設定，而不是進階選項。

---

## 從 `@nuxtjs/seo` 開始

Nuxt SEO 生態裡，個人認為 `@nuxtjs/seo` 是目前最完整的整合。它把六個獨立模組打包成一個安裝：

```bash
npx nuxi@latest module add seo
```

裝好之後，在 `nuxt.config.ts` 加上基本站點資料：

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],
  site: {
    url: 'https://example.com',
    name: '你的站名',
    description: '站點描述'
  }
})
```

這一步看起來很簡單，但它做的事情比你想的多很多：設定站點 URL 是後續所有絕對路徑（canonical、OG image URL、sitemap）的基礎，也是讓 AI 知識圖譜能把內容連結到正確實體的必要條件。

`@nuxtjs/seo` 裡面主要包含的六個模組各自負責不同的面向：

| 模組                | 負責什麼                  |
| ------------------- | ------------------------- |
| `@nuxtjs/robots`    | robots.txt 與 AI 爬蟲控制 |
| `@nuxtjs/sitemap`   | 自動 XML sitemap 生成     |
| `nuxt-og-image`     | 零執行期 OG 圖片生成      |
| `nuxt-schema-org`   | Schema.org 結構化資料圖譜 |
| `nuxt-link-checker` | 錯誤連結偵測              |
| `nuxt-site-config`  | 跨模組共享站點設定        |

---

## 三個優先順序

裝好模組之後，SEO 工作有三個層次，建議按這個順序來處理：

### 1. Meta 與內容語意（最先做）

用 `useSeoMeta()` 取代舊的 `useHead()`。前者是型別安全的扁平語法，比較不容易寫錯欄位：

```ts
useSeoMeta({
  title: '頁面標題',
  description: '140 字以內的描述，影響搜尋結果點擊率',
  ogImage: '/og/this-page.png',
  twitterCard: 'summary_large_image',
})
```

這一步的核心原則是：**所有 SEO 資料應該從同一份內容資料推導出來**。標題、描述、OG image 和 Schema.org 如果各自寫在不同地方，遲早會出現版本分裂、改了一個但另一個沒跟上的問題。

Schema.org 部分，`nuxt-schema-org` 讓你用 Vue composable 宣告結構化資料，不需要手寫 JSON-LD：

```ts
useSchemaOrg([
  defineArticle({
    headline: '文章標題',
    datePublished: '2026-01-01',
    author: definePerson({ name: '作者名' }),
  })
])
```

搜尋引擎和 AI 模型讀 Schema.org 的方式遠比讀純 HTML 更準確。如果你不提供結構化資料，它們只能靠猜，猜錯的機率不低。

### 2. 爬蟲控制與索引

確認 sitemap 能自動涵蓋你想被收錄的頁面，並且明確排除草稿、測試路由和 API endpoint。`@nuxtjs/sitemap` 預設會自動掃描 Nuxt 路由，但動態路由（例如 `/posts/:slug`）需要你提供資料來源。

> 注意：robots.txt 是控制爬取，不是保證不被索引。真正不希望出現在搜尋結果的頁面，應該用 noindex、權限保護，或在非 HTML 資源上使用 X-Robots-Tag。

`robots.txt` 方面，2026 年需要特別處理 AI 爬蟲：

```ts
// nuxt.config.ts
robots: {
  disallow: ['/admin', '/api'],
  // 允許 Googlebot，限制特定 AI 爬蟲
}
```

### 3. 渲染策略（視需求調整）

用 `routeRules` 做混合渲染，讓行銷頁和文章走 SSG 或 SWR 快取，動態功能頁走 SSR：

```ts
routeRules: {
  '/': { prerender: true },
  '/posts/**': { swr: 3600 },
  '/dashboard/**': { ssr: true },
}
```

這個設定直接影響 TTFB 和 INP，進而影響 Core Web Vitals 評分。

---

## 上線前的最低驗證清單

在 SEO 設定出現問題之前，最難發現問題的時機是剛上線後的幾週。這份清單可以在部署前擋住最常見的失誤：

- [ ] `title`、`description`、`canonical`、`og:image` 與 Schema.org 的主要欄位，都來自同一份內容資料，沒有手動散寫在各頁
- [ ] 用「檢視原始碼」確認 meta tags 出現在伺服器回傳的 HTML 裡，而不是只存在客戶端渲染後的 DOM
- [ ] 草稿頁、開發用路由、API endpoint 沒有誤進 sitemap
- [ ] Google Search Console 驗證站點，並提交 sitemap URL
- [ ] 瀏覽器 console 沒有水合錯誤（hydration mismatch）

---

## 小結

Nuxt 4 的 SEO 不只是補上幾個 meta tags，而是要讓內容資料、渲染策略、索引控制與結構化資料彼此一致。

這篇先建立整體地圖；後續可以再分別深入 sitemap、robots、metadata、Schema.org、canonical、i18n 與 internal linking。
