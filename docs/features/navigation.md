# Navigation, Kopf- und Fusszeile

## Zweck

Kopf- und Fusszeile sind vollständig redaktionell gepflegt. Die Navigationsstruktur steht
in der Datenbank, nicht im Code.

## Wichtige Dateien

- `src/globals/Header.ts`, `src/globals/Footer.ts`
- `src/fields/link.ts` — `linkField()`
- `src/components/CmsLink.tsx` — `CmsLink`, `resolveHref()`
- `src/components/SiteHeader/` (`index.tsx` Server, `Nav.client.tsx` Client)
- `src/components/SiteFooter/`
- `src/utilities/getGlobals.ts` — `getHeader()`, `getFooter()`

## Daten

**Global `header`**: `wordmark` (Pflicht, dient als Alternativtext des Logos), `logo`,
`homeLabel`, `groups` (max. 6 Gruppen mit je mindestens einem Unterpunkt), `utilityLinks`
(mit `highlight`), `searchEnabled`.

**Global `footer`**: `columns` (max. 4, Titel plus Rich Text mit auf Absatz und Link
reduziertem Editor), `organization` (Name, Adresse, Kanton, E-Mail — Quelle für
`OrganizationJsonLd`), `legalNote`, `legalLinks`.

## Frontend

`SiteHeader` und `SiteFooter` werden im Root-Layout gerendert und laden ihr Global selbst.
`SiteHeader` löst die Links auf dem Server auf und übergibt nur serialisierbare Daten an
`Nav.client.tsx`. Ein Eintrag ohne Ziel bleibt als Platzhalter stehen (`isPlaceholder`) —
die Unterseiten gibt es noch nicht.

## Zugriff

Beide Globals: `read: () => true`, `update: authenticated`.

## Wichtige Zusammenhänge

`linkField()` erzeugt eine Gruppe mit `type` (`internal` / `external` / `email`), `label`
und dem passenden Ziel. Die Zielfelder sind bewusst **nicht** `required`, weil Payload
`required` auch bei ausgeblendeten Feldern erzwingt — stattdessen validiert jedes Zielfeld
selbst gegen `type`.

`resolveHref()` ist die einzige Stelle, die daraus eine URL macht, inklusive
`slug === 'home'` → `/`. Kein Bauteil setzt `href` von Hand.

## Besonderheiten

Beide Globals hängen am gemeinsamen Cache-Tag `globals`. Eine Änderung an der Kopfzeile
invalidiert also auch die Fusszeile — das ist gewollt und billig.
