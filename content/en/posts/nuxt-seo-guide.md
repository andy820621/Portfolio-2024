---
title: Nuxt 4 SEO guide: meta, Schema.org, sitemap, and validation
date: 2025/12/17
description: A practical SEO setup for a bilingual Nuxt 4 content site: consistent meta, OG image generation, Schema.org (including image licensing), dynamic sitemap endpoints, and a validation checklist with common pitfalls.
image: /blog-images/nuxt-seo-guide.webp
alt: Nuxt 4 SEO: Meta, Schema.org, and sitemap
ogImage: /blog-images/nuxt-seo-guide.webp
tags: ['Nuxt', 'SEO', 'Schema.org', 'Sitemap', 'Open Graph', 'i18n']
categories: ['Nuxt', 'SEO']
published: true
schemaOrg:
  - "@type": "BlogPosting"
    headline: "Nuxt 4 SEO guide: meta, Schema.org, sitemap, and validation"
    description: "A practical SEO setup for a bilingual Nuxt 4 content site: consistent meta, OG image generation, Schema.org (including image licensing), dynamic sitemap endpoints, and a validation checklist with common pitfalls."
    author:
      "@type": "Person"
      name: "BarZ Hsieh"
    datePublished: "2025/12/17"
    dateModified: "2025/12/17"
    image: "/blog-images/nuxt-seo-guide.webp"
    keywords: ["Nuxt SEO", "Schema.org", "Sitemap", "Open Graph", "i18n"]
    articleSection: "TechArticle"

sitemap:
  lastmod: 2025-12-17
  changefreq: weekly
  priority: 0.8
  images:
    - loc: /page-cover/blog.webp
      title: "Nuxt 4 SEO guide"
      caption: "Meta + Schema.org + sitemap + OG images (with validation and common pitfalls)."
---

On most sites, SEO is treated as “marketing”. But for a portfolio, SEO is part of product quality: every page should be reliably understandable, previewable, and shareable.

## Why portfolios still need SEO

For developers/designers, a portfolio is not only a showcase—it’s also:

- how potential employers/clients find you through search
- how your work looks when shared on social platforms (OG / Twitter Card)
- a test of your understanding of web standards and structured content (Schema / Sitemap)

Portfolio SEO is also tricky: mixed content types (posts, projects, galleries), bilingual routing, and the need to generate canonical/OG/schema/sitemap correctly in SSG/SSR contexts.

## The three pillars: Meta, Schema, Sitemap

- **Meta (OG/Twitter)**: controls SERP and share previews—most visible changes
- **Schema.org**: helps search engines understand your content types and relationships (articles, lists, images, licensing)
- **Sitemap**: helps crawlers discover every important URL, especially with dynamic and multilingual content

A pragmatic strategy is: **centralize defaults, derive automatically from real page data, and validate early**.

## 1) Page-level meta: one composable

Create a SEO composable that centrally handles:

- title/description/keywords
- `og:*` / `twitter:*` (especially `og:url`, `og:image`)
- robots flags (e.g. noindex)
- canonical and trailing-slash normalization (avoid `/about` and `/about/` being treated as separate pages)

One common pitfall is **base URL**: you need a single source of truth that works in production and previews (e.g. `NUXT_PUBLIC_SITE_URL` or `I18N_BASE_URL`), otherwise `og:url`/`og:image` often break in preview environments.

```ts
interface PageSeoOptions {
  title: string
  description: string
  ogImage?: string
  keywords?: string | string[]
  noIndex?: boolean
}

export function usePageSeo(options: PageSeoOptions) {
  const route = useRoute()
  const config = useRuntimeConfig()

  const baseUrl = config.public.siteUrl // e.g. NUXT_PUBLIC_SITE_URL / I18N_BASE_URL
  const fullUrl = `${baseUrl}${route.path}` // locale prefix is part of route.path

  useSeoMeta({
    title: options.title,
    description: options.description,
    keywords: options.keywords,
    robots: options.noIndex ? 'noindex, nofollow' : 'index, follow',

    ogTitle: options.title,
    ogDescription: options.description,
    ogUrl: fullUrl,
    ogImage: options.ogImage,
    // twitterCard / twitterImage etc can be filled here too
  })
}
```

## 2) Content page SEO: derived from front matter

For content pages (posts/projects), the lowest-friction approach is to derive SEO from front matter:

- authors maintain `title`, `description`, `cover/ogImage`, `tags`
- composables merge tags into keywords, fill `og:url`, and handle draft/noindex logic
- for extra fields like `wordCount`/`readingTime`, compute them during build/parse so authors don’t maintain them manually

## 3) Schema.org in practice

Schema is more than articles. Typical mappings:

- **Home**: ProfilePage
- **Index pages (posts/projects/gallery)**: CollectionPage + ItemList
- **Detail pages**: WebPage + Article/BlogPosting
- **Gallery album**: WebPage + ItemList + `ImageObject` entries

You can also attach **image licensing** info to Schema.org:

```ts
// Gallery image Schema.org (with licensing)
const { locale } = useI18n()

useSchemaOrg([
  defineImage({
    '@id': `${fullUrl}#image-${locale.value}`, // avoid @id collision across locales
    '@type': 'ImageObject',
    'contentUrl': imageUrl,
    'url': imageUrl,

    // licensing fields (the highlight)
    'license': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    'acquireLicensePage': `${baseUrl}/license/`,
    'creditText': 'Photo by Your Name',
    'creator': {
      '@type': 'Person',
      'name': 'Your Name',
    },
  }),
])
```

> Tip: use “absolute URL + fragment” for `@id`, and avoid duplicates across locales (put locale in fragment or use `fullUrl`).

## 4) Sitemap: dynamic content + i18n + images

### Why custom sitemap endpoints?

Nuxt SEO / sitemap modules can generate sitemaps, but complex dynamic content often requires custom endpoints:

- generate entries based on real data sources (gallery/albums/projects)
- include image sitemap data (covers or representative images)
- ensure locale-aware URLs and hreflang alignment

So a pragmatic approach is to output sitemap URLs via **Nitro API routes**.

Example: generate a sitemap entry for a gallery album with image data:

```ts
import type { SitemapUrl } from '#sitemap/types'

export default defineSitemapEventHandler((): SitemapUrl[] => {
  return [
    {
      loc: '/gallery/album-1/',
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
      images: [
        {
          loc: '/gallery-images/album-1.webp',
          title: 'Album 1',
          caption: 'Cover image',
        },
      ],
    },
  ]
})
```

> If you have drafts/unpublished content, exclude them both in build/prerender and sitemap output (e.g. `sitemap: false` or `robots: false` in front matter).

## 5) SEO validation checklist

Content sites often “slowly regress”: broken links, invalid HTML, or a change that silently breaks schema/sitemap.

### During development

- [ ] HTML validation: enable dev-time validators
- [ ] Link validation: validate Markdown links at build time (avoid dead links)
- [ ] Meta checks: DevTools or https://metatags.io

### Before deployment

- [ ] Prerender test: ensure all dynamic routes are actually prerendered
- [ ] Sitemap check: open `/sitemap.xml` (or sitemap index) and verify completeness
- [ ] Schema validation: Google Rich Results Test / Schema Markup Validator

### After deployment

- [ ] Broken link scan: schedule link checks (or CI jobs)
- [ ] Search Console: submit sitemaps, monitor coverage and indexing
- [ ] OG preview: test shares on LinkedIn/Twitter/Facebook

## Summary

SEO success for content portfolios is rarely “add more meta tags”. It’s making Meta, Schema, and Sitemap maintainable systems: centralized defaults, derived fields, and a validation checklist so quality doesn’t slowly decay over time.
