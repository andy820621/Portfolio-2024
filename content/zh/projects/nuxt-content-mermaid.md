---
title: nuxt-content-mermaid
date: 2025/12/31
description: 將 Nuxt Content 的 mermaid 程式碼區塊自動轉成可渲染的 Mermaid 元件，支援 Lazy Loading 與暗亮主題切換
cover: /project-images/nuxt-content-mermaid.webp
image: /project-images/nuxt-content-mermaid-wide.webp
alt: nuxt-content-mermaid
ogImage: /project-images/nuxt-content-mermaid-wide.webp
tags: ['Nuxt', 'Nuxt Module', 'Nuxt Content', 'Mermaid', 'Markdown', 'TypeScript', 'Vitest', '開源']
categories: ['Nuxt', 'Nuxt Content', 'Mermaid']
published: true

sitemap:
  lastmod: 2025-12-31
  changefreq: weekly
  priority: 0.96
  images:
    - loc: /project-images/nuxt-content-mermaid.webp
      title: nuxt-content-mermaid
      caption: nuxt-content-mermaid
---

## 專案簡介

主要功能是整合 [**Nuxt Content v3**](https://content.nuxt.com/docs/getting-started) 跟 [**Mermaid**](https://mermaid.js.org/) 的模組。
能自動將 Markdown 中的 \`\`\`mermaid 區塊轉換為響應式的圖表元件，並支援 Lazy Loading 與深色模式切換。

## 解決的問題

在 Nuxt Content 中，Mermaid 通常需要自己處理「Markdown 解析 → 轉換 → 客戶端載入 Mermaid → render」這整段流程，還要顧及：

- SSR 與 Hydration（Mermaid 只能在 client 端 render）
- 多張圖表同頁渲染時的穩定性與效能
- 深色/淺色主題切換
- Mermaid 提供許多讓使用者設定的選項，但要在 Nuxt Content 中實作並不直觀

此模組把上述工作封裝成「內容轉換 + Runtime 元件」，讓使用者只需要專注在 Markdown 內容本身。

## 功能特色

- **自動轉換**：在 `content:file:beforeParse` 階段把 Mermaid fenced code block 轉為 `<Mermaid>`。
- **Lazy Loading**：預設用 `IntersectionObserver`，元件進入 viewport 才載入 Mermaid 並 render。
- **主題整合**：若專案安裝 `@nuxtjs/color-mode`，會自動依 `dark/light` 切換 Mermaid 主題；也支援 `useMermaidTheme()` 手動控制。
- **可客製元件**：可指定自訂 renderer / spinner / error component。
- **Runtime Config**：支援用 `runtimeConfig.public.contentMermaid` 於部署時覆寫設定。
- **Frontmatter**： 可在文章 frontmatter 中設定 `config` 屬性，覆寫該篇文章的 Mermaid 設定。
- **TypeScript 支援**：模組與元件皆有完善的 TypeScript 定義。
- **測試覆蓋**：使用 Vitest 撰寫單元測試，確保模組穩定性。

## 工作原理簡單示意

````mermaid
---
toolbar:
  title: nuxt-content-mermaid Basic Flow
---
flowchart TD
  MD["在 Markdown 寫下<br><b>```mermaid</b> 區塊"] --> Hook["Nuxt Content hook<br/><b>content:file:beforeParse</b>"]
  Hook --> Comp["輸出 <Mermaid> 元件"]
  Comp --> Plugin["client plugin 提供 $mermaid()"]
  Plugin --> Import["dynamic import('mermaid')"]
  Import --> Render["mermaid.run() 產生 SVG"]
````

## 快速使用

1. 安裝：

```bash
pnpm add -D @barzhsieh/nuxt-content-mermaid
```

2. 加到 `nuxt.config.ts`：

```ts
export default defineNuxtConfig({
  modules: ['@barzhsieh/nuxt-content-mermaid', '@nuxt/content'],
  contentMermaid: {
    theme: { light: 'default', dark: 'dark' },
    // loader: { lazy: true, init: { securityLevel: 'strict' } },
  },
})
```

3. 在 Markdown 直接寫 Mermaid：

````md
```mermaid
graph LR
  A[Start] --> B{Is it working?}
  B -- Yes --> C[Great!]
  B -- No --> D[Debug]
```
````

## 相關連結

- NPM：[https://www.npmjs.com/package/@barzhsieh/nuxt-content-mermaid](https://www.npmjs.com/package/@barzhsieh/nuxt-content-mermaid){:target="\_blank"}
- GitHub：[https://github.com/andy820621/nuxt-content-mermaid](https://github.com/andy820621/nuxt-content-mermaid){:target="\_blank"}
