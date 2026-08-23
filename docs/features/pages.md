# Seiten

## Zweck

Alle redaktionellen Seiten der Website. Der Inhalt entsteht ausschliesslich aus Blöcken;
im Code steht kein Text.

## Wichtige Dateien

- `src/collections/Pages.ts` — Collection, exportiert `HOME_SLUG`
- `src/utilities/getPage.ts` — Laden über die Local API mit Cache-Tag
- `src/utilities/generateMeta.ts` — Next-Metadaten aus der Gruppe `meta`
- `src/app/(frontend)/page.tsx` — die Startseite
- `src/app/sitemap.ts` — Sitemap aus veröffentlichten Seiten
- `src/hooks/revalidate.ts` — Invalidierung nach dem Speichern

## Daten

Collection `pages`. Felder: `title`, `slug` (über `slugField('title')`), `layout` (Blocks,
`minRows: 1`, Pflicht) und die Gruppe `meta` mit `title`, `description` (max. 160 Zeichen),
`image`, `noIndex`.

Entwürfe sind aktiv, mit Autosave alle 375 ms und maximal 20 Versionen je Dokument.

## Frontend

Nur `/` ist als Route umgesetzt (`src/app/(frontend)/page.tsx`, lädt `HOME_SLUG`).
Weitere Seiten lassen sich anlegen, erscheinen in der Sitemap, haben aber **noch keine
`/[slug]`-Route**. Wer eine solche Route ergänzt, orientiert sich an `page.tsx`:
`draftMode()`, `getPage()`, `generateMeta()`, `RenderBlocks`, `notFound()`.

## Zugriff

- lesen: `publishedOrAuthenticated` — anonym nur `_status: published`, Redaktion sieht Entwürfe
- anlegen und ändern: `authenticated`
- löschen: `authenticatedExceptHome` — die Startseite ist nicht löschbar

## Besonderheiten

- Der Slug der Startseite ist doppelt geschützt: gegen Löschen über die Access-Funktion,
  gegen Umbenennen über einen `beforeChange`-Hook, der mit `APIError` abbricht.
- `slug === 'home'` wird überall auf `/` abgebildet — in `CmsLink`, `sitemap.ts` und
  `generatePreviewPath()`.
- Live Preview und die Vorschau-Schaltfläche laufen über `generatePreviewPath()`, siehe
  `docs/features/auth.md`.
- `revalidate = false`: die Seite wird nie zeitgesteuert neu gebaut, nur über den Tag
  `pages:<slug>`.
