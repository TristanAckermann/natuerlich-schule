# 03 – Payload: Datenmodell & Konfiguration

Ersetzt das frühere Supabase-Dokument. Das Datenmodell wird in TypeScript beschrieben und
liegt im Repo – Schemaänderungen sind damit reviewbar und versioniert.

## Stand des Projekts

Aus dem Template vorhanden:

| Datei | Inhalt |
|---|---|
| `src/payload.config.ts` | D1-Adapter, R2-Plugin, Lexical-Editor, Logger |
| `src/collections/Users.ts` | Auth-Collection, noch ohne Zugriffsregeln |
| `src/collections/Media.ts` | Upload-Collection mit Pflichtfeld `alt` |
| `src/migrations/` | Erste Migration des Templates |

Noch zu bauen: `Events`, das Global `EventsPage`, deutsche Oberfläche, Zugriffsregeln.

## Collections

### Events

`src/collections/Events.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { revalidateEvents } from '../hooks/revalidateEvents'
import { formatSlug } from '../fields/slug'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Veranstaltung', plural: 'Veranstaltungen' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'location', '_status'],
    // Live Preview: zeigt beim Tippen die echte Seite
    livePreview: {
      url: ({ data }) => `${process.env.NEXT_PUBLIC_SITE_URL}/events/${data?.slug}?draft=true`,
    },
  },
  access: {
    // Öffentlich sind nur veröffentlichte Fassungen
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  versions: {
    drafts: { autosave: { interval: 2000 } },
    maxPerDoc: 20,
  },
  hooks: {
    afterChange: [revalidateEvents],
    afterDelete: [revalidateEvents],
  },
  fields: [
    { name: 'title', label: 'Titel', type: 'text', required: true },
    {
      name: 'slug',
      label: 'URL-Kürzel',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Wird automatisch aus dem Titel gebildet.',
      },
      hooks: { beforeValidate: [formatSlug('title')] },
    },
    { name: 'startsAt', label: 'Beginn', type: 'date', required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'endsAt', label: 'Ende', type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'allDay', label: 'Ganztägig', type: 'checkbox', defaultValue: false },
    { name: 'location', label: 'Ort', type: 'text' },
    { name: 'summary', label: 'Kurzbeschreibung', type: 'textarea', maxLength: 200,
      admin: { description: 'Erscheint in der Übersicht und in der Google-Suche.' } },
    { name: 'content', label: 'Beschreibung', type: 'richText' },
    { name: 'image', label: 'Bild', type: 'upload', relationTo: 'media' },
  ],
}
```

**Zu den Entscheidungen im Detail**

- **`versions.drafts` statt eines eigenen Statusfelds.** Payload verwaltet `_status`
  (`draft`/`published`) selbst, samt Historie und Wiederherstellung. Mit `autosave` geht
  nichts verloren, wenn der Browser abstürzt.
- **`access.read` ist die eigentliche Sicherheitsschicht.** Ohne Login werden nur
  veröffentlichte Fassungen zurückgegeben – über die Local API, die REST-API und GraphQL
  gleichermassen. Diese Regel unbedingt testen (siehe unten).
- **Kein `sortOrder`-Feld.** Sortiert wird nach `startsAt`; eine manuelle Reihenfolge wäre
  eine zusätzliche Bedienlast ohne Nutzen.
- **`endsAt` nach `startsAt`** wird über `validate` auf dem Feld geprüft (in D1 gibt es
  keine `CHECK`-Constraint aus Payload heraus).

### Media

Bestehende Collection ergänzen um deutsche Labels und Zugriffsregeln:

```ts
access: {
  read: () => true,
  create: ({ req }) => Boolean(req.user),
  update: ({ req }) => Boolean(req.user),
  delete: ({ req }) => Boolean(req.user),
},
upload: {
  crop: false,          // kein sharp auf Workers
  focalPoint: false,
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
},
```

`alt` bleibt Pflichtfeld – gut so, das ist die Barrierefreiheit.

> **Wichtig:** Ohne `sharp` erzeugt Payload **keine** verkleinerten Varianten. Was
> hochgeladen wird, wird ausgeliefert. Wie damit umgegangen wird, steht in
> [05-frontend.md](05-frontend.md), Abschnitt „Bilder".

### Users

```ts
access: {
  read: ({ req }) => Boolean(req.user),
  create: ({ req }) => Boolean(req.user),   // keine offene Registrierung
  update: ({ req, id }) => Boolean(req.user),
  delete: ({ req }) => Boolean(req.user),
  admin: ({ req }) => Boolean(req.user),
},
```

Zwei Konten: die Kundin und der Entwickler. Ein Rollenkonzept lohnt sich bei zwei
Personen nicht – wenn später mehr Leute dazukommen, ein `roles`-Feld ergänzen und die
Zugriffsregeln daran hängen.

Das erste Konto wird beim ersten Aufruf von `/admin` angelegt, danach ist der
Registrierungsbildschirm gesperrt.

## Global: Seitentext der Events-Seite

Damit die Kundin, wie gewünscht, die **ganze** Events-Seite anpassen kann und nicht nur
die Liste:

```ts
// src/globals/EventsPage.ts
export const EventsPage: GlobalConfig = {
  slug: 'events-page',
  label: 'Events-Seite',
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [revalidateEvents] },
  fields: [
    { name: 'title', label: 'Titel', type: 'text', required: true,
      defaultValue: 'Veranstaltungen' },
    { name: 'intro', label: 'Einleitungstext', type: 'richText' },
    { name: 'emptyText', label: 'Text, wenn keine Termine anstehen', type: 'text',
      defaultValue: 'Zurzeit sind keine Veranstaltungen geplant.' },
  ],
}
```

## Revalidierung nach dem Speichern

Der Hook, der dafür sorgt, dass Änderungen sofort sichtbar sind:

```ts
// src/hooks/revalidateEvents.ts
import { revalidatePath } from 'next/cache'

export const revalidateEvents = ({ doc, previousDoc }: any) => {
  revalidatePath('/events')
  if (doc?.slug) revalidatePath(`/events/${doc.slug}`)
  // Slug geändert? Dann auch die alte URL auffrischen.
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    revalidatePath(`/events/${previousDoc.slug}`)
  }
  return doc
}
```

Damit das im Worker funktioniert, müssen die Bindings `NEXT_INC_CACHE_R2_BUCKET` und
`WORKER_SELF_REFERENCE` aktiv sein → [06-deployment.md](06-deployment.md).

## Deutsche Oberfläche

In `payload.config.ts`:

```ts
import { de } from '@payloadcms/translations/languages/de'

export default buildConfig({
  i18n: {
    supportedLanguages: { de },
    fallbackLanguage: 'de',
  },
  // …
})
```

Zusammen mit den `labels` und `admin.description` an den Feldern ergibt das eine
Oberfläche, in der für die Kundin kein englischer Fachbegriff mehr auftaucht.

## Migrationen

D1 ist eine echte Datenbank, kein Auto-Sync – Schemaänderungen laufen über Migrationen.

```bash
pnpm payload migrate:create
```

```bash
pnpm payload migrate
```

Beim Deployment übernimmt das `pnpm run deploy:database` (steht schon in der
`package.json` des Templates) – erst migrieren, dann die Anwendung ausrollen.

**Regeln**

- Migrationen immer committen.
- Nie eine bereits ausgerollte Migration nachträglich ändern.
- Vor einer Migration mit Datenverlustpotenzial ein D1-Export ziehen
  ([09-betrieb.md](09-betrieb.md)).

## Typen generieren

```bash
pnpm generate:types
```

Erzeugt `src/payload-types.ts` (Payload) und `cloudflare-env.d.ts` (Bindings). Nach jeder
Modelländerung ausführen und committen.

## Abnahmetests für das Datenmodell

Diese Prüfungen ersetzen den früheren RLS-Test und sind genauso wenig verhandelbar:

- [ ] Ein Event im Status **Entwurf** ist unter `/api/events` **ohne** Login nicht sichtbar
- [ ] Dasselbe Event ist über GraphQL ohne Login nicht sichtbar
- [ ] `POST /api/events` ohne Login wird abgelehnt
- [ ] `/admin` ist ohne Login nicht erreichbar
- [ ] Der Registrierungsbildschirm ist nach dem ersten Konto gesperrt
- [ ] Ein Upload ohne `alt` wird abgelehnt
- [ ] Zwei Events mit identischem Slug lassen sich nicht speichern

## Verwandte Dokumente

- Wie die Redaktion damit arbeitet → [04-admin.md](04-admin.md)
- Bindings, Migrationen im Deployment → [06-deployment.md](06-deployment.md)
