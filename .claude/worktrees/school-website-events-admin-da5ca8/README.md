# natuerlich-schule

Neue Webseite für die Schule – Ersatz für die bestehende Jimdo-Seite.

Webseite mit eingebauter Redaktionsoberfläche: Die Schulleitung kann die **Events-Seite**
selbstständig pflegen (Veranstaltungen anlegen, bearbeiten, veröffentlichen), alles andere
ist statischer Inhalt, der über Git gepflegt wird.

## Stack

| Bereich | Technologie |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React 19) |
| CMS / Admin | [Payload 3](https://payloadcms.com) – Datenmodell, Auth, Admin-UI, Versionierung |
| Styling | Tailwind CSS v4 |
| Datenbank | Cloudflare D1 (SQLite) |
| Dateien | Cloudflare R2 |
| Hosting | Cloudflare Workers (über `@opennextjs/cloudflare`) |
| DNS/CDN | Cloudflare |
| Domain | `.ch`, Registrar Schweiz (nicht Cloudflare – siehe [07](docs/07-domain-und-email.md)) |

**Alles auf Cloudflare** – kein Supabase, kein zweiter Anbieter, keine selbst gebaute
Admin-Konsole. Details und Begründung → [01-architektur.md](docs/01-architektur.md).

## Quickstart

Die Anwendung liegt in [`natuerlichschulewebseite/`](natuerlichschulewebseite/):

```bash
cd natuerlichschulewebseite
pnpm install
pnpm dev
```

Vorher `.env` anlegen – siehe [docs/02-setup.md](docs/02-setup.md).

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [00 – Scope](docs/00-scope.md) | Ziele, Nicht-Ziele, Rollen, Annahmen, offene Punkte |
| [01 – Architektur](docs/01-architektur.md) | Systemüberblick, Rendering-Strategie, Technologieentscheide |
| [02 – Setup](docs/02-setup.md) | Repo-Struktur, lokale Entwicklung, Konventionen |
| [03 – Payload](docs/03-payload.md) | Datenmodell, Collections, Zugriffsregeln, Migrationen |
| [04 – Redaktionsoberfläche](docs/04-admin.md) | Payload Admin konfigurieren, Live Preview, Bilder |
| [05 – Frontend](docs/05-frontend.md) | Sitemap, Komponenten, Design, SEO, Barrierefreiheit |
| [06 – Deployment](docs/06-deployment.md) | Cloudflare Workers, Build, Secrets, Caching |
| [07 – Domain & E-Mail](docs/07-domain-und-email.md) | **Migration weg von Jimdo – Cutover-Runbook** |
| [08 – Content-Migration](docs/08-content-migration.md) | Inhalte übernehmen, Redirects, SEO-Umzug |
| [09 – Betrieb](docs/09-betrieb.md) | Kosten, Backups, Monitoring, Übergabe |
| [10 – Anleitung für die Kundin](docs/10-anleitung-kundin.md) | Bedienungsanleitung Admin-Bereich |
| [ROADMAP](docs/ROADMAP.md) | Phasen, Meilensteine, Checklisten |

## Der wichtigste Hinweis vorweg

Über die Domain läuft **E-Mail bei Jimdo**. Jimdo-Postfächer werden beim Domain-Transfer
**nicht** mitgenommen. Die Reihenfolge ist deshalb zwingend:

**Neue Seite fertig → Postfächer umziehen → MX umstellen → Domain transferieren.**

Details in [docs/07-domain-und-email.md](docs/07-domain-und-email.md). Nicht abkürzen.
