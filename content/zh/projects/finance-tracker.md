---
title: 個人財務追蹤系統
date: 2025/5/10
description: EconoMe - 簡單易用的個人財務管理解決方案
image: /project-images/finance-tracker.webp
alt: 個人財務追蹤系統
ogImage: /project-images/finance-tracker.webp
tags: ['財務管理', 'Nuxt 3', 'Vue 3', 'Supabase', 'TypeScript', 'Tailwind CSS']
categories: ['專案案例', 'Web開發', 'SaaS', '個人理財']
published: true
imageClass: object-left-top

sitemap:
  lastmod: 2025-05-10
  changefreq: weekly
  priority: 0.8
  images:
    - loc: /project-images/finance-tracker.webp
      title: 個人財務追蹤系統
      caption: EconoMe - 簡單易用的個人財務管理解決方案
---

## 專案背景

在現今生活中，妥善管理個人財務對於達成長期財務目標至關重要。然而，許多人面臨記帳不持續、難以追蹤支出模式，或缺乏有效工具來分析財務現況等挑戰。

我決定開發一個直覺易用的財務追蹤系統，幫助用戶清晰掌握自己的收支情況，並透過視覺化分析提供實用的財務洞見，協助用戶做出更明智的財務決策。

## 介紹

### 完整的財務管理方案

EconoMe 提供完整的財務管理功能，從日常交易記錄到長期趨勢分析，讓用戶輕鬆掌握財務狀況。

![系統概覽](/project-images/finance-tracker/overview.webp){placeholder style="margin-left: 1rem"}

### 核心功能

EconoMe 的功能設計著重於簡潔實用，滿足日常財務管理需求。

<!-- prettier-ignore-start -->
| 交易管理 | 分析與報告 |
| ------- | ------- |
| - 多種交易類型（收入、支出、儲蓄、投資）<br>- 靈活的分類系統<br>- 快速新增與編輯<br>- 支出分類標籤 | - 收支趨勢視覺化<br>- 期間比較分析<br>- 自定義時間範圍<br>- 百分比變化計算 |
<!-- prettier-ignore-end -->

### 登入系統

#### Magic Link

使用 Supabase 的 Magic Links 功能實作登入系統，讓用戶無需記憶密碼即可輕鬆登入。只需輸入電子郵件地址，即可收到登入連結，點擊後即可進入系統。

::ProjectLightBox{folder="finance-tracker/magic-link"}
::

### 使用者設定

用戶可以輕鬆管理個人資料與偏好設定，包括：

- 個人資料編輯
- 查看交易的方式 （依據日期）

::ProjectLightBox{folder="finance-tracker/settings"}
::

## 技術棧

<!-- prettier-ignore-start -->
|      | 主要技術  |
| ---- | ------- |
| 前端 | - 框架：Nuxt 3 (基於 Vue 3)<br>- UI框架：@nuxt/ui<br>- 樣式：Tailwind CSS<br>- 程式語言：TypeScript |
| 後端 | - 服務平台：Supabase<br>- 認證系統：Supabase Auth<br>- 資料庫：PostgreSQL<br>- API：RESTful API |
| 工具 | - 日期處理：date-fns<br>- 資料視覺化：Chart.js<br>- 資料驗證：zod<br>- 測試資料：@faker-js/faker |
<!-- prettier-ignore-end -->

## 未來規劃

系統持續改進的方向包括：

- 預算管理系統
- 增強資料視覺化（類別餅圖、長期趨勢分析）
- 定期交易功能
- 財務目標追蹤
- 多貨幣支援
- CSV 匯入/匯出

## 結語

EconoMe 專案致力於提供簡單而強大的財務管理工具，幫助用戶掌握財務狀況並做出更明智的決策。如果您有興趣試用，可以查看 [Demo](https://econo-me-tracker.vercel.app/){target="\_blank" rel="noopener"}（示例連結）。
