# 04 – Redaktionsoberfläche (Payload Admin)

Die Oberfläche wird **nicht gebaut, sondern konfiguriert**. Payload liefert unter
`/admin` eine vollständige Redaktionsumgebung; die Arbeit besteht darin, sie auf die
Kundin zuzuschneiden – deutsche Beschriftungen, nur die nötigen Felder, sinnvolle
Voreinstellungen.

## Was ohne eigenes Zutun schon da ist

| Funktion | Bemerkung |
|---|---|
| Login, Passwort-Reset, Session | Payload-Auth, E-Mail-basiert |
| Liste mit Suche, Filter, Sortierung, Spaltenwahl | konfigurierbar über `defaultColumns` |
| Formulare inklusive Validierung | ergibt sich aus der Felddefinition |
| Rich-Text-Editor (Lexical) | Fett, Kursiv, Listen, Links, Überschriften |
| Medienbibliothek mit Drag-and-drop | Collection `media` |
| Entwurf/Veröffentlicht, Versionshistorie, Autosave | über `versions.drafts` |
| Live Preview | zeigt die echte Seite beim Tippen |
| Deutsche Oberfläche | über `i18n` |
| Mobile- und Tablet-Bedienung | responsive |

Damit entfallen aus dem ursprünglichen Plan: Login-Flow, Middleware-Guard, Event-Formular,
Bild-Upload-Komponente, Validierung, Vorschaufunktion, Lösch-Dialog.

## Was konfiguriert werden muss

### 1. Deutsche Oberfläche

```ts
import { de } from '@payloadcms/translations/languages/de'

i18n: { supportedLanguages: { de }, fallbackLanguage: 'de' },
```

Dazu an jeder Collection und jedem Feld `labels` bzw. `label` setzen. Ziel: Die Kundin
sieht nirgends „Slug", „Draft" oder „Upload", sondern „URL-Kürzel", „Entwurf", „Bild".

### 2. Navigation aufräumen

Standardmässig erscheinen alle Collections in der Seitenleiste. Sinnvoll gruppieren und
Unnötiges ausblenden:

```ts
// Users interessiert die Kundin nicht im Alltag
admin: { group: 'Verwaltung' },
```

Reihenfolge: **Veranstaltungen**, **Events-Seite**, **Medien**, darunter **Verwaltung**.

### 3. Live Preview

```ts
admin: {
  livePreview: {
    url: ({ data }) => `${process.env.NEXT_PUBLIC_SITE_URL}/events/${data?.slug}?draft=true`,
    breakpoints: [
      { name: 'mobile', label: 'Handy', width: 390, height: 844 },
      { name: 'tablet', label: 'Tablet', width: 768, height: 1024 },
      { name: 'desktop', label: 'Desktop', width: 1440, height: 900 },
    ],
  },
},
```

Die Frontend-Route muss den Entwurfsmodus unterstützen (`draftMode()` in Next.js, Payload
liefert dazu einen Preview-Endpunkt). Für die Kundin ist das die wichtigste Funktion
überhaupt: Sie sieht sofort, wie ihr Text auf dem Handy aussieht.

### 4. Hilfetexte an den Feldern

`admin.description` an jedem nicht selbsterklärenden Feld. Das ist eingebaute
Dokumentation und erspart später Rückfragen:

```ts
{
  name: 'summary',
  label: 'Kurzbeschreibung',
  type: 'textarea',
  maxLength: 200,
  admin: {
    description: 'Ein bis zwei Sätze. Erscheint in der Übersicht und in der Google-Suche.',
  },
}
```

### 5. Rich-Text bewusst beschränken

Der Lexical-Editor kann sehr viel. Für eine Event-Beschreibung reichen Absatz,
Fett, Kursiv, Liste, Link und vielleicht `h3`. Alles Weitere wird abgeschaltet – weniger
Möglichkeiten heisst hier weniger Gelegenheiten, die Seite versehentlich zu verunstalten.

### 6. Branding

`admin.meta` mit Titel und Favicon, optional das Schullogo im Login. Kleiner Aufwand,
grosse Wirkung bei der Übergabe.

## Zugriffskontrolle

Die Regeln stehen bei den Collections in [03-payload.md](03-payload.md). Zusammengefasst:

- Ohne Login: nur **veröffentlichte** Events und Mediendateien lesbar.
- Mit Login: alles lesen und schreiben.
- `/admin` ohne Login nicht erreichbar.
- Keine offene Registrierung – Konten legt der Entwickler an.

Diese Regeln gelten für Local API, REST **und** GraphQL gleichermassen. Deshalb prüfen
und nicht annehmen: Die Abnahmetests am Ende von [03-payload.md](03-payload.md) sind der
Ersatz für den früheren RLS-Test.

## Bilder in der Redaktion

Ohne `sharp` verkleinert Payload nichts. Was hochgeladen wird, liefert die Seite aus.
Konsequenzen für die Praxis:

- `mimeTypes` auf JPEG/PNG/WebP begrenzen.
- Eine Grössenbegrenzung setzen und im Hilfetext erklären.
- In der Anleitung eine klare Ansage machen: Bilder vor dem Hochladen auf etwa
  1600 px Breite bringen. Am Mac geht das über „Vorschau → Werkzeuge → Grösse
  korrigieren", am Handy beim Teilen über „Mittlere Grösse".
- Technische Absicherung über Cloudflare Images Transformations → [05-frontend.md](05-frontend.md).

Das ist der einzige Punkt, an dem die Payload-Lösung mehr von der Kundin verlangt als
eine selbst gebaute Oberfläche mit Verkleinerung im Browser. Ein eigenes
Upload-Feld mit clientseitiger Verkleinerung wäre nachrüstbar, ist aber erst dann
sinnvoll, wenn sich zeigt, dass es in der Praxis wirklich stört.

## Verwandte Dokumente

- Collections und Zugriffsregeln → [03-payload.md](03-payload.md)
- Anleitung für die Kundin → [10-anleitung-kundin.md](10-anleitung-kundin.md)
