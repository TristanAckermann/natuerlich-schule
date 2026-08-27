# Assets für den Seed

`src/seed/homepage.ts` lädt die Dateien in diesem Ordner in die `media`-Collection,
sofern sie vorhanden sind. Fehlt eine Datei, überspringt der Seed sie mit einer
Warnung und läuft weiter — die Startseite bleibt funktionsfähig.

| Datei                          | Verwendung                       | Status                    |
| ------------------------------ | -------------------------------- | ------------------------- |
| `logo-natuerlich-schule.png`   | Logo in der Kopfzeile, Symbol im Seitenkopf der Unterstufe | fehlt — manuell exportieren |
| `hero-loop.mp4`                | Hintergrundvideo im Hero         | vorhanden                 |
| `hero-poster.jpg`              | Standbild und Rückfall zum Video | vorhanden                 |

## Woher kommen die Dateien

Logo aus dem Claude-Design-Projekt `00d9a05b-e5ab-4698-a826-2ef431ff3d36`
(`assets/logo-natuerlich-schule.png`). Es lässt sich nicht über die
Design-Schnittstelle exportieren — die schneidet Dateien bei 256 KiB ab. Export
daher von Hand aus dem Design-Canvas.

Ohne Logo zeigt die Kopfzeile die Wortmarke aus dem `header`-Global als Text.

## Das Hero-Video

`hero-loop.mp4` — 1536 × 864, H.264, 24 fps, 14.04 s, **ohne Tonspur**, Faststart,
2.7 MB. Damit unter dem 3-MB-Limit aus Spec 9.2. Quelle war eine 1920 × 1080er
Fassung mit Ton; die Tonspur ist entfernt, weil das Video ohnehin stumm läuft und
ein vorhandener Ton je nach Browser in der Medienbedienung des Betriebssystems
auftaucht. Eine WebM-Variante fehlt noch (Spec 9.2 sieht beide vor).

`hero-poster.jpg` ist das erste Bild des Videos — die leere Lichtung, bevor der
Käfer ins Bild kommt. Bewusst kein Bild aus der Bildmitte: das Standbild steht
vor dem ersten Frame, und ein anderes Motiv würde beim Anlaufen sichtbar springen.

### Wenn das Video ersetzt wird

Der Hero deckt seinen Text im Takt der rollenden Mistkugel auf. Wie schnell und
ab wann, steht in `src/blocks/Hero/HeroVideo.tsx` in drei Konstanten
(`BALL_ENTERS_AT`, `BALL_X_AT_ENTRY`, `BALL_X_AT_END`) — sie beschreiben die Bahn
der Kugel im Bild und gelten nur für genau diese Aufnahme. Ein neuer Schnitt
braucht neu ausgemessene Werte, sonst läuft die Maske an der Kugel vorbei.

Ausgemessen wird die Vorderkante der Kugel als Anteil der **Bildbreite** über die
Laufzeit; die Werte gehören als Anteil der **Laufzeit** eingetragen, damit sie
eine Neukodierung überstehen. Die Umrechnung auf das tatsächlich sichtbare
Fenster (`object-fit: cover` schneidet auf schmalen Geräten links und rechts ab)
macht die Komponente selbst.

Videos über 100 MB gehören direkt via `wrangler r2 object put` in den Bucket,
nicht über den Admin-Upload.
