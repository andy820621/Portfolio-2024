---
name: blog-writing
description: Use when creating, revising, translating, or polishing bilingual technical blog posts for this Nuxt portfolio, especially files under `content/en/posts/*.md` and `content/zh/posts/*.md`, or when a post idea needs to be shaped into either an opinionated explainer essay or a structured implementation guide with project-compatible frontmatter.
---

# Blog Writing

## Overview

Write posts that fit this portfolio's existing publishing format while keeping English and Chinese as native-feeling voices instead of mirrored translations. Default to one of two modes: `guide` for repo-grounded technical explainers, `essay` for stronger point-of-view articles about engineering judgment, tradeoffs, and "what/why/should" topics.

## Quick Start

1. Identify the target locale and output file.
2. Read [references/project-post-format.md](references/project-post-format.md).
3. Read the locale voice reference:
   - Chinese: [references/zh-voice.md](references/zh-voice.md)
   - English: [references/en-voice.md](references/en-voice.md)
4. Choose a primary mode: `guide` or `essay`.
5. Draft frontmatter before body text.
6. Write in the target locale's own voice. Do not translate sentence by sentence.
7. Run the checklist in `references/project-post-format.md` before finishing.

## Choose the Mode

Use `guide` when the post is mainly about implementation details, architecture, debugging, SEO, content workflow, or decisions that must be verified against this repo.

Use `essay` when the post is mainly about concepts, tradeoffs, heuristics, technical judgment, or "what is X / why it matters / how to think about it" framing.

If the post mixes both, choose one primary mode and let the other mode support it. Default to `guide` when unsure, because the current project posts mostly follow that structure.

## Writing Workflow

1. Ground the article in the right source of truth.
   - For repo-specific claims, inspect the actual code, content files, scripts, or config before writing.
   - For broader opinion pieces, use concrete real-world examples instead of vague abstractions.
2. Lock the audience promise early.
   - State what problem the post solves.
   - State what the reader will understand, decide, or implement by the end.
3. Draft frontmatter first.
   - Match the project's field names and date rules.
   - Mirror the counterpart locale file's metadata shape when writing a bilingual pair.
4. Build an outline that matches the mode.
   - `guide`: question-led or decision-led `##` headings
   - `essay`: thesis-led sections that progressively sharpen the argument
5. Draft the body in a locale-native voice.
   - Rephrase ideas for the target language.
   - Keep examples, tradeoffs, and section flow coherent even if wording changes.
6. Tighten.
   - Remove filler, duplicated setup, and generic claims.
   - Prefer one strong framing device over several weak ones.
7. Self-check.
   - Dates, frontmatter, and file placement
   - Native-sounding locale voice
   - Claims backed by the repo or by clearly framed examples

## Structure Templates

### `guide`

Use this default structure:

1. Opening paragraph: define the live problem, why it matters now, and the promised outcome.
2. Optional short criteria list: non-negotiables, constraints, or goals.
3. `##` sections named as decisions, questions, or subsystems.
4. `###` subsections only when the section truly has internal structure.
5. Close with `## Summary` / `## 總結` or an equivalent recap section.

Guide posts should feel concrete and inspectable. Mention real filenames, commands, modules, or data flow when that improves trust and clarity.

For search-facing technical guides, prefer the reader's real query over meta commentary about the article itself. If the topic is freshness-sensitive or ecosystem-sensitive, a stronger pattern is:

1. Current landscape or state-of-the-world change
2. Framework- or project-specific challenge
3. Recommended starting point, stack, or module choice
4. Explicit priority order
5. Minimum verification checklist

If the post belongs to a series, treat the series relationship as supporting structure, not the main title or opening hook, unless the user explicitly wants a hub page.

### `essay`

Use this default structure:

1. Opening hook: start with the sharpest tension, observation, or claim.
2. Define the concept only after the reader sees why it matters.
3. Use 2-4 main sections to develop the thesis through examples, contrasts, and implications.
4. Close with a practical heuristic, decision rule, or broader takeaway.

Essay posts should still be actionable. Strong opinions are useful only when backed by reasoning, examples, or experience.

## Locale Rules

Use the locale reference files as the style source, not as templates to copy.

- Chinese: preserve warmth, explanatory flow, and practical framing, but do not copy newsletter greetings or promo language.
- English: preserve thesis-first clarity, memorable heuristics, and sharper contrasts, but do not imitate a gimmick persona or reuse iconic phrases from source essays.

When writing both locales for the same topic:

1. Keep the same slug unless the user explicitly wants different URLs.
2. Keep the same factual scope and metadata shape.
3. Localize title, examples, cadence, and sentence structure for each language.
4. Avoid literal translation if it makes either locale sound flat.

For both locales, when the post is trying to capture a high-intent search query, it is acceptable for `title`, `seoTitle`, `headline`, `description`, and `seoDescription` to align tightly around one primary phrasing. Do not force artificial variation if it weakens clarity.

## Hard Rules

- Read repo evidence before describing implementation details.
- Default to no in-body `#` H1; most project posts rely on frontmatter title and start body headings at `##`.
- Preserve an existing post's original `date` on edits.
- Add or update `updatedAt` on edits using `YYYY-MM-DD`.
- Use `YYYY-MM-DD` for new posts.
- If a topic is time-sensitive, version-sensitive, or clearly shaped by the current search environment, it is acceptable to reflect that in the title and framing, but do not change historical dates just to simulate freshness.
- When editing a post with extra metadata blocks such as `relatedPages`, `relatedLinks`, `schemaOrg`, `sitemap`, or `published`, treat them as part of the article contract and keep them consistent with any title, description, image, or date changes.
- Keep the change scoped to the requested post. Do not "clean up" unrelated content.
- Do not copy the source sample articles' exact intros, slogans, or catchphrases.

## Reference Files

- [references/project-post-format.md](references/project-post-format.md): file locations, frontmatter, body conventions, date rules, and publish checklist
- [references/zh-voice.md](references/zh-voice.md): Chinese writing voice distilled from the provided examples
- [references/en-voice.md](references/en-voice.md): English writing voice distilled from the provided external essays
