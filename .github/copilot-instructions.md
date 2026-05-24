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

## Design Context

- For UI, layout, visual, or UX-related work, consult the relevant project skills under `.agents/skills/` first.
- Use those skills to align with user needs, the existing visual language, and the repo's current patterns.
- Do not apply design-specific guidance to unrelated non-UI tasks.

## graphify

- When `graphify-out/graph.json` exists, use `graphify` as a discovery aid for questions about this repo's architecture, structure, components, or file relationships.
- Prefer `graphify query "<question>"` to narrow the search space, `graphify path "<A>" "<B>"` for relationship questions, and `graphify explain "<concept>"` for focused concepts.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation. Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain is not enough.
- Treat graph output as navigation context, not as the source of truth. Before modifying code, confirming API shapes, or making behavior claims, read the relevant source files.
- In Copilot Chat, `/graphify` can be used to build or update the graph when needed.
