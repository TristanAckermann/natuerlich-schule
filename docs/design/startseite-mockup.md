# Mockup-Auszug — Startseite

Exakte Werte aus dem Design-Canvas `Natürlich Schule Startseite.dc.html`
(Claude-Design-Projekt `00d9a05b-e5ab-4698-a826-2ef431ff3d36`), extrahiert am
2026-08-23. Diese Datei ist die Umsetzungsreferenz; die verbindlichen Regeln
(Tokens, Breakpoints, Korrekturen) stehen in `docs/specs/001-homepage.md`.

Alle Farbwerte sind hier nur zur Nachvollziehbarkeit notiert. Im Code werden
ausschliesslich die Tokens aus `src/app/(frontend)/tokens.css` verwendet.

---

## Reihenfolge der Sektionen

1. Hero (dunkel, Video) — enthält im Mockup auch die Kopfzeile
2. `textIntro` — zweispaltig, Papierhintergrund
3. `pillarCards` — drei Karten, Papierhintergrund
4. `dayTimeline` — zweispaltig, Hintergrund `--ns-paper-alt`
5. `quote` — Papierhintergrund
6. `ctaBanner` — Tannengrün
7. Fusszeile — `--ns-paper-deep`

---

## Kopfzeile (liegt über dem Hero)

- Äussere Zeile: `display:flex; align-items:center; gap:34px; padding:16px 56px`
- Logo: `height:34px; width:auto`, Link auf die Startseite, `aria-label="Startseite"`
- `nav`: `display:flex; align-items:center; gap:30px; margin-left:auto`
- Home-Link: Haus-Icon 18×18 + Label, `gap:8px`, `padding:6px 0`,
  `font:400 16px`, Farbe `rgba(241,243,237,.72)`, Hover `#F1F3ED`,
  `border-bottom:1px solid transparent`
- Gruppen-Buttons: `padding:6px 0`, `font:400 16px`, `letter-spacing:.01em`,
  inaktiv `rgba(241,243,237,.72)`, aktiv `#F1F3ED` mit
  `border-bottom:1px solid <Akzent>`, `transition: color .2s ease, border-color .2s ease`
- Weitere-Links-Menü: Symbol mit drei Strichen 19×19, `stroke:rgba(241,243,237,.9)`.
  Panel: `position:absolute; top:calc(100% + 16px); right:0; min-width:210px; padding:8px;`
  `background:rgba(27,46,40,.72); backdrop-filter:blur(20px);`
  `border:1px solid rgba(241,243,237,.18)`.
  Einträge `padding:10px 14px; font:400 15px; color:#F1F3ED`,
  Hover `background:rgba(241,243,237,.12)`. Hervorgehobener Eintrag in Akzentfarbe.
- Suchfeld: Lupe 17×17 `stroke:rgba(241,243,237,.8)`, Eingabefeld `width:96px`,
  transparent, `font:400 14.5px`, `color:#F1F3ED`, Platzhalter „Suchen"
- Trennung vor dem Suchfeld: `padding-left:26px; border-left:1px solid rgba(241,243,237,.22)`

### Aufklappende Unterzeile

- `display:flex; flex-wrap:wrap; gap:8px 34px; justify-content:flex-end; overflow:hidden`
- offen: `padding:12px 56px 16px; max-height:140px; opacity:1;`
  `border-top:1px solid rgba(241,243,237,.16)`
- geschlossen: `padding:0 56px; max-height:0; opacity:0; border-top-color:transparent`
- `transition: max-height .34s ease, opacity .28s ease, padding .34s ease`
- Einträge: `padding:4px 0; font:400 14.5px`, mit Zielseite `rgba(241,243,237,.82)`,
  ohne Zielseite im Mockup `.5` — **Spec 9.1 schreibt `.72` vor** (Kontrast).

---

## Hero

- Wrapper: `position:relative; min-height:100vh; display:flex; flex-direction:column;`
  `overflow:hidden; background:#1B2E28`
- Video: `position:absolute; inset:0; width:100%; height:100%; object-fit:cover`,
  stumm, `playsinline`, `autoplay`, `preload="auto"`, `disableremoteplayback`
- Weichgezeichnet ab dem zweiten Durchlauf:
  `filter: blur(7px) saturate(.85) brightness(.82); transform: scale(1.06);`
  `transition: filter 1.4s ease, transform 1.4s ease`
- Scrim (`position:absolute; inset:0; pointer-events:none`), `transition: background 1.4s ease`:
  - normal: `linear-gradient(to bottom, rgba(27,46,40,.34) 0%, rgba(27,46,40,.12) 42%, rgba(241,243,237,.9) 72%, #F1F3ED 88%)`
  - weichgezeichnet: `linear-gradient(to bottom, rgba(27,46,40,.5) 0%, rgba(27,46,40,.4) 44%, rgba(241,243,237,.9) 72%, #F1F3ED 88%)`
- Textblock: `flex:1; display:flex; align-items:center; padding:5vh 56px 3vh`,
  innen `max-width:1000px`
  - Kicker: `margin:0 0 22px; font-size:11.5px; letter-spacing:.2em; text-transform:uppercase;`
    `color:rgba(241,243,237,.8)`
  - H1: `margin:0; font:500 clamp(48px,7vw,104px)/.98; letter-spacing:-.025em; color:#F1F3ED`
    (Spec 4.4: Minimum unter 560px auf 40px senken)
  - Lead: `margin:30px 0 0; max-width:48ch; font:400 clamp(18px,1.7vw,24px)/1.5;`
    `color:rgba(241,243,237,.9); text-wrap:pretty`

### Teaser-Band

- Wrapper: `padding:0 56px 30px`
- Raster: `display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr));`
  `gap:28px 60px; max-width:1240px`
- Spalte: `display:flex; flex-direction:column; gap:18px`
- Text: `margin:0; max-width:30ch; font:400 15px/1.6; color:rgba(36,51,46,.92); text-wrap:pretty`
- Link: `font:500 12.5px; letter-spacing:.16em; text-transform:uppercase; color:#26463D;`
  `border-bottom:1px solid rgba(36,51,46,.3); padding-bottom:6px; align-self:flex-start`
- Fortschrittslinie: `position:relative; height:2px; margin-top:26px; max-width:1240px;`
  `background:rgba(36,51,46,.16)`; Füllung `position:absolute; left:0; top:0; bottom:0;`
  `width:0%; background:<Akzent>; transition:width .25s linear`

### Wipe-In

`@keyframes wipeIn { from { clip-path: inset(0 100% 0 0) } to { clip-path: inset(0 -12% 0 0) } }`

Verzögerung als Anteil der Videodauer (Fallback 14 s): Kicker 2 %, Titel 6 %,
Lead 12 %, Teaser-Text 20 %, Teaser-Link 28 %. Die Animation läuft jeweils bis
zum Ende des Durchlaufs, also `dauer = pass − verzögerung`.

---

## `textIntro`

- Sektion: `padding:96px 56px; background:#F1F3ED`
- Raster: `grid-template-columns:minmax(0,300px) minmax(0,1fr); gap:70px;`
  `align-items:start; max-width:1240px`
- H2: `font:400 clamp(30px,3.2vw,44px)/1.1; letter-spacing:-.02em` (Umbruch per `<br>`)
- Textspalte: `display:flex; flex-direction:column; gap:22px; font-size:17.5px;`
  `line-height:1.8; color:rgba(36,51,46,.82); max-width:64ch; text-wrap:pretty`

## `pillarCards`

- Sektion: `padding:0 56px 110px; background:#F1F3ED`
- Raster: `grid-template-columns:repeat(auto-fit,minmax(270px,1fr)); gap:1px;`
  `max-width:1240px; background:rgba(36,51,46,.14)` — die Trennlinien entstehen
  durch die 1-px-Lücke, **nicht** durch Borders.
- Karte: `padding:44px 40px`. Flächenfarbe nach Position:
  1 → `#DDE8E2`, 2 → `rgba(125,170,155,.16)`, ab 3 → `rgba(<Akzent-RGB>,.14)`
- Kicker: `margin:0 0 12px; font-size:10.5px; letter-spacing:.18em;`
  `text-transform:uppercase; color:<Akzent>` — Text `{index} — {category}`
- H3: `margin:0 0 14px; font:400 25px/1.25`
- Text: `font-size:16.5px; line-height:1.75; color:rgba(36,51,46,.78)`

## `dayTimeline`

- Sektion: `padding:96px 56px; background:#E7EDE8;`
  `border-top:1px solid rgba(36,51,46,.1); border-bottom:1px solid rgba(36,51,46,.1)`
- Raster wie `textIntro`
- H2: `font:400 clamp(26px,2.6vw,34px)/1.15; letter-spacing:-.015em`
- Zeile: `display:flex; gap:34px; padding:22px 0; border-top:1px solid rgba(36,51,46,.14)`,
  die letzte zusätzlich mit `border-bottom`
- Zeit: `flex:none; width:88px; font:500 14px; letter-spacing:.06em`,
  im Mockup `rgba(36,51,46,.55)` — **Spec 9.1 schreibt `.70` vor** (Kontrast)
- Beschreibung: `font-size:17px; line-height:1.6; color:rgba(36,51,46,.85)`
- Umsetzung als `<dl>` / `<dt>` / `<dd>` (Spec 5.4)

## `quote`

- Sektion: `padding:110px 56px; background:#F1F3ED`
- Zitat: `max-width:900px; font:400 clamp(24px,2.8vw,38px)/1.35;`
  `letter-spacing:-.015em; color:#26463D; text-wrap:pretty`
- Anführungszeichen per CSS (`quotes: "„" "“"`), nicht im Inhalt
- Zuschreibung: `margin-top:26px; font:500 13px; letter-spacing:.16em;`
  `text-transform:uppercase; color:rgba(36,51,46,.55)`

## `ctaBanner`

- Sektion: `padding:96px 56px; background:#26463D`
- Zeile: `display:flex; flex-wrap:wrap; align-items:end; justify-content:space-between;`
  `gap:36px; max-width:1240px`
- H2: `margin:0 0 14px; font:400 clamp(28px,3vw,40px)/1.1; letter-spacing:-.02em; color:#F1F3ED`
- Text: `max-width:52ch; font-size:17px; line-height:1.7; color:rgba(241,243,237,.82)`
- Schaltfläche: `flex:none; padding:16px 30px; border:1px solid rgba(241,243,237,.4);`
  `font:500 13px; letter-spacing:.14em; text-transform:uppercase; color:#F1F3ED`

## Fusszeile

- `border-top:1px solid rgba(36,51,46,.12); background:#D5E2DA`
- Spalten: `display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr));`
  `gap:50px; padding:67px 56px 40px`
- Spaltenkopf: `font:500 15px/1.3; color:#26463D`
- Spaltentext: `font-size:15px; line-height:1.85; color:rgba(36,51,46,.72)`
- Fusszeile unten: `display:flex; flex-wrap:wrap; gap:12px 35px;`
  `justify-content:space-between; align-items:center; padding:20px 56px 35px;`
  `border-top:1px solid rgba(36,51,46,.1); font-size:12.5px`
  - Meta-Text im Mockup `rgba(36,51,46,.58)` — **Spec 9.1 schreibt `.72` vor**
  - Rechtslinks im Mockup `rgba(36,51,46,.68)` — **Spec 9.1 schreibt `.74` vor**
  - Rechtslinks nebeneinander mit `gap:25px`

---

## Navigationsstruktur (Konstante `NAV` im Canvas)

| Gruppe          | Unterpunkte                                                                                |
| --------------- | ------------------------------------------------------------------------------------------ |
| Administratives | Stundenplan · Formulare & Infos für Eltern · Ferienplan · Feste, Anlässe & Lager             |
| Stufen          | Unterstufe · Mittel- und Oberstufe · Sprachheilschule · Besondere Volksschule · Privatschule |
| Pädagogik       | Grundsätzliche Pädagogik · Lernort                                                           |
| Über uns        | Team · Leitbild · Wen wir ansprechen wollen · Fotos                                          |
| Weitere Links   | Aktuelles · Anmeldung · Offene Stellen · Insiderbereich (hervorgehoben)                      |
