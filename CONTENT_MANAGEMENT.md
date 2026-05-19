# 內容管理指南 (Content Management Guide)

本文檔說明如何在專案中新增和管理 Gallery 和 Projects 內容。

---

## 📸 Gallery 管理

### 新增相簿 (Album)

#### 1. 準備圖片文件

```bash
# 在 public/gallery-images/ 下創建新資料夾；資料夾名稱使用 albumId
public/gallery-images/
  └── Your Album Name/
      ├── image1.webp
      ├── image2.webp
      └── image3.webp
```

**注意事項：**

- 資料夾名稱必須與 YAML 的 `albumId` 完全一致；URL 使用 `slug`，圖片路徑仍使用 `albumId`
- 建議使用 `.webp` 格式以優化性能
- 圖片會按檔名自然排序（支援數字順序）

#### 2. 更新 Gallery metadata

在 `content/gallery/` 建立新的 YAML 檔案，例如 `content/gallery/10-your-album.yml`：

```yaml
albumId: 'Your Album Name' # 必須與圖片資料夾名稱完全一致
slug: your-album-name # Gallery 頁面的 lowercase URL slug，例如 /gallery/your-album-name/
order: 10
title: '相簿標題'
chTitle: '中文標題（可選）'
coverImage: '/gallery-images/Your Album Name.webp' # 封面圖（放在 gallery-images 根目錄）
description: '相簿描述'
tags:
  - 標籤1
  - 標籤2
  - Japan
published: true
```

#### 3. 生成圖片映射文件

```bash
# 手動執行（開發時）
node scripts/generate-gallery-images-map.js

# 或在構建時自動執行
pnpm build  # prebuild 會自動執行此腳本
```

**產出文件：**

- `public/gallery-images-map.json` - 包含所有相簿的圖片列表

#### 4. 測試

```bash
pnpm dev

# 訪問：
# /gallery - 查看相簿列表
# /gallery/your-album-name - 查看相簿內容
```

---

## 💼 Projects 管理

### 新增專案 (Project)

#### 1. 準備圖片文件

```bash
# 在 public/project-images/ 下創建專案資料夾
public/project-images/
  └── your-project/
      ├── 01.home.intro.webp
      ├── 02.feature.dashboard.webp
      └── 03.settings.profile.webp
```

**檔名規範：**

```
格式：{order}.{id}.{title}.{ext}

範例：
- 01.home.intro.webp
  ├─ order: 01 (排序)
  ├─ id: home (識別)
  └─ title: intro (標題)

- simple-name.webp (也支援簡單格式)
```

**支援的子資料夾：**

```bash
your-project/
  ├── feature-a/
  │   ├── 01.screenshot.webp
  │   └── 02.detail.webp
  └── feature-b/
      └── 01.overview.webp
```

#### 2. 生成圖片映射文件

```bash
# 手動執行
node scripts/generate-project-images-map.js

# 或在構建時自動執行
pnpm build  # prebuild 會自動執行此腳本
```

**產出文件：**

- `public/project-images-map.json` - 包含所有專案的圖片文件列表

#### 3. 生成元數據文件（首次或添加新圖片時）

```bash
pnpm run generate:metadata
# 或
node scripts/generate-project-images-metadata.js
```

**產出文件：**

- `public/project-images-metadata.json` (英文)
- `public/project-images-metadata.zh.json` (中文)

**元數據結構：**

```json
{
  "your-project": {
    "01.home.intro.webp": {
      "title": "Home Intro",
      "description": "Your Project - Home Intro"
    }
  }
}
```

#### 4. 自定義元數據（可選）

手動編輯生成的元數據文件，改善標題和描述：

```json
{
  "your-project": {
    "01.home.intro.webp": {
      "title": "歡迎頁面", // 👈 自定義標題
      "description": "展示產品核心價值的歡迎頁面設計" // 👈 自定義描述
    }
  }
}
```

**重要：** 手動編輯的元數據會被保留！再次執行 `generate:metadata` 不會覆蓋已編輯的內容。

#### 5. 創建 Markdown 內容

```bash
# 創建專案文件
content/
  ├── en/projects/your-project.md
  └── zh/projects/your-project.md
```

**在 Markdown 中使用圖片：**

```markdown
---
title: Your Project Title
description: Project description
---

## 功能展示

<!-- 使用 ProjectLightBox 組件顯示圖片集 -->

::ProjectLightBox{folder="your-project"}
::

<!-- 顯示特定子資料夾的圖片 -->

::ProjectLightBox{folder="your-project/feature-a"}
::
```

#### 6. 測試

```bash
pnpm dev

# 訪問：/projects/your-project
```

---

## 🔄 Scripts 流程圖

### 自動執行流程（構建時）

```
pnpm build
  ↓
[prebuild hook]
  ↓
├── generate-project-images-map.js
│   └── 輸出：public/project-images-map.json
│
└── generate-gallery-images-map.js
    └── 輸出：public/gallery-images-map.json
  ↓
nuxt build
```

### 手動執行流程（元數據管理）

```
[手動執行] pnpm run generate:metadata
  ↓
generate-project-images-metadata.js
  ├── 讀取：public/project-images-map.json
  ├── 讀取：public/project-images-metadata.json (保留已有數據)
  ├── 為新圖片生成元數據
  └── 輸出：
      ├── public/project-images-metadata.json
      └── public/project-images-metadata.zh.json
```

---

## 📋 快速檢查清單

### 新增 Gallery 相簿

- [ ] 在 `public/gallery-images/Your Album Name/` 放入圖片
- [ ] 準備封面圖 `public/gallery-images/Your Album Name.webp`
- [ ] 在 `content/gallery/*.yml` 新增相簿 metadata，並設定唯一 lowercase `slug`
- [ ] 執行 `node scripts/generate-gallery-images-map.js`（或等構建時自動執行）
- [ ] 測試訪問 `/gallery/your-album-name`

### 新增 Project 專案

- [ ] 在 `public/project-images/project-name/` 放入圖片
- [ ] 執行 `node scripts/generate-project-images-map.js`
- [ ] **首次或有新圖片時**執行 `pnpm run generate:metadata`
- [ ] （可選）手動編輯 `project-images-metadata.json` 優化內容
- [ ] 創建 `content/en/projects/project-name.md`
- [ ] 創建 `content/zh/projects/project-name.md`
- [ ] 在 Markdown 中使用 `::ProjectLightBox{folder="project-name"}`（並以 `::` 結尾）
- [ ] 測試訪問 `/projects/project-name`

---

## ⚠️ 常見問題

### Q: 為什麼 Gallery 圖片沒有顯示？

**A:** 檢查以下項目：

1. 圖片是否在 `public/gallery-images/{albumId}/` 目錄中
2. 封面圖是否在 `public/gallery-images/{albumId}.webp`
3. `content/gallery/*.yml` 中的 `albumId` 是否與圖片資料夾名稱一致
4. `content/gallery/*.yml` 中的 `slug` 是否為唯一 lowercase slug（URL 使用 slug，圖片資料夾仍使用 albumId）
5. 是否執行了 `generate-gallery-images-map.js`
6. 檢查 `public/gallery-images-map.json` 是否包含該相簿的 `albumId`

### Q: 修改圖片後需要做什麼？

**A:**

- **Gallery**: 重新執行 `node scripts/generate-gallery-images-map.js`
- **Projects**: 重新執行 `node scripts/generate-project-images-map.js`，如果有新圖片再執行 `pnpm run generate:metadata`

### Q: 元數據會被覆蓋嗎？

**A:** 不會！`generate-project-images-metadata.js` 會保留已存在的自定義元數據，只為新圖片生成初始元數據。

### Q: 什麼時候需要執行 `generate:metadata`？

**A:**

- 第一次設置專案時
- 添加了新的專案圖片時
- 元數據文件損壞需要重建時
- **不需要**在每次構建時執行

### Q: 可以在 Markdown 中直接引用圖片嗎？

**A:** 可以，但建議使用 `ProjectLightBox` 組件以獲得更好的展示效果：

```markdown
<!-- 直接引用 -->

![描述](/project-images/project-name/image.webp)

<!-- 使用組件（推薦） -->

::ProjectLightBox{folder="project-name"}
::
```

---

## 🛠️ 相關文件

### 數據源

- `content/gallery/*.yml` - Gallery metadata
- `public/gallery-images/` - Gallery 圖片目錄
- `public/project-images/` - Project 圖片目錄

### Scripts

- `scripts/generate-gallery-images-map.js` - 生成 Gallery 圖片列表
- `scripts/generate-project-images-map.js` - 生成 Project 圖片列表
- `scripts/generate-project-images-metadata.js` - 生成 Project 元數據

### 產出文件

- `public/gallery-images-map.json` - Gallery 圖片映射
- `public/project-images-map.json` - Project 圖片映射
- `public/project-images-metadata.json` - Project 元數據（英文）
- `public/project-images-metadata.zh.json` - Project 元數據（中文）

### Composables

- `app/composables/useGalleryImages.ts` - Gallery 圖片管理
- `app/composables/useProjectImages.ts` - Project 圖片管理

### 組件

- `app/components/content/ProjectLightBox.vue` - Project 圖片展示組件
- `app/components/LightGallery.vue` - Gallery 圖片展示組件

---

## 💡 最佳實踐

1. **圖片優化**
   - 使用 WebP 格式
   - 壓縮圖片大小
   - 適當的解析度（建議 1920px 寬）

2. **命名規範**
   - Gallery: 使用描述性的資料夾名稱
   - Projects: 使用 kebab-case，如 `finance-tracker`
   - 圖片檔名: 使用數字前綴以控制順序

3. **元數據管理**
   - 為重要的專案圖片自定義元數據
   - 使用清晰的描述幫助 SEO
   - 中英文元數據分別維護

4. **版本控制**
   - 提交生成的 JSON 文件到 Git
   - 不要 gitignore 元數據文件（因為可能包含手動編輯的內容）

---

**最後更新：** 2025-01-04
**維護者：** Andy Hsieh
