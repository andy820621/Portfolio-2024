---
title: 圖片的自動化管理方案：自動化 JSON map + LightBox + Schema.org
date: 2025/12/18
description: 這個作品集如何管理大量圖片：建置期生成 JSON map、可選的圖片 metadata、可預期的排序規則，以及在 Nuxt 中整合 LightBox 的方式。
image: /blog-images/image-management-pipeline.webp
alt: Projects 與 Gallery 圖片自動化管線
ogImage: /blog-images/image-management-pipeline.webp
tags: ['Nuxt', 'Images', 'Automation', 'Gallery', 'LightBox', 'SEO', 'Schema.org']
categories: ['Nuxt', '媒體', '自動化']
published: true
schemaOrg:
  - "@type": "BlogPosting"
    headline: "圖片的自動化管理方案：自動化 JSON map + LightBox + Schema.org"
    description: "這個作品集如何管理大量圖片：建置期生成 JSON map、可選的圖片 metadata、可預期的排序規則，以及在 Nuxt 中整合 LightBox 的方式。"
    author:
      "@type": "Person"
      name: "BarZ Hsieh"
    datePublished: "2025/12/18"
    dateModified: "2025/12/18"
    image: "/blog-images/image-management-pipeline.webp"
    keywords: ["Gallery", "LightBox", "Image map", "Metadata", "Schema.org"]
    articleSection: "TechArticle"

sitemap:
  lastmod: 2025-12-18
  changefreq: weekly
  priority: 0.8
  images:
    - loc: /page-cover/blog.webp
      title: "Projects / Gallery 圖片管線"
      caption: "建置期 JSON map + runtime LightBox 整合。"
---

本文將仔細說明專案中如何透過「建置期 scripts 生成 JSON」＋「runtime composables 讀取 JSON」來管理 Projects / Gallery 圖片，並整合 LightBox 與 SEO（授權 Schema.org），相關實現包含：

- 建置期生成 `public/project-images-map.json` / `public/gallery-images-map.json`（遞迴掃描＋`numeric: true` 自然排序）
- Projects 以 `public/project-images-metadata.json` / `public/project-images-metadata.zh.json` 管理每張圖的 `title/description`（只補齊缺漏、保留既有編輯）
- Runtime 以 composables 組裝 UI 所需資料（`Promise.allSettled()` 容錯、`encodeUrlPath()` 處理特殊字元）
- 在 Markdown 內容中用 `ProjectLightBox` 直接嵌入燈箱
- Gallery / Projects 主圖輸出 `ImageObject` 授權欄位（license / acquireLicensePage / creditText / creator / copyrightNotice）

## 建置流程（maps + metadata）

### Maps：掃描圖片並生成 JSON map

兩個 scripts 會掃描 `public/project-images/` 與 `public/gallery-images/`，輸出對應的 JSON：

- `scripts/generate-project-images-map.js` → `public/project-images-map.json`
- `scripts/generate-gallery-images-map.js` → `public/gallery-images-map.json`

核心行為：

- 遞迴掃描資料夾
- 只保留支援的副檔名
- 用 `numeric: true` 的自然排序支援 `01`, `02`, `10`…
- `gallery-images-map.json` 會跳過根目錄封面圖（`public/gallery-images/{album}.webp`），只收集各相簿資料夾內的照片

#### 執行方式：

1.手動更新 maps：

```bash
node scripts/generate-project-images-map.js
node scripts/generate-gallery-images-map.js
```

2.建置時 `pnpm build` 會先跑 `package.json#scripts.prebuild` 生成 maps：

```bash
pnpm build
```

### Metadata：為 Projects 圖片補齊 title/description

Projects 圖片的 metadata 放在：

- `public/project-images-metadata.json`（英文）
- `public/project-images-metadata.zh.json`（中文）

以下指令會產生兩份 metadata（保留你手動修改過的既有值，並補齊缺漏）：

```bash
pnpm run generate:metadata
```

## Runtime 架構（composables）

| composable                                                  | 功能                                                                                                                                                                               | 輸出                                                                                              |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `useProjectImages`（`app/composables/useProjectImages.ts`） | 讀 `project-images-map.json`（必須存在）＋依語系讀 metadata（可選）；用 `Promise.allSettled()` 讓 metadata 缺失不致壞頁；支援檔名解析（如 `01.hero.intro.webp`）推導排序與顯示文字 | `getProjectImages(folder)` → `Photo[]`（給 `LightBox.vue`；包含 `src/title?/description?/size?`） |
| `useGalleryImages`（`app/composables/useGalleryImages.ts`） | 讀取 `gallery-images-map.json`；回傳經 `encodeUrlPath()` 處理的 URL（相簿名可含空白或特殊字元）                                                                                    | `getAlbumImages(albumId)` → `string[]`（encoded URLs）                                            |

## UI 整合（LightBox 與 lazy loading）

在 project 的 Markdown 內容中，我可以直接用資料夾名稱嵌入 LightBox：

```md
::ProjectLightBox{folder="finance-tracker/settings"}
::
```

底層流程是：

- `ProjectLightBox.vue` runtime 載入圖片清單 → 丟給 `LightBox.vue`
- Gallery 頁面 lazy-load `LightGallery.vue`，並用 `useIntersectionObserver()` 做漸入；圖片本身則交給 `<NuxtImg loading="lazy" />` 做延遲載入

## 新增圖片指南

### Projects

1. 放到 `public/project-images/{project}/`（可含子資料夾；建議用 `01.*` 檔名控制排序）
2. 生成 map：

```bash
node scripts/generate-project-images-map.js
```

3. 補齊 metadata：

```bash
pnpm run generate:metadata
```

4. 將產出檔案納入版控：`public/project-images-map.json`、`public/project-images-metadata.json`、`public/project-images-metadata.zh.json`

### Gallery

1. 放到 `public/gallery-images/{album}/`
2. 準備封面 `public/gallery-images/{album}.webp`
3. 更新 `data/galleryData.ts`（`id` 必須與資料夾一致）
4. 生成 map：

```bash
node scripts/generate-gallery-images-map.js
```

5. 將產出檔案納入版控：`public/gallery-images-map.json`

## SEO 實作（Schema.org ImageObject）

Gallery 頁面（以及 project 詳情頁的主圖）會輸出 `ImageObject`，並包含授權欄位：

- `license`
- `acquireLicensePage`
- `creditText`
- `creator`
- `copyrightNotice`

這能支援 Google 圖片授權 rich results，也讓歸屬更清楚。

以下為頁面輸出的 JSON-LD 中，一筆 `ImageObject` 典型結構（以 Gallery 圖片為例；實作位於 `app/pages/gallery/[album].vue`）：

```json
{
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "contentUrl": "https://barz.app/gallery-images/Some%20Album/01.webp",
  "url": "https://barz.app/gallery-images/Some%20Album/01.webp",
  "name": "Some Album - Image 1",
  "description": "Some Album gallery image 1",
  "encodingFormat": "image/webp",
  "license": "https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hant",
  "acquireLicensePage": "https://barz.app/zh/license",
  "creditText": "BarZ Hsieh",
  "creator": {
    "@type": "Person",
    "name": "BarZ Hsieh"
  },
  "copyrightNotice": "2024-PRESENT © BarZ Hsieh"
}
```

## 相關連結

- 專案頁（Landing）：[BarZ Hsieh 作品集 2024](/zh/projects/portfolio-2024)
- 下一篇：[Nuxt 4 實戰 SEO：Schema.org、sitemap、OG images 與驗證工具](/zh/posts/nuxt-seo-guide)
