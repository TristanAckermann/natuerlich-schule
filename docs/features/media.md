# Medien

## Zweck

Bilder und Videos für Seiten, Blöcke und die Kopfzeile. Die Dateien liegen im Dateisystem
unter `MEDIA_DIR`, die Metadaten in der SQLite-Datenbank.

## Wichtige Dateien

- `src/collections/Media.ts`
- `src/collections/Media.ts` — `upload.staticDir`, gesteuert über `MEDIA_DIR`
- `src/seed/homepage.ts` — Abgleich vorhandener Dateien über `filename`

## Daten

Collection `media` mit `alt`, `caption`, `credit`. Erlaubte Typen: `image/*`, `video/mp4`,
`video/webm`.

`alt` ist für Bilder Pflicht — erzwungen über eine eigene `validate`-Funktion, nicht über
`required`, weil das Feld bei Videos per `admin.condition` ausgeblendet ist.

## Frontend

Bilder werden über die generierten Typen aus `src/payload-types.ts` gerendert; das
Hero-Video über `src/blocks/Hero/HeroVideo.tsx`. Bei Uploads über `filterOptions` wird auf
`mimeType` gefiltert, wo nur Bilder zulässig sind (SEO-Vorschaubild, Logo).

## Zugriff

`read: () => true` — Medien sind öffentlich. Anlegen, Ändern und Löschen: `authenticated`.

## Besonderheiten

`crop` und `focalPoint` sind abgeschaltet und es entstehen **keine abgeleiteten
Bildgrössen**. Seit dem Wechsel auf Node ist sharp vorhanden, der Grund ist jetzt das
Schema: `focalPoint` braucht die Spalten `focal_x`/`focal_y`, `imageSizes` je eine
Spaltengruppe pro Grösse. Einschalten heisst deshalb `payload migrate:create`.

Der Seed erkennt bereits hochgeladene Dateien am `filename` und lädt sie nicht erneut hoch.
Fehlt eine Datei unter `docs/assets/`, warnt er nur und läuft weiter.
