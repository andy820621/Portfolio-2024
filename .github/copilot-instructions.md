<!-- skilld -->

Before modifying code:

- Quickly scan available skills.
- Only use skills that are clearly relevant to the task.
- Do not over-evaluate skills or block execution if relevance is uncertain.

<!-- /skilld -->

# Copilot Instructions

## Primary Project Instructions

- Follow the project-wide instructions in `AGENTS.md` first.
- Treat this file as Copilot-specific guidance only.
- Do not duplicate or override `AGENTS.md` unless explicitly stated here.

## Copilot Working Style

- For non-trivial tasks, briefly explain the approach before editing.
- Follow the smallest correct implementation path.
- Avoid unrelated refactors, formatting churn, or new abstractions.
- When running Node-related commands, prefer Volta (for example, `volta run node ...`) to ensure the project-required Node version is used.
- After editing, summarize:
  - changed files
  - key changes
  - verification result
  - known risks or unverified parts

## Post Related Content

- `relatedPages` drives post/project "Further Reading" and is for internal site destinations only.
- `relatedLinks` drives "References" and is for external `http(s)` references only. Do not feed it site-relative paths such as `/posts/...` or `/projects/...`.
- When implementing outbound reference or tool links, reuse `useAnalyticsOutboundClick()` instead of bespoke tracking code.

## Graphify
See `AGENTS.md` for graphify usage policy. In Copilot Chat, `/graphify` can build or update the graph.
