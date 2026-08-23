# 01 – Architektur

## Überblick

Grundlage ist das offizielle **Payload-Cloudflare-Template**: Payload 3 läuft nicht als
eigener Server neben der Webseite, sondern **innerhalb derselben Next.js-Anwendung**.
Öffentliche Seiten und Redaktionsoberfläche sind ein einziges Deployment.

```
                     ┌──────────────────────────────────────────────┐
   Besucher ────────►│  Cloudflare Worker                            │
                     │  (OpenNext + Next.js 16 + Payload 3.88)       │
                     │                                               │
                     │  /                 öffentliche Seiten         │
                     │  /events           Veranstaltungen            │
                     │  /events/[slug]    Detailseite                │
                     │  /admin            Payload Admin (fertig!)    │
                     │  /api/*            Payload REST + GraphQL     │
                     └───────────┬───────────────────┬───────────────┘
                                 │                   │
                                 ▼                   ▼
                     ┌───────────────────┐  ┌────────────────────────┐
                     │  D1 (SQLite)      │  │  R2 (Objektspeicher)   │
                     │  Inhalte, Nutzer  │  │  Bilder, Uploads       │
                     └───────────────────┘  └────────────────────────┘

   Entwickler ──git push──► GitHub ──Action──► payload migrate + opennextjs deploy
```

**Alles auf Cloudflare.** Keine externe Datenbank, kein zweiter Anbieter, eine Rechnung.

## Der Stack im Einzelnen

| Baustein | Technologie | Rolle |
|---|---|---|
| Framework | Next.js 16 (App Router, React 19) | Öffentliche Seiten und Payload-Oberfläche |
| CMS | Payload 3.88 | Datenmodell, Admin-UI, Auth, Versionierung |
| Datenbank | Cloudflare D1 (SQLite), `@payloadcms/db-d1-sqlite` | Inhalte |
| Dateien | Cloudflare R2, `@payloadcms/storage-r2` | Bilder |
| Editor | Lexical (`@payloadcms/richtext-lexical`) | Fliesstext |
| Deployment | `@opennextjs/cloudflare` → Cloudflare Worker | Hosting |
| Paketmanager | pnpm | |

## Warum Payload statt einer selbst gebauten Admin-Konsole

Eine eigene Oberfläche hätte Login, Formulare, Validierung, Bild-Upload, Entwurfsstatus
und Vorschau als Handarbeit bedeutet – und jede dieser Stellen wäre langfristig zu
pflegen. Payload bringt all das mit und darüber hinaus einiges, was in einer selbst
gebauten Lösung realistisch nie entstanden wäre:

- **Versionen und Entwürfe** inklusive Wiederherstellen älterer Fassungen
- **Live Preview** – die Kundin sieht beim Tippen, wie die Seite aussehen wird
- **Deutschsprachige Oberfläche** von Haus aus
- **Zugriffskontrolle** pro Collection und Feld
- **Automatische REST- und GraphQL-API** samt TypeScript-Typen
- Ein Datenmodell, das sich in Code beschreiben lässt und mitversioniert wird

Der Preis dafür ist die Bindung an Next.js – Astro fällt damit weg – und ein grösserer
Worker. Beides ist für dieses Projekt vertretbar.

## Was sich gegenüber dem ersten Entwurf geändert hat

| Vorher geplant | Jetzt | Grund |
|---|---|---|
| Astro + React-Islands | Next.js 16 | Payload 3 ist Next.js-nativ |
| Supabase (Postgres, Auth, Storage) | D1 + R2 + Payload-Auth | Payload bringt Auth mit, D1/R2 liegen neben dem Worker |
| Selbst gebaute Admin-Konsole | Payload Admin | Fertig, mächtiger, weniger Wartung |
| Cache-Purge über die Cloudflare-API | `revalidatePath()` aus einem Payload-Hook | In Next.js eingebaut, feiner steuerbar |
| Cloudflare Workers **Free** | Workers **Paid** (5 USD/Monat) | Bundle-Grösse, siehe unten |

Unverändert gültig bleiben [07 – Domain & E-Mail](07-domain-und-email.md) und
[08 – Content-Migration](08-content-migration.md): Die Migration weg von Jimdo hängt
nicht an der Technikwahl.

## Datenzugriff: Local API

Innerhalb derselben Anwendung greifen die öffentlichen Seiten **nicht über HTTP** auf
Payload zu, sondern über die Local API – ein direkter Funktionsaufruf ohne Netzwerkweg:

```ts
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'events',
  where: { _status: { equals: 'published' } },
  sort: 'startsAt',
})
```

Die REST- und GraphQL-Endpunkte unter `/api/*` existieren trotzdem und sind nützlich für
spätere Integrationen, werden im eigenen Frontend aber nicht gebraucht.

## Rendering und Aktualität

Öffentliche Seiten werden statisch generiert und über den Cache ausgeliefert. Speichert
die Kundin ein Event, löst ein Payload-Hook `revalidatePath('/events')` aus – die Seite
wird neu erzeugt und ist **sofort** aktuell. Kein Rebuild, keine Wartezeit, trotzdem
statische Geschwindigkeit.

Dafür sind zwei Cloudflare-Bindings nötig, die im Template noch auskommentiert sind:

| Binding | Wofür |
|---|---|
| `NEXT_INC_CACHE_R2_BUCKET` | Ablage der vorgerenderten Seiten (ISR-Cache) |
| `WORKER_SELF_REFERENCE` | Damit der Worker seine eigene Revalidierung auslösen kann |

Details in [06-deployment.md](06-deployment.md).

## Bekannte Einschränkungen dieser Plattform

Diese Punkte sind keine Fehler, sondern Eigenschaften der Kombination Payload + Workers.
Man sollte sie kennen, bevor man darüber stolpert.

**1. Kein `sharp` – also keine serverseitige Bildverarbeitung.**
Auf Workers gibt es kein `sharp`. Damit entfallen `imageSizes`, Zuschneiden und
Fokuspunkt; im Template steht in `Media.ts` bereits `crop: false, focalPoint: false`.
Hochgeladene Bilder werden **unverändert** gespeichert und ausgeliefert. Für eine
Schulwebseite mit Fotos ist das relevant – ein 6-MB-Handyfoto bliebe ein 6-MB-Foto.
Gegenmassnahmen in [05-frontend.md](05-frontend.md), Abschnitt „Bilder".

**2. Workers Paid ist Pflicht.**
Der kostenlose Tarif begrenzt einen Worker auf 3 MiB komprimiert, der bezahlte auf
10 MiB. Ein Next.js-Bundle mit Payload passt nicht in 3 MiB. Kosten: 5 USD/Monat.

**3. D1 ist SQLite, nicht Postgres.**
Für dieses Datenvolumen völlig ausreichend, aber die Grenzen kennen: keine echte
Volltextsuche über Sprachgrenzen, weniger Datentypen, und Migrationen laufen über
`payload migrate` gegen die entfernte D1-Instanz.

**4. Der Worker ist ein einzelner Ausfallpunkt.**
Anders als beim ursprünglichen Entwurf gibt es keine rein statischen Seiten, die
unabhängig weiterlaufen. Fällt der Worker aus, ist die ganze Seite weg. Der
ISR-Cache mildert das ab, ersetzt aber kein Monitoring – siehe [09-betrieb.md](09-betrieb.md).

## Verwandte Dokumente

- Datenmodell und Collections → [03-payload.md](03-payload.md)
- Deployment, Bindings, Migrationen → [06-deployment.md](06-deployment.md)
