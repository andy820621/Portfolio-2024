---
title: Image management at scale: JSON maps, metadata, LightBox, and Schema.org licensing
date: 2025/12/18
description: How this portfolio manages a large image library: build-time JSON maps, optional per-image metadata, deterministic ordering, and LightBox integration (plus Schema.org licensing fields).
image: /blog-images/image-management-pipeline.webp
alt: Projects and gallery image pipeline
ogImage: /blog-images/image-management-pipeline.webp
tags: ['Nuxt', 'Images', 'Automation', 'Gallery', 'LightBox', 'SEO', 'Schema.org']
categories: ['Nuxt', 'Media', 'Automation']
published: true
schemaOrg:
  - "@type": "BlogPosting"
    headline: "Image management at scale: JSON maps, metadata, LightBox, and Schema.org licensing"
    description: "How this portfolio manages a large image library: build-time JSON maps, optional per-image metadata, deterministic ordering, and LightBox integration (plus Schema.org licensing fields)."
    author:
      "@type": "Person"
      name: "BarZ Hsieh"
    datePublished: "2025/12/18"
    dateModified: "2025/12/18"
    image: "/blog-images/image-management-pipeline.webp"
    keywords: ["Gallery", "LightBox", "Image map", "Metadata", "Schema.org"]
    articleSection: "TechArticle"

sitemap:
  lastmod: 2025-12-18
  changefreq: weekly
  priority: 0.8
  images:
    - loc: /page-cover/blog.webp
      title: "Projects / Gallery image pipeline"
      caption: "Build-time JSON maps + runtime LightBox integration."
---

This post explains how the portfolio manages **Projects / Gallery images** via a “build-time JSON pipeline” plus “runtime composables”, and how it integrates LightBox and SEO (image licensing schema).

It covers:

- Build-time generation of `public/project-images-map.json` / `public/gallery-images-map.json` (recursive scan + natural sort with `numeric: true`)
- Optional per-image metadata for Projects (`public/project-images-metadata.json` / `public/project-images-metadata.zh.json`) that only fills missing entries and preserves manual edits
- Runtime composables that assemble UI-friendly structures (`Promise.allSettled()` for resilience, `encodeUrlPath()` for special characters)
- Embedding a LightBox directly in Markdown via `ProjectLightBox`
- Emitting Schema.org `ImageObject` licensing fields on Gallery / Project pages

## Build-time pipeline (maps + metadata)

### Maps: scan images and generate JSON maps

Two scripts scan `public/project-images/` and `public/gallery-images/` and output deterministic JSON maps:

- `scripts/generate-project-images-map.js` → `public/project-images-map.json`
- `scripts/generate-gallery-images-map.js` → `public/gallery-images-map.json`

Core behavior:

- recursive directory scan
- keep only supported extensions
- natural sorting with `numeric: true` (so `01`, `02`, `10` behave as expected)
- for Gallery, `gallery-images-map.json` skips root-level cover images (e.g. `public/gallery-images/{album}.webp`) and only collects photos inside album folders

#### How to run

1. Manually update maps:

```bash
node scripts/generate-project-images-map.js
node scripts/generate-gallery-images-map.js
```

2. Or let `pnpm build` run them via `package.json#scripts.prebuild`:

```bash
pnpm build
```

### Metadata: fill `title/description` for Project images

Project image metadata lives in:

- `public/project-images-metadata.json` (en)
- `public/project-images-metadata.zh.json` (zh)

Generate both files (preserving existing values while filling missing entries):

```bash
pnpm run generate:metadata
```

## Runtime architecture (composables)

| composable                                                 | What it does                                                                                                                                                                                                                      | Output                                                                                                |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `useProjectImages` (`app/composables/useProjectImages.ts`) | Loads `project-images-map.json` (required) + locale-aware metadata (optional); uses `Promise.allSettled()` so missing metadata won’t break pages; parses filenames like `01.hero.intro.webp` to infer ordering and display labels | `getProjectImages(folder)` → `Photo[]` (for `LightBox.vue`; includes `src/title?/description?/size?`) |
| `useGalleryImages` (`app/composables/useGalleryImages.ts`) | Loads `gallery-images-map.json`; returns URLs encoded via `encodeUrlPath()` so album folders can contain spaces/special chars safely                                                                                              | `getAlbumImages(albumId)` → `string[]` (encoded URLs)                                                 |

## UI integration (LightBox + lazy loading)

In Project Markdown, I can embed a LightBox by folder name:

```md
::ProjectLightBox{folder="finance-tracker/settings"}
::
```

Under the hood:

- `ProjectLightBox.vue` loads images at runtime and passes them to `LightBox.vue`
- Gallery pages lazy-load `LightGallery.vue` and fade in items via `useIntersectionObserver()`; actual image loading is handled by `<NuxtImg loading="lazy" />`

## Adding new images

### Projects

1. Put images under `public/project-images/{project}/` (subfolders OK; using `01.*` helps ordering)
2. Generate the map:

```bash
node scripts/generate-project-images-map.js
```

3. (Optional) Fill metadata:

```bash
pnpm run generate:metadata
```

4. Commit generated files: `public/project-images-map.json`, `public/project-images-metadata.json`, `public/project-images-metadata.zh.json`

### Gallery

1. Put photos under `public/gallery-images/{album}/`
2. Add cover `public/gallery-images/{album}.webp`
3. Update `data/galleryData.ts` (`id` must match folder name)
4. Generate the map:

```bash
node scripts/generate-gallery-images-map.js
```

5. Commit generated file: `public/gallery-images-map.json`

## SEO: Schema.org `ImageObject` licensing

Gallery pages (and project pages with main images) emit `ImageObject` entries including licensing fields:

- `license`
- `acquireLicensePage`
- `creditText`
- `creator`
- `copyrightNotice`

This supports Google Images licensing rich results and makes attribution explicit.

Example JSON-LD output (one `ImageObject` entry; Gallery case):

```json
{
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "contentUrl": "https://barz.app/gallery-images/Some%20Album/01.webp",
  "url": "https://barz.app/gallery-images/Some%20Album/01.webp",
  "name": "Some Album - Image 1",
  "description": "Some Album gallery image 1",
  "encodingFormat": "image/webp",
  "license": "https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en",
  "acquireLicensePage": "https://barz.app/license",
  "creditText": "BarZ Hsieh",
  "creator": {
    "@type": "Person",
    "name": "BarZ Hsieh"
  },
  "copyrightNotice": "2024-PRESENT © BarZ Hsieh"
}
```

## Related

- Project landing: [BarZ Hsieh Portfolio 2024](/projects/portfolio-2024)
- Next: [Practical SEO in Nuxt 4: Schema.org, OG images, sitemap, and validation](/posts/nuxt-seo-guide)
