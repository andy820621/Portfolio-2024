---
title: "Nuxt canonical, i18n, and internal linking: a layered URL-signal implementation"
date: 2026-05-25
updatedAt: 2026-06-01
description: "Using a bilingual Nuxt portfolio site as the working example, this guide breaks down the real job of canonical URLs, pagination query parameters, trailing slashes, locale alternates, and related pages."
seoTitle: "Nuxt URL signal implementation: canonical, i18n, and internal linking"
seoDescription: "A practical guide to canonical URLs, hreflang, pagination canonical rules, trailing slashes, and related pages in a bilingual Nuxt site."
image: /blog-images/nuxt-seo-guide.webp
alt: "Nuxt canonical, i18n, and internal linking URL-signal implementation"
ogImage:
  url: /blog-images/nuxt-seo-guide.webp
tags: ['Nuxt', 'SEO', 'Canonical', 'i18n', 'Internal Linking', 'Hreflang']
published: true
relatedPages:
  - path: /posts/nuxt-seo-guide
  - path: /posts/nuxt-sitemaps-robots-indexing
  - path: /posts/nuxt-content-v3-i18n-bilingual-site
  - path: /posts/nuxt4-portfolio-architecture
relatedLinks:
  - title: "Canonical URLs in Nuxt · Nuxt SEO"
    href: https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/canonical-urls
    note: Useful for the idea that canonical is a hint rather than a command, and for the practical query-parameter policy.
  - title: "Hreflang Tags in Nuxt · Nuxt SEO"
    href: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/i18n
    note: Useful when checking that multilingual canonicals and hreflang both point at indexable canonical URLs.
  - title: "Trailing Slashes in Nuxt · Nuxt SEO"
    href: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/trailing-slashes
    note: Useful for keeping trailing-slash policy, canonical output, and redirects aligned.
  - title: "How to specify a canonical URL · Google Search Central"
    href: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
    note: Google's official reference for canonical rules and same-language hreflang pairing.
  - title: "Internal Linking · Nuxt SEO"
    href: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/internal-linking
    note: Useful when turning articles into a hub-and-spoke topic cluster.
sitemap:
  images:
    - loc: /blog-images/nuxt-seo-guide.webp
      title: "Nuxt canonical and i18n implementation"
      caption: "Canonical, hreflang, pagination, and internal linking layers for a bilingual personal site."
---

Once a blog starts to have English and Chinese pages, paginated lists, query parameters, multiple URL forms for the same content, and a series of articles linking to each other, the SEO problem is usually no longer “I forgot a canonical tag”.

When I planned this bilingual Nuxt 4 blog, these were the real questions:

- If both `/path` and `/path/` exist, which one is the official URL?
- Pagination can keep `?page=2`, but should `?page=1` exist at all?
- At which layer should alternates and hreflang be generated so they do not fight canonical?
- Are the Chinese and English pages translations of each other, or is one meant to replace the other?
- How should `relatedPages` balance locale, path structure, and return links?

This article is not about the abstract definition of canonical. It is about how I split URL signals inside this personal site so canonical, i18n, and internal linking all reinforce the same URL policy.

## Start by separating what canonical, hreflang, and internal linking each solve

All three operate on URL signals, but they do different jobs:

- **canonical** tells search engines which URL is the official version of the content
- **hreflang / alternates** tell search engines how locale variants relate to each other
- **internal linking** tells both readers and crawlers which pages belong to the same topic path

If you do not separate those responsibilities, the most common result is:

- canonical points at URL A
- hreflang points at URL B
- internal links keep sending people to URL C

At that point, it becomes hard for search engines to tell which URL you actually want to represent the page.

## I split URL signals into four layers

I did not solve this with one helper. I split it into four layers:

1. Path layer: `app/utils/pathUtils.ts` decides how the canonical path is normalized.
2. Site layer: `app/app.vue` plus `useLocaleHead()` handle alternates, trailing slashes, and pagination query output.
3. Page layer: `usePageSeo()` decides which pages need a custom canonical URL.
4. Content layer: `relatedPages` plus `useRelatedPages()` handle topical return links and locale-aware resolution.

That split keeps canonical from being just a string in `<head>`, and keeps i18n from turning into “prepend `/zh` and hope for the best”.

## Path layer: decide what the canonical path looks like

A stable canonical path makes sitemap URLs, share URLs, Schema.org URLs, and breadcrumbs much easier to keep consistent.

This repo defines the base rules in `app/utils/pathUtils.ts`:

```ts
export function canonicalizePagePath(path: string) {
  const normalizedPath = normalizePath(path)

  if (!normalizedPath || normalizedPath === '/')
    return normalizedPath || '/'

  return normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`
}

export function buildCanonicalSiteUrl(baseUrl: string, path: string) {
  const normalizedBaseUrl = normalizeBaseSiteUrl(baseUrl)
  const canonicalPath = encodeCanonicalPagePath(path)
  return `${normalizedBaseUrl}${canonicalPath}`
}
```

My decision is simple: **this site treats the trailing slash as part of the canonical URL.**

> Make the whole site agree on slashes, or the signal gets split across variants.

## Site layer: `app/app.vue` handles alternates, canonical-like URLs, and pagination query parameters

The easy mistake in multilingual SEO is thinking the page layer can set canonical and you are done. Alternates and hreflang are a second pipeline.

In `app/app.vue`, I start from `useLocaleHead({ seo: true })` and then apply two site-wide transforms:

1. Normalize trailing slashes for alternate URLs, canonical-like URLs, `og:url`, and `twitter:url`
2. When the current page is page 2 or higher, add the same `?page=` query to alternate URLs

The core logic looks like this:

```ts
const links = computed(() => localeHead.value.link?.map((link) => {
  const normalizedHref = trailingSlashUrlOrNot(link.href)

  if (link.rel === 'alternate') {
    return {
      ...link,
      href: withPaginationQuery(normalizedHref),
    }
  }

  return {
    ...link,
    href: normalizedHref,
  }
}) || [])
```

That means alternates are not maintained by hand per page. `@nuxtjs/i18n` generates them, and the app-level head layer normalizes both slash policy and pagination query handling.

That separation matters because it keeps locale mapping and page-specific copy from leaking into each other. Canonical should not force every page to hand-build alternates. Alternates should not invent a different URL format than canonical.

## Page layer: make pagination canonical explicit

On post-list pages, I compute pagination canonical URLs explicitly:

```ts
const paginatedCanonicalUrl = computed(() => buildCanonicalSiteUrlWithQuery(baseUrl.value, route.path, {
  page: pageNumber.value > 1 ? pageNumber.value : undefined,
}))

usePageSeo({
  title: seoTitle,
  description: seoDescription,
  canonicalUrl: paginatedCanonicalUrl,
})
```

The rule is straightforward:

- page 1: canonical does not include `?page=1`
- page 2 and above: canonical keeps `?page=2`, `?page=3`, and so on

In other words, this site does not treat every query parameter as a non-canonical URL.

My policy is:

- **pagination parameters** can appear in canonical when they represent a real slice of content
- **tracking parameters** such as `utm_*` should never become canonical
- **filter parameters** depend on whether you truly want search engines to index that filtered view

## i18n: each locale needs its own canonical

This site uses `prefix_except_default`:

- English: `/posts/...`
- Chinese: `/zh/posts/...`

That means the English and Chinese pages are not replacing each other. **Each locale gets its own canonical URL, and alternates / hreflang connect the pair.**

Google's own guidance is clear here: if you use `hreflang`, the canonical should point to the same-language page whenever possible, or at least the closest substitute.

For this site, the implementation rule is simple:

- Chinese pages canonicalize to Chinese URLs
- English pages canonicalize to English URLs
- alternates connect the pair

## Internal linking: `relatedPages` is not just further reading, it is topical return links

I keep internal and external references separate in markdown frontmatter:

- `relatedPages`: internal follow-up reading
- `relatedLinks`: external references

And `useRelatedPages()` does a few practical things:

- strips query strings and hashes so lookup paths stay clean
- checks whether the input path already has a locale prefix
- adds the current locale through `localePath()` when the path has no locale prefix
- resolves the right content collection from both section and locale
- only queries records where `published = true`

> The point is to make `relatedPages` aware of locale, collection, and publish state, not just render a list of URLs.

For this SEO series, that also matches the cluster I want:

- the hub article provides the entry point
- each deep dive owns one search intent
- spokes link back to the hub and sideways to sibling articles

> Internal linking here is not just “add more further reading”. It is how the canonical URL also gets reinforced through the site's topic paths.

## Which URLs are worth checking first?

If I need to find canonical or i18n problems, these are the URLs I inspect first:

- whether `/path` and `/path/` both exist
- whether page 1 and `?page=1` are both treated as official
- whether alternate URLs follow the same slash rule as the current canonical
- whether Chinese pages and English pages canonicalize to each other by mistake
- whether related pages point at the wrong locale, unpublished pages, or mismatched lookup paths

## How I verify before launch

- [ ] Spot-check one post and one project to make sure the canonical URL uses the trailing-slash version everywhere
- [ ] Check page 1 and page 2 of the post list to confirm the `?page=` canonical rule behaves as intended
- [ ] Inspect the alternate links emitted from `app/app.vue` and confirm both locale URLs and pagination query parameters match the current page
- [ ] Confirm the English and Chinese pages point to each other, but do not overwrite each other's canonical target
- [ ] Spot-check the pages behind `relatedPages` and make sure locale, title, and published state all resolve correctly
- [ ] Check sitemap, Schema.org, breadcrumbs, and share URLs to make sure they all follow the same canonical path policy

## Summary

Here is the final split of responsibilities I use for URL signals in this Nuxt personal site:

- `pathUtils.ts`: defines the canonical path and official URL form
- `app/app.vue` + `useLocaleHead()`: normalize alternates, slash policy, and pagination query handling
- `usePageSeo()`: explicitly overrides canonical URLs on list and paginated pages
- `relatedPages` + `useRelatedPages()`: turn internal links into locale-aware topical return links

Canonical, i18n, and internal linking are all ways of putting URLs in order. Once the rules are consistent, search engines see a clean set of official URLs with stable meaning.
