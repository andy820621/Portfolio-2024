---
title: 如何創建子網域並連接到 Vercel 應用程式
date: 2023/5/1
description: 在這裡，我們將學習如何創建子網域並連接到 Vercel 應用程式
image: /blog-images/create-namespace-subdomain-connect-to-vercel.jpg
alt: 如何創建子網域並連接到 Vercel 應用程式
ogImage: /blog-images/create-namespace-subdomain-connect-to-vercel.jpg
tags: ['nuxt', 'vercel', 'namecheap']
published: true
---

### 介紹

嘿，朋友們！如果你想在 Namecheap 上創建一個子網域，然後把它連接到你的 Vercel 應用程式，其實很簡單。在這篇文章中，我會帶你一步步完成這個過程，讓你輕鬆搞定！

### Step 1：在 Namecheap 上創建一個子網域

首先，我們要在 Namecheap 上創建一個子網域。登入你的 Namecheap 帳戶，進入你的網域儀表板。點擊「進階 DNS」標籤，然後點擊「新增新記錄」。

在「類型」下拉選單中選擇「CNAME（別名）」。在「主機」欄位中輸入你的子網域名稱（例如，如果你想要「app.yourdomain.com」，就輸入「app」）。在「值」欄位中輸入你的 Vercel 應用程式的 URL（例如，「yourapp.vercel.app」）。

### Step 2：驗證子網域

創建完子網域後，我們需要確認它已經正確設置。前往你的 Vercel 應用程式儀表板，點擊「網域」標籤。點擊「新增網域」，然後輸入你的子網域名稱。Vercel 會驗證子網域並確認它已正確設置。

### Step 3：將子網域新增到你的 Vercel 應用程式

現在你的子網域已經驗證過了，接下來要把它新增到你的 Vercel 應用程式。進入應用程式儀表板，點擊「設定」，然後點擊「網域」。點擊「新增網域」，輸入你的子網域名稱，然後點擊「新增」。

### Step 4：在 Vercel 中驗證子網域

將子網域新增到你的 Vercel 應用程式後，你需要再次確認它已正確設置。點擊 Vercel 應用程式儀表板中的子網域，然後點擊「驗證 DNS 配置」。Vercel 會檢查子網域是否已正確設置，並確認它已連接到你的 Vercel 應用程式。

### 結論

將 Namecheap 上的子網域連接到你的 Vercel 應用程式其實很簡單，只需要幾個步驟就能完成。按照這篇文章中的步驟，你可以輕鬆地在 Namecheap 上創建子網域並連接到你的 Vercel 應用程式。記得在 Namecheap 和 Vercel 中都驗證你的子網域，以確保設置正確。如果遇到任何問題，別忘了聯繫 Vercel 支援獲取幫助哦！
