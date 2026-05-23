# Nuxt SEO Checklist 對照整理

以下內容是根據 Nuxt SEO checklist 與目前專案程式碼比對後整理的結果。

## 部分完成

- SSR / prerender / route rules 已有配置，但仍需要透過實際部署與原始碼驗證，確認每個重要頁面都真的輸出可爬內容。
- 每頁 meta 已有落地，首頁、列表頁、內容頁都有各自的 SEO 設定，但仍要確認每個動態頁的 title / description 是否足夠唯一。
- Schema.org 已經有做，且涵蓋首頁、文章列表、專案列表、相簿列表、相簿詳頁、license 等頁面，但仍屬於「有做 schema」而不是「每種內容型別都已完整驗證」。
- Sitemap、robots、canonical 與 trailing slash 的基礎已經有了，但仍需要看實際產出與索引結果。
- 分頁 query 有同步機制，代表 pagination 的使用者體驗有處理，但 canonical / 索引策略還沒有在程式碼裡完全顯式化。

## 待補

- `llms.txt` / AI crawler 對應設定目前看不到明確落地，這是 checklist 裡的新重點。
- Analytics 還沒看到實作，包含 GA4、Plausible、Umami、Fathom 與轉換追蹤。
- Search Console 的營運流程還沒在 repo 內落地，例如 sitemap 提交、URL Inspection、索引異常追蹤。
- 分頁頁面是否需要加 canonical 或 noindex，現在還不夠明確，這是值得補強的 SEO 細節。
- Security headers，例如 CSP、HSTS、X-Frame-Options，程式碼裡沒有明顯配置。
- Core Web Vitals 的改善與監控、RUM、圖片 alt 品質檢查，還沒看到完整驗證流程。
- 社群預覽的外部驗證流程還沒看到，例如 Facebook Debugger、Twitter Card、Slack / Discord preview。
- 內容頁與列表頁的內部連結深度、孤兒頁檢查，尚未看到對應自動化。

## 無法從程式碼確認

- 原始碼是否真的在 deployed site 的 View Source 看到完整 meta 與內容。
- Search Console 是否已建立、驗證並提交 sitemap。
- Google 是否已成功索引所有重要頁面，以及是否存在 soft 404、duplicate canonical、crawled not indexed 等問題。
- 實際 Core Web Vitals 是否已達標。
- OG / Twitter Card / Slack unfurl 在外部 debugger 的實測結果。
- 是否已經有 backlinks、品牌提及、AI citation 追蹤。
- 週 / 月 / 季的 SEO 監控是否真的有在執行。

## 參考程式碼位置

- 全域 SEO 與 sitemap / robots / canonical 設定在 [nuxt.config.ts](../nuxt.config.ts)
- 首頁 SEO 與 schema 在 [app/pages/index.vue](../app/pages/index.vue)
- 文章列表與內容頁 SEO 在 [app/pages/posts/index.vue](../app/pages/posts/index.vue) 與 [app/pages/posts/[post].vue](../app/pages/posts/[post].vue)
- 專案列表與內容頁 SEO 在 [app/pages/projects/index.vue](../app/pages/projects/index.vue) 與 [app/pages/projects/[project].vue](../app/pages/projects/[project].vue)
- 相簿列表與內容頁 SEO 在 [app/pages/gallery/index.vue](../app/pages/gallery/index.vue) 與 [app/pages/gallery/[album].vue](../app/pages/gallery/[album].vue)
- 404 與 noindex 處理在 [app/error.vue](../app/error.vue)

## 結論

這個專案已經把技術型 SEO 的地基做得很完整，尤其是 SSR、meta、schema、sitemap、robots、canonical、404 這幾塊。

真正還需要補的，主要是 checklist 後半段：AI discovery、分析追蹤、Search Console 營運流程、以及分頁 / query 的索引策略。
