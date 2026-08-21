# 02 – Setup & Entwicklung

## Ausgangslage

Das Projekt wurde bereits aus dem offiziellen **Payload-Cloudflare-Template** erzeugt und
liegt unter `natuerlichschulewebseite/`. Enthalten sind Payload 3.88, Next.js 16,
D1-Adapter, R2-Plugin, OpenNext und eine Testeinrichtung (Vitest + Playwright).

## Zu klären: Ablage im Repository

Der Payload-Ordner ist derzeit **nicht in Git** (`?? natuerlichschulewebseite/`), das
Repository enthält nur diese Dokumentation. Bevor entwickelt wird, eine der beiden
Varianten wählen:

| Variante | Ergebnis | Bewertung |
|---|---|---|
| **Anwendung ins Repo-Wurzelverzeichnis** | `package.json`, `src/`, `wrangler.jsonc` oben, Doku bleibt in `docs/` | **Empfohlen.** Es gibt nur eine Anwendung; die übliche Cloudflare- und Payload-Werkzeugkette erwartet sie oben. |
| Anwendung als Unterordner `app/` | Repo enthält `app/` und `docs/` | Nur sinnvoll, wenn später eine zweite Anwendung dazukommt – danach sieht es nicht aus. |

Was in beiden Fällen zu tun ist: `.gitignore` prüfen (`.next`, `.open-next`, `.wrangler`,
`node_modules`, `.env`) und das Ganze als erster Commit erfassen.

## Zwei Punkte, die vor dem ersten Build zu beheben sind

Beim Durchsehen des Templates aufgefallen:

**1. Kaputter Import in `src/payload.config.ts`**

```ts
import migrations from './db/migrations'
```

Der Ordner heisst `src/migrations`, nicht `src/db/migrations`, und `index.ts` exportiert
`migrations` **benannt**, nicht als Default. Richtig ist:

```ts
import { migrations } from './migrations'
```

Ausserdem wird die Variable derzeit nirgends verwendet. Für den produktiven Betrieb
gehört sie an den Adapter:

```ts
db: sqliteD1Adapter({
  binding: cloudflare.env.D1,
  prodMigrations: migrations,
}),
```

**2. Platzhalter in `wrangler.jsonc`**

`name`, `database_name` und `bucket_name` stehen auf `my-app`, `database_id` auf
`DATABASE_ID`. Vor dem ersten Deploy auf echte Werte setzen – siehe
[06-deployment.md](06-deployment.md).

## Voraussetzungen

- Node.js ≥ 20 (das Template verlangt `^18.20.2 || >=20.9.0`)
- **pnpm** (`^9 || ^10 || ^11`) – nicht npm, das Template ist auf pnpm ausgelegt
- Ein Cloudflare-Konto mit **Workers Paid** (5 USD/Monat, technisch nötig)
- Wrangler-Anmeldung: `pnpm wrangler login`

## Erste Schritte

```bash
pnpm install
```

`.env` anlegen (die Vorlage im Projekt enthält nur `PAYLOAD_SECRET`):

```bash
PAYLOAD_SECRET="<openssl rand -hex 32>"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
# CLOUDFLARE_ENV nur setzen, wenn mit einer benannten Umgebung gearbeitet wird
```

```bash
pnpm dev
```

Öffentliche Seite auf `http://localhost:3000`, Payload-Oberfläche auf
`http://localhost:3000/admin`. Beim ersten Aufruf von `/admin` wird das erste
Benutzerkonto angelegt.

Lokal greift die Konfiguration über `getPlatformProxy` auf die Bindings zu: D1 läuft als
lokale SQLite-Datei unter `.wrangler/`, R2 als lokaler Ordner. Man arbeitet also **nicht**
auf den produktiven Daten.

## Wichtige Skripte

Aus dem Template, unverändert nutzbar:

| Befehl | Wirkung |
|---|---|
| `pnpm dev` | Entwicklungsserver |
| `pnpm devsafe` | Dasselbe, aber `.next` und `.open-next` vorher löschen (bei seltsamen Fehlern) |
| `pnpm build` | Next.js-Build |
| `pnpm preview` | OpenNext-Build und lokale Ausführung in der echten Worker-Laufzeit |
| `pnpm deploy` | Migrationen ausrollen, dann die Anwendung deployen |
| `pnpm generate:types` | Payload-Typen und Cloudflare-Bindings-Typen |
| `pnpm payload migrate:create` | Neue Migration erzeugen |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest (Integration) + Playwright (E2E) |

`pnpm preview` vor jedem Deploy laufen lassen: `pnpm dev` nutzt den Node-Server, erst
OpenNext zeigt Probleme, die nur in der Worker-Laufzeit auftreten.

## Geplante Projektstruktur

```
src/
├── app/
│   ├── (frontend)/                 öffentliche Seiten
│   │   ├── layout.tsx
│   │   ├── page.tsx                Startseite
│   │   ├── ueber-uns/page.tsx
│   │   ├── konzept/page.tsx
│   │   ├── team/page.tsx
│   │   ├── kontakt/page.tsx
│   │   ├── impressum/page.tsx
│   │   ├── datenschutz/page.tsx
│   │   └── events/
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   └── (payload)/                  Payload-Oberfläche, aus dem Template
├── collections/
│   ├── Users.ts
│   ├── Media.ts
│   └── Events.ts                   neu
├── globals/
│   └── EventsPage.ts               neu
├── components/                     Header, Footer, EventCard, EventDate …
├── fields/slug.ts                  Slug-Hook
├── hooks/revalidateEvents.ts       Revalidierung nach dem Speichern
├── lib/datum.ts                    Datumsformatierung de-CH
├── migrations/
├── payload.config.ts
└── payload-types.ts                generiert
```

## Konventionen

- Benutzersichtbare Texte und URLs auf **Deutsch** (`/ueber-uns`, nicht `/about`),
  Umlaute aufgelöst (`ue`, `oe`, `ae`, `ss`).
- Code und Commit-Messages auf Englisch, Conventional Commits:
  `feat(events): Detailseite mit Live Preview`.
- `main` ist das, was live ist. Feature-Branches, Pull Request, Preview prüfen, mergen.
- Vor jedem Commit: `pnpm lint` und `pnpm generate:types` (falls das Modell geändert wurde).

## Verwandte Dokumente

- Datenmodell → [03-payload.md](03-payload.md)
- Bindings, Secrets, Deployment → [06-deployment.md](06-deployment.md)
