---
title: Nuxt canonical、i18n 與 internal linking：避免內容互搶排名
date: 2026-05-25
updatedAt: 2026-06-01
description: 針對雙語 Nuxt 內容網站，整理 canonical URL、query parameters、hreflang、trailing slash 與文章 cluster 的實作方式，避免重複內容與站內訊號互相打架。
seoTitle: "Nuxt Canonical、i18n 與 Internal Linking"
seoDescription: "整理 Nuxt 內容網站的 canonical URL、hreflang、多語系網址、query parameters 與 internal linking 策略。"
image: /blog-images/nuxt-seo-guide.webp
alt: Nuxt canonical、i18n 與 internal linking
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
  - title: "Nuxt SEO Learn: Canonical URLs"
    href: https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/canonical-urls
    note: 建立 canonical 決策的基本原則。
  - title: "Nuxt SEO Learn: Query Parameters"
    href: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/query-parameters
    note: 處理分頁、篩選與追蹤參數的 canonical 策略。
  - title: "Nuxt SEO Learn: Hreflang & i18n"
    href: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/i18n
    note: 對照多語系 URL 與語系對應規則。
  - title: "Nuxt SEO Learn: Internal Linking"
    href: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/internal-linking
    note: 幫助設計文章 cluster 與回鏈節奏。
  - title: "Nuxt SEO Learn: Trailing Slashes"
    href: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/trailing-slashes
    note: 避免 `/path` 與 `/path/` 兩種網址同時存在。
sitemap:
  images:
    - loc: /page-cover/blog.webp
      title: "Nuxt canonical 與 i18n 實作"
      caption: "整理 canonical、hreflang、query parameters 與文章 cluster 設計。"
---

當你的網站開始同時有英文、中文、分頁、搜尋參數、列表頁與系列文章之後，SEO 問題很容易從「我少了一個 meta tag」變成「我有太多看起來很像、但訊號彼此衝突的 URL」。這篇文章要處理的，就是這種規模化後的混亂。

## canonical 真正解決的是什麼？

canonical 的目的不是幫所有頁面「加一個標籤」，而是告訴搜尋引擎：**哪個 URL 才是這份內容最該被記住的正式版本**。常見情境包含：

- `/posts/article` 與 `/posts/article/` 同時存在
- 同一列表頁因為 `?page=`、`?tag=`、`?utm_...` 產生多個變體
- 中英文頁面彼此是對應語系，而不是互相取代

如果 canonical 沒想清楚，站內連結越多，反而越容易把權重分散到一堆變體 URL 上。

## Query parameters、pagination 與 trailing slash 要一起決定

對內容站來說，這三個問題通常要一起談：

- **pagination**：page 1 不應該跟根列表頁拆成兩個 canonical
- **query parameters**：篩選或追蹤參數通常不應該自己成為新 canonical
- **trailing slash**：整站應該一致，不要 template、sitemap、share URL 各用一套

這就是為什麼 canonical 不只是 head 裡的字串，而是整站 URL policy。你在 `pathUtils`、sitemap、分享 URL、redirect rule 用的規則，都應該是一致的。

## hreflang 與雙語內容不能只靠翻譯

中英文頁面不是 duplicate content，但前提是你有明確的語系對應。以雙語內容站來說，至少要守住三件事：

- 每個 locale 都有自己的正式 URL
- 語系切換不會把使用者送到不存在或語意不對的頁面
- alternates / hreflang 指向真正對應的語系版本

這也意味著你不應該把中文頁面的 canonical 指到英文頁，或反過來。多語系不是「兩個頁面挑一個算正式版」，而是「每個語系都有自己的正式版，彼此透過 hreflang 建立關係」。

## internal linking：把文章系列變成可理解的 cluster

internal linking 常被誤解成「多加幾個延伸閱讀」。我更在意的是它是否真的形成可理解的主題架構。以這組 SEO 系列來說：

- 母文負責提供總覽與導覽
- sitemap、metadata、canonical 三篇深文各自承接單一搜尋意圖
- 每篇深文都要能回鏈母文，並至少橫向連到一篇兄弟文

這也是我在內容層把連結拆成兩種欄位的原因：

- `relatedPages`：站內延伸閱讀，負責 cluster 與回鏈
- `relatedLinks`：外部參考，負責證據鏈與補充閱讀

如果這兩者混在一起，讀者與 crawler 都很難判斷哪些連結是在描述站內主題架構，哪些只是外部引用。

## 哪些頁面不該搶正式 URL？

以下幾種頁面最值得檢查：

- deploy preview、測試頁、搜尋結果頁
- 帶有追蹤參數的分享 URL
- 第 1 頁其實等於根列表頁的 pagination URL
- 同一路徑不同大小寫或不同 slash 形式的變體

這些頁面未必都需要 301 redirect；有些只要 canonical 或 noindex 就足夠。但你必須先明確知道哪一種 URL 才是正式版本。

## 發佈前的最小檢查

- [ ] 每篇文章與每個列表頁都只有一個你願意公開索引的 canonical URL
- [ ] 中英文頁面互相對應，但沒有互相覆蓋 canonical
- [ ] 分頁與 query parameter 不會自己長出新的正式 URL
- [ ] 系列文之間有清楚的 hub-and-spoke 連結，而不是只靠標籤聚合

## 總結

canonical、i18n 與 internal linking 的本質都是「替 URL 排秩序」。當 sitemap 告訴搜尋引擎去哪裡找內容、metadata 告訴它看到的是什麼，canonical 與連結架構則決定它最後該相信哪個 URL、該沿著哪條主題脈絡繼續走。這也是整個系列最後要收束的地方。
