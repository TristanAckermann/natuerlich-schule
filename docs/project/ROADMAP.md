# Roadmap

Zehn Phasen. Die Phasen 1–6 bauen die neue Seite unter einer temporären Adresse fertig;
erst danach wird an Domain und E-Mail gerührt. Das ist Absicht: Solange nichts umgestellt
ist, läuft die alte Seite unverändert weiter und es steht nichts unter Zeitdruck.

```
Phase 0  Abklärung
   │
   ├── Phase 1  Grundgerüst ──► 2 Design ──► 3 Payload ──► 4 Events ──► 5 Redaktion ──► 6 Inhalte
   │                                                                                       │
   │                                                                        ┌──────────────┘
   │                                                                        ▼
   └────────────────────────────────► Phase 7  E-Mail ──► Phase 8  Go-Live ──► Phase 9  Übergabe
```

---

## Phase 0 – Abklärung & Zugänge

Zuliefern lassen und dokumentieren, bevor eine Zeile Code entsteht.

- [ ] Zugang zum Jimdo-Konto, getestet
- [ ] WHOIS-Auskunft (`nic.ch`), AdminC-Adresse notiert
- [ ] Liste aller E-Mail-Postfächer, Aliase, Weiterleitungen
- [ ] Vollständige DNS-Record-Tabelle der aktuellen Zone
- [ ] Jimdo-Vertragslaufzeit und Kündigungsfrist
- [ ] Inventar der bestehenden Seiten ([08](08-content-migration.md), Schritt 1)
- [ ] Logo und Bilder in Originalauflösung
- [ ] Wer liefert Impressum und Datenschutzerklärung?
- [ ] Go-Live-Wunschtermin (Ferienzeit bevorzugt)
- [ ] Cloudflare- und GitHub-Konten angelegt

**Fertig, wenn:** [00-scope.md](00-scope.md) keine offenen Punkte mehr enthält.

---

## Phase 1 – Grundgerüst

- [x] Payload-Cloudflare-Template initialisiert ([02](02-setup.md))
- [ ] Kaputten Import in `payload.config.ts` korrigieren, Platzhalter in `wrangler.jsonc`
      ersetzen ([02](02-setup.md))
- [ ] Prettier, ESLint, `.env.example`, `.gitignore` geprüft
- [ ] `wrangler.jsonc`, erster manueller Deploy auf `*.workers.dev`
- [ ] GitHub Actions: Preview bei PR, Produktion bei Push auf `main`
- [ ] `layout.tsx`, Header, Footer, mobiles Menü, 404-Seite

**Fertig, wenn:** Ein Push auf `main` bringt automatisch eine „Hallo Welt"-Seite online.

---

## Phase 2 – Design & statische Seiten

- [ ] Design-Tokens (Farben, Schriften, Abstände) in `global.css`
- [ ] Schriften selbst hosten
- [ ] UI-Bausteine: Button, Card, Section, Prose
- [ ] Startseite und alle Inhaltsseiten mit Platzhaltertext gebaut
- [ ] Responsiv geprüft: Handy, Tablet, Desktop
- [ ] Barrierefreiheits-Grundlagen ([05](05-frontend.md))

**Fertig, wenn:** Die Kundin hat das Design an der Preview-URL gesehen und freigegeben.

---

## Phase 3 – Payload-Backend

- [ ] D1-Datenbank und R2-Buckets angelegt, `wrangler.jsonc` mit echten IDs befüllt ([06](06-deployment.md))
- [ ] Collection `Events`, Global `EventsPage`, Zugriffsregeln ([03](03-payload.md))
- [ ] **Zugriffsregeln als anonymer Besucher getestet**: Entwürfe unsichtbar, Schreiben verboten
      – die Abnahmetests am Ende von [03-payload.md](03-payload.md)
- [ ] Media-Collection mit `alt`-Pflichtfeld, Uploads auf R2
- [ ] Offene Registrierung gesperrt, zwei Konten angelegt
- [ ] Deutsche Oberfläche (`i18n`) eingerichtet
- [ ] Migration erzeugt, committet und gegen die entfernte D1-Instanz angewandt
- [ ] TypeScript-Typen generiert und committet (`pnpm generate:types`)

**Fertig, wenn:** Die Abnahmetests aus [03-payload.md](03-payload.md) bestanden sind.
Nicht vorher weitergehen.

---

## Phase 4 – Events-Seite (öffentlich)

- [ ] `/events`, Intro-Text aus dem Global `EventsPage` ([05](05-frontend.md))
- [ ] Kommende und vergangene Termine getrennt und korrekt sortiert
- [ ] `/events/[slug]` mit Rich-Text-Inhalt und Bild
- [ ] Datumsformatierung `de-CH`, Zeitzone `Europe/Zurich`
- [ ] Leerer Zustand und Fehlerzustand gebaut
- [ ] Revalidierung nach dem Speichern getestet (`revalidatePath`-Hook, [03](03-payload.md))
- [ ] Cache-Header gesetzt und mit `curl -I` geprüft
- [ ] JSON-LD `Event`, Meta-Tags, Open Graph

**Fertig, wenn:** Ein im Payload-Admin von Hand angelegtes Event auf der Preview erscheint.

---

## Phase 5 – Redaktionsoberfläche (Payload Admin konfigurieren)

Die Oberfläche wird nicht gebaut, sondern zugeschnitten – siehe [04-admin.md](04-admin.md).

- [ ] Deutsche Beschriftungen an allen Collections, Feldern und Globals
- [ ] Navigation gruppiert und aufgeräumt (Veranstaltungen, Events-Seite, Medien, Verwaltung)
- [ ] Live Preview eingerichtet und mit Breakpoints (Handy/Tablet/Desktop) getestet
- [ ] Hilfetexte (`admin.description`) an allen nicht selbsterklärenden Feldern
- [ ] Rich-Text-Editor auf die nötigen Funktionen beschränkt
- [ ] Branding (Titel, Favicon, ggf. Logo im Login)
- [ ] Zugriffsregeln erneut geprüft (siehe Abnahmetests in [03-payload.md](03-payload.md))
- [ ] Tablet-tauglich und tastaturbedienbar

**Fertig, wenn:** Die Kundin legt ohne Hilfe ein Event an und veröffentlicht es.

---

## Phase 6 – Inhalte & SEO

- [ ] Alle Texte von der alten Seite übernommen und überarbeitet
- [ ] Bilder eingebaut, jedes mit Alternativtext
- [ ] Impressum und Datenschutzerklärung freigegeben
- [ ] Redirect-Tabelle alt → neu vollständig
- [ ] `robots.txt`, Sitemap, kanonische URLs
- [ ] Lighthouse Mobile ≥ 95, axe ohne Befunde
- [ ] Korrekturlesen durch eine zweite Person
- [ ] **Schriftliche Abnahme der Kundin**

**Fertig, wenn:** Die Seite wäre live-fähig – es fehlt nur noch die Domain.

---

## Phase 7 – E-Mail-Migration

Der heikelste Teil. Details in [07](07-domain-und-email.md), Phase D.

- [ ] Registrar mit Mailhosting gewählt und Konto angelegt
- [ ] Cloudflare-Zone angelegt, **alle** DNS-Records geprüft, Nameserver noch bei Jimdo
- [ ] TTLs gesenkt
- [ ] Postfächer beim neuen Anbieter angelegt (gleiche Adressen)
- [ ] Bestehende Mails per IMAP kopiert und kontrolliert
- [ ] MX, SPF, DKIM, DMARC in Cloudflare vorbereitet
- [ ] Liste der Geräte, die neu eingerichtet werden müssen

**Fertig, wenn:** Die neuen Postfächer sind gefüllt und über den neuen Anbieter direkt
erreichbar – auch ohne dass die MX-Records schon umgestellt wären.

---

## Phase 8 – Domain-Transfer & Go-Live

- [ ] Auth-Code bei Jimdo angefordert und erhalten
- [ ] Transfer beim neuen Registrar ausgelöst und abgeschlossen
- [ ] Nameserver auf Cloudflare, Zone „Active"
- [ ] Custom Domain am Worker, SSL Full (strict), Always Use HTTPS
- [ ] `www` ↔ Apex-Weiterleitung, alte URLs leiten korrekt um
- [ ] Mailtest rein und raus, Spam-Prüfung ≥ 9/10
- [ ] Search Console eingerichtet, Sitemap eingereicht
- [ ] Uptime-Monitoring auf `/` und `/events`
- [ ] Delta-Sync der Mails nachgezogen
- [ ] Geräte der Kundin neu eingerichtet

**Fertig, wenn:** Die Domain zeigt die neue Seite und die E-Mail läuft nachweislich.

---

## Phase 9 – Übergabe & Abschluss

- [ ] Schulung durchgeführt, Kundin legt selbst zwei echte Events an
- [ ] [Anleitung](10-anleitung-kundin.md) übergeben
- [ ] Alle Zugänge im Passwortmanager, Konten laufen auf die Schule
- [ ] Wartungsumfang und Support schriftlich vereinbart
- [ ] Nach zwei Wochen: keine Mailprobleme, Zugriffszahlen stabil
- [ ] **Jimdo kündigen**, alte Postfächer löschen
- [ ] Nach vier Wochen kurz nachfassen

---

## Mögliche Ausbaustufen (nicht Teil dieses Projekts)

Ausdrücklich ausgeklammert, aber vorgemerkt – die Architektur steht keiner davon im Weg:

| Idee | Aufwand |
|---|---|
| „Zum Kalender hinzufügen" (`.ics`) auf der Event-Detailseite | klein |
| News-/Aktuelles-Bereich analog zu den Events | mittel |
| Kontakt- oder Anmeldeformular (bräuchte Datenschutzkonzept und Spam-Schutz) | mittel |
| Weitere Seitentexte über den Admin editierbar | mittel |
| Zweite Sprache (Französisch/Englisch) | mittel bis gross |
| Bildergalerie mit Zugriffsschutz für Eltern | gross |
