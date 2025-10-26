# BarZ Hsieh Portfolio

> Creative Web Developer / Frontend Engineer / Photographer

[![Deploy Status](https://www.netlify.com/img/deploy/button.svg)](https://www.netlify.com/)

本專案是 BarZ Hsieh 的個人網站與作品集，採用 Nuxt 3、TypeScript、@nuxt/content、i18n、SEO、PWA 等現代前端技術，支援多語系、內容管理、結構化資料與最佳 SEO 實踐。

[English](./README.md) | [日本語](./README.ja.md)

---

## 特色功能

- **Nuxt 3 + TypeScript**：現代化 SSR/SPA 架構，極速開發體驗
- **@nuxt/content**：Markdown 驅動內容管理，支援多語系
- **多語系 (i18n)**：支援中英文切換，URL prefix_except_default 策略
- **SEO & Schema.org**：自動產生結構化資料、Sitemap、Open Graph、Twitter Card
- **圖片授權 Schema**：Gallery/Projects 頁面自動產生圖片授權資訊，支援 Google 圖片授權豐富摘要
- **自動化腳本**：專案圖片自動生成 metadata/map
- **Netlify 部署**：支援自動化部署

---

## 目錄結構

- `pages/`：Nuxt 路由頁面（首頁、部落格、專案、相簿、授權等）
- `content/`：Markdown 內容（多語系 about、license、posts、projects、demos）
- `data/`：靜態資料（galleryData、navbarData、SEO 設定等）
- `components/`：UI 元件（NavBar、Footer、LightBox、TagsFilter...）
- `composables/`：可重用邏輯（SEO、Breadcrumb、內容查詢...）
- `public/`：靜態資源（圖片、favicon...）
- `scripts/`：自動化腳本（圖片 metadata/map 生成）
- `server/api/`：自訂 sitemap API

---

## 內容授權

- **程式碼**：MIT License，詳見根目錄 `LICENSE`
- **網站內容/圖片**：除特別標註外，皆採用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hant) 授權，詳見 `/license` 頁面

---

## 快速開始

### 系統建議

- Node.js 20.19.0 以上
- pnpm（推薦使用的套件管理器）

小提醒：本專案以 Volta 在 `package.json` 中的 `volta.node` 鎖定 Node 版本；建議本機安裝 Volta，並讓 Corepack 依 `packageManager` 欄位管理 pnpm。
	- 安裝 Volta（macOS zsh）：`curl https://get.volta.sh | bash`
	- 啟用 Corepack 並遵循 packageManager：`corepack enable`

### 安裝步驟

```bash
# 複製專案
git clone <repository-url>
cd Portfolio\ 2024

# 安裝相依套件
pnpm install

# 啟動開發伺服器
pnpm dev
```

### 可用指令

```bash
pnpm dev          # 啟動開發伺服器
pnpm build        # 建置正式版本
pnpm generate     # 產生靜態網站
pnpm preview      # 預覽正式版本
pnpm lint         # 執行 ESLint
pnpm lint:fix     # 修正 ESLint 問題
pnpm typecheck    # 執行 TypeScript 型別檢查
```

---

## 開發指南

### 新增內容

1. **部落格文章**：在 `content/en/` 或 `content/zh/` 新增 Markdown 檔案
2. **專案項目**：在 `content/en/projects/` 或 `content/zh/projects/` 新增專案資料
3. **相簿內容**：更新 `data/galleryData.ts` 新增相簿與圖片資料設定，並確保圖片已放到至 `public/images/gallery/` 目錄

### 客製化設定

- **SEO**：修改 `data/seoData.ts` 設定預設 meta 標籤
- **導覽選單**：更新 `data/navbarData.ts` 設定選單項目
- **樣式設計**：在全域樣式中自訂 CSS 變數
- **多語系**：在 `i18n/` 目錄新增翻譯內容

---

## 部署

本專案已設定 Netlify 部署配置：

- git push 自動建置
- `netlify.toml` 定義部署規則與重定向
- 環境特定設定
- 靜態資源 CDN 最佳化

---

## 相關連結

- [線上網站](https://barz.app)
- [Nuxt 3 官方文件](https://nuxt.com/docs/getting-started/introduction)
- [授權說明](https://barz.app/zh/license)

---

## 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'feat: Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

---

## 授權條款

本專案採用雙重授權：

- **程式碼**：[MIT License](./LICENSE)
- **內容與圖片**：[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

詳細資訊請參閱[授權頁面](https://barz.app/zh/license)。
