# Project Post Format

## Target Paths

- English posts: `content/en/posts/<slug>.md`
- Chinese posts: `content/zh/posts/<slug>.md`
- For bilingual pairs, default to the same `<slug>` in both locales.

## Frontmatter Shape

Use the existing post files as the shape reference. New posts should usually include:

- `title`
- `date`
- `description`
- `seoTitle`
- `seoDescription`
- `image`
- `alt`
- `ogImage.url`
- `tags`
- `published`

Use these fields only when the post needs them:

- `updatedAt`
- `cover`
- `relatedPages`
- `relatedLinks`
- `sitemap`

Frontmatter rules for this repo:

- Keep `seoTitle` and `seoDescription` even when they are very close to `title` and `description`; they are reserved override fields.
- Do not add or preserve legacy `schemaOrg` blocks in post frontmatter.
- Do not add or preserve `categories`; use `tags` as the classification source.
- Do not set `sitemap.lastmod` manually; it is derived from `updatedAt`, with `date` as fallback.
- Keep `sitemap` only when the page still needs extra sitemap metadata such as `images`.
- Treat `published: false` as fully non-public content. It must stay out of lists, search, related-page resolution, direct detail access, and prerendered public routes.
- If an existing post contains `relatedPages`, `relatedLinks`, `sitemap`, or `published`, preserve those fields and update them consistently when the article title, summary, image, or dates change.

## Date Rules

- New posts: set `date` in `YYYY-MM-DD`.
- Edited posts: preserve the original `date` exactly, even if it uses a legacy format such as `YYYY/MM/DD`.
- Edited posts: add or update `updatedAt` in `YYYY-MM-DD`.
- Do not change only the body while ignoring the date rules.

## Body Conventions

- Most project posts do not include an in-body `#` H1. The page title comes from frontmatter.
- Start with 1-2 opening paragraphs that define the problem, scope, and promised outcome.
- Start section headings at `##`.
- Prefer question-led or decision-led `##` headings.
- Use `###` only when a section has real internal structure.
- Use bullets for criteria, invariants, commands, comparisons, or key takeaways.
- End with `## Summary` / `## 總結` or an equivalent recap when it improves scanability.

For search-driven guides, a stronger opening pattern is often:

1. Explain the real-world problem or current environment first.
2. State why the problem matters now.
3. Narrow to the framework or project-specific challenge.
4. Only then explain how the article is organized.

For repo-grounded personal-site guides, another strong opening pattern is:

1. Start with the concrete site problem.
2. Follow with a short list of the actual questions, risks, or failure cases being solved.
3. Then explain how the article will break down the implementation.

Do not spend the first screen mostly explaining that the article is a hub, a series intro, or a map, unless the article's primary job is genuinely navigational.

Guides that cover broad technical areas often read better when they add explicit prioritization, for example:

- what to do first
- what to do second
- what to tune only when needed

This helps turn architecture-heavy topics into an action order instead of a concept dump.

## Bilingual Pairing

- Keep slugs aligned across `en` and `zh` unless the user explicitly wants a locale-only draft.
- Keep the metadata shape aligned across locales.
- Localize the copy. Do not mechanically translate titles, descriptions, or section headings.
- Keep technical facts, filenames, commands, and architectural claims consistent across locales.

Alignment does not mean forced variety. If the post is targeting a strong primary query, it is acceptable for `title` / `seoTitle` and `description` / `seoDescription` to stay very close across the same locale file as long as the wording is precise.

## Repo Truth Rules

- For implementation-guide posts, inspect the relevant source files before writing.
- If the post mentions scripts, generated JSON, prerender behavior, content hooks, SEO output, or routing behavior, verify the real flow from the repo instead of inferring.
- If content or images are part of the story, confirm whether generated artifacts also need updates.
- Do not invent file paths, helpers, commands, or data flow.

## Current Structural Signals From Existing Posts

- Existing English and Chinese posts lean toward structured technical guides rather than casual newsletters.
- Openings usually state the practical problem immediately.
- H2 headings often read like reader questions, design decisions, or subsystem explanations.
- Lists are used heavily to make tradeoffs, invariants, and workflows scannable.
- Repo-specific names such as commands, composables, or utilities are surfaced directly when helpful.

Additional guide heuristics from recent revisions:

- Prefer standalone value before series framing. A reader landing from search should understand the article without caring that it belongs to a series.
- For fast-moving topics, use explicit year/version/context in the title only when the article truly reflects that current state.
- When a guide covers a large topic, introduce a recommended tool or module choice early if it helps anchor the rest of the article.
- Use article-specific images and metadata when available instead of generic site-wide cover assets.
- When the guide is about this portfolio or another personal site, prefer naming the real artifact type directly (`個人網站`, `部落格`, `作品集`) over abstract labels when that makes the promise clearer.
- If one technical layer contains materially different resource types or policies, split the explanation into separate sections instead of compressing them under one broad heading.

## Publish Checklist

- File is in the correct locale directory.
- Slug matches the intended counterpart locale file.
- Frontmatter fields follow the existing shape.
- `date` and `updatedAt` follow the project rules.
- Headings start at `##` unless there is a deliberate exception.
- Code blocks, commands, filenames, and links are real.
- Tone matches the target locale and chosen mode.
- The article says something specific, not generic.
