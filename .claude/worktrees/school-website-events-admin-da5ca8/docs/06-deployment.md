# 06 – Deployment (OpenNext → Cloudflare Workers)

Die Anwendung wird mit `@opennextjs/cloudflare` in einen Cloudflare Worker übersetzt und
zusammen mit D1 und R2 betrieben. Die dafür nötigen Skripte bringt das Template mit.

## Voraussetzung: Workers Paid

Der kostenlose Tarif erlaubt 3 MiB komprimiert pro Worker, der bezahlte 10 MiB. Ein
Next.js-Bundle mit Payload überschreitet 3 MiB deutlich – **Workers Paid (5 USD/Monat)
ist technisch nötig**, nicht optional. Das vor dem ersten Deploy einrichten, sonst
scheitert der Upload mit einem wenig sprechenden Grössenfehler.

## Cloudflare-Ressourcen anlegen

```bash
pnpm wrangler d1 create natuerlich-schule
```

```bash
pnpm wrangler r2 bucket create natuerlich-schule-media
```

Zusätzlich einen zweiten Bucket für den Seiten-Cache:

```bash
pnpm wrangler r2 bucket create natuerlich-schule-cache
```

## `wrangler.jsonc` anpassen

Im Template stehen überall Platzhalter. Zu setzen sind:

```jsonc
{
  "name": "natuerlich-schule",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-08-15",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": { "directory": ".open-next/assets", "binding": "ASSETS" },

  "d1_databases": [
    {
      "binding": "D1",
      "database_name": "natuerlich-schule",
      "database_id": "<echte ID aus dem d1-create-Befehl>",
      "remote": true
    }
  ],

  "r2_buckets": [
    { "binding": "R2", "bucket_name": "natuerlich-schule-media" },
    { "binding": "NEXT_INC_CACHE_R2_BUCKET", "bucket_name": "natuerlich-schule-cache" }
  ],

  "services": [
    { "binding": "WORKER_SELF_REFERENCE", "service": "natuerlich-schule" }
  ]
}
```

Die letzten beiden Einträge sind im Template **auskommentiert** und müssen aktiviert
werden, sonst funktioniert die sofortige Aktualisierung nach dem Speichern nicht:

| Binding | Ohne dieses Binding |
|---|---|
| `NEXT_INC_CACHE_R2_BUCKET` | Kein persistenter Seiten-Cache – jede Anfrage rendert neu |
| `WORKER_SELF_REFERENCE` | `revalidatePath()` aus dem Payload-Hook läuft ins Leere |

Passend dazu in `open-next.config.ts` den Cache aktivieren:

```ts
import { defineCloudflareConfig } from '@opennextjs/cloudflare/config'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
})
```

## Secrets

| Name | Art | Bemerkung |
|---|---|---|
| `PAYLOAD_SECRET` | Secret | `openssl rand -hex 32`, signiert Sessions. **Nie ändern**, ohne dass alle Logins ungültig werden |
| `NEXT_PUBLIC_SITE_URL` | Variable | Produktions-URL, für Live Preview und Metadaten |

```bash
pnpm wrangler secret put PAYLOAD_SECRET
```

## Deployment

Das Template macht das Richtige bereits vor:

```bash
pnpm run deploy
```

Dahinter stecken zwei Schritte, und die Reihenfolge ist wichtig:

1. `deploy:database` – `payload migrate` gegen die entfernte D1-Instanz, danach
   `PRAGMA optimize`.
2. `deploy:app` – `opennextjs-cloudflare build` und `deploy`.

**Erst das Schema, dann der Code.** Andersherum läuft neuer Code gegen ein altes Schema.

### GitHub Actions

`.github/workflows/deploy.yml`, ausgelöst bei Push auf `main`:

```yaml
- uses: actions/checkout@v4
- uses: pnpm/action-setup@v4
- uses: actions/setup-node@v4
  with: { node-version: 22, cache: pnpm }
- run: pnpm install --frozen-lockfile
- run: pnpm lint
- run: pnpm run deploy
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    PAYLOAD_SECRET: ${{ secrets.PAYLOAD_SECRET }}
```

Der API-Token braucht **Workers Scripts: Edit**, **D1: Edit**, **R2: Edit** und
**Account Settings: Read**.

### Staging

`wrangler.jsonc` enthält ein auskommentiertes Beispiel für eine zweite Umgebung mit
eigener D1-Datenbank und eigenem Bucket. Für dieses Projekt sinnvoll, sobald die Seite
live ist – dann lassen sich Migrationen und grössere Änderungen gefahrlos ausprobieren:

```bash
CLOUDFLARE_ENV=staging pnpm run deploy
```

**Rollback:** Im Dashboard unter Workers → Deployments eine frühere Version
zurückrollen. Achtung: Das rollt **nur den Code** zurück, nicht das Datenbankschema.
Migrationen deshalb möglichst additiv halten (Spalten hinzufügen statt umbenennen).

## Caching

| Route | Strategie |
|---|---|
| Statische Inhaltsseiten | Vollständig vorgerendert, Revalidierung nur beim Deploy |
| `/events`, `/events/[slug]` | Vorgerendert, `revalidatePath()` aus dem Payload-Hook |
| `/admin/*`, `/api/*` | Nie cachen |

Damit ist die Seite so schnell wie eine statische, aber sofort aktuell, wenn die Kundin
speichert. Der frühere Umweg über die Cache-Purge-API entfällt.

Zusätzlich in Cloudflare: **Always Use HTTPS**, SSL **Full (strict)**, Web Analytics.

## Custom Domain

Erst wenn die Seite fertig ist und die Zone in Cloudflare aktiv ist – siehe
[07-domain-und-email.md](07-domain-und-email.md).

Worker → Settings → Domains & Routes → **Add Custom Domain**. Danach
`NEXT_PUBLIC_SITE_URL` auf die echte Domain setzen und neu deployen, sonst zeigen Live
Preview und Metadaten weiterhin auf die `workers.dev`-Adresse.

## Vor dem Go-Live prüfen

- [ ] `pnpm preview` läuft ohne Fehler in der Worker-Laufzeit
- [ ] Bundle unter 10 MiB (Wrangler meldet die Grösse beim Deploy)
- [ ] Migrationen auf der entfernten D1 angewandt
- [ ] `/admin` erreichbar, Login funktioniert, Registrierung gesperrt
- [ ] Ein Event speichern → Änderung sofort auf `/events` sichtbar
- [ ] Bild-Upload landet im R2-Bucket und wird ausgeliefert
- [ ] Entwurf ist ohne Login nicht über `/api/events` abrufbar
- [ ] Lighthouse Mobile, 404-Seite, `robots.txt`, Sitemap

## Verwandte Dokumente

- Datenmodell und Migrationen → [03-payload.md](03-payload.md)
- Domain und DNS → [07-domain-und-email.md](07-domain-und-email.md)
