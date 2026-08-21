# 00 – Scope

## Ausgangslage

Die Schule betreibt heute eine Webseite bei **Jimdo**. Über dieselbe Domain (`.ch`) läuft
auch die **E-Mail** der Schule. Die Seite soll durch eine selbst gebaute, schnelle und
wartbare Webseite ersetzt werden.

Der einzige Teil, der sich regelmässig ändert, sind **Veranstaltungen (Events)**. Dafür
braucht die Kundin eine einfache Oberfläche, in der sie ohne technisches Wissen arbeiten kann.

## Ziele

1. **Öffentliche Webseite** mit den Informationsseiten der Schule – schnell, mobil,
   suchmaschinenfreundlich, barrierearm.
2. **Events-Seite**, die die Kundin vollständig selbst pflegt: Veranstaltungen anlegen,
   bearbeiten, mit Bild versehen, veröffentlichen oder verstecken – inklusive des
   Einleitungstextes der Seite.
3. **Admin-Konsole** mit Login, erreichbar unter `/admin`.
4. **Hosting auf Cloudflare**, Deployment automatisch bei jedem Push.
5. **Domain und E-Mail weg von Jimdo**, ohne dass eine einzige E-Mail verloren geht.
6. **Saubere Übergabe**: Die Kundin kann die Seite bedienen, alle Zugänge sind dokumentiert.

## Nicht-Ziele

Bewusst **nicht** Teil dieses Projekts:

- **Keine Formulare.** Kein Kontaktformular, kein Anmeldeformular, keine
  Newsletter-Anmeldung. Kontaktaufnahme läuft über eine angezeigte E-Mail-Adresse und
  Telefonnummer. → Es werden dadurch **keine Besucherdaten** verarbeitet oder gespeichert.
- **Kein vollwertiges CMS.** Nur Events sind über die Oberfläche editierbar. Änderungen an
  „Über uns", „Konzept", Impressum usw. laufen über den Entwickler per Git.
- **Kein Login-Bereich für Eltern**, keine Notenverwaltung, kein Intranet.
- **Kein Shop, keine Zahlungen.**
- **Keine Mehrsprachigkeit** in der ersten Version (Deutsch). Struktur wird so gebaut,
  dass eine zweite Sprache später ohne Umbau ergänzt werden kann.

Wenn eines dieser Themen später gewünscht wird, ist es eine eigene Ausbaustufe – siehe
[ROADMAP.md](ROADMAP.md), Abschnitt „Mögliche Ausbaustufen".

## Rollen

| Rolle | Wer | Aufgaben |
|---|---|---|
| Entwickler / Betreiber | Tristan | Bau, Deployment, Migration, Wartung, Support |
| Redaktion Events | Kundin (Schulleitung) | Events pflegen, Intro-Text der Events-Seite |
| Inhaltliche Freigabe | Kundin | Texte, Bilder, Impressum, Datenschutzerklärung |
| Domain-Inhaber (Holder) | Schule | Muss bei Registrar-Wechsel formal zustimmen |

## Annahmen

Diese Punkte wurden angenommen und müssen in Phase 0 bestätigt werden:

- Die Domain ist eine **`.ch`-Domain** und aktuell über Jimdo registriert.
- Über die Domain laufen **aktive E-Mail-Postfächer bei Jimdo**.
- Die Kundin hat Zugang zum Jimdo-Konto (oder kann ihn beschaffen).
- Die AdminC-E-Mail-Adresse der Domain ist erreichbar (dorthin geht der Auth-Code).
- Bilder liegen in brauchbarer Auflösung vor oder können neu beschafft werden.
- Es gibt kein bestehendes Corporate Design / Styleguide – Design wird neu entworfen.

## Offene Punkte (Phase 0 klären)

- [ ] Genauer Domainname und WHOIS-Auskunft (`nic.ch`)
- [ ] Liste aller aktiven E-Mail-Postfächer und Weiterleitungen
- [ ] Jimdo-Vertragslaufzeit und Kündigungsfrist
- [ ] Vollständige Liste der bestehenden Seiten/URLs
- [ ] Wer liefert Impressum und Datenschutzerklärung (rechtlich verbindlich)?
- [ ] Gibt es Logo/Schriften/Farben, die übernommen werden müssen?
- [ ] Gewünschter Go-Live-Termin (Schulferien sind ideal – wenig Mailverkehr)

## Rechtliches / Datenschutz

Anwendbar sind das Schweizer **revDSG** und – bei Besuchern aus der EU – die **DSGVO**.

Umsetzung:

- **Impressum** und **Datenschutzerklärung** als eigene Seiten, von der Kundin freigegeben.
- **Keine Formulare** → keine Erhebung personenbezogener Daten von Besuchern.
- **Schriften selbst hosten** – kein Aufruf von Google Fonts o.ä. von fremden Servern.
- **Analytics cookielos** (Cloudflare Web Analytics) → **kein Cookie-Banner nötig**.
- Nur die Admin-Konsole setzt Cookies (Session), und zwar nur für eingeloggte Redaktion –
  technisch notwendig, nicht einwilligungspflichtig.
- **Supabase-Region EU** (Frankfurt), damit die Daten in Europa bleiben.
- Fotos von Kindern: Einwilligungen sind Sache der Schule; im Übergabedokument erwähnt.

## Verwandte Dokumente

- Technischer Überblick → [01-architektur.md](01-architektur.md)
- Was wann passiert → [ROADMAP.md](ROADMAP.md)
