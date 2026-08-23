# Assets für den Seed

`src/seed/homepage.ts` lädt die Dateien in diesem Ordner in die `media`-Collection,
sofern sie vorhanden sind. Fehlt eine Datei, überspringt der Seed sie mit einer
Warnung und läuft weiter — die Startseite bleibt funktionsfähig.

| Datei                          | Verwendung                       | Status                    |
| ------------------------------ | -------------------------------- | ------------------------- |
| `logo-natuerlich-schule.png`   | Logo in der Kopfzeile            | fehlt — manuell exportieren |
| `hero-loop.mp4`                | Hintergrundvideo im Hero         | fehlt — Rechte offen (OF-3) |
| `hero-poster.jpg`              | Standbild und Rückfall zum Video | fehlt — manuell exportieren |

## Woher kommen die Dateien

Aus dem Claude-Design-Projekt `00d9a05b-e5ab-4698-a826-2ef431ff3d36`
(`assets/logo-natuerlich-schule.png`, `assets/hero-loop.mp4`, `assets/hero-see.png`).
Sie lassen sich nicht über die Design-Schnittstelle exportieren — die schneidet
Dateien bei 256 KiB ab. Export daher von Hand aus dem Design-Canvas.

Das Video muss vor dem Einspielen auf ≤ 3 MB gebracht werden (Spec 9.2), am besten
als H.264 **und** WebM. Videos über 100 MB gehören direkt via
`wrangler r2 object put` in den Bucket, nicht über den Admin-Upload.

Ohne Logo zeigt die Kopfzeile die Wortmarke aus dem `header`-Global als Text.
Ohne Video bleibt der Hero auf der dunklen Fläche bzw. dem Standbild stehen.
