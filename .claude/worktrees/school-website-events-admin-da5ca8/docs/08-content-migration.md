# 08 – Content-Migration

Die Inhalte der bestehenden Jimdo-Seite werden übernommen, das Design wird neu gebaut.
Übernehmen heisst dabei nicht kopieren: Texte werden beim Übertragen gestrafft und für
die neue Struktur aufbereitet.

## Schritt 1 – Inventar erstellen

Jede bestehende Seite erfassen, bevor irgendetwas gebaut wird. Tabelle in
`docs/inventar.md` oder in einem Spreadsheet:

| Alte URL | Titel | Wortzahl | Bilder | Übernehmen? | Neue URL |
|---|---|---|---|---|---|
| `/` | Startseite | 320 | 4 | ja, kürzen | `/` |
| `/ueber-uns` | Über uns | 640 | 2 | ja | `/ueber-uns` |
| `/aktuelles` | Aktuelles | – | – | ersetzt durch Events | `/events` |
| … | | | | | |

URL-Liste beschaffen über:

- die Navigation der bestehenden Seite von Hand durchklicken,
- die Jimdo-Sitemap (`/sitemap.xml`),
- Google: `site:domain.ch` – zeigt, was tatsächlich indexiert ist,
- Google Search Console, falls Zugang vorhanden: die tatsächlich aufgerufenen URLs. Genau
  die dürfen nicht ins Leere laufen.

## Schritt 2 – Texte und Bilder holen

**Texte** per Copy-Paste direkt in die Next.js-Seiten unter `src/app/(frontend)/`. Dabei:

- Überschriftenhierarchie sauber setzen (ein `h1`, darunter `h2`, `h3`).
- Bleiwüsten in Absätze und Listen gliedern.
- Veraltetes streichen (alte Termine, nicht mehr aktuelle Namen) – Liste der Streichungen
  der Kundin zur Freigabe vorlegen.
- Kontaktangaben und Öffnungszeiten gegen den aktuellen Stand prüfen.

**Bilder**: Wenn möglich die **Originale** von der Kundin holen, nicht die von Jimdo
komprimierten Versionen. Wo das nicht geht, die grösstmögliche Variante von der Seite
laden. Alles nach `public/` bzw. `src/assets/` und über Next.js' `<Image />` einbinden.

Für jedes Bild einen **Alternativtext** schreiben. Das macht am besten die Person, die den
Inhalt kennt – als Zulieferung bei der Kundin einfordern.

**Rechtliches**: Bei Fotos mit erkennbaren Kindern muss die Schule die Einwilligungen
haben. Beim Übernehmen kurz ansprechen; die Verantwortung liegt bei der Schule, aber der
Hinweis gehört ins Protokoll.

## Schritt 3 – Bestehende Events übernehmen

Falls die Jimdo-Seite eine Termin- oder Aktuelles-Seite hat: die kommenden Termine als
Events im Payload-Admin anlegen. Beim Erstbefüllen ist das die perfekte Gelegenheit, die
Kundin selbst zwei oder drei Events erfassen zu lassen – das ist gleichzeitig die
Schulung (siehe [10-anleitung-kundin.md](10-anleitung-kundin.md)).

Vergangene Termine nicht migrieren, ausser die Kundin will ausdrücklich ein Archiv.

## Schritt 4 – Redirects

Jede alte URL, die sich ändert, braucht eine **301-Weiterleitung**. Sonst verliert die
Seite ihre Google-Platzierungen, und Links in E-Mails, auf Elternbriefen und in
Facebook-Posts laufen ins Leere.

Umsetzung als **Cloudflare Bulk Redirect** oder – bei wenigen Regeln – über die
`redirects()`-Funktion in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/aktuelles', destination: '/events', permanent: true },
      { source: '/ueber-uns/team', destination: '/team', permanent: true },
      { source: '/kontaktformular', destination: '/kontakt', permanent: true },
    ]
  },
}
```

Regeln:

- Immer **301** (dauerhaft), nicht 302.
- **Keine Ketten**: alte URL → neue URL, nicht über zwei Stationen.
- Auf die **inhaltlich passendste** Seite leiten, nicht pauschal auf die Startseite. Eine
  Sammelweiterleitung auf `/` wird von Google wie ein 404 behandelt.
- Für die entfallenden Formularseiten: auf `/kontakt` leiten.
- Jimdo-eigene URLs mit Parametern oder `/j/`-Pfaden im Inventar mit erfassen.

**Sonderfall Formulare:** Die alte Seite hat womöglich ein Kontaktformular unter einer
eigenen URL. Das gibt es künftig nicht mehr (siehe [00-scope.md](00-scope.md)). Die
Weiterleitung geht auf `/kontakt`, wo E-Mail-Adresse und Telefonnummer gut sichtbar
stehen.

## Schritt 5 – SEO-Umzug

- [ ] `sitemap-index.xml` erreichbar, enthält alle öffentlichen Seiten
- [ ] `robots.txt` verweist auf die Sitemap, sperrt `/admin/`
- [ ] Google Search Console: neue Property anlegen (die Domain-Verifizierung braucht einen
      TXT-Record – der muss in Cloudflare gesetzt sein!), Sitemap einreichen
- [ ] Alte Search-Console-Property behalten und die Zugriffe beobachten
- [ ] Titel und Meta-Descriptions für jede Seite geschrieben – nicht generiert
- [ ] Google Business Profile: Link prüfen und aktualisieren
- [ ] Externe Verweise (Gemeinde, Schulverzeichnisse, Elternvereine) anschreiben, falls sie
      auf tiefe URLs zeigen, die sich ändern

Ein vorübergehender Rückgang der Zugriffe in den ersten zwei bis vier Wochen ist normal.
Wenn er nach sechs Wochen nicht wieder aufgeholt ist, Redirects und indexierte URLs
nachprüfen.

## Schritt 6 – Prüfen

- [ ] Jede Zeile des Inventars hat eine neue URL oder ein bewusstes „entfällt"
- [ ] Alle Redirects einzeln getestet (`curl -I` und Klick im Browser)
- [ ] Kein Bild fehlt, keines ist unscharf oder verzerrt
- [ ] Keine Blindtexte, keine „TODO", keine Platzhalter mehr im Code
- [ ] Rechtschreibung geprüft – am besten von jemandem, der die Texte nicht geschrieben hat
- [ ] Alle Telefonnummern und E-Mail-Adressen sind klickbar und stimmen
- [ ] Impressum und Datenschutzerklärung von der Kundin freigegeben
- [ ] Kundin hat die komplette Seite abgenommen (schriftlich, per Mail genügt)

## Verwandte Dokumente

- Seitenstruktur → [05-frontend.md](05-frontend.md)
- Der Domain-Wechsel selbst → [07-domain-und-email.md](07-domain-und-email.md)
