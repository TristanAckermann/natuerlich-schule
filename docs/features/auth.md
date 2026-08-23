# Anmeldung, Zugriff und Vorschau

## Zweck

Eine einzige Rolle: die Redaktion. Wer angemeldet ist, darf alles ändern; anonym ist alles
nur lesbar, und Entwürfe bleiben verborgen.

## Wichtige Dateien

- `src/collections/Users.ts` — `auth: true`, gleichzeitig `admin.user`
- `src/access/index.ts` — alle Access-Funktionen
- `src/app/(frontend)/next/preview/route.ts` — Handshake für den Entwurfsmodus
- `src/utilities/generatePreviewPath.ts` — Ziel-URL für Live Preview
- `tests/helpers/seedUser.ts`, `tests/helpers/login.ts`

## Daten

Collection `users` mit den Standardfeldern der Payload-Authentifizierung. **Keine
Rollenfelder** — es gibt keine Abstufung. Wer ein Rollenmodell einführt, muss alle drei
Access-Funktionen und jede Collection anfassen.

## Zugriff

| Funktion | Bedeutung |
| --- | --- |
| `authenticated` | eingeloggt — Standard für alles Schreibende |
| `publishedOrAuthenticated` | anonym nur `_status: published`, sonst alles |
| `authenticatedExceptHome` | wie `authenticated`, gibt aber `{ slug: { not_equals: 'home' } }` zurück |

Access-Funktionen dürfen eine Query liefern; Payload hängt sie an das WHERE an. So bleibt
die Startseite unlöschbar, ohne dass ein Hook nötig wäre.

## Vorschau

`/next/preview` setzt den Draft-Modus nur, wenn **beides** stimmt: das gemeinsame Geheimnis
aus `PREVIEW_SECRET` und eine gültige Payload-Session (`payload.auth()`). Zusätzlich muss
`path` seiteninterne Form haben (beginnt mit `/`, nicht mit `//`) — das verhindert eine
offene Weiterleitung. Fehlt `PREVIEW_SECRET`, antwortet die Route mit 403.

`getPage(slug, draft)` umgeht die Zugriffskontrolle nur im Entwurfsmodus
(`overrideAccess: draft`) und cacht dort bewusst nicht.

## Besonderheiten

- `/admin`, `/api` und `/next/preview` sind in `src/app/robots.ts` gesperrt.
- Den ersten Benutzer legt der Admin beim ersten Aufruf selbst an; für Tests erledigt das
  `tests/helpers/seedUser.ts`.
- Framework-Details zur Authentifizierung stehen im Skill `.claude/skills/payload/`.
