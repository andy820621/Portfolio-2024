---
title: "Nuxt sitemap, robots.txt, X-Robots-Tag, and noindex: indexing control in practice"
date: 2026-05-25
updatedAt: 2026-06-01
description: "Using a bilingual Nuxt portfolio site as the working example, this guide breaks down the real responsibilities of sitemap, robots.txt, meta robots, X-Robots-Tag, and routeRules."
seoTitle: "Nuxt indexing control implementation: sitemap, robots.txt, and noindex"
seoDescription: "A practical guide to sitemap, robots.txt, X-Robots-Tag, meta robots, routeRules, and non-production noindex in a bilingual Nuxt site."
image: /blog-images/nuxt-seo-guide.webp
alt: "Nuxt sitemap, robots.txt, and noindex indexing-control implementation"
ogImage:
  url: /blog-images/nuxt-seo-guide.webp
tags: ['Nuxt', 'SEO', 'Sitemap', 'robots.txt', 'X-Robots-Tag', 'noindex', 'i18n']
published: true
relatedPages:
  - path: /posts/nuxt-seo-guide
  - path: /posts/nuxt-canonical-i18n-internal-linking
  - path: /posts/nitro-prerender-dynamic-routes-solution
  - path: /posts/nuxt-content-v3-i18n-bilingual-site
relatedLinks:
  - title: "Google Search Central: Block Search indexing with noindex"
    href: https://developers.google.com/search/docs/crawling-indexing/block-indexing
    note: Useful for the boundary between noindex and robots.txt, and for when to use X-Robots-Tag.
  - title: "Nuxt Sitemap: Introduction"
    href: https://nuxtseo.com/docs/sitemap/getting-started/introduction
    note: Useful for automatic lastmod, image discovery, and i18n support.
  - title: "Nuxt Sitemap: I18n"
    href: https://nuxtseo.com/docs/sitemap/guides/i18n
    note: Useful for locale-aware sitemap output and route transformation.
  - title: "Nuxt Robots: Config Using Route Rules"
    href: https://nuxtseo.com/docs/robots/guides/route-rules
    note: Useful when mapping `routeRules` to `robots`, `index`, and `X-Robots-Tag` behavior.
  - title: "Nuxt Robots: Nuxt Config"
    href: https://nuxtseo.com/docs/robots/api/config
    note: Useful for global groups such as `blockNonSeoBots`, `blockAiBots`, and custom bot policies.
sitemap:
  images:
    - loc: /blog-images/nuxt-seo-guide.webp
      title: "Nuxt sitemap, robots.txt, and noindex"
      caption: "Sitemap, robots.txt, meta robots, and X-Robots-Tag layers for a bilingual personal site."
---

Once a blog starts to include posts, projects, galleries, API routes, deploy previews, and multilingual paths, the SEO problem is usually no longer “did I generate `/sitemap.xml`?”

When I planned this bilingual Nuxt 4 blog, these were the real questions:

- Which content is even eligible to appear in the sitemap?
- Which URLs may crawlers fetch?
- Which pages or resources should still stay out of the index even if crawlers can fetch them?
- How do I stop deploy previews and staging environments from being indexed?
- Should image assets, API routes, and AI crawler policy be treated the same way as public article pages?

If those rules are not split clearly, contradictions appear fast. Draft posts leak into the sitemap. Preview URLs get indexed. API routes show up in search results. Or the same URL appears in the sitemap while also being blocked in `robots.txt`.

This article focuses on indexing control. I use the configuration in this personal site to break down what `content.config.ts`, `nuxt.config.ts`, `routeRules`, deployment headers, and the SEO composables each own, and why I ended up with that split.

## Start by separating discovery, crawling, and indexing

Before touching sitemap, robots.txt, or noindex, I separate the three jobs:

- **sitemap** tells search engines which URLs are worth discovering
- **robots.txt** controls whether crawlers may fetch specific paths
- **meta robots / X-Robots-Tag** decide whether a fetched page or resource may enter the index

### The easiest confusion here is `robots.txt` vs `noindex`

`robots.txt` means “do not fetch this path”, while `noindex` means “you may fetch this content, but do not show it in search results”.
If a URL is blocked by `robots.txt`, the crawler may never see the page-level `noindex` at all.

So I avoid treating `robots.txt` as a substitute for noindex.
The steadier model is:

- `sitemap` lets public URLs be discovered
- `robots.txt` limits the crawler's fetch surface
- `noindex` and `X-Robots-Tag` decide whether fetched resources may enter the index

## I split indexing control into four layers

I do not push every rule into the sitemap or into `robots.txt`. I split it into four layers:

1. Content layer: decides which content is eligible to be public
2. Route layer: decides which URL types may be indexed
3. Deployment layer: decides which environments must never be indexed
4. Page layer: emits HTML-page robots meta consistently

That split lets each layer own one job instead of repeating the same judgment in several places.

## Content layer: use collection schemas to decide what can enter the sitemap

In `content.config.ts`, I attach SEO-related schema to collections such as `posts_en`, `posts_zh`, `projects_en`, and `projects_zh`:

```ts
function createSeoSchemaFields(name: string, onUrl?: (url: { loc: string }) => void) {
  return {
    robots: defineRobotsSchema(),
    ogImage: defineOgImageSchema(),
    sitemap: defineSitemapSchema({
      z,
      name,
      filter: entry => entry.published !== false,
      ...(onUrl ? { onUrl } : {}),
    }),
  }
}
```

### `published: false`

```ts
filter: entry => entry.published !== false
```

I want the meaning of `published: false` to be decided close to the content source, not re-implemented separately in the sitemap, the list pages, related pages, and prerender route generation.

That matters because content-heavy sites drift easily:

- the post list hides a draft, but the sitemap still exposes it
- the sitemap excludes a draft, but related pages still link to it
- prerender routes still ship unpublished content
- English and Chinese collections stop following the same publish rules

So the goal of this layer is not merely “let the sitemap read front matter”. It is to keep public eligibility close to the content source.

## Route layer: use `routeRules` for different URL types

I do not treat every URL as a normal page, because article pages, list pages, API routes, and image assets all have different indexing needs.

For example, public list pages are explicitly indexable and get sitemap `lastmod` values:

```ts
routeRules: {
  '/posts': {
    prerender: true,
    robots: true,
    sitemap: { lastmod: listPageLastmod.en.posts },
  },
  '/zh/posts': {
    prerender: true,
    robots: true,
    sitemap: { lastmod: listPageLastmod.zh.posts },
  },
}
```

That does more than put `/posts` into the sitemap. It makes the page's status explicit:

- it is public
- it can be prerendered
- it may be indexed
- its `lastmod` stays in sync with content updates

That is useful for a blog because the list page may not change code often, but it has still changed from a search engine's point of view whenever the underlying posts or projects change.

## API routes: use `X-Robots-Tag`, not meta robots

API routes do not behave like HTML pages:

```ts
routeRules: {
  '/api/**': {
    headers: { 'X-Robots-Tag': 'noindex' },
  },
}
```

I use `X-Robots-Tag` because `/api/**` does not necessarily return HTML. If the response is not HTML, you cannot rely on a `<meta name="robots">` tag being there to read.

The goal for those URLs is also straightforward: the application may need them, but they should not become search results.

## Images and static assets: keep their indexing policy separate from article pages

Images do not always deserve the same policy as article pages.
For example, this site applies a stricter policy to `/gallery-images/**`:

```ts
routeRules: {
  '/gallery-images/**': {
    index: false,
    robots: {
      noindex: true,
      noai: true,
      noimageai: true,
    },
  },
}
```

The goal here is not only to keep raw image URLs out of search results. It is also to define a clearer usage boundary for media assets.

An article page being indexable does not mean gallery originals, project images, or internal media assets should be opened the same way. That distinction matters even more now that many crawlers are used not only for search, but also for AI training, image understanding, and content reuse.

## Deployment layer: whole-site noindex outside production

If I could keep only one safety measure, I would keep this one.
This site uses `isSearchIndexableDeployment` to decide whether the current deployment is allowed to enter search indexes:

```ts
const isSearchIndexableDeployment
  = isProduction && (!isNetlify || process.env.CONTEXT === 'production')

function getSecurityHeaders() {
  return {
    ...(!isSearchIndexableDeployment
      ? { 'X-Robots-Tag': 'noindex, nofollow' }
      : {}),
  }
}
```

That means anything outside the real production deployment, such as a Netlify deploy preview or staging environment, gets:

```txt
X-Robots-Tag: noindex, nofollow
```

The reason is simple: preview URLs getting indexed is one of the most common and most annoying mistakes on content sites.

## Page layer: unify robots meta in composables

For HTML-page robots meta, I keep the logic inside `useContentSEO.ts` and `usePageSEO.ts`:

```ts
const robots = computed(() => {
  if (resolveOption(options.noIndexFollow))
    return 'noindex, follow'

  if (resolveOption(options.noIndex))
    return 'noindex, nofollow'

  return 'index, follow'
})
```

The value of this layer is not “one more place to set robots”. It is that pages do not have to maintain their own `useHead()` logic.

If a page needs an exception, such as a paginated view, an internal page, or a search-result page, it can pass `noIndex` or `noIndexFollow` through the same composable instead of inventing its own rule.

## Do not rely on the sitemap alone

Nuxt Sitemap automation is useful, and this site does enable features such as:

- `discoverImages: true`
- `discoverVideos: true`
- `autoI18n: true`
- `zeroRuntime: isProduction`
- `exclude` for routes that do not belong in the sitemap

But I do not rely on automatic sitemap generation alone.
Auto-discovery helps prevent missed URLs, but it does not understand the real content policy of the project. It does not inherently know:

- which markdown entries are `published: false`
- which deployments should never be indexed
- which image assets should stay away from AI crawlers
- which list pages need `lastmod` to track content updates
- which dynamic routes exist but still should not enter the sitemap

So my recommendation is: let the sitemap module handle automation and coverage, but define public eligibility in the content schema, `routeRules`, and deployment headers.

## Do not wait until the template layer to fix multilingual sitemap paths

This site uses `@nuxtjs/i18n` with `prefix_except_default`, so the routes look like:

```txt
/posts/...
/zh/posts/...
```

Multilingual sites break here all the time. If sitemap, canonical, hreflang, and page links all build URLs in different ways, the result is predictable:

- the real page is `/zh/...`, but the sitemap emits the English path
- canonical follows one rule while hreflang follows another
- dynamic routes exist only for the default locale
- related pages manually build paths that disagree with i18n routing

That is why I prefer to lock locale paths in the collection source, `routeRules`, and i18n config first, then let `sitemap.autoI18n` handle locale-aware output.

If I later need `defineSitemapEventHandler()` for custom dynamic URLs, I still handle locale transforms at the sitemap layer, not inside the template.

## `robots.txt` also needs an AI policy

This site does not block every AI bot. It separates bot groups by purpose:

- search-style bots may fetch public pages, but not gallery image directories
- user-triggered fetch bots may read public content, but the image directory remains restricted
- training crawlers are blocked across the whole site

In `robots.groups`, that becomes bot groups such as:

- `OAI-SearchBot`
- `Claude-SearchBot`
- `PerplexityBot`
- `ChatGPT-User`
- `Claude-User`
- `GPTBot`
- `ClaudeBot`
- `Google-Extended`

The reason is that `robots.txt` is no longer only a classic SEO file. It is also where I define usage boundaries for content and assets.

My goal is not “block everything AI-related”. It is a more specific policy:

- bots that help users discover or read public content may be allowed
- bots used for training or large-scale reuse should be restricted
- image and gallery assets should be stricter than ordinary article pages

## How I verify before launch

Indexing control usually breaks through contradictory rules, not missing files.
This is the minimum check I run:

- [ ] Open the same route in production and in a deploy preview and confirm the preview sends `X-Robots-Tag: noindex, nofollow`
- [ ] Open `/robots.txt` and confirm the sitemap URL, AI bot groups, and disallow rules match the current policy
- [ ] Open `/sitemap.xml` or the sitemap index and confirm English and Chinese routes, posts, projects, and gallery list pages are all emitted correctly
- [ ] Confirm API routes are not being indexed and do not leak into the sitemap
- [ ] Spot-check one public article and confirm canonical, hreflang, and robots meta all behave as expected
- [ ] Spot-check one `/gallery-images/**` asset and confirm raw image resources are not being treated like normal indexable pages
- [ ] If I just added `noindex`, use Search Console URL Inspection to request a recheck

> `noindex` does not take effect instantly after deployment. The crawler has to fetch the page or response header again before the status changes.

## Summary

Here is the final split of responsibilities I use for indexing control in this Nuxt personal site:

- `content.config.ts`: decides whether content is eligible to be public
- `routeRules`: decide the indexing policy for each URL type
- deployment headers: protect non-production environments from being indexed
- SEO composables: emit robots meta consistently for HTML pages
- `robots.txt`: defines crawler scope and bot policy

That split keeps sitemap, robots.txt, meta robots, and `X-Robots-Tag` from fighting over the same job.

For a content-heavy site, the sitemap is only one part of indexing control. The real work is defining which content is public, which URLs may be fetched, which resources must stay out of the index, and which deployments should never appear in search at all.
