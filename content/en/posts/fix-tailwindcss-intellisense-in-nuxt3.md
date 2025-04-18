---
title: How To Fix TailwindCSS Intellisense In Nuxt3 Project
date: 2023/1/26
description: In Nuxt3 project tailwind css intellisense doesn't seems to work properly. In this blog I will share a workaround to fix this issue.
image: /blog-images/fix-tailwindcss-intellisense-in-nuxt3.jpg
alt: Hwo to fix tailwind intellisense in nuxt3 project
ogImage: /blog-images/fix-tailwindcss-intellisense-in-nuxt3.jpg
tags: ['nuxt', 'tailwindcss']
published: true
schemaOrg:
  - "@type": "BlogPosting"
    headline: "How To Fix TailwindCSS Intellisense In Nuxt3 Project"
    description: "In Nuxt3 project tailwind css intellisense doesn't seems to work properly. In this blog I will share a workaround to fix this issue."
    author:
      "@type": "Person"
      name: "BarZ Hsieh"
    datePublished: "2023/1/26"
    dateModified: "2023/1/26"
    image: "/blog-images/fix-tailwindcss-intellisense-in-nuxt3.jpg"
    keywords: ["TailwindCSS", "Nuxt3"]
    articleSection: "TechArticle"
sitemap:
  lastmod: 2025-04-17
  changefreq: weekly
  priority: 0.8
  images:
    - url: /blog-images/fix-tailwindcss-intellisense-in-nuxt3.jpg
      title: "How To Fix TailwindCSS Intellisense In Nuxt3 Project"
      caption: "In Nuxt3 project tailwind css intellisense doesn't seems to work properly. In this blog I will share a workaround to fix this issue."
---

### Problems

I had a Nuxt3 and TailwindCSS project. which was opened in VsCode. But the problem was, in my project the tailwind intellisense didn't working properly. I tried to reinstall the vscode tailwind extension but the problem didn't solve properly. Later after doing some research I found a [workaround](https://github.com/tailwindlabs/tailwindcss-intellisense/issues/663#issuecomment-1316788128), That I am sharing here today.

### Why It's Not working

In our nuxt project we have a `.nuxt` directory. Nuxt uses the `.nuxt/` directory in development to generate your Vue application. And if we try to look properly there is also a file called `.nuxt/tailwind.config.cjs`, So tailwind find to config file in the same project, one is in your root directory and another one is in you `.nuxt` directory.

### Possible Workaround

One possible solution is, In your project we call tell the extension to exclude the `.nuxt` directory. To exclude the `.nuxt` directory in your workspace,

- Create a `/.vscode` folder in your project's root level.
- Inside `.vscode` folder add a `settings.json` file
- Copy the below code to `settings.json` file

```json
// /.vscode/settings.json
{
  "tailwindCSS.files.exclude": [
    "**/.git/**",
    "**/node_modules/**",
    "**/.hg/**",
    "**/.svn/**",
    "**/.nuxt/**"
  ]
}
```

Hopefully now tailwind intellisense start working properly.
