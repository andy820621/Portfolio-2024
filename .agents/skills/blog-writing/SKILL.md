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
   - For search-facing guides, make `description` / `seoDescription` primarily answer the reader's problem and promised outcome, not the article's role inside a series.
   - When using `relatedLinks`, write each `note` as reader-facing value about the destination page, not as an editorial note about how the link functions in your article plan.
4. Build an outline that matches the mode.
   - `guide`: question-led or decision-led `##` headings
   - `essay`: thesis-led sections that progressively sharpen the argument
5. Draft the body in a locale-native voice.
   - Rephrase ideas for the target language.
   - Keep examples, tradeoffs, and section flow coherent even if wording changes.
6. Tighten.
   - Remove filler, duplicated setup, and generic claims.
   - Prefer one strong framing device over several weak ones.
   - For implementation guides, compress rhetorical transitions once the structure is clear; keep the article feeling inspectable rather than essay-like.
   - If a definition section or recap only repeats a distinction already made by a list, code sample, or heading, compress it to one sentence or cut it.
   - Keep contrast framing ("不是 A，而是 B") only when the contrast teaches a real decision; otherwise prefer direct operational wording.
7. Self-check.
   - Dates, frontmatter, and file placement
   - Native-sounding locale voice
   - Claims backed by the repo or by clearly framed examples
   - Search-facing opening still works for a reader who never sees the rest of the series
8. If the user manually revises an AI draft, diff the user's wording against the earlier draft before editing the skill or continuing the post.
   - Treat the user's edits as the stronger style signal.
   - Extract reusable preferences such as framing, specificity, section granularity, pronoun choice, and metadata wording.
   - Update the post or skill with the underlying pattern, not just sentence-level mimicry.

When extracting reusable preferences from a user revision, check at least these surfaces:

1. Opening hook: did the user move from series framing to live problem framing?
2. Metadata wording: did `description` / `seoDescription` become more reader-facing?
3. Terminology: did the locale move toward native-language primary nouns with English as support?
4. Link annotations: did `relatedLinks.note` become a summary of the linked resource instead of an editorial aside?
5. Compression: which rhetorical transitions, contrasts, or recap paragraphs did the user delete?

## Structure Templates

### `guide`

Use this default structure:

1. Opening paragraph: define the live problem, why it matters now, and the promised outcome.
2. Optional short criteria list: non-negotiables, constraints, or goals.
3. `##` sections named as decisions, questions, or subsystems.
4. `###` subsections only when the section truly has internal structure.
5. Close with `## Summary` / `## 總結` or an equivalent recap section.

Guide posts should feel concrete and inspectable. Mention real filenames, commands, modules, or data flow when that improves trust and clarity.

For repo-grounded personal-site guides, prefer the concrete artifact over abstract platform labels when it improves naturalness. If the article is really about a personal blog, portfolio, or website, naming that directly is often stronger than generic phrasing such as "content site" or "this repo".

For implementation retrospectives, it is often better to move from one dense opening paragraph into a short list of concrete questions, risks, or failure cases. This usually makes the article promise clearer than jumping straight into architecture.

When one broad layer actually contains different policy surfaces, split them. For example, "route rules" may read better as separate sections for list pages, API routes, and image/static assets instead of one compressed catch-all section.

Once the core structure is established, prefer concise operational sections over repeated justification. A strong guide often benefits from reducing “why this matters” repetition and keeping each section focused on one decision or subsystem.

If a guide needs emphasis, prefer a small number of short callouts over extra explanatory paragraphs. A single `>` line can work well for one policy rule, implementation invariant, or key reminder, but only when the sentence is strong enough to stand alone.

Definition-heavy sections should usually get shorter as the article goes on. If a heading already names the distinction clearly, avoid re-explaining the same mapping in multiple parallel sentences.

For search-facing technical guides, prefer the reader's real query over meta commentary about the article itself. If the topic is freshness-sensitive or ecosystem-sensitive, a stronger pattern is:

1. Current landscape or state-of-the-world change
2. Framework- or project-specific challenge
3. Recommended starting point, stack, or module choice
4. Explicit priority order
5. Minimum verification checklist

If the post belongs to a series, treat the series relationship as supporting structure, not the main title or opening hook, unless the user explicitly wants a hub page.

Even for hub pages, earn the click as a standalone article before switching into map mode. The first screen should still tell the reader what changed, what problem the guide solves, or what they will be able to decide after reading.

For search-facing guides, use this preflight check before drafting body paragraphs:

1. Would the first screen still make sense if all mentions of "series", "hub", or "map" were removed?
2. Does the opening explain the current environment, concrete risk, or practical question before article organization?
3. Is the article promising reader value before editorial structure?

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
- When editing a post with extra metadata blocks such as `relatedPages`, `relatedLinks`, `sitemap`, or `published`, treat them as part of the article contract and keep them consistent with any title, description, image, or date changes.
- For search-facing guides, do not let frontmatter or the opening paragraph primarily describe the article's role in a series when the user is really searching for a practical answer.
- Treat `relatedLinks.note` as user-facing link context. Default to describing what the linked page teaches or helps verify.
- Do not add or preserve legacy `schemaOrg`, `categories`, or `sitemap.lastmod` fields in post frontmatter. Keep `seoTitle` and `seoDescription`, and use `updatedAt` as the source of sitemap last-modified time.
- Keep the change scoped to the requested post. Do not "clean up" unrelated content.
- Do not copy the source sample articles' exact intros, slogans, or catchphrases.
- Do not over-generalize a repo-specific personal-site guide into abstract product language if the concrete site type is part of why the article sounds trustworthy.
- Do not preserve long explanatory contrasts or conclusion paragraphs out of habit. If the guide already made the rule concrete, shorter is usually stronger.

## Reference Files

- [references/project-post-format.md](references/project-post-format.md): file locations, frontmatter, body conventions, date rules, and publish checklist
- [references/zh-voice.md](references/zh-voice.md): Chinese writing voice distilled from the provided examples
- [references/en-voice.md](references/en-voice.md): English writing voice distilled from the provided external essays
