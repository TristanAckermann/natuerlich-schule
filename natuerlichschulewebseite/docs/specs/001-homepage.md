# Spec 001 — Startseite in Payload CMS

| Feld           | Wert                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| Status         | Draft — bereit zur Umsetzung                                                          |
| Autor          | Tristan Ackermann                                                                     |
| Erstellt       | 2026-08-21                                                                            |
| Betrifft       | `natuerlichschulewebseite` (Payload 3.88 · Next 16 · D1 · R2 · Cloudflare Workers)   |
| Design-Vorlage | Claude Design Projekt `00d9a05b-e5ab-4698-a826-2ef431ff3d36`, Datei `Natürlich Schule Startseite.dc.html` |
| Design-System  | gleiches Projekt, Datei `Natürlich Schule UI-Elemente.dc.html` (Version 1)             |

---

## 1. Kontext und Ziel

Die Website der Natürlich Schule (Privatschule Unterbach, Kanton Bern) wird neu aufgebaut. Es existiert ein
vollständiges Mockup der Startseite als Design-Canvas-Datei sowie ein UI-Kit mit allen wiederverwendbaren
Bausteinen. Der technische Unterbau ist das Payload-Cloudflare-Template: Payload 3.88 als CMS, Next.js 16 im
App Router, D1 (SQLite) als Datenbank, R2 als Medienspeicher, Deployment via OpenNext auf Cloudflare Workers.

**Ziel dieser Spec:** die Startseite so in Payload abbilden, dass sie

1. pixelnah dem Mockup entspricht,
2. vollständig redaktionell pflegbar ist (kein Text, kein Bild, kein Link im Code),
3. auf einer Blockarchitektur steht, die für die restlichen ~15 Seiten des Mockups wiederverwendbar ist.

**Nicht-Ziel:** ein generischer Page-Builder. Die Blöcke bilden exakt die im Design vorhandenen Muster ab und
werden erst erweitert, wenn eine weitere Seite ein neues Muster braucht.

---

## 2. Scope

### In Scope

- `Pages`-Collection mit Blocks-Layout, Drafts, Versionierung und Live Preview
- Sechs Blocktypen: `hero`, `textIntro`, `pillarCards`, `dayTimeline`, `quote`, `ctaBanner`
- Globals `Header` (Navigation) und `Footer`
- Erweiterung der `Media`-Collection um Video-Uploads und Bildnachweis
- Frontend-Rendering der Startseite unter `/` inklusive Design-Tokens, responsivem Verhalten und
  Hero-Video-Interaktion
- Seed-Skript, das die Startseite mit dem Inhalt aus Abschnitt 8 anlegt
- Integrations- und E2E-Tests für die Startseite
- SEO-Grundlagen (Metadaten, Open Graph, `JSON-LD` für `EducationalOrganization`)

### Out of Scope (bewusst, spätere Specs)

- Alle Unterseiten (Stundenplan, Team, Lernorte, Stufen, …) — die Navigation verlinkt vorerst auf `#`
- Volltextsuche hinter dem Suchfeld im Header (Feld wird gerendert, Submit führt zu `/suche` → 404, bis Spec 00X)
- Insiderbereich / geschützter Login-Bereich
- Mehrsprachigkeit (Seite ist einsprachig `de-CH`)
- Cookie-Banner / Analytics
- Impressum- und Datenschutz-Seiteninhalte (Links im Footer, Zielseiten separat)

---

## 3. Vorbedingungen und bekannte Blocker

**BLOCKER-1 — kaputter Import in `src/payload.config.ts:13`.**
`import migrations from './db/migrations'` zeigt auf ein nicht existierendes Verzeichnis; die Migrationen liegen
unter `src/migrations/` und werden dort als **Named Export** `migrations` exportiert, nicht als Default. Der
Import wird ausserdem nirgends verwendet. Muss vor Beginn der Umsetzung entfernt oder korrigiert werden
(`import { migrations } from './migrations'` und Übergabe an `sqliteD1Adapter({ binding, prodMigrations: migrations })`).

**BLOCKER-2 — Assets aus dem Design-Projekt exportieren.** Folgende Dateien werden von der Startseite gebraucht
und liegen aktuell nur im Design-Canvas:

| Datei                                | Verwendung                     |
| ------------------------------------ | ------------------------------ |
| `assets/logo-natuerlich-schule.png`  | Header-Logo                    |
| `assets/hero-loop.mp4`               | Hero-Hintergrundvideo          |
| `assets/hero-see.png` (o. Ä.)        | Poster/Fallback für das Video  |

**Randbedingung — kein `sharp` auf Workers.** Die `Media`-Collection hat `crop` und `focalPoint` deaktiviert;
`imageSizes` funktioniert nicht. Responsive Bilder müssen entweder in den benötigten Grössen hochgeladen oder
über Cloudflare Image Resizing (`/cdn-cgi/image/...`) ausgeliefert werden. Für die Startseite ist nur das Logo
betroffen (unkritisch) — die Entscheidung ist in Abschnitt 13 als offene Frage festgehalten.

---

## 4. Design-Tokens

Quelle: `Natürlich Schule UI-Elemente.dc.html`, Abschnitt „00 Grundlagen". Die Tokens werden **einmal** als CSS
Custom Properties in `src/app/(frontend)/tokens.css` definiert. Kein Hex-Wert darf in einer Komponente
hartcodiert werden.

### 4.1 Farben

| Token                  | Wert      | Rolle                                            |
| ---------------------- | --------- | ------------------------------------------------ |
| `--ns-paper`           | `#F1F3ED` | Seitenhintergrund, Text auf Dunkelflächen        |
| `--ns-paper-alt`       | `#E7EDE8` | Alternierender Sektionshintergrund („Ein Tag")   |
| `--ns-paper-deep`      | `#D5E2DA` | Footer-Hintergrund                               |
| `--ns-surface`         | `#FBFCF8` | Karten-/Formularflächen (UI-Kit)                 |
| `--ns-mint`            | `#DDE8E2` | Karte 01 im Pillar-Grid                          |
| `--ns-sage`            | `#7DAA9B` | Akzent „Salbei" (Default)                        |
| `--ns-sage-rgb`        | `125,170,155` | für `rgba()`-Ableitungen                     |
| `--ns-fir`             | `#26463D` | Akzent „Tannengrün", CTA-Band, Überschriften     |
| `--ns-ink`             | `#24332E` | Fliesstext                                       |
| `--ns-ink-rgb`         | `36,51,46`  | für `rgba()`-Ableitungen                       |
| `--ns-night`           | `#1B2E28` | Hero-Hintergrund hinter dem Video                |
| `--ns-link-hover`      | `#3D6B5C` | Linkhover                                        |
| `--ns-graphite`        | `#2F3437` | Akzent-Alternative „Graphit"                     |
| `--ns-danger`          | `#A5443A` | Fehlerzustand (UI-Kit)                           |
| `--ns-warning`         | `#B8862F` | Warnzustand (UI-Kit)                             |
| `--ns-success`         | `#3D8B62` | Erfolgszustand (UI-Kit)                          |

Abgeleitete Deckkraft-Stufen (nicht als eigene Hex-Werte anlegen):
Text sekundär `rgba(var(--ns-ink-rgb), .82)` · Text tertiär `.72` · Text gedämpft `.55`
Haarlinien `.16` / `.14` / `.12` / `.10` · Auf Dunkel: `rgba(241,243,237, .9 / .82 / .72 / .5)`

### 4.2 Typografie

Eine einzige Familie: **Rethink Sans** (400/500/600, Kursiv 400). Einbindung über `next/font/google` mit
`display: 'swap'` und Subset `latin` — **nicht** über `<link>` auf `fonts.googleapis.com` (spart Roundtrips und
vermeidet CLS). Fallback-Stack: `system-ui, sans-serif`.

| Rolle             | Spezifikation                                                         |
| ----------------- | --------------------------------------------------------------------- |
| Hero-H1           | `500 clamp(48px, 7vw, 104px) / .98`, `letter-spacing: -.025em`         |
| H2 gross          | `400 clamp(30px, 3.2vw, 44px) / 1.1`, `-.02em`                         |
| H2 mittel         | `400 clamp(26px, 2.6vw, 34px) / 1.15`, `-.015em`                       |
| H3 Karte          | `400 25px / 1.25`                                                      |
| Zitat             | `400 clamp(24px, 2.8vw, 38px) / 1.35`, `-.015em`, Farbe `--ns-fir`     |
| Lead              | `400 clamp(18px, 1.7vw, 24px) / 1.5`, `max-width: 48ch`                |
| Fliesstext        | `400 17.5px / 1.8`, `max-width: 64ch`, `text-wrap: pretty`             |
| Fliesstext klein  | `400 16.5px / 1.75`                                                    |
| Teaser-Band       | `400 15px / 1.6`, `max-width: 30ch`                                    |
| Eyebrow / Kicker  | `400 11.5px`, `letter-spacing: .2em`, `text-transform: uppercase`      |
| Karten-Kicker     | `400 10.5px`, `.18em`, uppercase, Farbe = Akzent                       |
| Link-Label        | `500 12.5–13px`, `.14–.16em`, uppercase                                |
| Zeit-Label        | `500 14px`, `.06em`                                                    |
| Meta / Footer     | `400 12.5px`                                                           |

### 4.3 Layout und Raster

- Inhaltsbreite: `max-width: 1240px`, linksbündig im Viewport (nicht zentriert — so im Mockup)
- Horizontales Padding: `56px` Desktop, `32px` ab 900px, `20px` ab 560px
- Vertikales Sektions-Padding: `96px` Standard, `110px` für Zitat und Pillar-Grid, `67px 56px 40px` im Footer
- Zweispaltiges Textraster: `minmax(0, 300px) minmax(0, 1fr)`, `gap: 70px`
- Pillar-Grid: `repeat(auto-fit, minmax(270px, 1fr))`, `gap: 1px` auf Haarlinien-Hintergrund
  (`rgba(var(--ns-ink-rgb), .14)`) — die Trennlinien entstehen durch die Lücke, nicht durch Borders
- **Keine Border-Radien.** Das gesamte Design arbeitet mit rechten Winkeln. Kein `border-radius` irgendwo.
- **Keine Schatten.** Tiefe entsteht ausschliesslich über Flächenfarbe und Haarlinien.

### 4.4 Breakpoints

Das Mockup ist reines Desktop. Das responsive Verhalten ist damit **Teil dieser Spec**, nicht des Designs:

| Breakpoint | Verhalten                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| `≥ 1200px` | wie Mockup                                                                                             |
| `< 1200px` | Padding `40px`, Teaser-Band zweispaltig                                                                |
| `< 900px`  | Zweispaltige Textraster stapeln (H2 über Text), Teaser-Band einspaltig, Padding `32px`                 |
| `< 768px`  | Header klappt zu Burger-Menü (Vollbild-Overlay, Gruppen als Accordion), Suchfeld in das Overlay        |
| `< 560px`  | Padding `20px`, Hero-H1 min. `40px`, Pillar-Karten Padding `32px 24px`, Zeitplan-Zeilen stapeln        |

---

## 5. Datenmodell

### 5.1 Architekturentscheid: `Pages`-Collection statt Global

Naheliegend wäre ein Global `homepage`. Dagegen spricht: das Mockup enthält 15+ weitere Seiten mit denselben
Bausteinen, Globals unterstützen keine sauberen URL-/Slug-Semantiken und Live Preview auf Globals ist
umständlicher. Deshalb: **`Pages`-Collection**, die Startseite ist das Dokument mit `slug: 'home'`. Das kostet
in dieser Spec kaum Mehraufwand und spart bei jeder Folgeseite eine Migration.

### 5.2 Collection `pages`

`src/collections/Pages.ts`

```ts
slug: 'pages'
admin: {
  useAsTitle: 'title',
  defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
  livePreview: { url: ({ data }) => previewUrl(data?.slug) },
}
versions: { drafts: { autosave: { interval: 375 } }, maxPerDoc: 20 }
access: {
  read: publishedOrAuthenticated,   // { _status: { equals: 'published' } } für Anonyme
  create/update/delete: authenticated,
}
```

| Feld                | Typ            | Constraints                                                                 |
| ------------------- | -------------- | --------------------------------------------------------------------------- |
| `title`             | `text`         | `required`                                                                   |
| `slug`              | `text`         | `unique`, `index`, `required`, aus `title` per `beforeValidate`-Hook, editierbar |
| `layout`            | `blocks`       | `required`, `minRows: 1`, Blöcke siehe 5.4                                   |
| `meta.title`        | `text`         | Fallback auf `title`                                                         |
| `meta.description`  | `textarea`     | `maxLength: 160`, Validierung warnt ab 160                                   |
| `meta.image`        | `upload → media` | Open-Graph-Bild, Fallback global                                            |
| `meta.noIndex`      | `checkbox`     | `defaultValue: false`                                                        |

Die Startseite darf nicht gelöscht oder umbenannt werden: `delete`-Access blockt `slug === 'home'`, ein
`beforeChange`-Hook verhindert die Änderung dieses Slugs.

### 5.3 Collection `media` (Erweiterung)

Bestehende Collection um Videofähigkeit und Bildnachweis erweitern:

| Feld       | Typ        | Constraints                                                          |
| ---------- | ---------- | -------------------------------------------------------------------- |
| `alt`      | `text`     | `required` **nur für Bilder** (`admin.condition` + `validate` auf MIME) |
| `caption`  | `text`     | optional, Bildlegende                                                 |
| `credit`   | `text`     | optional, Urheber                                                     |

`upload`-Optionen: `mimeTypes: ['image/*', 'video/mp4', 'video/webm']`, `crop: false`, `focalPoint: false`
(bleibt), `skipSafeFetch: true` (bleibt). Uploadlimit für Video im Admin dokumentieren — R2 ist unkritisch,
aber der Worker-Request-Body ist begrenzt; Videos > 100 MB direkt via `wrangler r2 object put` einspielen.

### 5.4 Blöcke

Alle Blöcke unter `src/blocks/<Name>/config.ts` (Payload-Config) + `Component.tsx` (Rendering) im selben Ordner.
Jeder Block bekommt `interfaceName`, damit `payload-types.ts` benannte Typen erzeugt.

#### `hero` — `HeroBlock`

| Feld           | Typ                | Default / Constraints                                                       |
| -------------- | ------------------ | --------------------------------------------------------------------------- |
| `kicker`       | `text`             | optional                                                                     |
| `heading`      | `text`             | `required`                                                                   |
| `lead`         | `textarea`         | optional                                                                     |
| `video`        | `upload → media`   | `filterOptions` auf `mimeType like 'video'`                                  |
| `poster`       | `upload → media`   | Standbild; Pflicht wenn `video` gesetzt (`validate`)                         |
| `loopPause`    | `number`           | `defaultValue: 4`, `min: 0`, `max: 12` — Sekunden Pause zwischen Loops       |
| `softenAfter`  | `checkbox`         | `defaultValue: true` — Video nach erstem Durchlauf weichzeichnen             |
| `accent`       | `select`           | `sage` \| `fir` \| `graphite`, `defaultValue: 'sage'`                        |
| `showProgress` | `checkbox`         | `defaultValue: true` — Fortschrittslinie unter dem Teaser-Band               |
| `teasers`      | `array`            | `minRows: 3`, `maxRows: 3`                                                   |
| ↳ `text`       | `textarea`         | `required`, Richtwert ≤ 30 Zeichen pro Zeile                                 |
| ↳ `linkLabel`  | `text`             | `defaultValue: 'Mehr erfahren'`                                              |
| ↳ `link`       | `relationship → pages` \| `text` | Link-Gruppe, siehe 5.6                                        |

Die drei Design-Props aus dem Mockup (`loopPause`, `softenAfter`, `navAccent`) werden bewusst zu
Redaktionsfeldern — sie waren im Canvas als einstellbar angelegt und sollen es bleiben. `accent` steuert
zusätzlich die Karten-Kicker und die Fortschrittslinie weiter unten auf der Seite (siehe 5.5).

#### `textIntro` — `TextIntroBlock`

| Feld      | Typ        | Constraints                                                                       |
| --------- | ---------- | --------------------------------------------------------------------------------- |
| `heading` | `textarea` | `required`; Zeilenumbrüche werden als `<br>` gerendert (Design bricht bewusst um)  |
| `body`    | `richText` | Lexical, Features auf `paragraph`, `bold`, `italic`, `link` reduziert              |

#### `pillarCards` — `PillarCardsBlock`

| Feld         | Typ      | Constraints                                                    |
| ------------ | -------- | -------------------------------------------------------------- |
| `cards`      | `array`  | `minRows: 2`, `maxRows: 4`                                      |
| ↳ `index`    | `text`   | `required`, z. B. `01` — bewusst redaktionell, nicht abgeleitet |
| ↳ `category` | `text`   | `required`, z. B. `Hof`                                         |
| ↳ `heading`  | `text`   | `required`                                                      |
| ↳ `text`     | `textarea` | `required`                                                    |

Kicker wird als `{index} — {category}` gerendert (Halbgeviertstrich, geschützte Leerzeichen).
Die Flächenfarbe wird **aus der Position abgeleitet**, nicht redaktionell gesetzt:
Position 1 → `--ns-mint`, Position 2 → `rgba(var(--ns-sage-rgb), .16)`, Position 3+ → `rgba(<accent-rgb>, .14)`.

#### `dayTimeline` — `DayTimelineBlock`

| Feld           | Typ     | Constraints                                                       |
| -------------- | ------- | ----------------------------------------------------------------- |
| `heading`      | `text`  | `required`                                                         |
| `entries`      | `array` | `minRows: 1`                                                       |
| ↳ `time`       | `text`  | `required`, Validierung auf `HH:MM`                                |
| ↳ `description`| `text`  | `required`                                                         |

Rendert als Definitionsliste (`<dl>` / `<dt>` / `<dd>`), nicht als Div-Stapel — semantisch ist es eine
Zeit-→-Aktivität-Zuordnung.

#### `quote` — `QuoteBlock`

| Feld          | Typ        | Constraints                                              |
| ------------- | ---------- | -------------------------------------------------------- |
| `quote`       | `textarea` | `required`, **ohne** Anführungszeichen eingeben          |
| `attribution` | `text`     | optional, z. B. `Schulleitung`                           |

Anführungszeichen setzt das CSS (`quotes: "„" "“"` plus `::before` / `::after` mit `content: open-quote` /
`close-quote`; das schliessende Zeichen im Deutschen ist `“`, nicht `"`). Damit ist ausgeschlossen, dass
wie im Mockup versehentlich ein gerades `"` als schliessendes Zeichen landet.

#### `ctaBanner` — `CtaBannerBlock`

| Feld       | Typ        | Constraints                                        |
| ---------- | ---------- | -------------------------------------------------- |
| `heading`  | `text`     | `required`                                         |
| `text`     | `textarea` | optional, `max-width: 52ch`                        |
| `link`     | Link-Gruppe| `required`, siehe 5.6                              |

### 5.5 Akzentfarbe über die Seite hinweg

Der Akzent (`sage` / `fir` / `graphite`) wird **einmal** im `hero`-Block gesetzt und per CSS Custom Property
`--ns-accent` / `--ns-accent-rgb` auf dem Seitenwrapper gesetzt. Alle nachgelagerten Blöcke lesen `--ns-accent`.
Kein Block bekommt ein eigenes Akzentfeld. Enthält eine Seite keinen `hero`-Block, gilt `sage`.

### 5.6 Wiederverwendbare Feld-Helfer

`src/fields/link.ts` — eine `linkField()`-Factory, die überall dieselbe Link-Semantik liefert:

| Feld           | Typ                      | Bedingung                          |
| -------------- | ------------------------ | ---------------------------------- |
| `type`         | `radio`                  | `internal` \| `external` \| `email` |
| `page`         | `relationship → pages`   | `type === 'internal'`              |
| `url`          | `text`                   | `type === 'external'`, URL-Validierung |
| `email`        | `text`                   | `type === 'email'`, E-Mail-Validierung |
| `label`        | `text`                   | immer, `required`                   |
| `newTab`       | `checkbox`               | `type === 'external'`               |

Ein einziger Renderer `<CmsLink>` löst das auf (`next/link` für intern, `<a>` für extern/mailto,
`rel="noopener noreferrer"` bei `newTab`).

`src/fields/slug.ts` — `slugField()` mit `beforeValidate`-Hook (slugify, nur bei leerem Wert oder `create`).

### 5.7 Global `header`

`src/globals/Header.ts`

| Feld             | Typ                    | Constraints                                                        |
| ---------------- | ---------------------- | ------------------------------------------------------------------ |
| `logo`           | `upload → media`       | `required`                                                          |
| `homeLabel`      | `text`                 | `defaultValue: 'Home'`                                              |
| `groups`         | `array`                | `maxRows: 6` — die Top-Level-Einträge                               |
| ↳ `label`        | `text`                 | `required`                                                          |
| ↳ `items`        | `array`                | `minRows: 1` — Unterpunkte, erscheinen in der aufklappenden Zeile   |
| ↳↳ `link`        | Link-Gruppe            | siehe 5.6                                                           |
| `utilityLinks`   | `array`                | Inhalt des Hamburger-Dropdowns rechts                               |
| ↳ `link`         | Link-Gruppe            |                                                                     |
| ↳ `highlight`    | `checkbox`             | rendert das Label in Akzentfarbe (für „Insiderbereich")             |
| `searchEnabled`  | `checkbox`             | `defaultValue: true`                                                |

Struktur aus dem Mockup (`NAV`-Konstante):

| Gruppe            | Unterpunkte                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| Administratives   | Stundenplan · Formulare & Infos für Eltern · Ferienplan · Feste, Anlässe & Lager                  |
| Stufen            | Unterstufe · Mittel- und Oberstufe · Sprachheilschule · Besondere Volksschule · Privatschule       |
| Pädagogik         | Grundsätzliche Pädagogik · Lernort                                                                |
| Über uns          | Team · Leitbild · Wen wir ansprechen wollen · Fotos                                               |
| _Utility_         | Aktuelles · Anmeldung · Offene Stellen · **Insiderbereich** (`highlight`)                         |

### 5.8 Global `footer`

| Feld           | Typ         | Constraints                                            |
| -------------- | ----------- | ------------------------------------------------------ |
| `columns`      | `array`     | `maxRows: 4`                                            |
| ↳ `title`      | `text`      | `required`                                              |
| ↳ `body`       | `richText`  | reduziert auf `paragraph`, `link`, Zeilenumbruch        |
| `legalNote`    | `text`      | einzeilige Fusszeile links                              |
| `legalLinks`   | `array`     | Link-Gruppe, rechts in der Fusszeile                    |

### 5.9 Registrierung

`payload.config.ts`: `collections: [Users, Media, Pages]`, `globals: [Header, Footer]`.
Nach jeder Schemaänderung: `pnpm generate:types` **und** `pnpm payload migrate:create`.

---

## 6. Frontend-Architektur

### 6.1 Dateien

```
src/
├── app/(frontend)/
│   ├── layout.tsx                # <html lang="de-CH">, Font, tokens.css, Header, Footer
│   ├── tokens.css                # Design-Tokens aus Abschnitt 4
│   ├── globals.css               # Reset, Basistypografie, :focus-visible
│   ├── page.tsx                  # lädt slug 'home', rendert <RenderBlocks>
│   └── next/preview/route.ts     # Draft-Mode-Handshake für Live Preview
├── blocks/
│   ├── Hero/{config.ts,Component.tsx,HeroVideo.tsx,index.module.css}
│   ├── TextIntro/…
│   ├── PillarCards/…
│   ├── DayTimeline/…
│   ├── Quote/…
│   ├── CtaBanner/…
│   └── RenderBlocks.tsx          # Block-Registry
├── components/
│   ├── SiteHeader/{index.tsx,Nav.client.tsx,index.module.css}
│   ├── SiteFooter/…
│   ├── CmsLink.tsx
│   └── RichText.tsx
├── fields/{link.ts,slug.ts}
├── globals/{Header.ts,Footer.ts}
├── collections/{Users.ts,Media.ts,Pages.ts}
└── utilities/{getPage.ts,getGlobals.ts,generateMeta.ts}
```

### 6.2 Datenzugriff

Ausschliesslich Local API in Server Components — **kein** `fetch` auf die eigene REST-API:

```ts
const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'home' } },
  draft: isDraftMode,
  depth: 2,
  limit: 1,
})
```

- `depth: 2` reicht: Block → Upload/Relationship → Media-Doc.
- Im Draft-Modus (`draftMode().isEnabled`) zusätzlich `draft: true` und `overrideAccess: false` mit dem
  Request-User, damit Unveröffentlichtes nur authentifiziert sichtbar ist.
- Kein Dokument gefunden → `notFound()`.

### 6.3 Caching und Revalidierung

- Startseite ist statisch (`export const revalidate = false`), Invalidierung ausschliesslich on-demand.
- `afterChange`- und `afterDelete`-Hooks auf `pages`, `header`, `footer` rufen `revalidateTag('pages:home')`
  bzw. `revalidateTag('globals')`. Die Hooks prüfen `context.disableRevalidate`, um Seed-Läufe und
  Autosave-Ticks nicht bei jedem Tastenanschlag zu invalidieren (Autosave alle 375 ms!).
- **Wichtig für Cloudflare:** ISR/On-Demand-Revalidation über OpenNext braucht einen konfigurierten
  Incremental Cache. In `wrangler.jsonc` ist das R2-Binding `NEXT_INC_CACHE_R2_BUCKET` auskommentiert und muss
  aktiviert werden; `open-next.config.ts` bekommt entsprechend
  `defineCloudflareConfig({ incrementalCache: r2IncrementalCache })`. Ohne das laufen die Revalidate-Aufrufe
  ins Leere und die Seite bleibt bis zum nächsten Deploy alt.
- Im Draft-Modus: `export const dynamic = 'force-dynamic'` über einen separaten Codepfad bzw.
  `draftMode()`-Aufruf, der Next automatisch dynamisch macht.

### 6.4 Block-Registry

```ts
const blockComponents = {
  hero: HeroBlock,
  textIntro: TextIntroBlock,
  pillarCards: PillarCardsBlock,
  dayTimeline: DayTimelineBlock,
  quote: QuoteBlock,
  ctaBanner: CtaBannerBlock,
} as const
```

`RenderBlocks` iteriert über `layout`, schlägt via `block.blockType` nach und rendert `null` für unbekannte
Typen (statt zu werfen) — sonst bricht die Seite, sobald ein Block-Typ entfernt wird, bevor die Inhalte
migriert sind.

### 6.5 Styling

CSS Modules, ein Modul pro Block/Komponente. Keine Utility-Framework-Einführung (Tailwind ist im Projekt nicht
vorhanden und lohnt für sechs Blöcke nicht). Regeln:

- Alle Farben, Abstände und Schriftgrössen über die Tokens aus Abschnitt 4.
- `clamp()` für alle Schriftgrössen mit fluidem Verhalten, exakt wie im Mockup notiert.
- Layout mit CSS Grid/Flex, keine festen Höhen ausser bei Farbfeldern.

### 6.6 Server- vs. Client-Komponenten

Client-Komponenten (`'use client'`) sind **nur** diese zwei:

1. `HeroVideo.tsx` — Video-Steuerung, Loop-Pause, Weichzeichnen, Fortschrittslinie, Wipe-In-Animation
2. `Nav.client.tsx` — Aufklappen der Unterzeile, Utility-Dropdown, Burger-Menü

Alles andere rendert auf dem Server. Grund: Worker-Bundle-Limit (3 MB, Details in `README.md`).

---

## 7. Verhalten und Interaktion

### 7.1 Hero-Video

Aus dem Mockup übernommen (`Component`-Klasse im Design-Canvas):

1. Video startet stumm, `playsInline`, `autoPlay`, `preload="auto"`, `disableRemotePlayback`.
   Muted wird bei `loadedmetadata`, `playing` und jedem Re-Render **erneut** gesetzt — iOS Safari setzt es
   sonst gelegentlich zurück. `volume = 0` zusätzlich zu `muted`.
2. `timeupdate` schreibt `currentTime / duration` als `width` in die Fortschrittslinie unter dem Teaser-Band
   (direkte DOM-Mutation über Ref, **kein** State — sonst 30 Re-Renders pro Sekunde).
3. Bei `ended`: `loopPause` Sekunden warten, dann `currentTime = 0` und `play()`. `play()` liefert ein Promise,
   dessen Rejection abgefangen wird (Autoplay-Policy).
4. Nach dem ersten Durchlauf, falls `softenAfter`: Video bekommt `blur(7px) saturate(.85) brightness(.82)` und
   `scale(1.06)`, Übergang `1.4s ease`; gleichzeitig wird der Scrim-Gradient dunkler. Danach steht der Text im
   Vordergrund, das Video wird zur Textur.
5. Wipe-In der Hero-Texte: `@keyframes wipeIn { from { clip-path: inset(0 100% 0 0) } to { clip-path: inset(0 -12% 0 0) } }`,
   gestaffelt über die Videodauer (Kicker 2 %, Titel 6 %, Lead 12 %, Teaser-Text 20 %, Teaser-Link 28 %).
   Ab dem zweiten Durchlauf sind alle Texte sofort sichtbar.
6. `useEffect`-Cleanup entfernt alle Listener und den Timer.

**Ergänzungen gegenüber dem Mockup (verbindlich):**

- `prefers-reduced-motion: reduce` → kein Autoplay, kein Wipe-In, kein Weichzeichnen. Statt des Videos wird das
  `poster`-Bild statisch gezeigt, alle Texte sind sofort sichtbar. Die Fortschrittslinie entfällt.
- `navigator.connection.saveData === true` oder `effectiveType` in `('slow-2g','2g')` → ebenfalls nur Poster.
- Das Video ist rein dekorativ: `aria-hidden="true"`, kein `<track>`, nicht fokussierbar.
- Poster-Bild als `poster`-Attribut, damit vor dem ersten Frame nichts flackert.

### 7.2 Navigation

- Top-Level-Einträge sind `<button aria-expanded>` in einer `<ul>`; Klick toggelt die Unterzeile,
  erneuter Klick auf denselben Eintrag schliesst sie (so im Mockup).
- Unterzeile: `max-height`-Transition `.34s`, `opacity` `.28s`, rechtsbündig. Bei geschlossenem Zustand
  `max-height: 0`, `opacity: 0`, `overflow: hidden` **und** `inert`/`aria-hidden`, damit die Links nicht in die
  Tabreihenfolge geraten.
- `Escape` schliesst die offene Gruppe und gibt den Fokus an den auslösenden Button zurück.
- Klick ausserhalb des Headers schliesst die Gruppe.
- Utility-Dropdown: das `<details>`/`<summary>` aus dem Mockup bleibt (funktioniert ohne JS), bekommt aber
  `aria-label="Weitere Links"` und schliesst bei `Escape` und Klick ausserhalb.
- Suchfeld: `<form action="/suche" role="search">` mit sichtbar verstecktem `<label>`. Bis Spec 00X führt das
  zu einer 404 — das ist bewusst, siehe Scope.
- Aktive Seite: `aria-current="page"` auf dem Home-Link.
- `< 768px`: Burger öffnet ein Vollbild-Overlay, Body bekommt `overflow: hidden`, Fokus wird im Overlay
  gefangen, Gruppen sind `<details>`-Accordions.

### 7.3 Sonstiges

- Alle Links im Teaser-Band und im CTA rendern das `→` als eigenständiges `<span aria-hidden="true">`, nicht als
  Teil des Linktexts — Screenreader sollen kein „Pfeil nach rechts" vorlesen.
- Sichtbarer Fokusindikator: `:focus-visible { outline: 2px solid var(--ns-accent); outline-offset: 3px }`.
  Auf dunklem Grund `var(--ns-paper)`.
- Skip-Link „Zum Inhalt springen" als erstes Element im `<body>`, sichtbar bei Fokus.

---

## 8. Content-Inventar (Seed-Inhalt)

Wortlaut wie im Mockup, mit den unten markierten Korrekturen. Schweizer Rechtschreibung: **kein ß**.

### Hero

- Kicker: `Privatschule Unterbach · Kanton Bern`
- Titel: `Natürlich Schule`
- Lead: `Bauernhof, Wald, Garten. Lernen an Orten, die mitreden.`
- Teaser 1: `Der Hof gibt den Takt vor: gefüttert wird, bevor gerechnet wird.` → Lernorte
- Teaser 2: `Im Wald gilt, was draussen wirklich passiert, nicht was im Buch steht.` → Grundsätzliche Pädagogik
- Teaser 3: `Im Garten wächst Geduld, meistens langsamer als geplant.` → Team
- Alle Teaser-Links: Label `Mehr erfahren`
- `loopPause: 4`, `softenAfter: true`, `accent: sage`, `showProgress: true`

### textIntro

- Überschrift (mit Umbruch): `Schule mit Wetter,\nTieren und Werkzeug`
- Absatz 1: `Wir sind eine kleine Privatschule im Berner Oberland, bewilligt vom Kanton Bern. Unterricht findet im Schulhaus statt, aber ebenso im Stall, im Wald und im Garten.`
- Absatz 2: `Die Klassen sind klein, die Wege kurz, der Tagesablauf ruhig. Wer bei uns lernt, arbeitet mit den Händen und übernimmt Verantwortung für etwas, das ohne ihn nicht funktioniert.`

> **Redaktionshinweis:** „…ohne ihn nicht funktioniert" — geschlechtsneutrale Alternative prüfen
> („…ohne diese Arbeit nicht funktioniert"). Siehe offene Frage OF-4.

### pillarCards

| # | Kategorie | Überschrift                    | Text                                                                       |
| - | --------- | ------------------------------ | -------------------------------------------------------------------------- |
| 01| Hof       | Tiere, die warten nicht        | Jeden Morgen versorgen die Kinder die Tiere, im Sommer wie im Januar.       |
| 02| Wald      | Ein Tag pro Woche draussen     | Werkzeug, Feuer, Karte. Der Wald korrigiert schneller als jede Note.        |
| 03| Garten    | Vom Samen bis zum Mittagessen  | Angebaut, geerntet, gekocht. Rechnen inklusive, weil es sonst nicht aufgeht.|

### dayTimeline

Überschrift: `Ein Tag bei uns`

| Zeit  | Beschreibung                              |
| ----- | ----------------------------------------- |
| 07:30 | Stalldienst und Ankommen                  |
| 08:30 | Unterricht in kleinen Gruppen             |
| 11:45 | Kochen und Mittagessen aus dem Garten     |
| 13:30 | Projektarbeit, Werkstatt oder Wald        |

### quote

- Zitat (ohne Anführungszeichen erfassen): `Kinder brauchen Aufgaben, die echt sind. Alles andere merken sie sofort.`
- Zuschreibung: `Schulleitung`

> **Korrektur gegenüber Mockup:** Dort steht `„…sofort."` — öffnendes deutsches, schliessendes gerades
> Anführungszeichen. Wird durch die CSS-`quotes`-Lösung (5.4) strukturell verhindert.

### ctaBanner

- Überschrift: `Schule anschauen`
- Text: `Besuchstage finden während des Semesters statt. Meldet euch, dann vereinbaren wir einen Termin.`
- Link: `Kontakt aufnehmen` → `mailto:info@natuerlich-schule.ch`

> **Redaktionshinweis:** „Meldet euch" duzt, der Rest der Seite siezt nicht explizit. Ansprache über die
> gesamte Website vereinheitlichen — siehe OF-4.

### Footer

- Spalte „Adresse": `Natürlich Schule` / `Unterbach 205a` / `3857 Unterbach`
- Spalte „Kontakt": `info@natuerlich-schule.ch` (mailto)
- Fusszeile: `Natürlich Schule · Privatschule · Bewilligt vom Kanton Bern`
- Rechtslinks: `Impressum`, `Datenschutz`

### SEO

- `meta.title`: `Natürlich Schule — Privatschule in Unterbach, Kanton Bern`
- `meta.description`: `Kleine Privatschule im Berner Oberland. Unterricht im Schulhaus, im Stall, im Wald und im Garten. Bewilligt vom Kanton Bern.` (139 Zeichen)

---

## 9. Nicht-funktionale Anforderungen

### 9.1 Barrierefreiheit — WCAG 2.2 AA

| Anforderung                                                                                            | Prüfung                        |
| ------------------------------------------------------------------------------------------------------ | ------------------------------ |
| Kontrast Fliesstext ≥ 4.5:1, grosse Schrift (≥ 24px bzw. ≥ 18.66px fett) ≥ 3:1                           | axe + manuell                  |
| Hero-Text über Video: Scrim garantiert Kontrast in jedem Videoframe                                      | Screenshots über mehrere Frames|
| Alle interaktiven Elemente per Tastatur erreichbar und bedienbar, sichtbarer Fokus                        | manuell                        |
| Semantik: eine `<h1>`, lückenlose Überschriftenhierarchie, `<nav>`, `<main>`, `<footer>` als Landmarks   | axe                            |
| `prefers-reduced-motion` respektiert (7.1)                                                               | manuell                        |
| `lang="de-CH"` am `<html>`                                                                                | axe                            |
| Zoom bis 400 % ohne horizontales Scrollen                                                                 | manuell                        |

**Kontrastfehler im Mockup — verbindlich zu korrigieren.** Vier Werte aus dem Design bestehen WCAG AA nicht.
Die Korrekturwerte sind nachgerechnet und einzuhalten:

| Element                        | Vorder-/Hintergrund                    | Mockup      | Korrektur   |
| ------------------------------ | -------------------------------------- | ----------- | ----------- |
| Sub-Nav-Links ohne Zielseite   | `rgba(241,243,237,α)` auf `#1B2E28`    | `.50` → 4.36:1 ❌ | `.72` → 7.39:1 ✅ |
| Zeit-Labels im Tagesablauf     | `rgba(36,51,46,α)` auf `#E7EDE8`       | `.55` → 3.15:1 ❌ | `.70` → 4.73:1 ✅ |
| Fusszeile (Meta-Text, 12.5px)  | `rgba(36,51,46,α)` auf `#D5E2DA`       | `.58` → 3.27:1 ❌ | `.72` → 4.66:1 ✅ |
| Fusszeile (Impressum/Datenschutz) | `rgba(36,51,46,α)` auf `#D5E2DA`    | `.68` → 4.22:1 ❌ | `.74` → 4.93:1 ✅ |

Alle übrigen im Mockup verwendeten Deckkraft-Stufen wurden geprüft und bestehen AA (Karten-Text `.78` auf
`#DDE8E2` = 5.69:1, Footer-Fliesstext `.72` auf `#D5E2DA` = 4.66:1, Fliesstext `.82` auf `#F1F3ED` deutlich
darüber).

### 9.2 Performance

| Metrik                     | Ziel                                                       |
| -------------------------- | ---------------------------------------------------------- |
| LCP (Mobil, 4G)            | ≤ 2.5 s — LCP-Element ist die `<h1>`, nicht das Video       |
| CLS                        | ≤ 0.05 — Fonts via `next/font`, Video mit fixer Aspect Ratio |
| INP                        | ≤ 200 ms                                                    |
| JS auf der Startseite      | ≤ 60 kB gzip (nur die zwei Client-Komponenten)              |
| Hero-Video                 | ≤ 3 MB, H.264 + WebM-Variante, `preload="auto"` erst nach `poster`-Paint |
| Worker-Bundle              | unter dem 3-MB-Limit bleiben (`pnpm preview` prüft)          |

Das Video darf **nie** LCP-Element werden: der Hero-Text wird serverseitig gerendert und ist ohne JS sichtbar
(die Wipe-Animation läuft nur, wenn JS und Motion erlaubt sind — ohne JS gilt der Endzustand).

### 9.3 SEO

- `generateMetadata()` aus `meta.*` mit Fallbacks, `metadataBase` gesetzt
- Open Graph + Twitter Card aus `meta.image`
- `JSON-LD` `EducationalOrganization` mit Name, Adresse, E-Mail, URL
- `robots.txt` und `sitemap.ts` (Startseite genügt vorerst)
- Kanonische URL ohne trailing slash

### 9.4 Sicherheit

- `pages.read` gibt Anonymen ausschliesslich `_status: 'published'` frei
- Draft-Preview-Route validiert ein signiertes Secret **und** die Payload-Session, bevor `draftMode().enable()`
- `media.read` bleibt öffentlich, `create/update/delete` nur authentifiziert
- Alle Local-API-Aufrufe, die im Namen eines Users laufen, mit `overrideAccess: false`
- Keine Nutzereingaben auf der Startseite → kein CSRF-/Injection-Vektor ausser dem Suchfeld (GET, escaped)

---

## 10. Migration, Seeding, Deployment

1. Schemaänderungen → `pnpm generate:types` → `pnpm payload migrate:create` → Migration committen.
   D1-Migrationen laufen bei `pnpm run deploy:database` gegen die Remote-DB.
2. Seed: `src/seed/homepage.ts`, aufgerufen über ein `payload`-Skript. Idempotent — sucht `slug: 'home'`,
   legt an oder aktualisiert. Lädt Logo, Video und Poster aus `docs/assets/` in die `media`-Collection, sofern
   noch nicht vorhanden (Abgleich über `filename`). Setzt `context: { disableRevalidate: true }`.
3. `wrangler.jsonc`: `NEXT_INC_CACHE_R2_BUCKET`-Binding aktivieren (siehe 6.3), `name` von `my-app` auf
   `natuerlich-schule` ändern, D1-`database_id` eintragen.
4. Deployment unverändert über `pnpm run deploy`.

**Rollback:** Migrationen haben `down`-Funktionen; ein fehlerhaftes Content-Deployment wird über die
Payload-Versionierung zurückgerollt (Dokumentversion wiederherstellen), nicht über einen Code-Rollback.

---

## 11. Teststrategie

### Integration (Vitest, `tests/int/`)

- `pages`-Collection: Slug wird generiert, `home` ist nicht löschbar, Slug `home` nicht änderbar
- Access Control: anonymer `find` liefert keine Drafts; authentifizierter mit `draft: true` schon
- Jeder Block validiert korrekt: `hero.teasers` erzwingt genau 3, `dayTimeline.entries[].time` erzwingt `HH:MM`,
  `poster` ist Pflicht, sobald `video` gesetzt ist
- `linkField`: genau eines von `page` / `url` / `email` je nach `type` gesetzt
- Seed ist idempotent: zweimal ausführen erzeugt ein Dokument, nicht zwei

### E2E (Playwright, `tests/e2e/`)

- Startseite rendert alle sechs Blöcke in der richtigen Reihenfolge
- Genau eine `<h1>` mit `Natürlich Schule`
- Navigation: Klick auf „Stufen" öffnet die Unterzeile, `Escape` schliesst sie, Fokus kehrt zurück
- Utility-Dropdown öffnet und enthält vier Einträge
- Teaser-Links haben `href` (nicht `#`), sobald die Zielseiten existieren
- `prefers-reduced-motion: reduce` (Playwright `colorScheme`/`reducedMotion`-Option): Video pausiert, alle
  Hero-Texte sind sofort sichtbar
- Mobile Viewport 390 × 844: Burger-Menü öffnet, kein horizontales Scrollen (`scrollWidth === clientWidth`)
- `@axe-core/playwright`: 0 kritische Verstösse auf `/`
- Redaktioneller Durchstich: über die Local API `heading` ändern → Seite zeigt den neuen Wert

### Visuelle Prüfung

Screenshot-Vergleich gegen das Mockup bei 1440 px und 1280 px. Kein automatischer Pixel-Diff (das Hero-Video
macht ihn instabil) — manueller Abgleich als Review-Schritt in T13.

---

## 12. Definition of Done

- [ ] Startseite unter `/` gerendert, visuell abgenommen gegen das Mockup bei 1440/1024/768/390 px
- [ ] Jeder Text, jedes Bild und jeder Link stammt aus Payload — `grep` nach Mockup-Textfragmenten im
      `src/`-Baum (ausser `src/seed/`) liefert keinen Treffer
- [ ] `pnpm lint`, `pnpm test:int`, `pnpm test:e2e` grün
- [ ] axe: 0 kritische Verstösse; Tastaturdurchlauf manuell geprüft
- [ ] Lighthouse Mobil: Performance ≥ 90, Accessibility = 100, SEO ≥ 95
- [ ] `pnpm preview` baut erfolgreich, Worker-Bundle unter 3 MB
- [ ] Migration erzeugt und committet, `payload-types.ts` aktuell
- [ ] Seed läuft auf leerer DB durch und ergibt eine vollständige Startseite
- [ ] Live Preview im Admin funktioniert für alle sechs Blöcke
- [ ] `docs/specs/001-homepage.md` auf `Status: Umgesetzt` gesetzt, Abweichungen dokumentiert

---

## 13. Offene Fragen

| ID   | Frage                                                                                                                   | Entscheider | Blockiert |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | ----------- | --------- |
| OF-1 | Bildauslieferung ohne `sharp`: mehrere Grössen manuell hochladen oder Cloudflare Image Resizing (kostenpflichtig) nutzen? | Tristan     | T14       |
| OF-2 | Ist `info@natuerlich-schule.ch` die finale Adresse, und soll sie gegen Harvesting geschützt werden?                       | Schule      | T11       |
| OF-3 | Woher stammt `hero-loop.mp4` — Rechte geklärt, Personen auf dem Video einverstanden?                                     | Schule      | T02       |
| OF-4 | Ansprache: „ihr" oder „Sie"? Aktuell gemischt (siehe Abschnitt 8). Geschlechtsneutrale Formulierungen gewünscht?          | Schule      | T12       |
| OF-5 | Soll das Suchfeld bis zur Suchfunktion ausgeblendet werden statt auf 404 zu führen?                                       | Tristan     | T09       |
| OF-6 | Impressum/Datenschutz: eigene Payload-Seiten oder statische MDX-Routen?                                                   | Tristan     | —         |

---

## 14. Tasks

Reihenfolge ist die empfohlene Abarbeitung. `→` markiert Abhängigkeiten. Schätzung in Personentagen.

### Phase 0 — Fundament

**T00 · Blocker beheben und Projekt startklar machen** — 0.25 d
Kaputten `migrations`-Import in `payload.config.ts:13` korrigieren, `prodMigrations` korrekt an
`sqliteD1Adapter` übergeben. `wrangler.jsonc`: Workername, D1-`database_id`, R2-Bucketname setzen.
`pnpm dev` startet, Admin unter `/admin` erreichbar, `pnpm build` läuft durch.
_AK:_ `pnpm build` und `pnpm test:int` laufen auf frischem Clone fehlerfrei.

**T01 · Design-Tokens und Basis-Layout** — 0.5 d
`tokens.css` mit allen Tokens aus Abschnitt 4, `globals.css` mit Reset, Basistypografie, `:focus-visible`,
Skip-Link. Rethink Sans über `next/font/google` einbinden. `layout.tsx` auf `lang="de-CH"` umstellen,
Template-Boilerplate aus `page.tsx` und `styles.css` entfernen.
_AK:_ Eine Testseite zeigt alle Typo-Stufen aus 4.2 korrekt; keine Google-Fonts-`<link>`-Requests im Netzwerk-Tab.

**T02 · Assets exportieren und Media-Collection erweitern** — 0.5 d → T00
Logo, Hero-Video und Poster aus dem Design-Projekt nach `docs/assets/` exportieren; Video als H.264 **und**
WebM, ≤ 3 MB, mit Poster-Frame. `Media.ts` um `caption`, `credit` und bedingtes `alt` erweitern, `mimeTypes`
für Video freigeben. Migration erzeugen.
_AK:_ Video- und Bildupload über den Admin funktioniert, Datei landet in R2, `alt` ist bei Video nicht Pflicht.
_Hängt an OF-3._

**T03 · Feld-Helfer `linkField()` und `slugField()`** — 0.5 d → T00
`src/fields/link.ts` und `src/fields/slug.ts` gemäss 5.6, plus `<CmsLink>`-Renderer. Unit-Tests für die
Validierungslogik.
_AK:_ Alle drei Linktypen validieren korrekt; `<CmsLink>` rendert `next/link`, `<a href="https://…">` bzw.
`<a href="mailto:…">` und setzt `rel` bei `newTab`.

### Phase 1 — Datenmodell

**T04 · Collection `pages`** — 0.75 d → T03
Collection gemäss 5.2 inkl. Access Control, Drafts mit Autosave, `maxPerDoc`, Schutz des `home`-Slugs,
`meta`-Gruppe, Live-Preview-URL. Migration erzeugen, `pnpm generate:types`.
_AK:_ Integrationstests aus Abschnitt 11 (Slug, Löschschutz, Draft-Sichtbarkeit) grün.

**T05 · Blöcke konfigurieren** — 1 d → T03, T04
Alle sechs Block-Configs aus 5.4 mit `interfaceName`, Validierungen (`teasers` genau 3, `time`-Format,
`poster`-Pflicht bei `video`), sinnvollen `admin.description`-Texten für Redaktion und
`labels.singular/plural` auf Deutsch. In `pages.layout` registrieren, Migration erzeugen.
_AK:_ Alle Blöcke im Admin anlegbar; `payload-types.ts` enthält `HeroBlock`, `TextIntroBlock`, … als benannte
Interfaces; Validierungstests grün.

**T06 · Globals `header` und `footer`** — 0.5 d → T03
Gemäss 5.7 und 5.8, in `payload.config.ts` registrieren, Migration erzeugen.
_AK:_ Beide Globals im Admin editierbar, Navigationsstruktur aus 5.7 abbildbar.

**T07 · Revalidierungs-Hooks** — 0.5 d → T04, T06
`afterChange`/`afterDelete` auf `pages`, `header`, `footer` mit `revalidateTag` und `context.disableRevalidate`.
`NEXT_INC_CACHE_R2_BUCKET` in `wrangler.jsonc` aktivieren, `open-next.config.ts` auf `r2IncrementalCache`
umstellen.
_AK:_ Änderung im Admin ist nach Reload auf der Live-Seite sichtbar, ohne Deployment. Autosave-Ticks lösen
keine Revalidierung aus (per Log verifiziert).

### Phase 2 — Frontend

**T08 · Seitengerüst und Block-Registry** — 0.5 d → T04, T05
`page.tsx` lädt `slug: 'home'` per Local API (6.2), `RenderBlocks` gemäss 6.4, `notFound()` bei fehlendem
Dokument, `generateMetadata()` aus `meta.*` mit Fallbacks.
_AK:_ Startseite rendert Platzhalter-Markup für jeden Block in Reihenfolge; unbekannter `blockType` bricht
nicht.

**T09 · Header-Komponente** — 1 d → T06, T08
Server-Wrapper lädt das Global, `Nav.client.tsx` implementiert das Verhalten aus 7.2 inkl. Tastatur,
`Escape`, Klick-ausserhalb, `inert` auf geschlossener Unterzeile, Burger-Overlay unter 768 px, Fokusfalle.
Suchformular gemäss OF-5.
_AK:_ E2E-Tests für Navigation grün; Tastaturdurchlauf ohne Maus vollständig möglich; axe ohne Verstösse im
Header.

**T10 · Hero-Block** — 1.5 d → T02, T05, T08
Server-Teil rendert Kicker, H1, Lead, Teaser-Band und Fortschrittsbalken-Container.
`HeroVideo.tsx` implementiert 7.1 vollständig inklusive `prefers-reduced-motion`, Save-Data, Ref-basierter
Fortschrittslinie und Cleanup. Scrim-Gradienten und Wipe-In exakt nach Mockup.
_AK:_ Video läuft stumm, pausiert `loopPause` Sekunden, weicht danach ab; ohne JS ist der komplette Hero-Text
sichtbar; bei `reduced-motion` läuft nichts; LCP-Element ist die `<h1>`.

**T11 · Blöcke `textIntro`, `pillarCards`, `dayTimeline`, `quote`, `ctaBanner`** — 1.5 d → T05, T08
Rendering und CSS Modules für die fünf verbleibenden Blöcke gemäss 4 und 5.4. `dayTimeline` als `<dl>`,
`quote` mit CSS-`quotes`, `pillarCards` mit positionsabgeleiteten Flächenfarben und 1-px-Grid-Trennlinien,
`ctaBanner` mit `<CmsLink>`. Akzentfarbe als CSS-Variable vom Hero durchreichen (5.5).
_AK:_ Visueller Abgleich mit dem Mockup bei 1440 px bestanden; Semantik per axe geprüft.

**T12 · Footer-Komponente** — 0.5 d → T06, T08
Gemäss 5.8 und Mockup-Layout (auto-fit-Spalten, Trennlinie, Fusszeile).
_AK:_ Footer entspricht dem Mockup; Links funktionieren; Kontakt-E-Mail klickbar.

**T13 · Responsives Verhalten und visuelle Abnahme** — 1 d → T09, T10, T11, T12
Breakpoints aus 4.4 vollständig umsetzen und bei 1440/1280/1024/768/560/390 px durchprüfen. Kein horizontales
Scrollen, keine abgeschnittenen Texte, Zoom bis 400 % nutzbar.
_AK:_ Screenshot-Serie über alle Breakpoints im PR; `scrollWidth === clientWidth` in jedem.

### Phase 3 — Inhalt, Qualität, Auslieferung

**T14 · Seed-Skript** — 0.75 d → T05, T06, T10, T11, T12
`src/seed/homepage.ts` gemäss Abschnitt 10.2 mit dem Inhalt aus Abschnitt 8, idempotent, inkl. Media-Upload und
Befüllung beider Globals. Als `pnpm seed`-Skript in `package.json`.
_AK:_ Auf leerer D1 erzeugt `pnpm seed` eine vollständige, veröffentlichte Startseite; zweiter Lauf ändert
nichts und erzeugt keine Duplikate.

**T15 · SEO und strukturierte Daten** — 0.5 d → T08, T14
`generateMetadata`, Open Graph, Twitter Card, `JSON-LD` `EducationalOrganization`, `robots.txt`, `sitemap.ts`,
kanonische URL.
_AK:_ Rich-Results-Test validiert das JSON-LD; OG-Vorschau zeigt Titel, Beschreibung und Bild.

**T16 · Barrierefreiheit: Prüfung und Korrekturen** — 0.75 d → T13
Die vier Kontrastfehler aus der Tabelle in 9.1 korrigieren (Sub-Links `.50 → .72`, Zeit-Labels `.55 → .70`,
Fusszeilen-Meta `.58 → .72`, Fusszeilen-Links `.68 → .74`), axe-Lauf, vollständiger Tastaturdurchlauf,
Screenreader-Stichprobe (VoiceOver), Zoom-Test 400 %.
_AK:_ 0 kritische axe-Verstösse; Checkliste 9.1 vollständig abgehakt und im PR dokumentiert.

**T17 · Tests** — 1 d → T13, T14
Integrations- und E2E-Tests gemäss Abschnitt 11 schreiben, `@axe-core/playwright` einbinden, bestehende
Template-Tests (`tests/e2e/frontend.e2e.spec.ts`) an die neue Startseite anpassen.
_AK:_ `pnpm test` grün; Tests laufen gegen eine frisch geseedete Test-DB.

**T18 · Performance-Budget prüfen** — 0.5 d → T13, T15
Lighthouse Mobil und Desktop, JS-Bundle messen, Worker-Bundle über `pnpm preview` prüfen, Videogrösse und
Ladeverhalten validieren.
_AK:_ Ziele aus 9.2 erreicht; Ergebnisse im PR dokumentiert. Bei Verfehlung: Ursache benennen und Massnahme
vorschlagen, nicht stillschweigend absenken.

**T19 · Deployment und Abnahme** — 0.5 d → alle
Migrationen auf die Remote-D1 spielen, deployen, Seed auf Staging, Durchstichtest im Admin (Text ändern →
erscheint live), Definition of Done abhaken, Spec-Status aktualisieren.
_AK:_ Startseite produktiv erreichbar, Redaktion kann alle Inhalte ändern.

**Summe:** ≈ 14.5 Personentage.

---

## 15. Referenzen

- Mockup: Claude Design `00d9a05b-e5ab-4698-a826-2ef431ff3d36` / `Natürlich Schule Startseite.dc.html`
- UI-Kit: dasselbe Projekt / `Natürlich Schule UI-Elemente.dc.html`
- Payload-Skill im Repo: `.claude/skills/payload/SKILL.md` (Access Control, Hooks, Blocks, Adapter)
- Template-Randbedingungen: `README.md` — kein `sharp`, GraphQL-Einschränkungen, 3-MB-Bundle-Limit
- Payload Website-Template als Referenzimplementierung für Blocks/Live Preview:
  <https://github.com/payloadcms/payload/tree/3.x/templates/website>
