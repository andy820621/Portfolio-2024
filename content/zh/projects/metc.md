---
title: 智慧消防系統
date: 2024/3/31
description: 智慧消防系統 - 社區防災物聯網解決方案
image: /project-images/metc.webp
alt: 智慧消防系統
ogImage: /project-images/metc.webp
tags: ['智慧消防', '物聯網', '社區防災', 'Web開發', 'Vue', 'Quasar', 'PWA', '.NET Core', 'WorkflowCore']
categories: ['專案案例', 'IoT應用', '智慧城市', '消防科技']
published: true

sitemap:
  lastmod: 2025-04-17
  changefreq: weekly
  priority: 0.8
  images:
    - loc: /project-images/metc.webp
      title: 智慧消防系統
      caption: 智慧消防系統 - 社區防災物聯網解決方案
---

## 專案背景

台灣每年發生的火災次數居高不下，平均每4小時就會有一起火災，其中住宅火災佔了70.4%。
我們公司長期在相關領域中，發現現今民眾的防災觀念和相關政策存在諸多不足之處。
因此，我們公司決心開發一個全新的智慧消防系統，希望透過 IoT 技術實現一個智慧消防管理平台，通過技術提升社區防災能力和應變效率。

## 介紹

### 智慧消防資訊整合

首先會需要建置權限系統、大樓資訊建檔，透過對社區資料的建置，可以更好的去應對各種情形的發生。

![intro image](/project-images/metc/01.intro.webp){placeholder style="margin-left: 1rem"}

### 使用方式

根據使用時機主要可分成<b>平時管理</b>、<b>災時應變</b>這個兩個大方向。

<!-- prettier-ignore-start -->
| 平時管理 | 緊急應變 |
| ------- | ------- |
| - 社區人員資訊管理<br>- 定期檢查和維護排程<br>- 公告發佈系統<br>- 設備狀態追蹤 | - 實時監控消防設備（消防總機、PLC）<br>- 多管道即時通知（WebSocket、Line、手機推播、簡訊）<br>- 智能任務調度<br>- 應變指引和疏散路線推薦 |
<!-- prettier-ignore-end -->

![function image](/project-images/metc/02.function.webp){placeholder style="margin-left: 1rem"}

### 災時應對

平時消防編組的訓練、或是實際災時，防災中心可以透系統的監控資料，給予編組、社區成員更為正確且迅速的指示。

::ProjectLightBox{folder="metc/monitor"}
::

## 技術棧

<!-- prettier-ignore-start -->
|      | 主要技術  |
| ---- | ------- |
| 前端 | - 框架：Vue 3<br>- UI庫：Quasar<br>- 編程語言：TypeScript<br>- 特殊功能：PWA（iOS推播支持）|
| 後端 | - 開發框架：.NET Core <br>- 工作流引擎：WorkflowCore <br>- 通訊協議：WebSocket <br>- 跨平台通知：多通道整合 |
<!-- prettier-ignore-end -->
