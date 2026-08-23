# Architektur

Nur was für dieses Repository gilt. Payload-Grundlagen stehen im Skill
`.claude/skills/payload/`, die Karte der Dateien in `docs/INDEX.md`.

## Aufbau

Eine Next-Anwendung mit zwei Root-Layouts, getrennt durch Route Groups:

- `src/app/(frontend)/` — die öffentliche Website
- `src/app/(payload)/` — Admin, REST und GraphQL, aus dem Payload-Template generiert

Weil es zwei Root-Layouts gibt, liegen `robots.ts` und `sitemap.ts` direkt unter
`src/app/` — innerhalb einer Gruppe registriert Next sie nicht.

Payload und Frontend laufen im selben Prozess. Die Website spricht nie über HTTP mit
Payload, sondern über die Local API in `src/utilities/`.

## Lesepfad

```
Request → src/app/(frontend)/page.tsx
        → getPage('home', draft)          src/utilities/getPage.ts
        → Local API, unstable_cache, Tag „pages:home"
        → RenderBlocks                     src/blocks/RenderBlocks.tsx
        → Block-Komponente je blockType
```

Kopf- und Fusszeile laufen parallel dazu über `getHeader()` / `getFooter()` am Tag
`globals`. Komponenten rufen `getPayload()` nie selbst auf — sonst fehlt das Cache-Tag.

Die Route ist absichtlich dynamisch (`draftMode()`), aber `revalidate = false`: die
Datenbankabfrage hängt am Cache-Tag und läuft nur nach einer Änderung erneut.

**Derzeit gibt es nur die Startseite als Route.** Weitere `pages`-Dokumente lassen sich im
Admin anlegen, haben aber noch keine `/[slug]`-Route.

## Schreibpfad

Speichern im Admin löst `afterChange` aus (`src/hooks/revalidate.ts`), das den Tag der
betroffenen Seite invalidiert. Wichtig dabei:

- Autosave feuert alle 375 ms; Aufrufe mit `context.disableRevalidate` werden übersprungen.
- Nur veröffentlichte Dokumente invalidieren. Wechselt der Slug, wird auch der alte Tag geleert.
- Ausserhalb eines Next-Requests (Seed, CLI, Tests) fällt die Invalidierung still aus.

## Grenzen und Konventionen

**Zugriff** — jede Collection und jedes Global deklariert `access` explizit; die Funktionen
stehen ausschliesslich in `src/access/index.ts`. Anonyme sehen veröffentlichte Seiten,
Medien und die Globals; alles Schreibende verlangt einen Login.

**Blocks** — ein Block ist ein Ordner mit `config.ts` (Payload), `Component.tsx` (Rendering)
und `index.module.css`. Er wird an zwei Stellen registriert: im Feld `layout` von
`src/collections/Pages.ts` und in der Map in `RenderBlocks.tsx`. Fehlt der zweite Eintrag,
wird der Block stillschweigend nicht gerendert.

**Akzentfarbe** — der Hero setzt sie einmal, `RenderBlocks` gibt sie als `data-accent` an
alle nachfolgenden Blöcke weiter. Ohne Hero gilt Salbei.

**Links** — jedes redaktionelle Ziel entsteht aus `linkField()` und wird über `CmsLink` /
`resolveHref()` aufgelöst. Interne Seiten verweisen auf ein `pages`-Dokument, nicht auf
einen getippten Pfad.

**Styling** — CSS Modules plus Custom Properties aus `src/app/(frontend)/tokens.css`. In
einer Komponente steht kein Farbwert.

**Server zuerst** — alles rendert auf dem Server; Client-Komponenten sind die Ausnahme und
tragen das Suffix `.client.tsx`.

**Redaktionelle Inhalte** — auf der Startseite liegt kein Text, kein Bild und kein Link im
Code. Was fest verdrahtet wird, ist ein Fehler.

## Plattform

Cloudflare Workers über OpenNext, D1 als Datenbank, R2 für Medien und den Next-Cache.
Daraus folgt:

- **Kein sharp.** Keine abgeleiteten Bildgrössen, kein Zuschneiden, kein Fokuspunkt.
- **`push: false`.** Schemaänderungen kommen ausschliesslich über Migrationen in die
  Datenbank, lokal wie produktiv. Siehe `.claude/agents/database.md`.
- **`prodMigrations`** bündelt die Registry in den Worker.
- Ohne das Binding `NEXT_INC_CACHE_R2_BUCKET` laufen die `revalidateTag`-Aufrufe ins Leere.
- In Produktion schreibt ein eigener JSON-Logger (`src/payload.config.ts`).

## Umgebung

`PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `PREVIEW_SECRET` — Vorlage in `.env.example`.
Fehlt `PREVIEW_SECRET`, antwortet die Vorschau-Route mit 403.
