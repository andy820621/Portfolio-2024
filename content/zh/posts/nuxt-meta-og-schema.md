---
title: Nuxt Meta、OG、Twitter Card 與 Schema.org：網頁 metadata 分層實作
date: 2026-05-25
updatedAt: 2026-06-01
description: 以個人雙語 Nuxt 部落格網頁為例，整理 front matter、useSeoMeta、OG image、Twitter Card 與 Schema.org 在 metadata 系統中的實際分工。
seoTitle: "Nuxt 網頁 metadata 實作：Meta、OG 與 Schema.org"
seoDescription: "用個人網頁的實作案例說明 front matter、canonical、Open Graph、Twitter Card、OG image 與 Schema.org 的分層方式。"
image: /blog-images/nuxt-seo-guide.webp
alt: Nuxt Meta、OG、Twitter Card 與 Schema.org metadata 實作
ogImage:
  url: /blog-images/nuxt-seo-guide.webp
tags: ['Nuxt', 'SEO', 'Open Graph', 'Twitter Card', 'Schema.org', 'Metadata', 'i18n']
published: true
relatedPages:
  - path: /zh/posts/nuxt-seo-guide
  - path: /zh/posts/image-management-pipeline
  - path: /zh/posts/nuxt-canonical-i18n-internal-linking
  - path: /zh/posts/nuxt-content-v3-i18n-bilingual-site
relatedLinks:
  - title: "Nuxt 4 Docs: SEO and Meta"
    href: https://nuxt.com/docs/4.x/getting-started/seo-meta
    note: 對照 `useSeoMeta()`、`useHead()` 與 app-level head 的分工。
  - title: "`nuxt-schema-org`: How It Works"
    href: https://nuxtseo.com/docs/schema-org/guides/how-it-works
    note: 說明 JSON-LD 注入位置、production static 行為與 inferencing。
  - title: "`nuxt-schema-org`: Supported Nodes"
    href: https://nuxtseo.com/docs/schema-org/guides/nodes
    note: 用來對照 `WebSite`、`WebPage`、`Article`、`ImageObject`、`ItemList` 等節點。
  - title: "`nuxt-schema-org`: Setup Identity"
    href: https://nuxtseo.com/docs/schema-org/guides/setup-identity
    note: 對照個人網站使用 `Person` identity 的做法。
  - title: "Nuxt OG Image: defineOgImage()"
    href: https://nuxtseo.com/docs/og-image/api/define-og-image
    note: 對照動態 OG image、使用既有圖片與停用 OG image 的能力。
sitemap:
  images:
    - loc: /blog-images/nuxt-seo-guide.webp
      title: "Nuxt Meta、OG 與 Schema.org 實作"
      caption: "整理個人部落格網頁的 meta、OG image、Twitter Card 與 Schema.org 分層。"
---

當部落格網頁開始同時有文章、專案、相簿、分頁清單、多語系網址與社群分享需求時，metadata 問題通常不只是「有沒有補 `title` 和 `description`」。

我在規劃這個雙語 Nuxt 4 部落格網站時，真正需要考慮的是這幾個問題：

- 哪些欄位應該由內容作者在 front matter 維護？
- 哪些欄位應該由程式從同一份資料推導？
- canonical、`og:url`、Twitter Card、OG image 應該在哪一層決定？
- Schema.org 應該寫在 front matter，還是放在頁面程式碼？
- 文章頁、專案頁、列表頁、圖片頁，是否應該用同一種 schema？

## 先分清楚：metadata、分享預覽、Schema.org

- **meta / canonical / robots**：影響瀏覽器、搜尋引擎與 head tag。
- **Open Graph / Twitter Card**：決定連結被分享到 Slack、LinkedIn、X、Discord 時長什麼樣。
- **Schema.org**：用 JSON-LD 把頁面類型、作者、日期、圖片、清單結構講得更明確。

在 Nuxt 裡，這些資料可以彼此共用來源，但不代表應該寫在同一個地方。
Nuxt 官方文件把 `useSeoMeta()` 定位成型別安全的 SEO meta 入口；`nuxt-schema-org` 官方文件則明確說明，schema 會以 JSON-LD 注入頁面，production 以 SSR 靜態輸出為主。
因此我傾向於規劃成：**可以共用內容真相，但不要把所有責任硬塞進同一層 API。**

## 把 metadata 拆成四層

1. 內容層：front matter 與 content schema 決定作者真正要維護的欄位。
2. 全站層：`app.vue` 處理 title template、locale alternates、canonical 主幹、`WebSite` 與 `Person` identity。
3. 頁面層：`useContentSEO()` / `usePageSeo()` 負責 page-level meta、OG、Twitter Card，列表或分頁頁再由 `usePageSeo()` 覆寫 canonical。
4. 頁型層：各頁面自己用 `useSchemaOrg()` 補上符合頁型的 schema。

這樣拆的好處是，每一層只做自己最適合做的內容，不會把「分享預覽」、「搜尋理解」和「內容建模」混在一起。

## 內容層：front matter 只維護少量真實需要的欄位

在 `content.config.ts` 裡，文章與專案的 schema 大致圍繞這些欄位：

- `title`
- `description`
- `seoTitle`
- `seoDescription`
- `image`
- `alt`
- `ogImage`
- `tags`
- `published`
- `updatedAt`

## 全站層：`app.vue` 處理網站共用的 head 與 identity

這一層大概在做三件事：

- 套用整站 `titleTemplate`
- 透過 `useLocaleHead()` 整合多語系 alternate / canonical 類 URL，再做 trailing slash 與分頁 query 的正規化
- 定義全站層級的 `WebSite` 與 `Person`

`app.vue` 裡的 schema 大致是這樣：

```ts
useSchemaOrg([
  defineWebSite({
    '@id': websiteId,
    '@type': 'WebSite',
    name: 'BarZ Hsieh\'s Personal Portfolio Website',
    url: siteBaseUrl,
    publisher: { '@id': personId },
  }),
  definePerson({
    '@id': personId,
    '@type': 'Person',
    ...createPersonIdentity({ baseUrl: siteBaseUrl, imagePath: '/me.jpg' }),
  }),
])
```

這樣做的好處是，文章頁、專案頁、相簿頁就不需要每一頁重新宣告一次「這是誰的網站、誰是作者」。
頁面只要補自己的 `WebPage`、`Article`、`ImageObject` 即可。

## 頁面層：用 composable 統一 meta、canonical、OG 與 Twitter Card

這個專案分成兩個入口：

- `useContentSEO()`：給文章與專案這種內容詳情頁用
- `usePageSeo()`：給首頁、列表頁、相簿頁、license 頁等一般頁型用

`WrapperPost.vue` 會先把 front matter 欄位整理成一個 `data` 物件，再交給 `useContentSEO()`：

```ts
const data = computed(() => ({
  title: mainData.value?.title,
  description: mainData.value?.description,
  seoTitle: mainData.value?.seoTitle,
  seoDescription: mainData.value?.seoDescription,
  image: mainData.value?.image,
  alt: mainData.value?.alt,
  ogImage: mainData.value?.ogImage,
  tags: mainData.value?.tags || [],
  published: mainData.value?.published ?? true,
}))

useContentSEO(data)
```

而 `useContentSEO()` 做的事情是：

- `seoTitle ?? title` 當成 page title
- `seoDescription ?? description` 當成 description
- `tags + seoData.keywords` 合併成 keywords
- `buildCanonicalSiteUrl()` 推導 `og:url`
- `resolveStaticOgImageUrl()` / `resolveOgImageAlt()` 推導 OG 與 Twitter 圖片
- 在需要時輸出 `robots`

如果是列表頁、分頁頁這種不是內容詳情頁的頁型，`usePageSeo()` 還會額外處理可覆寫的 `canonicalUrl`、`publishedTime`、`modifiedTime` 與 `noIndexFollow`。像文章列表與專案列表的分頁 canonical，就是在這一層明確指定，而不是只靠全站預設。

這層的重點不是「集中管理比較漂亮」，而是避免每個頁面自己散寫 `useHead()` 與 `useSeoMeta()`。只要 metadata 規則集中，之後要改 canonical 規則、OG image fallback 或 Twitter Card 就不需要逐頁找。

## OG image

對部落格網頁和作品集來說，分享卡片本身就是流量入口。
這個專案的 OG image 來源設定有三種：

1. front matter 直接提供既有圖片
2. `ogImage` 提供自訂靜態 URL
3. 沒有靜態圖片時，server 端用 `defineOgImage()` 動態產生

`useContentSEO()` / `usePageSeo()` 裡設定：

```ts
if (import.meta.server && !data.value.noIndex && !ogImageUrl.value) {
  const dynamicOgImage = resolveDynamicOgImageDefinition(data.value.ogImage)

  if (dynamicOgImage) {
    defineOgImage(dynamicOgImage.component, {
      title: pageTitle.value,
      description: pageDescription.value,
      ...dynamicOgImage.props,
    }, {
      alt: ogImageAlt.value,
    })
  }
}
```

這和 Nuxt OG Image 官方文件的設計方向一致：`defineOgImage()` 可以使用既有圖片、渲染動態圖片，或直接停用 OG image。

真正重要的是**OG 與 Twitter 不應該有兩條各自獨立的圖片邏輯**。
我傾向於直接讓 `og:image` 與 `twitter:image` 共用同一個 `ogImageUrl` / `ogImageAlt`，比較不容易出現漂移。

## Schema.org 不放在 front matter，而是依頁型決定

### 文章與專案詳情頁

文章頁 `app/pages/posts/[post].vue` 會補：

- `WebPage`
- `Breadcrumb`
- `BlogPosting`

而專案頁除了 `WebPage`、`Breadcrumb`、`Article` 之外，還需額外補一個 `ImageObject`，把作品圖的 license、creator、creditText 一起帶進去。
這比較符合我的個人網站場景：專案頁不只是文章，它還承載作品圖、授權資訊與視覺資產本身。

### 列表頁不是 `BlogPosting`

文章列表頁與專案列表頁也不是偷懶全部塞成文章，而是用：

- `CollectionPage`
- `ItemList`

在列表頁面我會把每篇文章組成 `ListItem`，再掛到 `ItemList` 下。
這種做法比起「列表頁也硬塞一個 `BlogPosting`」更符合頁面本質，也更接近 `nuxt-schema-org` 官方文件對 supported nodes 的思路。

### schema 和 meta 是共用資料，不是共用 API

`nuxt-schema-org` 官方文件提到，schema 會根據頁面已提供的 `title`、`description`、`image`、`date` 等資訊做 inferencing。
但很多情況下 head tags 的做法並不是用於每個頁面。

我比較推薦的架構是：

- meta / OG / Twitter Card：解決 head 與分享預覽
- `useSchemaOrg()`：解決頁型語意與結構化資料
- front matter：提供共同的內容來源

這樣三層就能分工合作，但不會彼此互相牴觸。

## 上線前我會怎麼檢查？

這類 metadata 重構最怕的不是少一個 tag，而是不同層互相打架。我的最小檢查會長這樣：

- [ ] 抽查一篇文章，確認 `title`、`description`、canonical、`og:url` 指向同一個正式 URL
- [ ] 抽查一篇專案，確認 OG image、`ImageObject`、license 與圖片本身是一致的
- [ ] 抽查文章列表頁與專案列表頁，確認 schema 是 `CollectionPage + ItemList`，不是把列表頁誤當文章頁
- [ ] 檢查整站輸出的 alternate links 與 canonical 沒有因分頁 query 或 trailing slash 出現漂移
- [ ] 在 preview 與 production 看分享預覽，確認 `og:image` / `twitter:image` 沒有切到錯的網址或 fallback
- [ ] 如果有寫 `seoTitle` / `seoDescription`，確認它是真的改善搜尋意圖，而不是單純換句話說

## 總結

最後整理我在這個 Nuxt 個人網站裡對 metadata 的分工方式：

- front matter：維護內容真相欄位
- `app.vue`：維護全站 head 規則與 `WebSite` / `Person` identity
- `useContentSEO()` / `usePageSeo()`：維護 page-level meta、OG、Twitter Card，並在需要時覆寫 canonical
- `useSchemaOrg()`：依頁型補 `WebPage`、`BlogPosting`、`Article`、`ItemList`、`ImageObject`
