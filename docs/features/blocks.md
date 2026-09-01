# Blöcke

## Zweck

Die Bausteine, aus denen die Redaktion eine Seite zusammensetzt. Jeder Block bringt seine
Payload-Konfiguration, seine Darstellung und sein CSS mit.

## Wichtige Dateien

- `src/blocks/<Name>/config.ts` — Felder für den Admin
- `src/blocks/<Name>/Component.tsx` — Rendering
- `src/blocks/<Name>/index.module.css` — Styles
- `src/blocks/RenderBlocks.tsx` — Registry und Akzentweitergabe

## Daten

Neun Blocktypen, verwendet im Feld `layout` von `pages`:

| Slug | Ordner | Zweck |
| --- | --- | --- |
| `hero` | `Hero/` | Kopfbereich, setzt die Akzentfarbe, optionales Video |
| `pageHeader` | `PageHeader/` | Auftakt einer Unterseite, rendert das `h1`, optional mit Symbol darüber |
| `textIntro` | `TextIntro/` | Einleitender Fliesstext |
| `pillarCards` | `PillarCards/` | Karten mit den Schwerpunkten |
| `dayTimeline` | `DayTimeline/` | Tagesablauf |
| `quote` | `Quote/` | Zitat |
| `ctaBanner` | `CtaBanner/` | Handlungsaufforderung mit Link |
| `timetable` | `Timetable/` | Stundenplan als Tabelle mit Zellverbund und Legende |
| `holidayPlan` | `HolidayPlan/` | Schulferien je Schuljahr, mit Hervorhebung der laufenden Ferien |

## Frontend

`RenderBlocks` bildet `blockType` auf die Komponente ab. Ein unbekannter Typ wird
übersprungen statt zu werfen — so bricht die Seite nicht, wenn ein Typ vor der
Inhaltsmigration entfernt wird.

Die Akzentfarbe (`sage`, `fir`, `graphite`) setzt der Hero. `RenderBlocks` schreibt sie als
`data-accent` auf den umschliessenden Container; alle Blöcke lesen sie über CSS. Ohne Hero
gilt `sage`.

## Zugriff

Keiner eigener — Blöcke sind Felder von `pages` und folgen dessen Regeln.

## Einen Block hinzufügen

1. Ordner mit `config.ts`, `Component.tsx`, `index.module.css` nach dem Muster eines
   bestehenden Blocks anlegen.
2. In `src/collections/Pages.ts` im Feld `layout` registrieren.
3. In `src/blocks/RenderBlocks.tsx` in die Map eintragen. **Ohne diesen Schritt rendert der
   Block stillschweigend nichts.**
4. `npm run generate:types`, dann `npm run payload migrate:create`.

## Besonderheiten

- Farben und Abstände kommen aus `src/app/(frontend)/tokens.css`. Kein Hex-Wert in einer
  Komponente.
- Client-Komponenten gibt es nur zwei: `Hero/HeroVideo.tsx` und die Hervorhebung in
  `HolidayPlan/`; alles andere rendert auf dem Server.
- Genau zwei Blöcke rendern ein `h1`: `hero` auf der Startseite und `pageHeader` auf allen
  übrigen Seiten. Eine Seite braucht einen von beiden, sonst beginnt sie auf Ebene 2.
- Das Feld `icon` des `pageHeader` ist optional und rein dekorativ: das Bild steht über dem
  Titel und bekommt einen leeren Alternativtext, damit Screenreader die Überschrift nicht
  doppelt vorlesen.
- Links entstehen über `linkField()` und werden mit `CmsLink` gerendert.
- `timetable` bildet HTML-Tabellensemantik ab: `colSpan` und `rowSpan` verbinden Zellen,
  eine dadurch überdeckte Position wird in den Daten **nicht** erneut erfasst. Das Raster
  expandiert `Timetable/grid.ts`; daraus entsteht auch die Kartenansicht pro Wochentag,
  die unter 768px an die Stelle der Tabelle tritt.
- `holidayPlan` speichert Tagesdaten. Payload normalisiert `pickerAppearance: 'dayOnly'` auf
  12:00 UTC, deshalb formatiert die Komponente zwingend mit `timeZone: 'UTC'` — sonst wird
  aus dem 19. September in einer westlichen Zeitzone der 18.
- Welche Ferien gerade laufen, entscheidet sich **im Browser**, nicht auf dem Server. Die
  Seiten sind mit `revalidate = false` gecacht und werden nur über `revalidateTag` neu
  gebaut; ein serverseitig aus `new Date()` abgeleiteter Zustand fror auf dem Zeitpunkt des
  letzten Builds ein. Der Server rendert die Liste deshalb neutral und vollständig, die
  Client-Komponente ergänzt nach der Hydration nur die Hervorhebung. Ohne JavaScript fehlt
  genau diese und sonst nichts.
