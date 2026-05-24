# AGENTS.md

## 回覆語言

- 一律使用中文回覆。

## Agent Skills

- 本專案的專案級 Agent Skills 位於 `.agents/skills/`。
- 若任務需要使用 skills，先以 `.agents/skills/` 內的專案技能為主，再視情況補充其他可用技能。

## 代理工作模式

- 非 trivial 任務先釐清目標、影響檔案與主要風險，再開始修改。
- 任務涉及 3 個以上步驟、跨檔案或跨層修改、資料轉換、重構或架構決策時，先提供短計畫再動手。
- 建議使用以下格式描述計畫：
  1. [步驟] -> 驗證: [檢查方式]
  2. [步驟] -> 驗證: [檢查方式]
  3. [步驟] -> 驗證: [檢查方式]
- 若新的程式碼證據推翻原本計畫，應先停止並重排計畫，再繼續實作。
- 對於簡單且明確的單點修正，維持輕量流程，直接做最小正確變更即可。

## 實作紀律

- 需求若有歧義，且會影響產品行為、資料來源或使用者流程，先明確說出假設；若存在多個同樣合理但結果不同的解讀，不要默默選一個。
- 若程式碼可回答問題，就先讀 source of truth，不要急著向使用者追問。
- 優先選擇最小、最直接、與既有模式一致的解法；不要加入未被要求的功能、彈性、設定或錯誤處理。
- 如果解法開始明顯膨脹，先停下來重新確認是否有更簡單、耦合更低的做法。
- 若使用者要求的方案過度複雜、風險過高，或明顯違背目前專案模式，應直接指出並提出更簡單的替代方案。

## 目標與驗證循環

- 非 trivial 任務在修改前，先把需求轉成可驗證的成功條件。
- Bug 修復先找出重現路徑，再用同一路徑驗證修正是否生效。
- Refactor 必須確認修改前後行為等價，除非需求本身要求改變行為。
- 完成前優先執行最窄、最有區辨力的驗證：單一測試、型別檢查、lint、對應 script 或具體的手動檢查。
- 若無法執行驗證，必須明確說明哪些項目未驗證，以及原因。

## 任務執行原則

- 對於明確範圍的實作或 bug 回報，優先自主檢查相關錯誤、測試、日誌與相鄰程式碼，再決定是否需要向使用者提問。
- 變更範圍應緊扣需求，不做無關的重構、搬移、格式化或順手清理。
- 當工作跨越多層時，優先沿著既有資料流追查與修改：page/component -> composable/utils -> content/server/scripts/config。
- 若需求涉及內容、圖片或衍生資料，先確認來源檔與生成流程，再決定是否需要更新產物。

## Content Frontmatter 時間欄位規範

- 適用範圍：`content/{en,zh}/posts/*.md` 與 `content/{en,zh}/projects/*.md`。
- 新增文章時：frontmatter 必須包含 `date`（建立時間，`YYYY-MM-DD`）。
- 修改既有文章時：保留原本 `date`，並同步更新 `updatedAt`（最後修改時間，`YYYY-MM-DD`）。
- 若 `updatedAt` 不存在，首次修改該文時應新增。
- AI 在新增或修改 posts/projects 內容時，必須一併檢查並更新上述時間欄位，不可只改內文。

## Diff 紀律

- 每一行修改都應能直接追溯到使用者需求。
- 不要清理、重新命名、格式化或重構相鄰但不相關的程式碼，除非該變更是修正所必需。
- 遵循既有檔案風格與專案慣例，即使其他寫法看起來更理想。
- 只移除這次修改直接造成的未使用 import、變數、函式或輔助程式。
- 若發現與本次任務無關的壞味道或清理機會，放到最後回報，不要順手修改。

## 程式碼閱讀與假設

- 修改前必須先讀相關檔案，確認 source of truth 所在位置。
- 不要猜測 API、欄位名稱、資料結構、Nuxt/Nitro 行為或第三方套件細節；不確定就先搜尋專案。
- 只有在程式碼無法回答，或決策會改變產品行為時，才向使用者提問。
- 任何會影響實作方向的假設，都應在動手前明說。

## Generated 檔案 Guardrails

- `public/gallery-images-map.json` 與 `public/project-images-map.json` 為生成產物；不要直接手動編輯，應修改來源檔案或對應 script 後重新生成。
- `public/project-images-metadata.json` 與 `public/project-images-metadata.zh.json` 的標準更新流程是先執行 `pnpm run generate:metadata`，再依專案內容需求做必要調整；不要用手動修改掩蓋來源資料或生成流程的問題。
- 調整內容、圖片或衍生資料時，確認對應的生成檔是否需要一併更新並納入版控。

## Auto-Import Guardrails

- 本專案使用 Nuxt 的 auto-import 與 components auto-registration，`app/components/`、`app/composables/`、`app/utils/` 內的符號通常不需要手動 import。
- 不要在這些會被掃描的目錄中新增重複名稱的 re-export shim 或相容層，避免產生重複 auto-import 候選與開發期警告。
- 若搬移 helper 或 composable，應更新呼叫端並移除舊的掃描出口，而不是留下同名 re-export。
- 新增工具函式前，先確認 `app/utils/` 或既有 composables 是否已有可重用實作，避免在區域檔案重造語意相同的 helper。

## Graphify

- 本專案提供 `graphify-out/` 作為程式碼關聯圖譜；非 trivial 任務、review、重構或跨檔案修改時，可先用它辨識受影響檔案、呼叫關係與風險區域。
- `graphify` 只用來輔助定位上下文；實際行為、API 形狀與修改依據仍以原始碼為準。
- 完成非 trivial 修改後，可再次利用 graphify 檢查是否遺漏相鄰受影響檔案。

## 回覆風格

- 保持精簡直接，避免不必要的鋪陳或重複。
- 實作任務的回覆優先包含：變更檔案、核心變更、驗證結果。
- Review 任務優先指出：bug、風險、錯誤假設與缺少驗證的地方。

## 避免過度設計

- 不要為單一用途程式碼引入抽象層，除非它明確符合現有重複模式。
- 不要提早最佳化、提早泛化，或替尚未出現的需求預留結構。
- 如果一個方案看起來太大、太繞，先退一步尋找更直接的版本。

## 專案速覽

- Nuxt 4 + TypeScript + UnoCSS 的個人作品集網站，提供部落格、專案、相簿與授權資訊，並以 `@nuxt/content` + Markdown 管理中英雙語內容。
- SEO/i18n 皆整合在 `nuxt.config.ts`，透過 `@nuxtjs/seo`、`@nuxtjs/i18n`、`@nuxt/image` 與 `nuxt-delay-hydration` 等模組實作。
- Netlify 為主要部署目標，`netlify.toml` 與 `@netlify/nuxt` 處理對應設定；`nitro.prerender` 會掃描 Markdown 產生所有動態內容路由。

## 技術棧與環境

- Node.js 22.22.1（`package.json#engines` 與 `volta.node`），建議透過 Volta 安裝；封包管理版本以 `package.json#packageManager` 為準，升級後執行 `pnpm sync:pnpm` 同步文件。
- Nuxt 4、Vue 3、TypeScript 5，UnoCSS。
- 主要模組：`@nuxt/content`（Markdown + 搜尋）、`@nuxtjs/i18n`（`prefix_except_default` 策略）、`@nuxtjs/seo`、`@nuxt/image`、`@nuxt/fonts`、`@nuxtjs/html-validator`、`nuxt-delay-hydration`、`nuxt-headlessui`、`floating-vue/nuxt`、`@stefanobartoletti/nuxt-social-share`。
- 內容搜尋和列表功能位於 `app/composables/useContentSearchIndex.ts`、`app/composables/useContentListsFilter.ts`，依賴 `minisearch`、`dayjs` 等工具。

## 常用指令

```bash
pnpm install           # 安裝依賴（postinstall 會執行 nuxt prepare）
pnpm dev               # 啟動開發伺服器
pnpm dev:netlify       # 模擬 Netlify dev 環境
pnpm build             # 會先跑 prebuild -> (generate-project-images-map + generate-gallery-images-map) 再 nuxt build
pnpm generate          # 產生靜態檔
pnpm preview           # 預覽產物
pnpm lint / lint:fix   # ESLint（基於 @antfu/eslint-config + UnoCSS plugin）
pnpm typecheck         # vue-tsc
pnpm test:prerender    # 跑 scripts/test-prerender.js 驗證 Nitro 預渲染
pnpm run generate:metadata  # 手動生成/更新 project image metadata
node scripts/generate-gallery-images-map.js   # 可單獨更新 gallery 映射
node scripts/generate-project-images-map.js   # 可單獨更新 project 映射
```

## 主要資料夾與檔案

- `app/pages/*`：頁面路由（`/posts`, `/projects`, `/gallery`, `/license` 等）；頁面大多透過 content composable 組裝資料。
- `app/components/`：共用 UI（LightBox、TagsFilterDropdown、NavBar、Footer 等）；`app/components/content/ProjectLightBox.vue` 與 Gallery 組件負責圖片燈箱邏輯。
- `app/composables/`：搜尋索引、內容過濾、SEO meta、路徑工具（例如 `app/utils/pathUtils.ts`）。
- `content/{en,zh}/`：Markdown 內容，posts/projects/demos/about/license 等；`content/gallery/*.yml` 存放 Gallery 相簿 metadata。
- `data/`：靜態資料與設定（`navbarData.ts`, `seoData.ts`, `bundleIcons.ts`…）。
- `public/`：靜態資源與自動產生的 JSON，如 `gallery-images-map.json`, `project-images-map.json`, `project-images-metadata(.zh).json`。
- `scripts/`：影像映射/中繼資料生成與預渲染測試；建置前會先執行 `generate-project-images-map.js` 與 `generate-gallery-images-map.js`。
- `modules/content-hooks`：Nuxt layer/模組掛勾內容流程

## Contents 新增流程（from `CONTENT_MANAGEMENT.md`）

### Gallery

- 圖片置於 `public/gallery-images/{album-id}/`；封面圖片放在 `public/gallery-images/{album-id}.webp`。
- 在 `content/gallery/*.yml` 建立相簿 metadata，`albumId` 必須與資料夾一致。
- 更新後執行 `node scripts/generate-gallery-images-map.js`（或等待 `pnpm build` prebuild）生成 `public/gallery-images-map.json`。

### Projects

- 圖片置於 `public/project-images/{project}/`（可含子資料夾）；建議 `01.intro.hero.webp` 這類檔名以控制排序。
- 執行 `node scripts/generate-project-images-map.js` 產生 `public/project-images-map.json`。
- 若有新圖片需更新描述，執行 `pnpm run generate:metadata` 生成/合併 `project-images-metadata.json` 與 `project-images-metadata.zh.json`，再視需要手動調整。
- 於 `content/en/projects/*.md` 與 `content/zh/projects/*.md` 撰寫內容並透過 `::ProjectLightBox{folder="project"}` 區塊載入圖片（並以 `::` 結尾）。

## 開發注意事項

- **i18n**：`@nuxtjs/i18n` 以 `prefix_except_default` 策略，新增頁面時確保 `en` 為預設，`zh` 有對應內容或 fallback。
- **環境變數**：`NUXT_SITE_URL` 是 canonical site URL，會用於 `site.url`、`@nuxtjs/i18n` 的 `baseUrl`、social share 與 sitemap/OG 等 SEO 輸出；`NETLIFY=true` 時 Nitro preset 會切換。
- **HTML 驗證**：在非 production 模式 `@nuxtjs/html-validator` 會啟動，避免引入 validator 無法處理的自訂元素。
- **影像最佳化**：目前 `@nuxt/image` provider 設為 `none`，上傳圖片需自行控制格式與大小（建議 WebP/AVIF）。
- **自動產出檔**：`public/*-map.json` 與 `project-images-metadata*.json` 須納入版控，避免開發者環境不一致。
- **UnoCSS**：`unocss.config.ts` 影響全域原子樣式，若新增大量自訂 class，務必同步更新 UNO 設定與 ESLint UnoCSS plugin。
- **自動匯入機制**：Nuxt 內建 `unplugin-auto-import` 與 `unplugin-vue-components`，會自動匯入以下內容，**無需手動 import**：
  - `app/components/` 中的所有 Vue 組件（可直接在 template 中使用）
  - `app/composables/` 中的 composables 函式
  - `app/utils/` 中的工具函式
  - Nuxt、Vue、Vue Router 等框架 API（如 `ref`, `computed`, `useRoute`, `useFetch` 等）
  - 這些檔案中定義的 **TypeScript 類型/介面也會自動匯入**，可直接使用而不需要 `import type { ... }`
  - 當撰寫或修改程式碼時，請記住這些資源已全域可用，避免多餘的 import 語句

## 驗證清單（提交前）

1. `pnpm lint` + `pnpm typecheck` 皆需通過。
2. 若調整內容/圖片，重新執行對應 scripts 並確認產生的 JSON 更新。
3. 重大路由/內容改動後跑一次 `pnpm test:prerender` 或 `pnpm generate`，確保 Nitro 掃描所有 Markdown 路徑（`nitro.hooks['prerender:routes']` 會依據 `content/` 生成路由）。
4. 手動驗證 `/posts`, `/projects`, `/gallery`, `/license`、多語切換與 meta tags 是否符合預期。
