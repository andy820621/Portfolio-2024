# Nuxt SEO Checklist 對照整理

以下內容是根據 Nuxt SEO checklist 與目前專案程式碼比對後整理的結果。

## 待補

- Security headers，例如 CSP、HSTS、X-Frame-Options，程式碼裡沒有明顯配置。
- Core Web Vitals 的改善與監控、RUM、圖片 alt 品質檢查，還沒看到完整驗證流程。
- 內容頁與列表頁的內部連結深度、孤兒頁檢查，尚未看到對應自動化。

## 無法從程式碼確認

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
