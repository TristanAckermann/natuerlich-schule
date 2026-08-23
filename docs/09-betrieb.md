# 09 – Betrieb & Übergabe

## Laufende Kosten

Grössenordnung pro Jahr. **Preise beim Aufsetzen prüfen** – sie ändern sich.

| Posten | Tarif | Kosten/Jahr |
|---|---|---|
| Cloudflare Workers | **Paid**, ca. USD 5/Monat – technisch nötig, siehe [01-architektur.md](01-architektur.md) | ca. CHF 55 |
| Cloudflare D1 (Datenbank) | Im Workers-Paid-Kontingent enthalten, bei diesem Datenvolumen weit von den Limits entfernt | CHF 0 |
| Cloudflare R2 (Bilder) | Free-Kontingent (10 GB) reicht für eine Schulwebseite bei Weitem | CHF 0 |
| Cloudflare DNS + CDN + Zertifikat | Free | CHF 0 |
| Cloudflare Web Analytics | Free | CHF 0 |
| `.ch`-Domain | Schweizer Registrar | ca. CHF 10–20 |
| Mailhosting | je nach Anbieter und Postfachzahl | ca. CHF 20–80 |
| **Total realistisch** | | **ca. CHF 85–155** |

Zum Vergleich: Ein Jimdo-Paket mit Domain und Mail liegt in ähnlicher oder höherer
Grössenordnung – die Umstellung ist bei den laufenden Kosten also mindestens neutral, bei
deutlich mehr Leistung (eigene Datenhaltung, Versionierung, Live Preview).

### Wann es teurer wird

| Auslöser | Folge |
|---|---|
| D1-Grösse > 5 GB oder > 25 Mio. Zeilen gelesen/Tag | Workers-Paid-Kontingent überschritten, nutzungsabhängige Mehrkosten. Bei ein paar Dutzend Events pro Jahr sehr weit entfernt. |
| R2-Speicher > 10 GB oder viel Traffic | Nutzungsabhängige Mehrkosten (R2 hat aber keine Egress-Gebühren). |
| > 10 Mio. Worker-Anfragen/Monat | Nutzungsabhängige Mehrkosten im Workers-Paid-Tarif. Für eine Schulwebseite unrealistisch. |

**Workers Paid ist ab Tag eins nötig**, nicht erst ab einer Wachstumsschwelle – siehe
[01-architektur.md](01-architektur.md), „Bekannte Einschränkungen dieser Plattform".

## Backups

| Was | Wie | Wie oft |
|---|---|---|
| Quellcode und Inhalte der statischen Seiten | Git / GitHub | bei jedem Commit |
| Datenbank (Events, Seitentexte) – Export | `pnpm wrangler d1 export natuerlich-schule --remote --output backups/JJJJ-MM-TT.sql` | monatlich, ausserhalb von Cloudflare ablegen |
| Event-Bilder | `pnpm wrangler r2 object get` je Datei, oder ein S3-kompatibles Werkzeug (`rclone`) gegen den R2-Bucket | halbjährlich |
| Zugangsdaten | Passwortmanager | bei jeder Änderung |

D1 legt automatisch **Time Travel**-Wiederherstellungspunkte an (30 Tage Historie ohne
eigenes Zutun) – nützlich für einen schnellen Rollback, ersetzt aber keinen externen
Export. Ein Restore einmal ausprobieren, bevor man ihn braucht: Dump in eine lokale
SQLite-Datei einspielen und schauen, ob die Events da sind.

## Monitoring

| Prüfung | Werkzeug |
|---|---|
| Ist die Seite erreichbar? | Uptime-Dienst (UptimeRobot Free o.ä.) auf `/` **und** `/events`, alle 5 Min |
| Laufzeitfehler im Worker | Cloudflare Observability / `wrangler tail` |
| Zugriffszahlen | Cloudflare Web Analytics |
| Indexierung, kaputte Links | Google Search Console |
| Zertifikatsablauf | Cloudflare erneuert automatisch; Uptime-Check meldet Ausfälle trotzdem |

`/events` gehört ausdrücklich in die Überwachung: Nur diese Route merkt, wenn D1 nicht
erreichbar ist. Die statischen Seiten funktionieren dann weiter und würden ein Problem
verdecken.

## Wartung

| Intervall | Tätigkeit |
|---|---|
| Monatlich | `pnpm outdated` prüfen, Sicherheitsupdates einspielen, `pnpm preview` testen, deployen |
| Quartalsweise | Backup-Export, kurzer Blick in Search Console und Analytics, Lighthouse |
| Jährlich | Domain- und Hostingrechnungen prüfen, Inhalte auf Aktualität durchgehen, Zugänge im Passwortmanager verifizieren, `compatibility_date` im Worker prüfen |

Next.js, Payload und `@opennextjs/cloudflare` bekommen regelmässig grössere
Versionssprünge. Diese nicht blind einspielen: Migrationsleitfaden lesen, auf einem
Branch testen, `pnpm preview` in der echten Worker-Laufzeit prüfen, dann mergen.

## Zugangs-Inventar

Vollständig im Passwortmanager der Kundin **und** beim Entwickler. Diese Liste gehört ins
Übergabedokument:

- [ ] Registrar-Konto (Domain)
- [ ] Mailhosting-Konto und alle Postfach-Passwörter
- [ ] Cloudflare-Konto (Workers, D1, R2)
- [ ] GitHub-Repository
- [ ] Admin-Login der Webseite (Konto der Kundin, `/admin`)
- [ ] Google Search Console
- [ ] Google Business Profile
- [ ] Jimdo-Konto (bis zur Kündigung)

**Wichtig:** Die Konten sollten auf die **Schule** laufen, nicht auf den Entwickler. Falls
das nicht möglich ist, mindestens die Kundin als zweiten Administrator eintragen. Sonst
sitzt die Schule fest, wenn die Zusammenarbeit einmal endet – und das ist auch für den
Entwickler kein angenehmer Zustand.

## Übergabe

- [ ] Schulung mit der Kundin, ca. 45 Minuten, am besten an ihrem eigenen Gerät
- [ ] Sie legt während der Schulung selbst zwei echte Events an
- [ ] [10-anleitung-kundin.md](10-anleitung-kundin.md) ausgedruckt oder als PDF übergeben
- [ ] Zugangsdaten übergeben und im Passwortmanager abgelegt
- [ ] Klären: Was macht sie selbst, was läuft über den Entwickler
- [ ] Erreichbarkeit und Reaktionszeit für Support vereinbaren
- [ ] Wartungsumfang und -kosten schriftlich festhalten
- [ ] Nach vier Wochen kurz nachfragen, ob alles läuft

## Wenn etwas nicht funktioniert

| Symptom | Erste Vermutung | Nachschauen |
|---|---|---|
| Seite komplett weg | DNS oder Zertifikat | Cloudflare-Dashboard, Zone „Active"? |
| Nur `/events` kaputt, Rest läuft | D1 nicht erreichbar oder Migration fehlgeschlagen | Cloudflare-Dashboard (D1), Worker-Logs (`wrangler tail`) |
| Änderung im Admin nicht sichtbar | Cache | Bis zu 5 Min warten oder Cache purgen |
| Kundin kommt nicht rein | Passwort / Session | Passwort-Reset über den Payload-Admin (`/admin` → „Passwort vergessen") auslösen |
| Mail kommt nicht an | MX-Records | `dig MX domain.ch`, MXToolbox |
| Mail landet im Spam | SPF/DKIM | mail-tester.com |
| Deploy schlägt fehl | Build, Bundle-Grösse oder Token | GitHub-Actions-Log |

## Verwandte Dokumente

- Kosten und Limits des Deployments → [06-deployment.md](06-deployment.md)
- Datenmodell und Migrationen im Detail → [03-payload.md](03-payload.md)
