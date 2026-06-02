---
title: "Nuxt Sitemap、robots.txt、X-Robots-Tag 與 noindex：網頁索引控制實作"
date: 2026-05-25
updatedAt: 2026-06-02
description: 以個人雙語 Nuxt 部落格網頁為例，詳解 sitemap、robots.txt、X-Robots-Tag、noindex、動態路由來源一致性，以及渲染模式如何影響可被發現的內容面。
seoTitle: "Nuxt Sitemap、robots.txt、X-Robots-Tag 與 noindex"
seoDescription: "整理 Nuxt sitemap、robots.txt、X-Robots-Tag、noindex、動態路由與渲染模式如何共同決定索引面。"
image: /blog-images/nuxt-seo-guide.webp
alt: Nuxt Sitemap、robots.txt、X-Robots-Tag 與 noindex
ogImage:
  url: /blog-images/nuxt-seo-guide.webp
tags: ['Nuxt', 'SEO', 'Sitemap', 'robots.txt', 'X-Robots-Tag', 'noindex']
published: true
relatedPages:
  - path: /zh/posts/nuxt-seo-guide
  - path: /zh/posts/nuxt-meta-og-schema
  - path: /zh/posts/nuxt-canonical-i18n-internal-linking
  - path: /zh/posts/nuxt-seo-checklist-monitoring-authority
  - path: /zh/posts/nuxt-url-lifecycle-redirects-llms
relatedLinks:
  - title: "Nuxt SEO Learn: Sitemaps"
    href: https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/sitemaps
    note: 如何透過套件或動態生成 Sitemap，並優化搜尋引擎抓取
  - title: "Nuxt SEO Learn: robots.txt"
    href: https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/robots-txt
    note: robots.txt 設定指南，介紹如何控管爬蟲存取、運用環境自動化配置，以及引進最新 AI 檢索治理策略。
  - title: "Nuxt SEO Learn: Robot Meta Tag"
    href: https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/meta-tags
    note: Meta Robots 標籤教學，指導如何設定頁面級檢索規則、控制 AI 摘要擷取，以及排除非 HTML 檔案的索引。
  - title: "Nuxt SEO Learn: Dynamic Routes"
    href: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/dynamic-routes
    note: Nuxt 動態路由 SEO 指南，介紹如何設定每條路由的獨特 Meta 標籤，並解決參數衍生重複內容的防範技巧。
  - title: "Nuxt SEO Learn: Rendering Modes"
    href: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/rendering
    note: Nuxt 混合渲染 SEO 指南，介紹如何混合使用 SSR、SSG、Islands 與 Edge 技術，以優化索引效率與網頁互動體驗（INP）。
sitemap:
  images:
    - loc: /blog-images/nuxt-seo-guide.webp
      title: "Nuxt Sitemap、robots.txt、X-Robots-Tag 與 noindex"
      caption: "聚焦 SEO 中發現、抓取與索引頁面的實作邊界"
---

## 哪些 Nuxt 頁面能被發現、被抓取，以及最後進入索引

我在規劃這個雙語 Nuxt 4 部落格網站時，真正需要考慮的是這幾個問題：

- 搜尋系統能不能知道這個 URL 存在
- 爬蟲能不能抓到這個 URL 的內容
- 就算抓到了，它應不應該被留下來當正式索引頁

sitemap、robots.txt、X-Robots-Tag、noindex 之所以容易出錯，就是因為太多人把它們當成同一套規則。

## 先分清楚：發現、抓取、索引是三件事

- **發現**：主要靠 sitemap、站內連結與外部連結。
- **抓取**：主要靠 robots 與 URL 可達性。
- **索引**：主要靠 noindex、header 規則與頁面品質。

## 內容來源要先一致，動態路由才不會分歧

Nuxt 部落格站最常見的索引問題是 **sitemap 與實際公開內容來自不同資料來源**。例如：

- prerender 是根據 content collection
- sitemap 是根據 route 定義
- 頁面顯示又依賴另一份手動名單

這種情況只要有一層忘記排除草稿、或一層沒有更新 slug，就會發生內容明明存在卻不在 sitemap，或 sitemap 仍然列著已退休頁的情況。
對動態路由來說，最穩定的做法不是讓 sitemap「猜」有哪些頁，而是直接從內容真相來源查出哪些頁面公開。

## 渲染模式會影響 crawler 看到的內容面

渲染模式（SSR、SSG、SWR）的差異不只是效能，而是會直接影響可被發現的內容：

- **SSG / prerender**：適合穩定公開內容，最容易驗證 sitemap 與輸出是否一致。
- **SSR**：適合需要即時內容，但要更小心 header 與 route rule。
- **SWR / hybrid**：適合列表頁或頻繁更新內容，但要確認 crawler 抓到的永遠是完整 HTML，而不是半套 client state。

## routeRules、robots.txt 與 X-Robots-Tag 的責任分工

我傾向用這種分法：

- `robots.txt`：控制大範圍路徑能否被抓取
- `routeRules` / header：處理 `/api/**`、preview、deploy preview 這類明確路由型別
- meta robots：處理內容頁層級的 noindex / nofollow

這樣做的好處是，每一層都很清楚自己在處理哪種型別的 URL。

## 圖片、靜態資源與 bilingual path 要分開看

圖片 sitemap、相簿資源與文章頁不該用同一套索引思考，尤其是作品集或內容型網站：

- 圖片可能值得被發現，但不一定要像內容頁那樣被當成獨立搜尋結果。
- bilingual path 要用真實公開 URL，而不是在前端層臨時推導。
- 靜態資源路徑如果不小心被 robots 或 header 規則一起擋掉，會連帶拖壞 preview 與複合搜尋結果。

## 最小檢查清單

- [ ] 公開文章、專案、系列頁都有進 sitemap
- [ ] 草稿、preview、API route 沒有誤進 sitemap 或公開索引面
- [ ] SSR、SSG、SWR 路由的輸出 HTML 都能被 crawler 穩定讀到
- [ ] header 規則與 robots / meta robots 沒有互相打架

## 小結

這篇文章的核心很明確：釐清「發現」、「抓取」與「建立索引」的邏輯，先做好內容的發現與抓取控管，後續的網址訊號與驗證流程才能建立在穩固的基礎上。
