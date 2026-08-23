# 05 – Frontend

## Sitemap

```
/                    Startseite
/ueber-uns           Über die Schule
/konzept             Pädagogisches Konzept
/team                Lehrpersonen / Mitarbeitende
/events              Veranstaltungen          ← von der Kundin gepflegt
/events/[slug]       Einzelne Veranstaltung   ← von der Kundin gepflegt
/kontakt             Adresse, Karte, Anfahrt, E-Mail, Telefon
/impressum
/datenschutz
/404
```

Die endgültige Struktur ergibt sich aus dem Inventar der bestehenden Jimdo-Seiten – siehe
[08-content-migration.md](08-content-migration.md). Oben steht der erwartete Umfang.

> **Kein Kontaktformular.** Auf `/kontakt` stehen E-Mail-Adresse (als `mailto:`-Link) und
> Telefonnummer (als `tel:`-Link). Das ist eine bewusste Entscheidung – siehe
> [00-scope.md](00-scope.md).

## Layout und Komponenten

Struktur wie in [02-setup.md](02-setup.md) skizziert:

```
src/app/(frontend)/
  layout.tsx            <html>, Meta, Open Graph, Skip-Link, Header, Footer
  page.tsx               Startseite
  ueber-uns/page.tsx, konzept/page.tsx, team/page.tsx, kontakt/page.tsx, …
  events/page.tsx, events/[slug]/page.tsx

src/components/
  layout/  Header.tsx (Navigation, mobiles Menü), Footer.tsx, Nav.tsx
  ui/      Button.tsx, Card.tsx, Prose.tsx, Section.tsx
  events/  EventCard.tsx, EventList.tsx, EventDetail.tsx, EventDate.tsx
```

`(payload)` bleibt das aus dem Template mitgelieferte Admin-Layout, siehe [04-admin.md](04-admin.md).

Die öffentlichen Seiten sind **React Server Components** und werden zur Build- bzw.
Revalidierungszeit gerendert – auf den Client kommt praktisch kein JavaScript. Das mobile
Menü ist die einzige nennenswerte Interaktivität und wird entweder mit
`<details>`/`<summary>` oder als winzige `'use client'`-Komponente gelöst. Es gibt also
kein React-Bundle im öffentlichen Bereich, obwohl das Framework selbst React ist.

## Design

Kein fertiges Corporate Design vorhanden, also wird eines entworfen. Grundhaltung: warm,
ruhig, viel Weissraum, grosse Fotos, sehr gut lesbar. Eine Schulwebseite wird von Eltern
gelesen, oft auf dem Handy, oft in Eile.

Design-Tokens in `src/styles/global.css` als CSS-Variablen im Tailwind-v4-`@theme`-Block:

```css
@import "tailwindcss";

@theme {
  --color-brand-50:  #...;   /* aus dem Logo / den Fotos abgeleitet */
  --color-brand-600: #...;
  --color-ink:       #1a1a1a;
  --color-muted:     #5c5c5c;

  --font-sans:    "Inter", system-ui, sans-serif;
  --font-display: "Fraunces", Georgia, serif;
}
```

**Schriften werden selbst gehostet** (`public/fonts/`, `woff2`, `font-display: swap`,
Preload für die eine Schrift above the fold). Kein Aufruf von Google Fonts – aus
Datenschutzgründen und weil es schneller ist.

Breakpoints: Tailwind-Standard. Zuerst mobil entwerfen, dann nach oben erweitern.

## Events-Übersicht (`/events`)

Vorgerendert, Aktualisierung über `revalidatePath()` aus dem Payload-Hook (siehe
[03-payload.md](03-payload.md)). Ablauf:

1. Titel und Einleitungstext aus dem Global `events-page` laden (Local API, siehe
   [01-architektur.md](01-architektur.md)).
2. Events laden: `_status = 'published'`, aufgeteilt in
   - **Kommende** (`startsAt >= heute`), aufsteigend sortiert – zuoberst;
   - **Vergangene** (`startsAt < heute`), absteigend, eingeklappt oder auf die letzten
     paar begrenzt.
3. Als Karten rendern: Bild, Datum gross, Titel, Ort, Kurzbeschreibung.
4. Leerer Zustand: „Zurzeit sind keine Veranstaltungen geplant. Schauen Sie bald wieder
   vorbei." – nie eine leere Seite.
5. Fehlerzustand (D1 nicht erreichbar): freundlicher Hinweistext mit Kontaktangaben, aus
   dem ISR-Cache ausgeliefert (`stale-while-revalidate`) statt eines Stacktraces.

Cache-Header siehe [06-deployment.md](06-deployment.md).

## Event-Detailseite (`/events/[slug]`)

- Bild, Titel, Datum/Zeit, Ort, Rich-Text-Inhalt (Lexical-JSON aus Payload, mit dem
  offiziellen `@payloadcms/richtext-lexical`-Renderer in HTML umgewandelt – kein
  ungefiltertes HTML aus der Datenbank).
- Kein passender Slug oder `_status = 'draft'` (ohne Vorschau-Session) → **404**.
- Link zurück zur Übersicht.
- Optional: „Zum Kalender hinzufügen" als generierte `.ics`-Datei – kleiner Aufwand,
  grosser Nutzen für Eltern. Kann in Phase 4 oder später kommen.

## Datum und Zeit

Alles in `Europe/Zurich`, Formatierung `de-CH` zentral in `src/lib/datum.ts`:

| Fall | Ausgabe |
|---|---|
| Ganztägig, ein Tag | `Sa, 14. März 2026` |
| Mit Uhrzeit | `Sa, 14. März 2026, 14:00 – 17:00 Uhr` |
| Mehrtägig | `14. – 16. März 2026` |

Payload speichert Datumsfelder als ISO-8601-Zeitstempel (UTC). Die Umrechnung nach
`Europe/Zurich` passiert nur bei der Ausgabe – sonst gibt es zur Sommerzeitumstellung
Überraschungen.

## SEO

- Pro Seite eigener `<title>` und `<meta name="description">`; bei Events aus Titel und
  Kurzbeschreibung generiert.
- Open-Graph- und Twitter-Card-Tags, damit geteilte Links in WhatsApp und auf Facebook
  ordentlich aussehen – für eine Schule der wichtigste Verbreitungsweg.
- `src/app/sitemap.ts` (Next.js-eigene Sitemap-Route) erzeugt `sitemap.xml`; `robots.txt`
  in `public/` verweist darauf.
- **JSON-LD `Event`** auf der Detailseite (`name`, `startDate`, `endDate`, `location`,
  `image`, `description`, `organizer`) – damit erscheinen Veranstaltungen in der
  Google-Suche als Termine.
- `JSON-LD` `EducationalOrganization` auf der Startseite mit Adresse und Telefon.
- Kanonische URLs; `noindex` auf `/admin/*` und auf Vorschauseiten.
- Redirects der alten Jimdo-URLs → [08-content-migration.md](08-content-migration.md).

## Bilder

- Statische Bilder aus dem Repo (Logo, Icons) über Next.js' `<Image />` einbinden:
  WebP/AVIF, `width`/`height` gesetzt (verhindert Layout-Sprünge), `loading="lazy"`
  ausser beim ersten sichtbaren Bild.
- **Event-Bilder aus R2 nicht über `<Image />` optimieren lassen.** Next.js' eingebaute
  Bildoptimierung braucht `sharp`, das auf Workers nicht verfügbar ist – wie bei Payloads
  eigener Verarbeitung (siehe [04-admin.md](04-admin.md)). Für Event-Bilder deshalb ein
  normales `<img>` (oder `<Image unoptimized>`) direkt auf die R2-URL, mit festem
  Seitenverhältnis (16:9) und `object-fit: cover`, damit ein zu grosses Originalbild das
  Layout nicht sprengt.
- Jedes inhaltstragende Bild braucht ein `alt`. Dekorative Bilder bekommen `alt=""`.

## Barrierefreiheit

Zielniveau **WCAG 2.2 AA** – für eine Schule keine Kür, sondern Anstand.

- Semantisches HTML: `header`, `nav`, `main`, `footer`, Überschriften in korrekter
  Reihenfolge, genau ein `h1` pro Seite.
- Kontrastverhältnis mindestens 4.5:1 für Text.
- Sichtbarer Fokusindikator, „Zum Inhalt springen"-Link.
- Alles per Tastatur bedienbar, auch das mobile Menü.
- Formulare im Admin: `<label>` mit `for`, Fehler über `aria-describedby` verknüpft.
- Zoom bis 200 % ohne horizontales Scrollen.
- `prefers-reduced-motion` respektieren.

Prüfung vor dem Go-Live: axe DevTools, Lighthouse, einmal die ganze Seite nur mit der
Tastatur durchklicken.

## Performance-Ziele

| Kennzahl | Ziel |
|---|---|
| Lighthouse Performance (Mobile) | ≥ 95 |
| Largest Contentful Paint | < 1.5 s |
| Cumulative Layout Shift | < 0.05 |
| JavaScript auf Inhaltsseiten | < 5 KB |

## Verwandte Dokumente

- Woher die Inhalte kommen → [08-content-migration.md](08-content-migration.md)
- Deployment und Caching → [06-deployment.md](06-deployment.md)
