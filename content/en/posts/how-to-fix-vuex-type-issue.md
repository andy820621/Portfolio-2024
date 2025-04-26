---
title: How to fix vuex type issue
date: 2024/1/9
description: In recent vue project we see that vuex type not working properly. We will fix that type issue and make vuex type workable
image: /blog-images/how-to-fix-vuex-type-issue.jpg
alt: How to fix vuex type issue
ogImage: /blog-images/how-to-fix-vuex-type-issue.jpg
tags: ['vue', 'vuex', 'typescript', 'type error', 'state management', 'frontend', 'bug fix']
categories: ['Frontend', 'Vue', 'State Management', 'TypeScript']
published: true
schemaOrg:
  - "@type": "BlogPosting"
    headline: "How to fix vuex type issue"
    description: "In recent vue project we see that vuex type not working properly. We will fix that type issue and make vuex type workable."
    author:
      "@type": "Person"
      name: "BarZ Hsieh"
    datePublished: "2023/1/9"
    dateModified: "2023/1/9"
    image: "/blog-images/how-to-fix-vuex-type-issue.jpg"
    keywords: ['vue', "vuex"]
    articleSection: "TechArticle"
sitemap:
  lastmod: 2025-04-17
  changefreq: weekly
  priority: 0.8
  images:
    - loc: /blog-images/how-to-fix-vuex-type-issue.jpg
      title: "How to fix vuex type issue"
      caption: "In recent vue project we see that vuex type not working properly. We will fix that type issue and make vuex type workable."
---

## Introduction

In recent version of our vue project, when we try to add vuex we see type error and vuex type not found. We can easily fix that issue.

## How to fix that issue

1. Create a `vuex.d.ts` file inside of your route project.
2. Pase this code in that file

```ts
declare module 'vuex' {
  export * from 'vuex/types/helpers.d.ts'
  export * from 'vuex/types/index.d.ts'
  export * from 'vuex/types/logger.d.ts'
  export * from 'vuex/types/vue.d.ts'
}
```

3. That's it. Your are ok to go.
