---
title: Personal Portfolio Website
date: 2025/12/18
description: A Nuxt 4 portfolio built with a product mindset—bilingual Nuxt Content, i18n, global search, automated image pipeline, and comprehensive SEO for long-term maintainability.
cover: /project-images/portfolio-2024.webp
image: /project-images/portfolio-2024-hero.webp
alt: Nuxt 4 personal portfolio website
ogImage: /project-images/portfolio-2024-hero.webp
tags: ['Nuxt', 'Nuxt 4', 'TypeScript', 'UnoCSS', 'Nuxt Content', 'i18n', 'SEO', 'Schema.org', 'MiniSearch', 'Nitro', 'Netlify']
categories: ['Portfolio', 'Nuxt', 'Full Stack']
updatedAt: 2025/12/22
published: true

sitemap:
  lastmod: 2025-12-18
  changefreq: monthly
  priority: 0.95
  images:
    - loc: /project-images/portfolio-2024-hero.webp
      title: "Nuxt 4 personal portfolio website"
      caption: "A bilingual Nuxt 4 portfolio site with content management, global search, and comprehensive SEO."
---

## Project Overview

This is a personal portfolio built with a **product mindset**: it's designed to be maintained long term, not just to look good once.
It brings together a blog, projects, technical demos, and a gallery.

Core stack: **[Nuxt 4](https://nuxt.com/) + [TypeScript](https://www.typescriptlang.org/) + [UnoCSS](https://unocss.dev/)**, with content powered by [@nuxt/content](https://content.nuxtjs.org/) (Markdown-based).

I treat every piece—content workflows, SEO, image/media pipeline, and deployment—as part of the product.

---

## Core Features

### Bilingual content system

Built on [@nuxtjs/i18n](https://i18n.nuxtjs.org/) with a consistent schema (validated with [Zod](https://zod.dev/)) and a clean URL strategy, so content stays predictable as it grows.

### Global search (`Cmd/Ctrl+K`)

A keyboard-first search experience powered by [MiniSearch](https://github.com/lucaong/minisearch) with section-level indexing, supporting **section/paragraph-level** search for Markdown, so users can jump directly to what they need.

### Comprehensive SEO

Integrated with [@nuxtjs/seo](https://github.com/nuxt-modules/seo) suite, including:

- [Schema.org](https://schema.org/) structured data
- Automatically generated [sitemap](https://nuxt.com/modules/sitemap), OG images, meta tags, robots.txt, and more
- Integrated validation tooling with [remark-validate-links](https://github.com/remarkjs/remark-validate-links) to keep SEO best practices enforced

### Automated image data pipeline

With [@nuxt/image](https://image.nuxtjs.org/) for optimization, build-time scripts generate `gallery-images-map.json`, `project-images-map.json`, and optional image metadata, and the UI uses LightBox for a smooth viewing experience.

### Smart prerendering

A [Nitro](https://nitro.unjs.io/) prerender hook scans Markdown routes and filters out drafts (`published: false`) so only finished content ships. Deployed to [Netlify](https://www.netlify.com/) using [@netlify/nuxt](https://github.com/netlify/netlify-nuxt) adapter.

### UX polish

- **TOC + anchors**: smooth scrolling to headings
- **Tag filtering**: multi-tag combinations
- **Social share**: one-click sharing to platforms
- **Dynamic backgrounds**: fresh visuals on every visit
- **Prev/next navigation**: more continuous reading

---

## Design Principles

### Maintainability first

Querying, formatting, and SEO logic are centralized in composables to avoid repeating the same implementation on every page.

### Systematic content

Nuxt Content collections + schemas keep front matter consistent across content types and across locales.

### Automate everything possible

From image maps to routes to SEO defaults, automate the boring parts to reduce mistakes and manual workload.

### UX matters

Small details add up: smooth scrolling, keyboard shortcuts, instant search, and flexible filters are all polished intentionally.

---

## Further Reading

Want the implementation details? I wrote a series of deep dives:

1. [Nuxt 4 Portfolio as a Product](/posts/nuxt4-portfolio-architecture)

2. [Bilingual Nuxt Content v3 + i18n](/posts/nuxt-content-v3-i18n-bilingual-site)

3. [Prerendering Markdown routes safely (Nitro)](/posts/nitro-prerender-dynamic-routes-solution)

4. [Global search for Markdown sections (MiniSearch)](/posts/global-fulltext-search)

5. [Image pipeline: JSON maps + metadata + LightBox + Schema.org](/posts/image-management-pipeline)

6. [Nuxt 4 SEO guide](/posts/nuxt-seo-guide)

---

## Project Links

- [**Live Site**](/)
- [**GitHub**](https://github.com/andy820621/portfolio-2024)

---

## Tech Stack Summary

| Area        | Stack                                                        | Purpose                                                |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| **Core**    | Nuxt 4, Vue 3, TypeScript                                    | Application foundation                                 |
| **Styling** | UnoCSS                                                       | Atomic CSS + theming                                   |
| **Content** | @nuxt/content, @nuxtjs/i18n, Zod                             | Markdown CMS, bilingual content + schema validation    |
| **SEO**     | @nuxtjs/seo, Schema.org, nuxt-sitemap, remark-validate-links | Structured data, search optimization + link validation |
| **Search**  | MiniSearch                                                   | Global content search engine                           |
| **Media**   | @nuxt/image, automation scripts                              | Image optimization + pipelines                         |
| **Deploy**  | Netlify, @netlify/nuxt, Nitro                                | Static output + CDN deployment                         |

---

_This project is actively maintained. Feedback and suggestions are welcome via [GitHub Issues](https://github.com/andy820621/portfolio-2024/issues)._
