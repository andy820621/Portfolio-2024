---
title: Nuxt Sitemap、robots.txt、X-Robots-Tag 與 noindex：網頁索引控制實作
date: 2026-05-25
updatedAt: 2026-06-01
description: 以個人雙語 Nuxt 部落格網頁為例，整理 sitemap、robots.txt、meta robots、X-Robots-Tag 與 routeRules 在索引控制中的實際分工。
seoTitle: "Nuxt 網頁索引控制實作：Sitemap、robots.txt 與 noindex"
seoDescription: "用個人網頁作為實作案例說明 sitemap、robots.txt、X-Robots-Tag、meta robots、routeRules 與非 production noindex 的分工。"
image: /blog-images/nuxt-seo-guide.webp
alt: Nuxt 網頁 sitemap、robots.txt 與 noindex 索引控制實作
ogImage:
  url: /blog-images/nuxt-seo-guide.webp
tags: ['Nuxt', 'SEO', 'Sitemap', 'robots.txt', 'X-Robots-Tag', 'noindex', 'i18n']
published: true
relatedPages:
  - path: /zh/posts/nuxt-seo-guide
  - path: /zh/posts/nuxt-canonical-i18n-internal-linking
  - path: /zh/posts/nitro-prerender-dynamic-routes-solution
  - path: /zh/posts/nuxt-content-v3-i18n-bilingual-site
relatedLinks:
  - title: "Google Search Central: Block Search indexing with noindex"
    href: https://developers.google.com/search/docs/crawling-indexing/block-indexing
    note: 說明 noindex 與 robots.txt 的邊界，以及 X-Robots-Tag 的使用時機。
  - title: "Nuxt Sitemap: Introduction"
    href: https://nuxtseo.com/docs/sitemap/getting-started/introduction
    note: 對照 sitemap 的自動 lastmod、image discovery、i18n 支援。
  - title: "Nuxt Sitemap: I18n"
    href: https://nuxtseo.com/docs/sitemap/guides/i18n
    note: 補充多語系 sitemap 與 locale route 轉換的處理方式。
  - title: "Nuxt Robots: Config Using Route Rules"
    href: https://nuxtseo.com/docs/robots/guides/route-rules
    note: 對照 `routeRules` 上的 `robots`、`index` 與 `X-Robots-Tag` 行為。
  - title: "Nuxt Robots: Nuxt Config"
    href: https://nuxtseo.com/docs/robots/api/config
    note: 參考 `groups`、`blockNonSeoBots`、`blockAiBots` 等全域設定。
sitemap:
  images:
    - loc: /blog-images/nuxt-seo-guide.webp
      title: "Nuxt Sitemap、robots.txt 與 noindex"
      caption: "整理 Nuxt 部落格網頁的 sitemap、robots.txt、meta robots 與 X-Robots-Tag。"
---

當部落格網頁開始有文章、作品、相簿、API route、deploy preview 與多語系路徑時，SEO 問題通常不只是「有沒有產生 `/sitemap.xml`」。

我在規劃這個雙語 Nuxt 4 部落格網站時，真正需要考慮的是這幾個問題：

- 哪些內容有資格被放進 sitemap？
- 哪些 URL 可以被 crawler 抓取？
- 哪些頁面或資源即使被抓到，也不應該進入搜尋索引？
- deploy preview、staging 這類非正式環境，要怎麼避免被搜尋引擎收錄？
- 圖片資源、API route、AI crawler policy 要不要跟一般文章頁分開處理？

如果這些規則沒有拆清楚，很容易出現矛盾。
例如草稿文章被放進 sitemap、preview 網址被收錄、API route 出現在搜尋結果。
又或是同一個 URL 一邊出現在 sitemap，另一邊又被 robots.txt 擋住。

本篇文章會聚焦在「索引控制」的細節及設計原因。我會用我的個人網站的設定為例，拆解 `content.config.ts`、`nuxt.config.ts`、`routeRules`、deployment headers 與 SEO composables 各自負責什麼，以及為什麼我最後選擇這樣設計與分層。

## 先分清楚：發現、抓取、索引是三件事

在設定 sitemap、robots.txt、noindex 之前，需先釐清三者的功用：

- **sitemap**：告訴搜尋引擎哪些 URL 值得被發現。
- **robots.txt**：控制 crawler 能不能抓取某些路徑。
- **meta robots / X-Robots-Tag**：控制頁面或資源被抓到之後，能不能進入索引。

### 這裡最容易搞混的是 `robots.txt` 和 `noindex`

`robots.txt` 是「不要來抓這個路徑」，但 `noindex` 是「你可以看到這個內容，但不要把它放進搜尋結果」。
也就是說，如果一個 URL 先被 `robots.txt` 擋住，crawler 反而可能看不到頁面上的 `noindex`。
所以盡量別把 `robots.txt` 當成 `noindex` 的替代品。比較穩的理解方式是：

- `sitemap` 負責讓公開 URL 被發現
- `robots.txt` 負責限制 crawler 的抓取範圍
- `noindex` / `X-Robots-Tag` 負責告訴搜尋引擎是否能索引

## 我的個人網頁把索引控制拆成四層

我最後沒有把所有規則都塞進 sitemap 或 robots.txt，而是拆成四層：

1. 內容層：決定哪些內容有資格公開
2. 路由層：決定哪些 URL 可以被索引
3. 部署層：決定哪個環境完全不能被索引
4. 頁面層：統一輸出 HTML 頁面的 robots meta

這樣做的好處是每一層只處理自己的責任，不需要在很多地方重複判斷同一件事。

## 內容層：用 collection schema 決定哪些內容能進 sitemap

在 `content.config.ts` 裡，我把 `posts_en`、`posts_zh`、`projects_en`、`projects_zh` 這幾個 collection 都掛上 SEO 相關 schema：

```ts
function createSeoSchemaFields(name: string, onUrl?: (url: { loc: string }) => void) {
  return {
    robots: defineRobotsSchema(),
    ogImage: defineOgImageSchema(),
    sitemap: defineSitemapSchema({
      z,
      name,
      filter: entry => entry.published !== false,
      ...(onUrl ? { onUrl } : {}),
    }),
  }
}
```

### `published: false`

```ts
filter: entry => entry.published !== false
```

我希望 `published: false` 的判斷在內容 schema 這一層就完成，而不是等到產生 sitemap、列表頁、related pages 或 prerender routes 時才各自補一次。

原因是部落格網頁很容易出現「同一篇文章在不同功能裡有不同公開狀態」的問題。例如：

- 文章列表沒有顯示草稿，但 sitemap 裡還有
- sitemap 排除了草稿，但 related pages 還連得到
- prerender routes 仍然把 unpublished content 打包進去
- 中英文 collection 的路徑規則不一致

所以這一層的重點不是「讓 sitemap 可以吃 frontmatter」，而是把 `published` 規則集中在內容來源附近。只要內容沒有資格公開，後面的 sitemap、列表頁、prerender 就不應該再把它當成公開內容處理。

## 路由層：用 routeRules 處理不同類型的 URL

我沒有把所有 URL 都當成一般頁面處理，因為文章頁、列表頁、API route、圖片資源的索引規則其實不一樣。

例如公開列表頁會明確開放索引，並設定 sitemap 的 `lastmod`：

```ts
routeRules: {
  '/posts': {
    prerender: true,
    robots: true,
    sitemap: { lastmod: listPageLastmod.en.posts },
  },
  '/zh/posts': {
    prerender: true,
    robots: true,
    sitemap: { lastmod: listPageLastmod.zh.posts },
  },
}
```

這裡不是單純為了讓 `/posts` 出現在 sitemap，而是希望列表頁的狀態是明確的：

- 它是公開頁面
- 它可以 prerender
- 它可以被索引
- 它的 `lastmod` 會跟內容更新時間同步

`listPageLastmod` 會去掃文章的 frontmatter 日期，讓列表頁的更新時間可以跟著內容變動，而不是手動維護。

這對部落格網頁很實用，因為列表頁本身不一定常改程式碼，但只要文章或專案更新，列表頁對搜尋引擎來說也算是有更新。

## API route：用 X-Robots-Tag，而不是 meta robots

API route 的處理方式跟 HTML 頁面不同。

```ts
routeRules: {
  '/api/**': {
    headers: { 'X-Robots-Tag': 'noindex' },
  },
}
```

我會用 `X-Robots-Tag`，原因是 `/api/**` 回傳的不一定是 HTML。既然不是 HTML，就不能期待它有 `<meta name="robots">` 可以被讀到。

這類 URL 的目標也很明確：它們可以被應用程式使用，但不應該成為搜尋結果的一部分。

所以 API route 的索引控制放在 response header 會比放在頁面 composable 更合理。

## 圖片與靜態資源：索引規則要跟文章頁分開

圖片資源也不是全部都應該跟文章頁套同一套規則。

例如我的個人網頁對 `/gallery-images/**` 做了更嚴格的設定：

```ts
routeRules: {
  '/gallery-images/**': {
    index: false,
    robots: {
      noindex: true,
      noai: true,
      noimageai: true,
    },
  },
}
```

這裡的重點不是只防止圖片 URL 出現在搜尋結果，而是把媒體資源的使用邊界也一起定義清楚。

文章頁可以被搜尋引擎索引，不代表相簿原圖、作品圖片或內部資產也要用同樣方式開放。尤其現在很多 crawler 不只是搜尋用途，還可能涉及 AI 訓練、圖片理解或內容重用，所以我會把圖片資源的 policy 跟一般內容頁分開。

同樣地，靜態資源目錄，也不一定需要自己出現在搜尋結果。
它們通常是頁面內容的一部分，而不是獨立的 landing page。

## 部署層：非 production 環境全站 noindex

如果只能保留一個保護措施，我會優先保留這一層。

我的個人網頁會透過 `isSearchIndexableDeployment` 判斷目前是不是正式可索引環境：

```ts
const isSearchIndexableDeployment
  = isProduction && (!isNetlify || process.env.CONTEXT === 'production')

function getSecurityHeaders() {
  return {
    ...(!isSearchIndexableDeployment
      ? { 'X-Robots-Tag': 'noindex, nofollow' }
      : {}),
  }
}
```

這代表只要不是正式 production，例如 Netlify deploy preview、staging 或其他測試部署，就會在 response header 加上：

```txt
X-Robots-Tag: noindex, nofollow
```

這樣做的原因很簡單：preview 網址被搜尋引擎收錄，是部落格網頁很常見也很麻煩的問題。

## 頁面層：用 composable 統一 robots meta

頁面的 robots meta 我則是收斂在 `useContentSEO.ts` 與 `usePageSEO.ts`統一設定：

```ts
const robots = computed(() => {
  if (resolveOption(options.noIndexFollow))
    return 'noindex, follow'

  if (resolveOption(options.noIndex))
    return 'noindex, nofollow'

  return 'index, follow'
})
```

這一層的價值不是「多一個地方設定 robots」，而是避免每個頁面自己去維護 `useHead()`。

如果某些頁面需要例外，例如分頁、內部頁、搜尋結果頁，就透過同一個 composable 傳入 `noIndex` 或 `noIndexFollow`。

這樣未來調整規則時，只需要看 composable 的行為，不需要在整個專案搜尋每一個頁面有沒有自己寫 robots meta。

## 不單單依靠 sitemap

Nuxt Sitemap 的自動能力很方便，我的個人網頁也有設定：

- `discoverImages: true`
- `discoverVideos: true`
- `autoI18n: true`
- `zeroRuntime: isProduction`
- `exclude` 排除部分不需要進 sitemap 的路由

但我不會只靠自動 sitemap。
原因是自動掃描可以幫你減少漏掉 URL，卻不一定知道專案裡真正的內容策略。
例如它不一定知道：

- 哪些 Markdown 是 `published: false`
- 哪些部署環境不應該被索引
- 哪些圖片資源不希望被 AI crawler 使用
- 哪些列表頁的 `lastmod` 應該跟內容更新時間同步
- 哪些動態路由雖然存在，但不適合放進 sitemap

所以我比較建議的做法是：

讓 sitemap module 負責自動化與減少漏網，但公開規則要由 content schema、routeRules 和 deployment headers 定義。

## 多語系 sitemap 不要等到 template 才補路徑

這個站使用 `@nuxtjs/i18n` 的 `prefix_except_default` 策略，所以英文路徑是：

```txt
/posts/...
```

中文路徑是：

```txt
/zh/posts/...
```

多語系網站很容易在這裡出問題。如果 sitemap、canonical、hreflang、頁面連結各自用不同方式組 URL，最後就可能出現：

- 頁面實際路徑是 `/zh/...`，但 sitemap 輸出英文 URL
- canonical 指向一套規則，hreflang 指向另一套規則
- 自訂動態路由只產生 default locale，沒有中文版本
- related pages 手動補路徑時跟 i18n routing 不一致

所以我會盡量讓語系路徑在 collection source、routeRules 與 i18n 設定裡就定下來，再讓 `sitemap.autoI18n` 接手 locale-aware 的輸出。

如果之後需要用 `defineSitemapEventHandler()` 自己補動態 URL，我也會在 sitemap 層處理 locale transform，而不是把這件事留到 template 或元件裡面才補。

這樣 sitemap、canonical、hreflang 才比較容易維持同一套 URL policy。

## `robots.txt` 也要針對 AI 做相應的設計

我的個人網頁沒有擋掉所有 AI bot，而是把不同用途的 crawler 分開處理：

- 搜尋型 bot：允許抓公開頁面，但限制圖片目錄
- 使用者觸發的 fetch bot：允許讀公開內容，但同樣限制圖片目錄
- 訓練型 crawler：直接禁止全站抓取

例如 `robots.groups` 會區分：

- `OAI-SearchBot`
- `Claude-SearchBot`
- `PerplexityBot`
- `ChatGPT-User`
- `Claude-User`
- `GPTBot`
- `ClaudeBot`
- `Google-Extended`

這樣做的原因是，現在的 `robots.txt` 不只是傳統 SEO 設定，也是在定義內容和資源的使用邊界。

我的目標不是「所有 AI 相關 user-agent 全部擋掉」，而是根據用途做比較細的區分：

- 可以幫助搜尋或使用者讀取公開內容的 bot，可以允許
- 可能用於訓練或大規模重用內容的 bot，要限制
- 圖片、相簿、作品資源，比一般文章頁更嚴格

## 上線前我會怎麼驗證？

索引控制最怕的不是少設定，而是規則彼此矛盾。

我會用下面這幾個項目做最小驗證：

- [ ] 在 production 和 deploy preview 各打開同一路徑，確認 preview response header 有 `X-Robots-Tag: noindex, nofollow`
- [ ] 打開 `/robots.txt`，確認 sitemap URL、AI bot groups、disallow 規則符合目前策略
- [ ] 打開 `/sitemap.xml` 或 sitemap index，確認英文、中文、文章、專案、相簿列表頁都有正確輸出
- [ ] 確認 API route、沒有被放進 sitemap
- [ ] 抽查一篇公開文章，確認 canonical、hreflang、robots meta 正常
- [ ] 抽查一張 `/gallery-images/**` 圖片，確認圖片資源沒有被當成一般頁面索引
- [ ] 如果剛加上 `noindex`，用 Search Console 的 URL Inspection 送出重新檢查

> `noindex` 不是部署後立刻生效，它需要 crawler 重新抓到頁面或 response header 才會更新狀態。

## 總結

最後整理 Nuxt 部落格網頁的索引控制的分工策略：

- `content.config.ts`：決定內容是否有資格公開
- `routeRules`：決定不同 URL 類型的索引規則
- deployment headers：保護非 production 環境不被收錄
- SEO composables：統一輸出 HTML 頁面的 robots meta
- robots.txt：定義 crawler 的抓取範圍與 bot policy

這樣拆的好處是，sitemap、robots.txt、meta robots 與 `X-Robots-Tag` 不會互相搶責任。

對部落格網頁來說，sitemap 只是索引控制的一部分。真正重要的是先定義清楚哪些內容可以公開、哪些 URL 可以被抓、哪些資源不能索引，以及哪些部署環境根本不應該進搜尋結果。
