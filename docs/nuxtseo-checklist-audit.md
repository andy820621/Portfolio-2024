# Nuxt SEO Checklist 對照整理

以下內容是根據 Nuxt SEO checklist 與目前專案程式碼比對後整理的結果。

## 部分完成

- Schema.org 已經有做，且涵蓋首頁、文章列表、專案列表、相簿列表、相簿詳頁、license 等頁面，但仍屬於「有做 schema」而不是「每種內容型別都已完整驗證」。
- 分頁 query 有同步機制，代表 pagination 的使用者體驗有處理，但 canonical / 索引策略還沒有在程式碼裡完全顯式化。

## 待補

- `llms.txt` / AI crawler 對應設定目前看不到明確落地，這是 checklist 裡的新重點。
- Analytics 還沒看到實作，包含 GA4、Plausible、Umami、Fathom 與轉換追蹤。
- 分頁頁面是否需要加 canonical 或 noindex，現在還不夠明確，這是值得補強的 SEO 細節。
- Security headers，例如 CSP、HSTS、X-Frame-Options，程式碼裡沒有明顯配置。
- Core Web Vitals 的改善與監控、RUM、圖片 alt 品質檢查，還沒看到完整驗證流程。
- 內容頁與列表頁的內部連結深度、孤兒頁檢查，尚未看到對應自動化。

## 無法從程式碼確認

- Google 是否已成功索引所有重要頁面，以及是否存在 soft 404、duplicate canonical、crawled not indexed 等問題。
- 實際 Core Web Vitals 是否已達標。

  | 指標 | 中文理解         | 在看什麼                           |
  | ---- | ---------------- | ---------------------------------- |
  | LCP  | 最大內容繪製     | 主要內容多久顯示出來               |
  | INP  | 互動到下一次繪製 | 使用者點擊、輸入後，頁面反應快不快 |
  | CLS  | 累積版面位移     | 頁面會不會突然跳動                 |

- 是否已經有 backlinks、品牌提及、AI citation 追蹤。
- 週 / 月 / 季的 SEO 監控是否真的有在執行。

## 結論

這個專案已經把技術型 SEO 的地基做得很完整，尤其是 SSR、meta、schema、sitemap、robots、canonical、404 這幾塊。

真正還需要補的，主要是 checklist 後半段：AI discovery、分析追蹤、Search Console 營運流程、以及分頁 / query 的索引策略。
