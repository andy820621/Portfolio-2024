---
title: Nuxt Canonical、i18n 與 Internal Linking：網址訊號分層實作
date: 2026-05-25
updatedAt: 2026-06-01
description: 以個人雙語 Nuxt 部落格網頁為例，整理 canonical URL、pagination query、trailing slash、locale alternates 與 related pages 在網址訊號中的實際分工。
seoTitle: "Nuxt 網址訊號實作：Canonical、i18n 與 Internal Linking"
seoDescription: "用個人網頁的實作案例說明 canonical URL、hreflang、pagination canonical、trailing slash 與站內 related pages 的設計方式。"
image: /blog-images/nuxt-seo-guide.webp
alt: Nuxt Canonical、i18n 與 Internal Linking 網址訊號實作
ogImage:
  url: /blog-images/nuxt-seo-guide.webp
tags: ['Nuxt', 'SEO', 'Canonical', 'i18n', 'Internal Linking', 'Hreflang']
published: true
relatedPages:
  - path: /zh/posts/nuxt-seo-guide
  - path: /zh/posts/nuxt-sitemaps-robots-indexing
  - path: /zh/posts/nuxt-content-v3-i18n-bilingual-site
  - path: /zh/posts/nuxt4-portfolio-architecture
relatedLinks:
  - title: "Canonical URLs in Nuxt · Nuxt SEO"
    href: https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/canonical-urls
    note: 對照 canonical 是提示而不是強制，以及 query param 的實務策略。
  - title: "Hreflang Tags in Nuxt · Nuxt SEO"
    href: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/i18n
    note: 對照多語系 canonical 與 hreflang 必須指向可索引 canonical URL。
  - title: "Trailing Slashes in Nuxt · Nuxt SEO"
    href: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/trailing-slashes
    note: 對照 trailing slash 一致性、canonical 與 redirect 的配合方式。
  - title: "How to specify a canonical URL · Google Search Central"
    href: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
    note: 補 canonical 與 hreflang 同語言對應的 Google 官方原則。
  - title: "Internal Linking · Nuxt SEO"
    href: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/internal-linking
    note: 對照文章 cluster、hub-and-spoke 與站內主題訊號。
sitemap:
  images:
    - loc: /blog-images/nuxt-seo-guide.webp
      title: "Nuxt Canonical 與 i18n 實作"
      caption: "整理個人部落格網頁的 canonical、hreflang、pagination 與 internal linking 分層。"
---

當部落格網頁開始同時有英文、中文、分頁列表、query parameters、相同內容的不同網址形式，以及系列文章彼此互相連結時，SEO 問題通常不只是「少一個 canonical tag」。

我在規劃這個雙語 Nuxt 4 部落格網站時，真正需要考慮的是這幾個問題：

- 同一頁如果同時有 `/path` 和 `/path/`，哪一個才是正式 URL？
- pagination 的 `?page=2` 可以保留，那 `?page=1` 該不該存在？
- alternates / hreflang 應該在哪一層產生，才不會和 canonical 打架？
- 中文頁和英文頁是互譯版本，還是其中一個覆蓋另一個？
- `relatedPages` 這種站內延伸閱讀，要怎麼兼顧語系、路徑與回鏈關係？

這篇文章聚焦的不是 canonical 的抽象定義，而是我怎麼在這個個人網站裡把網址訊號拆成幾層，讓 canonical、i18n 與 internal linking 指向同一套 URL policy。

## 先分清楚 canonical、hreflang、internal linking 分別在解什麼問題

這三者都在處理網址訊號，但責任不同：

- **canonical**：告訴搜尋引擎哪個 URL 才是這份內容最正式的版本。
- **hreflang / alternates**：告訴搜尋引擎不同語系之間的對應關係。
- **internal linking**：告訴搜尋引擎與讀者，站內哪些頁面彼此屬於同一個主題脈絡。

如果三者沒有分清楚，最常見的結果就是：

- canonical 指到 A URL
- hreflang 指到 B URL
- 站內連結卻大量指向 C URL

這會變得搜尋引擎很難判斷你自己到底想讓哪個 URL 代表這份內容。

## 我把網址訊號拆成四層

我最後不是靠單一 helper 解決全部問題，而是拆成四層：

1. 路徑層：`pathUtils.ts` 決定 canonical path 要怎麼正規化。
2. 全站層：`app.vue` + `useLocaleHead()` 處理 alternates、trailing slash 與分頁 query 的整站輸出。
3. 頁面層：`usePageSeo()` 決定哪些頁面需要自訂 canonical。
4. 內容層：`relatedPages` + `useRelatedPages()` 處理站內主題回鏈與語系對應。

這樣拆的好處是：canonical 不會只是 head 裡的一串字，i18n 也不只是「把 `/zh` 補上去」而已，而是每一層都對同一套 URL policy 負責。

## 路徑層：先決定 canonical path 的樣子

穩定的 canonical path 會讓後續的 sitemap、分享網址、schema URL、breadcrumbs 等等都能更好維護。

這個 repo 在 `app/utils/pathUtils.ts` 裡先把 canonical path 的基礎規則定義清楚：

```ts
export function canonicalizePagePath(path: string) {
  const normalizedPath = normalizePath(path)

  if (!normalizedPath || normalizedPath === '/')
    return normalizedPath || '/'

  return normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`
}

export function buildCanonicalSiteUrl(baseUrl: string, path: string) {
  const normalizedBaseUrl = normalizeBaseSiteUrl(baseUrl)
  const canonicalPath = encodeCanonicalPagePath(path)
  return `${normalizedBaseUrl}${canonicalPath}`
}
```

我的決策重點很簡單：**這個站把 trailing slash 視為 canonical URL 的一部分**。

> 統一整個網站對 slash 的看法，避免訊號就會被拆開。

## 全站層：`app.vue` 負責 alternates、canonical 類 URL 與分頁 query

多語系 canonical 最容易被低估的地方，是你以為頁面層自己補 canonical 就夠了，但 alternates / hreflang 其實是另一條管線。

我在個人網頁的 `app.vue` 用 `useLocaleHead({ seo: true })` 抓出 i18n 自動生成的 head，再做兩個整站級處理：

1. 正規化 alternate / canonical / `og:url` / `twitter:url` 的 trailing slash
2. 如果目前是第 2 頁以上，替 alternate URLs 同步補上 `?page=`

核心邏輯大概是這樣：

```ts
const links = computed(() => localeHead.value.link?.map((link) => {
  const normalizedHref = trailingSlashUrlOrNot(link.href)

  if (link.rel === 'alternate') {
    return {
      ...link,
      href: withPaginationQuery(normalizedHref),
    }
  }

  return {
    ...link,
    href: normalizedHref,
  }
}) || [])
```

這代表多語系 alternates 並不是每頁自己手動維護，而是由 `@nuxtjs/i18n` 產生，再由 app-level head 統一補齊 slash 與 pagination query。

這個分層很重要，因為它把「語系對應」和「頁面個別文案」分開了。
canonical 不該每頁各寫一套 alternates；alternates 也不該自己長出和 canonical 不同的 URL 格式。

## 頁面層：明確 pagination canonical

我在文章列表頁會明確計算分頁 canonical：

```ts
const paginatedCanonicalUrl = computed(() => buildCanonicalSiteUrlWithQuery(baseUrl.value, route.path, {
  page: pageNumber.value > 1 ? pageNumber.value : undefined,
}))

usePageSeo({
  title: seoTitle,
  description: seoDescription,
  canonicalUrl: paginatedCanonicalUrl,
})
```

這裡的規則其實很清楚：

- 第 1 頁：canonical 不帶 `?page=1`
- 第 2 頁以上：canonical 保留 `?page=2`、`?page=3` ...

也就是說，這個站沒有把所有 query parameters 一律視為「非正式 URL」。

我對 query parameter 的規劃是：

- **分頁參數** 如果真的代表不同內容切面，可以進 canonical
- **追蹤參數** 例如 `utm_*`，不應該成為 canonical
- **純篩選參數** 是否保留，要看它是不是你願意讓搜尋引擎當成正式列表頁索引

## i18n：每個語系都要有自己的 canonical

這個站使用 `prefix_except_default`：

- 英文：`/posts/...`
- 中文：`/zh/posts/...`

這代表中英文頁面不是互相覆蓋，而是**各自有自己的 canonical URL，再透過 alternates / hreflang 建立對應關係**。

Google Search Central 對這件事的原則也很明確：如果你有 `hreflang`，canonical 最好指向同語言頁面，或至少指向最接近的替代語言版本。

對這個網站來說，實作原則就是：

- 中文頁 canonical 指向中文頁
- 英文頁 canonical 指向英文頁
- alternates 負責把兩者關聯起來

## internal linking：`relatedPages` 不只是延伸閱讀，而是主題回鏈

透過 internal linking 把整個網頁的訊號正確的連結。

我在 markdown 的 frontmatter 裡把站內與站外連結刻意分開：

- `relatedPages`：站內延伸閱讀
- `relatedLinks`：站外參考資料

而 `useRelatedPages()` 做了幾件實用的事：

- 去掉 query / hash，避免 lookup path 被雜訊污染
- 判斷 path 本身有沒有語系前綴
- 如果 path 沒有語系前綴，就用 `localePath()` 補上當前語系
- 依 path section 與 locale 解析應該查哪個 collection
- 只查 `published = true` 的頁面

> 關鍵: 讓 `relatedPages` 不只是模板裡的一串網址，而是和語系、collection、published 狀態綁在一起。

對 SEO 系列文來說，這也剛好對應我想建立的 cluster：

- 母文提供系列入口
- 各篇深文聚焦單一搜尋意圖
- 深文之間透過 `relatedPages` 做橫向連結與回鏈

> internal linking 在這裡不單單只是「多放幾個延伸閱讀」，而是讓 canonical URL 不只存在於 head，也存在於站內主題路徑裡。

## 哪些 URL 最值得優先檢查？

如果你要找 canonical / i18n 問題，我會先看這幾種網址：

- `/path` 與 `/path/` 是否同時存在
- 第 1 頁和 `?page=1` 是否同時被當成正式版
- alternate URL 是否和目前 canonical 使用相同的 slash 規則
- 中文頁與英文頁是否彼此 canonical 到對方
- 站內 related pages 是否指到錯語系、未發布頁或不一致的 lookup path

## 上線前我會怎麼檢查？

- [ ] 抽查一篇文章與一個專案，確認 canonical URL 都是帶 trailing slash 的正式版本
- [ ] 抽查文章列表第 1 頁與第 2 頁，確認 canonical 對 `?page=` 的保留規則正確
- [ ] 檢查 `app.vue` 輸出的 alternate links，確認語系 URL 與 pagination query 都和當前頁一致
- [ ] 確認中文與英文頁面彼此對應，但 canonical 沒有互相覆蓋
- [ ] 抽查 `relatedPages` 連到的頁面，確認語系、title 與 published 狀態都正確
- [ ] 檢查 sitemap、schema、breadcrumbs 與站內分享 URL 是否都使用同一套 canonical path 規則

## 總結

最後整理我在這個 Nuxt 個人網站裡對網址訊號的分工方式：

- `pathUtils.ts`：定義 canonical path 與正式 URL 形式
- `app.vue` + `useLocaleHead()`：統一處理 alternates、slash 正規化與 pagination query
- `usePageSeo()`：在列表與分頁頁明確覆寫 canonical
- `relatedPages` + `useRelatedPages()`：把 internal linking 變成真正有語系與發布狀態意識的站內回鏈

canonical、i18n 與 internal linking 的本質，都是在替 URL 排秩序。
只要統一規則，搜尋引擎看到的就是一組結構清楚、語意一致的正式網址。
