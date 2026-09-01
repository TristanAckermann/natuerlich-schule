# Claude Code — Natürlich Schule

Router, not documentation. Load deeper context only when the task needs it.

## Project

Payload CMS 3.88 (headless CMS + admin) on Next.js 16 App Router, React 19, TypeScript.
SQLite via `@payloadcms/db-sqlite` (a file on disk), media on the local filesystem,
deployed as a plain Node.js server on Infomaniak. Content, labels and code comments are
German (de-CH).

## Payload framework knowledge

Use the installed `payload` skill (`.claude/skills/payload/`) for anything framework-level:
fields, hooks, access control, Local API, queries, endpoints. This repo's docs describe only
what is specific to this repository — never duplicate Payload documentation into them.

## Important paths

| Path | Contains |
| --- | --- |
| `src/payload.config.ts` | Payload config: collections, globals, SQLite adapter, sharp |
| `src/collections/` | `Users.ts`, `Media.ts`, `Pages.ts` |
| `src/globals/` | `Header.ts` (navigation), `Footer.ts` |
| `src/access/index.ts` | All access functions |
| `src/hooks/revalidate.ts` | Cache tags and `afterChange` / `afterDelete` invalidation |
| `src/fields/` | `link.ts` (`linkField()`), `slug.ts` (`slugField()`) |
| `src/blocks/` | Six layout blocks: `config.ts` + `Component.tsx` + `index.module.css`, plus `RenderBlocks.tsx` |
| `src/app/(frontend)/` | Public site, `page.tsx`, `layout.tsx`, `tokens.css`, preview route |
| `src/app/(payload)/` | Admin and API routes — template-generated, do not hand-edit |
| `src/components/` | `SiteHeader/`, `SiteFooter/`, `CmsLink`, `RichText`, `OrganizationJsonLd` |
| `src/utilities/` | `getPage`, `getGlobals`, `generateMeta`, `generatePreviewPath`, `getURL`, `slugify` |
| `src/migrations/` | SQLite migrations + `index.ts` registry |
| `src/seed/` | Idempotent seed for homepage and globals |
| `src/payload-types.ts` | Generated — never edit by hand |
| `tests/int/`, `tests/e2e/` | Vitest (Local API) and Playwright |
| `docs/INDEX.md` | Repository map — the entry point for architecture context |

## Context rules

- Never scan the whole repository. Prefer targeted search over broad directory listings.
- Search for the relevant file before opening anything.
- When architecture context is needed, start at `docs/INDEX.md`, then load only the one
  feature doc it points to.
- Read only files relevant to the current task; follow imports only when required.
- Do not load unrelated documentation and do not reread files already understood.
- `docs/project/` is planning and operations material, partly ahead of the code. Never treat
  it as truth about the current implementation.
- Prefer existing project patterns over new abstractions.
- Keep changes scoped to the request; never modify unrelated files.
- Use the `payload` skill for Payload knowledge instead of restating it.

## Workflow

1. Locate the relevant files.
2. Read only those files.
3. Inspect the existing pattern before writing anything new.
4. Implement the smallest correct change.
5. Validate: `npm run lint`, `npm run test:int`, `npm run test:e2e` as appropriate.
   After a schema change: `npm run generate:types` and `npm run payload migrate:create`.
6. Review the diff.
7. Report what changed.
8. Provide exactly one commit message (conventional style, one line, no AI attribution).

## Agents

`explorer` finds files · `payload-backend` for CMS work · `frontend` for site work ·
`database` for migrations · `reviewer` for the finished diff. See `.claude/agents/`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
