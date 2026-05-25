---
title: Nuxt Meta、OG 與 Schema.org：從 front matter 到分享預覽
date: 2026-05-25
updatedAt: 2026-05-25
description: 以 Nuxt 內容網站為例，整理如何把 title、description、image、tags 等 front matter 推導成頁面 meta、Open Graph、Twitter Card 與 Schema.org，降低手動維護成本。
seoTitle: "Nuxt Meta、OG 與 Schema.org 實作"
seoDescription: "整理 Nuxt 內容網站的 page-level meta、OG image、Twitter Card 與 Schema.org 推導流程。"
image: /blog-images/nuxt-seo-guide.webp
alt: Nuxt Meta、OG 與 Schema.org
ogImage:
  url: /blog-images/nuxt-seo-guide.webp
tags: ['Nuxt', 'SEO', 'Open Graph', 'Schema.org', 'Metadata', 'i18n']
categories: ['Nuxt', 'SEO']
published: true
relatedPages:
  - path: /zh/posts/nuxt-seo-guide
  - path: /zh/posts/image-management-pipeline
  - path: /zh/posts/nuxt-canonical-i18n-internal-linking
  - path: /zh/posts/nuxt-content-v3-i18n-bilingual-site
relatedLinks:
  - title: "Nuxt SEO Learn: Titles"
    href: https://nuxtseo.com/learn-seo/nuxt/mastering-meta/titles
    note: 標題模板與搜尋結果可讀性的基準。
  - title: "Nuxt SEO Learn: Meta Descriptions"
    href: https://nuxtseo.com/learn-seo/nuxt/mastering-meta/descriptions
    note: 釐清 description 是點擊率訊號，不只是補欄位。
  - title: "Nuxt SEO Learn: Social Sharing (Open Graph)"
    href: https://nuxtseo.com/learn-seo/nuxt/mastering-meta/open-graph
    note: 對照 OG preview 與社群分享卡片策略。
  - title: "Nuxt SEO Learn: Schema.org"
    href: https://nuxtseo.com/learn-seo/nuxt/mastering-meta/schema-org
    note: 幫助規劃內容頁、列表頁與圖片 schema。
  - title: "Nuxt SEO Learn: Twitter Cards"
    href: https://nuxtseo.com/learn-seo/nuxt/mastering-meta/twitter-cards
    note: 補足 OG 以外的平台預覽差異。
schemaOrg:
  - "@type": "BlogPosting"
    headline: "Nuxt Meta、OG 與 Schema.org：從 front matter 到分享預覽"
    description: "以 Nuxt 內容網站為例，整理如何把 title、description、image、tags 等 front matter 推導成頁面 meta、Open Graph、Twitter Card 與 Schema.org，降低手動維護成本。"
    author:
      "@type": "Person"
      name: "BarZ Hsieh"
    datePublished: "2026-05-25"
    dateModified: "2026-05-25"
    image: "/blog-images/nuxt-seo-guide.webp"
    keywords: ["Nuxt Metadata", "Open Graph", "Schema.org", "Twitter Cards", "Front Matter SEO"]
    articleSection: "TechArticle"

sitemap:
  lastmod: 2026-05-25
  images:
    - loc: /page-cover/blog.webp
      title: "Nuxt Meta 與 Schema.org 實作"
      caption: "從 front matter 推導頁面 meta、OG image 與結構化資料。"
---

如果 sitemap 與 robots 決定了搜尋引擎能不能發現頁面，那麼 meta、OG 與 Schema.org 就決定了它看見你之後，是否能正確理解內容，並且在搜尋結果與社群分享時呈現一致。這篇文章聚焦在「怎麼少手動、少重複，卻還能維持高品質」。

## 先把 page-level meta 集中在一個入口

內容站最容易退化的地方，就是每個頁面各自決定 title、description、og:image、robots。表面上很靈活，實際上會讓同一個內容在不同層有不同版本。比較穩定的做法是先建立一個 page-level SEO composable，統一處理：

- title / description
- canonical URL
- Open Graph 與 Twitter Card
- robots
- locale 與 alternates

一旦預設值集中，你就能在文章、專案、清單頁之間共用同一套邏輯，而不是每種頁型都自己補一次。

## 內容頁最省力的方式：從 front matter 推導

對文章或專案頁，我會把內容作者真正需要維護的欄位控制在少數幾個：

- `title`
- `description`
- `image` 或 `ogImage`
- `tags`
- `published`

其餘像是 keywords、share preview 的 title/description、甚至部分 schema 欄位，都可以從這些資料往外推導。這有兩個好處：

1. 作者只維護內容真相，不用記住每個 SEO 細節。
2. 同一份資料可以同時餵給 meta、schema、sitemap。

簡化後的資料流大概會像這樣：

```ts
const data = computed(() => ({
  title: post.value?.seoTitle || post.value?.title,
  description: post.value?.seoDescription || post.value?.description,
  image: post.value?.ogImage || post.value?.image,
  keywords: post.value?.tags,
  noIndex: post.value?.published === false,
}))

useContentSEO(data)
```

這個方向也和 [雙語內容架構那篇](/zh/posts/nuxt-content-v3-i18n-bilingual-site/) 一致：front matter 應該先服務內容模型，再讓 SEO 層去讀它。

## OG image、Twitter Card 與分享預覽不是附加功能

很多內容站會把 OG image 視為「有空再做」。但對技術文章或作品集來說，社群分享就是流量入口之一。只要有人把你的文章貼到 Slack、LinkedIn、X 或 Discord，OG preview 就直接影響點擊意願。

這裡我會特別注意三件事：

- `og:url` 與 canonical 使用同一個正式網址來源
- `og:image` 不要在 production 與 preview 環境切來切去
- title / description 在搜尋結果與社群預覽不要完全兩套語氣

如果你的站點還有大量圖片內容，那 [圖片自動化管理與 Schema.org 那篇](/zh/posts/image-management-pipeline/) 會是很好的搭配閱讀，因為圖片 metadata 不只影響 LightBox，也會影響分享與結構化資料的品質。

## Schema.org 不只服務文章

很多人第一次接觸 schema，只想到 `BlogPosting`。但對內容型網站來說，更重要的是建立一個一致的頁型對應：

- 首頁：`ProfilePage` 或 `WebSite`
- 文章列表 / 專案列表：`CollectionPage` + `ItemList`
- 內容詳情：`WebPage` + `BlogPosting` 或 `CreativeWork`
- 相簿或作品圖：`ImageObject`

特別是作品集與相簿內容，圖片授權、作者、creditText 這些欄位都很值得放進 schema。它們不只是技術炫技，而是讓搜尋引擎真的理解你的媒體資產。

## 什麼時候要分開 `seoTitle` / `seoDescription`？

我傾向把 `title` 與 `description` 當成主要真相欄位，只有在這兩種情況下才額外寫 `seoTitle` / `seoDescription`：

- 畫面上的標題比較文學、比較長，但搜尋結果需要更明確的關鍵字
- 頁面前言需要照顧閱讀節奏，但 SERP snippet 需要更精準的利益點

如果每篇文章都同時維護四種標題與描述，長期一定失控。額外欄位應該是例外，而不是預設。

## 發佈前的最小檢查

- [ ] `title`、`description`、`canonical`、`og:url` 是否都指向同一篇內容
- [ ] OG image 在本機、preview、production 是否都能正確載入
- [ ] schema 是否使用了對應頁型，而不是所有頁面都塞 `BlogPosting`
- [ ] 若有 `seoTitle` / `seoDescription`，是否真的改善搜尋意圖，而不是只是重寫一次

## 總結

好的 metadata 系統，不是每個欄位都可以客製，而是讓內容作者只維護少量真相欄位，剩下由程式一致地推導。當這一層穩定之後，再去處理 [Nuxt canonical、i18n 與 internal linking](/zh/posts/nuxt-canonical-i18n-internal-linking/) 就會順得多，因為你已經知道每個 URL 上真正代表頁面的資料是什麼。
