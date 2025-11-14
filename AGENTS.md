# AGENTS.md

## 專案速覽

- Nuxt 4 + TypeScript + UnoCSS 的個人作品集網站，提供部落格、專案、相簿與授權資訊，並以 `@nuxt/content` + Markdown 管理中英雙語內容。
- SEO/i18n 皆整合在 `nuxt.config.ts`，透過 `@nuxtjs/seo`、`@nuxtjs/i18n`、`@nuxt/image` 與 `nuxt-delay-hydration` 等模組實作。
- Netlify 為主要部署目標，`netlify.toml` 與 `@netlify/nuxt` 處理對應設定；`nitro.prerender` 會掃描 Markdown 產生所有動態內容路由。

## 技術棧與環境

- Node.js 22.21.0（`package.json#engines` 與 `volta.node`），建議透過 Volta 安裝；封包管理使用 `pnpm 10.21.x`。
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
pnpm run generate:metadata  # 手動生成/更新 project image metadata（CONTENT_MANAGEMENT.md 中的 build:originaldata 即此指令）
node scripts/generate-gallery-images-map.js   # 可單獨更新 gallery 映射
node scripts/generate-project-images-map.js   # 可單獨更新 project 映射
```

## 主要資料夾與檔案

- `app/pages/*`：頁面路由（`/posts`, `/projects`, `/gallery`, `/license` 等）；頁面大多透過 content composable 組裝資料。
- `app/components/`：共用 UI（LightBox、TagsFilterDropdown、NavBar、Footer 等）；`app/components/content/ProjectLightBox.vue` 與 Gallery 組件負責圖片燈箱邏輯。
- `app/composables/`：搜尋索引、內容過濾、SEO meta、路徑工具（例如 `app/utils/pathUtils.ts`）。
- `content/{en,zh}/`：Markdown 內容，posts/projects/demos/about/license 等。
- `data/`：靜態資料與設定（`navbarData.ts`, `seoData.ts`, `galleryData.ts`, `bundleIcons.ts`…）。
- `public/`：靜態資源與自動產生的 JSON，如 `gallery-images-map.json`, `project-images-map.json`, `project-images-metadata(.zh).json`。
- `scripts/`：影像映射/中繼資料生成與預渲染測試；建置前會先執行 `generate-project-images-map.js` 與 `generate-gallery-images-map.js`。
- `modules/content-hooks`：Nuxt layer/模組掛勾內容流程

## Contents 新增流程（from `CONTENT_MANAGEMENT.md`）

### Gallery
- 圖片置於 `public/gallery-images/{album-id}/`；封面圖片放在 `public/gallery-images/{album-id}.webp`。
- 在 `data/galleryData.ts` 登記 `GalleryGroup`，`id` 必須與資料夾一致。
- 更新後執行 `node scripts/generate-gallery-images-map.js`（或等待 `pnpm build` prebuild）生成 `public/gallery-images-map.json`。

### Projects
- 圖片置於 `public/project-images/{project}/`（可含子資料夾）；建議 `01.intro.hero.webp` 這類檔名以控制排序。
- 執行 `node scripts/generate-project-images-map.js` 產生 `public/project-images-map.json`。
- 若有新圖片需更新描述，執行 `pnpm run generate:metadata` 生成/合併 `project-images-metadata.json` 與 `project-images-metadata.zh.json`，再視需要手動調整。
- 於 `content/en/projects/*.md` 與 `content/zh/projects/*.md` 撰寫內容並透過 `::ProjectLightBox{folder="project"}::` 插槽載入圖片。

## 開發注意事項

- **i18n**：`@nuxtjs/i18n` 以 `prefix_except_default` 策略，新增頁面時確保 `en` 為預設，`zh` 有對應內容或 fallback。
- **環境變數**：`process.env.I18N_BASE_URL` 會用於 site/url、OG image、social share，Netlify 需設定；`NETLIFY=true` 時 Nitro preset 會切換。
- **HTML 驗證**：在非 production 模式 `@nuxtjs/html-validator` 會啟動，避免引入 validator 無法處理的自訂元素。
- **影像最佳化**：目前 `@nuxt/image` provider 設為 `none`，上傳圖片需自行控制格式與大小（建議 WebP/AVIF）。
- **自動產出檔**：`public/*-map.json` 與 `project-images-metadata*.json` 須納入版控，避免開發者環境不一致。
- **UnoCSS**：`unocss.config.ts` 影響全域原子樣式，若新增大量自訂 class，務必同步更新 UNO 設定與 ESLint UnoCSS plugin。
- **自動化**： Nuxt 使用 `unplugin-auto-import` 與 `unplugin-vue-components` 進行自動匯入與組件註冊。(`/components/`, `/composables/`, `/uitils/` 等皆可直接使用)

## 驗證清單（提交前）

1. `pnpm lint` + `pnpm typecheck` 皆需通過。
2. 若調整內容/圖片，重新執行對應 scripts 並確認產生的 JSON 更新。
3. 重大路由/內容改動後跑一次 `pnpm test:prerender` 或 `pnpm generate`，確保 Nitro 掃描所有 Markdown 路徑（`nitro.hooks['prerender:routes']` 會依據 `content/` 生成路由）。
4. 手動驗證 `/posts`, `/projects`, `/gallery`, `/license`、多語切換與 meta tags 是否符合預期。
