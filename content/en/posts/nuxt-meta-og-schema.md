---
title: "Nuxt meta, OG, Twitter Cards, and Schema.org: a layered metadata implementation"
date: 2026-05-25
updatedAt: 2026-06-01
description: "Using a bilingual Nuxt portfolio site as the working example, this guide breaks down the real responsibilities of front matter, useSeoMeta, OG images, Twitter Cards, and Schema.org."
seoTitle: "Nuxt metadata implementation: meta, OG, and Schema.org"
seoDescription: "A practical guide to front matter, canonical URLs, Open Graph, Twitter Cards, OG images, and Schema.org in a bilingual Nuxt site."
image: /blog-images/nuxt-seo-guide.webp
alt: "Nuxt meta, OG, Twitter Cards, and Schema.org metadata implementation"
ogImage:
  url: /blog-images/nuxt-seo-guide.webp
tags: ['Nuxt', 'SEO', 'Open Graph', 'Twitter Card', 'Schema.org', 'Metadata', 'i18n']
published: true
relatedPages:
  - path: /posts/nuxt-seo-guide
  - path: /posts/image-management-pipeline
  - path: /posts/nuxt-canonical-i18n-internal-linking
  - path: /posts/nuxt-content-v3-i18n-bilingual-site
relatedLinks:
  - title: "Nuxt 4 Docs: SEO and Meta"
    href: https://nuxt.com/docs/4.x/getting-started/seo-meta
    note: Useful for the split between `useSeoMeta()`, `useHead()`, and app-level head rules.
  - title: "`nuxt-schema-org`: How It Works"
    href: https://nuxtseo.com/docs/schema-org/guides/how-it-works
    note: Explains JSON-LD injection, production static output, and schema inferencing.
  - title: "`nuxt-schema-org`: Supported Nodes"
    href: https://nuxtseo.com/docs/schema-org/guides/nodes
    note: Useful when mapping `WebSite`, `WebPage`, `Article`, `ImageObject`, and `ItemList`.
  - title: "`nuxt-schema-org`: Setup Identity"
    href: https://nuxtseo.com/docs/schema-org/guides/setup-identity
    note: Useful for a personal-site setup based on a `Person` identity.
  - title: "Nuxt OG Image: defineOgImage()"
    href: https://nuxtseo.com/docs/og-image/api/define-og-image
    note: Useful when comparing dynamic OG images, static assets, and OG-image opt-out.
sitemap:
  images:
    - loc: /blog-images/nuxt-seo-guide.webp
      title: "Nuxt meta, OG, and Schema.org implementation"
      caption: "Meta, OG images, Twitter Cards, and Schema.org layers for a bilingual personal site."
---

Once a blog starts to include posts, projects, galleries, paginated lists, multilingual URLs, and social sharing needs, the metadata problem is usually no longer “did I fill in `title` and `description`?”

When I planned this bilingual Nuxt 4 blog, these were the real questions:

- Which fields should content authors maintain in front matter?
- Which fields should be derived from the same source by code?
- At which layer should canonical, `og:url`, Twitter Card, and OG image be decided?
- Should Schema.org live in front matter, or in page code?
- Should posts, projects, list pages, and image-heavy pages all use the same schema type?

## Start by separating metadata, share previews, and Schema.org

- **meta / canonical / robots** affect browsers, search engines, and head tags
- **Open Graph / Twitter Card** decide how links look in Slack, LinkedIn, X, and Discord
- **Schema.org** uses JSON-LD to describe page type, author, dates, images, and list structure more explicitly

In Nuxt, those layers can share the same content truth, but that does not mean they should all live inside one API.
The Nuxt docs position `useSeoMeta()` as the type-safe entry point for SEO meta. The `nuxt-schema-org` docs are equally explicit that schema is injected as JSON-LD and relies on SSR or static output in production.

That is why I prefer this rule: **share the same content truth, but do not force every responsibility into the same layer.**

## I split metadata into four layers

1. Content layer: front matter and content schema define the small set of fields authors truly maintain.
2. Site layer: `app/app.vue` handles the title template, locale alternates, the canonical backbone, and site identity such as `WebSite` and `Person`.
3. Page layer: `useContentSEO()` and `usePageSeo()` handle page-level meta, OG, and Twitter Card, while lists and paginated pages can override canonical through `usePageSeo()`.
4. Page-type layer: each page uses `useSchemaOrg()` to add the schema that matches its actual role.

That split lets each layer do the job it is best at instead of mixing share previews, search understanding, and content modeling together.

## Content layer: front matter only maintains a small set of fields

In `content.config.ts`, post and project content mostly revolves around fields like:

- `title`
- `description`
- `seoTitle`
- `seoDescription`
- `image`
- `alt`
- `ogImage`
- `tags`
- `published`
- `updatedAt`

## Site layer: `app/app.vue` handles shared head rules and site identity

This layer does three jobs:

- applies the site-wide `titleTemplate`
- uses `useLocaleHead()` to integrate locale alternates and canonical-like URLs, then normalizes trailing slashes and pagination query parameters
- defines site-level `WebSite` and `Person`

The schema setup in `app/app.vue` looks roughly like this:

```ts
useSchemaOrg([
  defineWebSite({
    '@id': websiteId,
    '@type': 'WebSite',
    name: 'BarZ Hsieh\'s Personal Portfolio Website',
    url: siteBaseUrl,
    publisher: { '@id': personId },
  }),
  definePerson({
    '@id': personId,
    '@type': 'Person',
    ...createPersonIdentity({ baseUrl: siteBaseUrl, imagePath: '/me.jpg' }),
  }),
])
```

That keeps post pages, project pages, and gallery pages from having to re-declare the same site and author identity over and over. Individual pages can focus on their own `WebPage`, `BlogPosting`, `Article`, or `ImageObject`.

## Page layer: use composables to unify meta, canonical, OG, and Twitter Card

This project uses two entry points:

- `useContentSEO()`: for content detail pages such as posts and projects
- `usePageSeo()`: for general pages such as the homepage, lists, gallery pages, and the license page

`app/components/WrapperPost.vue` first reshapes front matter into one `data` object and passes it to `useContentSEO()`:

```ts
const data = computed(() => ({
  title: mainData.value?.title,
  description: mainData.value?.description,
  seoTitle: mainData.value?.seoTitle,
  seoDescription: mainData.value?.seoDescription,
  image: mainData.value?.image,
  alt: mainData.value?.alt,
  ogImage: mainData.value?.ogImage,
  tags: mainData.value?.tags || [],
  published: mainData.value?.published ?? true,
}))

useContentSEO(data)
```

And `useContentSEO()` then does the actual SEO work:

- uses `seoTitle ?? title` as the page title
- uses `seoDescription ?? description` as the description
- merges `tags` with `seoData.keywords` for keywords
- derives `og:url` through `buildCanonicalSiteUrl()`
- derives OG and Twitter images through `resolveStaticOgImageUrl()` and `resolveOgImageAlt()`
- emits `robots` only when needed

For list pages and paginated pages, `usePageSeo()` also handles overrides such as `canonicalUrl`, `publishedTime`, `modifiedTime`, and `noIndexFollow`. The post-list and project-list pagination canonical rules live there instead of being left to global defaults.

The point is not “centralized code looks cleaner”. It is that once the metadata rules live in one place, changing canonical behavior, OG fallbacks, or Twitter Card defaults does not require hunting through every page for scattered `useHead()` calls.

## OG image

For a blog or portfolio, the share card is a traffic surface in its own right.
This project has three OG image sources:

1. front matter provides an existing image
2. `ogImage` provides a custom static URL
3. if no static image exists, the server generates one with `defineOgImage()`

The setup inside `useContentSEO()` and `usePageSeo()` looks like this:

```ts
if (import.meta.server && !data.value.noIndex && !ogImageUrl.value) {
  const dynamicOgImage = resolveDynamicOgImageDefinition(data.value.ogImage)

  if (dynamicOgImage) {
    defineOgImage(dynamicOgImage.component, {
      title: pageTitle.value,
      description: pageDescription.value,
      ...dynamicOgImage.props,
    }, {
      alt: ogImageAlt.value,
    })
  }
}
```

That matches the design direction in the Nuxt OG Image docs: `defineOgImage()` can use an existing image, render a dynamic one, or be skipped entirely.

The part I care about most is simpler: **OG and Twitter should not run on two independent image pipelines.** I let `og:image` and `twitter:image` share the same `ogImageUrl` and `ogImageAlt`, which keeps them from drifting apart.

## Schema.org does not live in front matter, it follows page type

### Post and project detail pages

The post page at `app/pages/posts/[post].vue` adds:

- `WebPage`
- `Breadcrumb`
- `BlogPosting`

The project page adds `WebPage`, `Breadcrumb`, `Article`, and an extra `ImageObject` so that license, creator, and credit text can travel with the project image itself.

That fits this personal-site use case better: a project page is not just a text article. It also carries visual assets, usage terms, and media-specific context.

### List pages are not `BlogPosting`

The post index and project index are not forced into article schema just because they list articles.
At the page level, they use:

- `CollectionPage`
- `ItemList`

I build the list items under `ItemList` instead of pretending the whole page is one article. That is closer to the page's real job and closer to how `nuxt-schema-org` thinks about supported nodes.

### Schema and meta can share data without sharing one API

The `nuxt-schema-org` docs mention inferencing from fields such as `title`, `description`, `image`, and `date`.
That shared source is useful, but it does not mean head tags and schema should be written through the same abstraction.

The architecture I recommend is:

- meta / OG / Twitter Card: solve head output and share previews
- `useSchemaOrg()`: solve page-type semantics and structured data
- front matter: provide the shared content source

That way the three layers cooperate without stepping on each other.

## How I verify before launch

This kind of metadata refactor usually fails through conflicts between layers, not because one tag is missing. My minimum check looks like this:

- [ ] Spot-check one post and confirm that `title`, `description`, canonical, and `og:url` all point at the same official URL
- [ ] Spot-check one project and confirm that the OG image, `ImageObject`, license, and the actual image asset agree with each other
- [ ] Spot-check the post list and project list and confirm the schema is `CollectionPage + ItemList`, not a detail-page schema by accident
- [ ] Inspect site-wide alternates and canonical output to confirm pagination query parameters and trailing slashes do not introduce drift
- [ ] Check share previews in preview and production to make sure `og:image` and `twitter:image` do not resolve to the wrong URL or fallback
- [ ] When `seoTitle` or `seoDescription` exists, confirm it really sharpens search intent instead of just rephrasing the same copy

## Summary

Here is the split of responsibilities I use for metadata in this Nuxt personal site:

- front matter: maintains the core content-truth fields
- `app/app.vue`: maintains site-wide head rules plus `WebSite` and `Person` identity
- `useContentSEO()` / `usePageSeo()`: maintain page-level meta, OG, Twitter Card, and canonical overrides where needed
- `useSchemaOrg()`: adds the right `WebPage`, `BlogPosting`, `Article`, `ItemList`, or `ImageObject` by page type
