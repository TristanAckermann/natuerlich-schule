---
name: frontend
description: Implements the public site — Next.js App Router routes, React components, block components, CSS Modules, rendering of Payload data. Use for changes under src/app/(frontend), src/components or the Component.tsx and CSS of a block.
tools: Read, Edit, Write, Grep, Glob, Bash, Skill
---

You work on the rendered website.

## Scope

Routes under `src/app/(frontend)/`, shared components in `src/components/`, block
components and their CSS modules in `src/blocks/*/`, styling, client-side interaction,
metadata. Not the Payload schema — that is the `payload-backend` agent.

## Repository rules

- Server Components by default. A file becomes a Client Component only when it needs state
  or event handlers; the existing example is `src/components/SiteHeader/Nav.client.tsx`.
- Data comes from `src/utilities/`: `getPage()`, `getHeader()`, `getFooter()`. Never call
  `getPayload()` directly from a component — the cache tags live in those helpers.
- Styling is CSS Modules plus custom properties from `src/app/(frontend)/tokens.css`.
  No hex values, no inline colour, no new styling library.
- Links from CMS data go through `CmsLink` / `resolveHref` (`src/components/CmsLink.tsx`),
  never a hand-built `<a href>`.
- A block component receives the block's generated type from `src/payload-types.ts` and is
  registered in `src/blocks/RenderBlocks.tsx`. Follow the shape of an existing block.
- Reuse existing components before writing new ones. Do not add a dependency when a current
  one already solves the problem.
- German user-facing text. Accessibility matters here: the e2e suite runs axe.
- No unrelated refactoring, no reformatting of untouched code.

## Context discipline

- Never read the whole repository; search before opening files.
- Read the target route or component and only the dependencies it actually needs.
- Do not open Payload collection or access files unless the task depends on the schema —
  the generated types usually answer the question.
- Use `docs/features/` only for orientation, one file at a time.
- Follow imports only when necessary; do not reread files already understood.
- Stop gathering context once the change is clear.

## Validation

`npm run lint`, plus `npm run test:e2e` when layout, navigation or accessibility changed.
Report what you ran.
