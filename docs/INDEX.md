# Projekt-Index

Karte des Repositorys. Von hier aus gezielt weiterlesen — nie alles laden.
Payload-Framework-Wissen kommt aus dem Skill `.claude/skills/payload/`, nicht aus diesen Dokumenten.

## Payload

**Konfiguration**

- `src/payload.config.ts` — Collections, Globals, D1-Adapter, R2-Plugin, Logger

**Collections**

- `users` → `src/collections/Users.ts` (Redaktionslogin, `auth: true`)
- `media` → `src/collections/Media.ts` (Upload nach R2)
- `pages` → `src/collections/Pages.ts` (Blocks, Entwürfe, SEO)

**Globals**

- `header` → `src/globals/Header.ts` (Navigation)
- `footer` → `src/globals/Footer.ts`

**Zugriff**

- `src/access/index.ts` — `authenticated`, `publishedOrAuthenticated`, `authenticatedExceptHome`

**Hooks**

- `src/hooks/revalidate.ts` — Cache-Tags `pages:<slug>` und `globals`, Invalidierung nach dem Speichern

**Wiederverwendbare Felder**

- `src/fields/link.ts` — `linkField()`, ein Ziel aus Seite / URL / E-Mail
- `src/fields/slug.ts` — `slugField()`, leitet den Slug aus dem Titel ab

**Blocks** (`config.ts` + `Component.tsx` + `index.module.css` je Ordner)

- `src/blocks/` — `Hero`, `TextIntro`, `PillarCards`, `DayTimeline`, `Quote`, `CtaBanner`
- `src/blocks/RenderBlocks.tsx` — Registry für das Rendering

## Frontend

- Startseite → `src/app/(frontend)/page.tsx`
- Layout, Kopf- und Fusszeile → `src/app/(frontend)/layout.tsx`
- Design-Tokens → `src/app/(frontend)/tokens.css`, Reset → `globals.css`
- Vorschau-Handshake → `src/app/(frontend)/next/preview/route.ts`
- `robots.txt` → `src/app/robots.ts`, Sitemap → `src/app/sitemap.ts`
- Admin und REST/GraphQL → `src/app/(payload)/` (generiert, nicht von Hand ändern)

**Komponenten**

- `src/components/SiteHeader/` (inkl. `Nav.client.tsx`), `src/components/SiteFooter/`
- `src/components/CmsLink.tsx` — löst `linkField()` in eine URL auf
- `src/components/RichText.tsx`, `src/components/OrganizationJsonLd.tsx`

**Datenzugriff**

- `src/utilities/getPage.ts`, `getGlobals.ts` — Local API mit Cache-Tag
- `src/utilities/generateMeta.ts`, `generatePreviewPath.ts`, `getURL.ts`, `slugify.ts`

## Authentifizierung

- `src/collections/Users.ts` — einzige Auth-Collection, gleichzeitig Admin-User
- `src/access/index.ts` — wer was sehen und ändern darf
- `src/app/(frontend)/next/preview/route.ts` — `PREVIEW_SECRET` **und** gültige Payload-Session
- `tests/helpers/login.ts`, `tests/helpers/seedUser.ts`

## Datenbank

- `src/migrations/` — D1-Migrationen, Registry in `index.ts`
- D1-Adapter mit `push: false` in `src/payload.config.ts`
- `wrangler.jsonc` — Bindings D1, R2 (Medien und Next-Cache)
- `src/seed/homepage.ts` — idempotenter Seed für Startseite und Globals

## Tests

- `tests/int/` — Vitest über die Local API (`npm run test:int`)
- `tests/e2e/` — Playwright inkl. axe (`npm run test:e2e`)

## Dokumentation

- Architektur → `docs/architecture.md`
- Features → `docs/features/` (`pages`, `blocks`, `navigation`, `media`, `auth`)
- Spezifikation Startseite → `docs/specs/001-homepage.md`
- Design-Referenz → `docs/design/startseite-mockup.md`
- Planung und Betrieb → `docs/project/` — **Absicht, nicht Ist-Zustand.** Beschreibt unter
  anderem eine Events-Funktion, die es im Code nicht gibt. Nie als Beleg für aktuelles
  Verhalten lesen.
