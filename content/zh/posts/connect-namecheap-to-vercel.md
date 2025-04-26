---
title: 如何將 Namecheap 網域連接到 Vercel 部署的應用程式
date: 2023/5/1
description: 在這裡你將學習如何將你的 Namecheap 網域連接到 Vercel 部署的應用程式。
image: /blog-images/connect-namecheap-to-vercel.jpg
alt: 如何將 Namecheap 網域連接到 Vercel 部署的應用程式
ogImage: /blog-images/connect-namecheap-to-vercel.jpg
tags: ['Namecheap', 'Vercel', '自訂網域', 'DNS 記錄', '網域綁定', '部署教學', '網站連接', '雲端服務']
categories: ['網域設定', '部署教學', 'Vercel 指南', 'DNS 操作', '網站管理']
published: true
schemaOrg:
  - "@type": "BlogPosting"
    headline: "如何將 Namecheap 網域連接到 Vercel 部署的應用程式"
    description: "在這裡你將學習如何將你的 Namecheap 網域連接到 Vercel 部署的應用程式。"
    author:
      "@type": "Person"
      name: "BarZ Hsieh"
    datePublished: "2023/5/1"
    dateModified: "2023/5/1"
    image: "/blog-images/connect-namecheap-to-vercel.jpg"
    keywords: ["Namecheap", "Domain", "Vercel", "Deploy"]
    articleSection: "TechArticle"

sitemap:
  lastmod: 2025-04-17
  changefreq: weekly
  priority: 0.8
  images:
    - loc: /blog-images/connect-namecheap-to-vercel.jpg
      title: "如何將 Namecheap 網域連接到 Vercel 部署的應用程式"
      caption: "如何將 Namecheap 網域連接到 Vercel 部署的應用程式"
---

## 介紹

如果你從 Namecheap 上購買了一個網域並希望將其連接到你的 Vercel，則需要遵循幾個步驟。
在這篇文章中，我們將引導你如何將 Namecheap 網域連接到 Vercel。

## Step 1：將自訂網域新增到你的 Vercel 應用程式

請登入你的 Vercel 帳戶並進入你的儀表板（dashboard）。
點擊「設定」，然後選擇「網域」。點擊「新增網域」，輸入你的自訂網域名稱，然後點擊「新增」。

## Step 2：從 Vercel 獲取 DNS record

一旦你將自訂網域新增到 Vercel，你需要從 Vercel 獲取 DNS 記錄。
為此，返回「網域」部分，點擊你剛剛新增的自訂網域，然後點擊「DNS 記錄」。

你會看到需要新增到 Namecheap 帳戶的 DNS 記錄列表，包括 A record、CNAME record和 TXT record。

## Step 3：將 DNS record 新增到 Namecheap

現在你已經從 Vercel 獲得了 DNS 記錄，需將它們新增到你的 Namecheap 帳戶。
請登入你的 Namecheap 帳戶並進入你的網域儀表板。點擊「進階 DNS」，然後點擊「新增新記錄」。

首先新增 A record。在「類型」下拉選單中選擇「A（地址）」。在「主機」欄位中輸入「@」（不含引號）。在「值」欄位中輸入來自 Vercel DNS 的 IP 地址。

接著新增 CNAME record。在「類型」下拉選單中選擇「CNAME（別名）」。在「主機」欄位中輸入「www」（不含引號）。在「值」欄位中輸入來自 Vercel DNS record 的值。

最後，新增 TXT record。在「類型」下拉選單中選擇「TXT（文字）」。在「主機」欄位中輸入「@」（不含引號）。在「值」欄位中輸入來自 Vercel DNS 記錄的值。

## Step 4：驗證 DNS 記錄

一旦你將 DNS 記錄新增到 Namecheap 帳戶，你需要驗證它們是否正確。為此，返回你的 Vercel 應用程式儀表板並點擊自訂網域。然後點擊「驗證 DNS 配置」。Vercel 將檢查 DNS 記錄是否已正確設定。

DNS 記錄可能需要一些時間來傳播，所以請耐心等待。一旦 DNS 記錄傳播後，Vercel 將驗證它們，然後你的自訂網域將連接到你的 Vercel 應用程式。

## 結論

將 Namecheap 網域連接到 Vercel 是一個相對簡單的過程。
根據本文中列出的步驟操作，你將能夠很快地連接你的自訂網域。
記得耐心等待，因為 DNS record 可能需要一些時間。
如果你遇到任何問題，不要猶豫，隨時聯繫 Vercel 支援以獲得協助。
