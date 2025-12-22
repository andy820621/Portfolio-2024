---
title: 個人作品集網站
date: 2025/12/18
description: 以產品思維打造的 Nuxt 4 作品集——整合 Nuxt Content、i18n、全站搜尋、自動化圖片管線與完整 SEO 優化，可長期維護的個人網站專案。
cover: /project-images/portfolio-2024.webp
image: /project-images/portfolio-2024-hero.webp
alt: Nuxt 4 個人作品集網站
ogImage: /project-images/portfolio-2024-hero.webp
tags: ['Nuxt', 'Nuxt 4', 'TypeScript', 'UnoCSS', 'Nuxt Content', 'i18n', 'SEO', 'Schema.org', 'MiniSearch', 'Nitro', 'Netlify']
categories: ['作品集', 'Nuxt', 'Full Stack']
updatedAt: 2025/12/22
published: true

sitemap:
  lastmod: 2025-12-18
  changefreq: monthly
  priority: 0.95
  images:
    - loc: /project-images/portfolio-2024-hero.webp
      title: "Nuxt 4 個人作品集網站"
      caption: "基於 Nuxt 4 打造的雙語作品集網站，整合內容管理、全站搜尋與完整 SEO 優化。"
---

## 專案概述

這是一個以**產品思維**打造的個人作品集網站，整合了部落格、專案展示、技術 Demos 與相簿功能。

核心技術棧：**[Nuxt 4](https://nuxt.com/) + [TypeScript](https://www.typescriptlang.org/) + [UnoCSS](https://unocss.dev/)**，內容管理透過 [@nuxt/content](https://content.nuxtjs.org/) 實現。

我把它當作真正要長期維護的產品來設計，從內容管理、SEO 優化到自動化部署，每個環節都經過系統化規劃。

---

## 核心功能

### 雙語內容系統

整合 [@nuxtjs/i18n](https://i18n.nuxtjs.org/) 實現中英文雙版本，搭配一致的 schema 定義(使用 [Zod](https://zod.dev/) 驗證)與乾淨的 URL 策略，讓內容擴充更簡單。

### 全站搜尋(`Cmd/Ctrl+K`)

鍵盤優先的搜尋體驗，透過 [MiniSearch](https://github.com/lucaong/minisearch) 實現段落級索引，支援 Markdown **段落與章節級別**搜尋，讓使用者快速找到想要的內容。

### 完整 SEO 優化

整合 [@nuxtjs/seo](https://github.com/nuxt-modules/seo) 套件，包含:

- 符合 [Schema.org](https://schema.org/) 規範的結構化資料
- 自動生成 [sitemap](https://nuxt.com/modules/sitemap)、OG images、meta tags、robots.txt...等等
- 整合 SEO 驗證工具確保最佳實踐
- 使用 [remark-validate-links](https://github.com/remarkjs/remark-validate-links) 驗證內部連結完整性

### 圖片資料自動化生成

透過 [@nuxt/image](https://image.nuxtjs.org/) 優化圖片載入，建置時自動生成 `gallery-images-map.json`、`project-images-map.json` 與圖片 metadata，搭配 LightBox 提供流暢的相簿體驗。

### 智能預渲染

[Nitro](https://nitro.unjs.io/) prerender hook 自動掃描 Markdown routes，並過濾 `published: false` 的草稿內容，確保只有完成的內容會被發布。部署至 [Netlify](https://www.netlify.com/)，使用 [@netlify/nuxt](https://github.com/netlify/netlify-nuxt) adapter。

### 細節打磨

- **TOC 與錨點**: 平滑捲動定位
- **標籤篩選**: 支援多標籤組合查詢
- **社群分享**: 一鍵分享到各大平台
- **動態背景**: 每次造訪都有新鮮感
- **前後文導航**: 提升閱讀連貫性

---

## 設計理念

### 可維護性優先

將查詢邏輯、格式化、SEO 配置統一封裝在 composables 中，避免在各頁面重複實作，讓未來的擴充與維護更簡單。

### 內容系統化

透過 Nuxt Content 的 collections 與 schema，確保所有內容格式一致，並支援雙語內容的無縫切換。

### 能自動就不手動

從圖片處理、路由生成到 SEO 配置，盡可能自動化，減少手動操作的錯誤與時間成本。

### 使用者體驗

細節決定體驗——平滑捲動、鍵盤快捷鍵、即時搜尋、標籤篩選，每個功能都經過打磨。

---

## 深入閱讀

想了解更多實作細節? 我撰寫了一系列技術文章:

1. [以產品思維打造 Nuxt 4 個人網站](/zh/posts/nuxt4-portfolio-architecture)

2. [整合 Nuxt Content + i18n,打造多語系內容網站](/zh/posts/nuxt-content-v3-i18n-bilingual-site)

3. [如何用 Nitro Hooks 解決 Nuxt Content 動態路由的預渲染問題](/zh/posts/nitro-prerender-dynamic-routes-solution)

4. [整合 MiniSearch + Nuxt Content 實現全站搜尋](/zh/posts/global-fulltext-search)

5. [圖片的自動化管理方案:自動化 JSON map + LightBox + Schema.org](/zh/posts/image-management-pipeline)

6. [Nuxt 4 SEO 開發指南](/zh/posts/nuxt-seo-guide)

---

## 專案連結

- [**Live Site**](https://barz.app)
- [**GitHub**](https://github.com/andy820621/portfolio-2024)

---

## 技術棧總覽

| 領域         | 技術                                                         | 用途                                 |
| ------------ | ------------------------------------------------------------ | ------------------------------------ |
| **核心框架** | Nuxt 4、Vue 3、TypeScript                                    | 應用程式基礎架構                     |
| **樣式**     | UnoCSS                                                       | 原子化 CSS 與主題系統                |
| **內容管理** | @nuxt/content、@nuxtjs/i18n、Zod                             | Markdown CMS、雙語支援與 schema 驗證 |
| **SEO**      | @nuxtjs/seo、Schema.org、nuxt-sitemap、remark-validate-links | 結構化資料、搜尋優化與連結驗證       |
| **搜尋**     | MiniSearch                                                   | 全站內容搜尋引擎                     |
| **媒體**     | @nuxt/image、自動化 scripts                                  | 圖片優化與管線自動化                 |
| **部署**     | Netlify、@netlify/nuxt、Nitro                                | 靜態生成與 CDN 部署                  |

---

_這個專案持續更新中，歡迎透過 [GitHub Issues](https://github.com/andy820621/portfolio-2024/issues) 提供建議或回饋。_
