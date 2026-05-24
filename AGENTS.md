# AGENTS.md

## Response Language

- Always reply in Chinese.

## Agent Skills

- Project-level agent skills live in `.agents/skills/`.
- When a task needs skills, prefer project skills in `.agents/skills/` first, then use other available skills only if needed.

## Agent Workflow

- For non-trivial tasks, clarify the goal, affected files, and main risks before editing.
- If a task has 3+ steps, crosses files/layers, transforms data, refactors, or involves architecture decisions, provide a short plan first.
- Recommended plan format:
  1. [Step] -> Verify: [check]
  2. [Step] -> Verify: [check]
  3. [Step] -> Verify: [check]
- If new code evidence invalidates the plan, stop, re-plan, then continue.
- For simple, clear single-point fixes, keep the process lightweight and make the smallest correct change.

## Implementation Discipline

- If requirements are ambiguous and affect product behavior, data sources, or user flow, state assumptions clearly. If multiple interpretations are equally reasonable but lead to different results, do not silently choose one.
- If the code can answer the question, read the source of truth before asking the user.
- Prefer the smallest, most direct solution consistent with existing patterns. Do not add unrequested features, flexibility, config, or error handling.
- If a solution starts growing too large, stop and look for a simpler, lower-coupling approach.
- If the requested approach is too complex, too risky, or against current project patterns, say so and suggest a simpler alternative.

## Goal and Verification Loop

- For non-trivial tasks, turn requirements into verifiable success criteria before editing.
- For bug fixes, identify the reproduction path first, then verify the fix with the same path.
- Refactors must preserve behavior unless the requirement explicitly changes behavior.
- Before finishing, run the narrowest useful verification: a single test, typecheck, lint, relevant script, or concrete manual check.
- If verification cannot be run, clearly state what was not verified and why.

## Task Execution Principles

- For scoped implementation or bug reports, first inspect relevant errors, tests, logs, and nearby code before deciding whether to ask the user.
- Keep changes tightly scoped to the request. Do not do unrelated refactors, moves, formatting, or cleanup.
- When work crosses layers, follow the existing data flow first: page/component -> composable/utils -> content/server/scripts/config.
- For content, images, or generated data, confirm the source files and generation flow before deciding whether outputs need updates.

## Content Frontmatter Date Rules

- Scope: `content/{en,zh}/posts/*.md` and `content/{en,zh}/projects/*.md`.
- New articles must include `date` in frontmatter as creation date, format `YYYY-MM-DD`.
- When editing existing articles, keep the original `date` and update `updatedAt` as last modified date, format `YYYY-MM-DD`.
- If `updatedAt` is missing, add it on the first edit.
- When AI adds or edits posts/projects content, it must also check and update these date fields. Do not change only the body.

## Diff Discipline

- Every changed line must trace directly to the user request.
- Do not clean up, rename, format, or refactor unrelated nearby code unless required for the fix.
- Follow existing file style and project conventions, even if another style seems better.
- Only remove unused imports, variables, functions, or helpers directly caused by this change.
- If unrelated smells or cleanup opportunities are found, report them at the end instead of changing them.

## Code Reading and Assumptions

- Before editing, read the relevant files and confirm the source of truth.
- Do not guess API shapes, field names, data structures, Nuxt/Nitro behavior, or third-party package details. Search the project first when unsure.
- Ask the user only when the code cannot answer or when a decision changes product behavior.
- State any assumption that affects implementation direction before acting.

## Generated File Guardrails

- `public/gallery-images-map.json` and `public/project-images-map.json` are generated files. Do not edit them by hand; edit source files or scripts, then regenerate.
- Standard flow for `public/project-images-metadata.json` and `public/project-images-metadata.zh.json`: run `pnpm run generate:metadata`, then make necessary content-specific adjustments. Do not use manual edits to hide source or generation-flow issues.
- When changing content, images, or derived data, check whether generated files also need updates and should be committed.

## Auto-Import Guardrails

- This project uses Nuxt auto-imports and component auto-registration. Symbols in `app/components/`, `app/composables/`, and `app/utils/` usually do not need manual imports.
- Do not add duplicate-name re-export shims or compatibility layers inside scanned directories. They can create duplicate auto-import candidates and dev warnings.
- When moving a helper or composable, update call sites and remove the old scanned export instead of leaving a same-name re-export.
- Before adding a utility function, check `app/utils/` and existing composables for reusable implementations. Avoid recreating the same semantic helper locally.

## Graphify

- The project provides `graphify-out/` as a code relationship graph. For non-trivial tasks, reviews, refactors, or cross-file edits, use it to identify affected files, call relationships, and risk areas.
- `graphify` is only for context discovery. Actual behavior, API shape, and edit decisions must still come from source code.
- After non-trivial edits, optionally use graphify again to check whether nearby affected files were missed.

## Response Style

- Be concise and direct. Avoid unnecessary setup or repetition.
- For implementation tasks, prioritize: changed files, core changes, verification result.
- For review tasks, prioritize: bugs, risks, wrong assumptions, and missing verification.

## Avoid Over-Engineering

- Do not introduce abstractions for single-use code unless it clearly matches existing repeated patterns.
- Do not optimize, generalize, or reserve structure for needs that do not exist yet.
- If a solution feels too large or indirect, step back and find a simpler version.

## Project Overview

- Personal portfolio site built with Nuxt 4 + TypeScript + UnoCSS. It provides blog posts, projects, gallery, and license info, with bilingual English/Chinese content managed by `@nuxt/content` + Markdown.
- SEO and i18n are integrated in `nuxt.config.ts` using `@nuxtjs/seo`, `@nuxtjs/i18n`, `@nuxt/image`, and `nuxt-delay-hydration`.
- Netlify is the main deployment target. `netlify.toml` and `@netlify/nuxt` handle related setup. `nitro.prerender` scans Markdown and generates all dynamic content routes.

## Tech Stack and Environment

- Node.js 22.22.1 (`package.json#engines` and `volta.node`). Prefer Volta. Package manager version follows `package.json#packageManager`; after upgrading, run `pnpm sync:pnpm` to sync docs.
- For Node commands, agents should prefer Volta, e.g. `volta run node ...`, to ensure the project Node version.
- Nuxt 4, Vue 3, TypeScript 5, UnoCSS.
- Main modules: `@nuxt/content` (Markdown + search), `@nuxtjs/i18n` (`prefix_except_default` strategy), `@nuxtjs/seo`, `@nuxt/image`, `@nuxt/fonts`, `@nuxtjs/html-validator`, `nuxt-delay-hydration`, `nuxt-headlessui`, `floating-vue/nuxt`, `@stefanobartoletti/nuxt-social-share`.
- Content search and list filtering live in `app/composables/useContentSearchIndex.ts` and `app/composables/useContentListsFilter.ts`, using tools such as `minisearch` and `dayjs`.

## Common Commands

- When running Node scripts directly, prefer `volta run node ...`, for example `volta run node scripts/generate-project-images-map.js`.

```bash
pnpm install           # install dependencies; postinstall runs nuxt prepare
pnpm dev               # start dev server
pnpm dev:netlify       # emulate Netlify dev
pnpm build             # prebuild -> image maps, then nuxt build
pnpm generate          # static generation
pnpm preview           # preview build output
pnpm lint / lint:fix   # ESLint based on @antfu/eslint-config + UnoCSS plugin
pnpm typecheck         # vue-tsc
pnpm test:prerender    # run scripts/test-prerender.js to verify Nitro prerender
pnpm run generate:metadata  # generate/update project image metadata
node scripts/generate-gallery-images-map.js   # update gallery map only
node scripts/generate-project-images-map.js   # update project map only
```

## Main Folders and Files

- `app/pages/*`: page routes (`/posts`, `/projects`, `/gallery`, `/license`, etc.). Most pages assemble data through content composables.
- `app/components/`: shared UI such as LightBox, TagsFilterDropdown, NavBar, Footer. `app/components/content/ProjectLightBox.vue` and Gallery components handle image lightbox logic.
- `app/composables/`: search index, content filtering, SEO meta, and path utilities such as `app/utils/pathUtils.ts`.
- `content/{en,zh}/`: Markdown content for posts/projects/demos/about/license, etc. `content/gallery/*.yml` stores Gallery album metadata.
- `data/`: static data and config such as `navbarData.ts`, `seoData.ts`, `bundleIcons.ts`.
- `public/`: static assets and generated JSON such as `gallery-images-map.json`, `project-images-map.json`, `project-images-metadata(.zh).json`.
- `scripts/`: image map/metadata generation and prerender tests. Prebuild runs `generate-project-images-map.js` and `generate-gallery-images-map.js`.
- `modules/content-hooks`: Nuxt layer/module hooks for content flow.

## Content Creation Flow (from `CONTENT_MANAGEMENT.md`)

### Gallery

- Put images in `public/gallery-images/{album-id}/`; put the cover image at `public/gallery-images/{album-id}.webp`.
- Create album metadata in `content/gallery/*.yml`; `albumId` must match the folder.
- After updates, run `node scripts/generate-gallery-images-map.js` or rely on `pnpm build` prebuild to generate `public/gallery-images-map.json`.

### Projects

- Put images in `public/project-images/{project}/`; subfolders are allowed. Prefer filenames like `01.intro.hero.webp` to control sorting.
- Run `node scripts/generate-project-images-map.js` to generate `public/project-images-map.json`.
- For new images needing descriptions, run `pnpm run generate:metadata` to generate/merge `project-images-metadata.json` and `project-images-metadata.zh.json`, then adjust manually if needed.
- Write project content in `content/en/projects/*.md` and `content/zh/projects/*.md`. Load images with `::ProjectLightBox{folder="project"}` blocks and close with `::`.

## Development Notes

- **i18n**: `@nuxtjs/i18n` uses `prefix_except_default`. When adding pages, ensure `en` is default and `zh` has matching content or fallback.
- **Environment variables**: `NUXT_SITE_URL` is the canonical site URL. It is used by `site.url`, `@nuxtjs/i18n` `baseUrl`, social share, sitemap, OG, and other SEO outputs. When `NETLIFY=true`, Nitro preset switches accordingly.
- **HTML validation**: `@nuxtjs/html-validator` runs outside production. Avoid custom elements that the validator cannot handle.
- **Image optimization**: `@nuxt/image` provider is currently `none`; uploaded images must be size/format controlled manually, preferably WebP/AVIF.
- **Generated outputs**: `public/*-map.json` and `project-images-metadata*.json` must be committed to avoid environment drift.
- **UnoCSS**: `unocss.config.ts` affects global atomic styles. If adding many custom classes, update Uno config and the ESLint UnoCSS plugin as needed.
- **Auto-imports**: Nuxt auto-imports these; no manual import needed:
  - all Vue components in `app/components/` for template use
  - composables in `app/composables/`
  - utilities in `app/utils/`
  - Nuxt, Vue, and Vue Router APIs such as `ref`, `computed`, `useRoute`, `useFetch`
  - TypeScript types/interfaces defined in these scanned files; they can be used directly without `import type { ... }`
  - When writing or editing code, remember these resources are globally available and avoid redundant imports.

## Pre-Commit Verification Checklist

1. `pnpm lint` and `pnpm typecheck` must pass.
2. If content/images changed, rerun the matching scripts and confirm generated JSON changes.
3. After major route/content changes, run `pnpm test:prerender` or `pnpm generate` to ensure Nitro scans all Markdown routes. `nitro.hooks['prerender:routes']` generates routes from `content/`.
4. Manually verify `/posts`, `/projects`, `/gallery`, `/license`, language switching, and meta tags.
