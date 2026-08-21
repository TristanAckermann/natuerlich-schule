# 09 – Betrieb & Übergabe

## Laufende Kosten

Grössenordnung pro Jahr. **Preise beim Aufsetzen prüfen** – sie ändern sich.

| Posten | Tarif | Kosten/Jahr |
|---|---|---|
| Cloudflare Workers | Free (bis 100 000 Anfragen/Tag) | CHF 0 |
| Cloudflare DNS + CDN + Zertifikat | Free | CHF 0 |
| Cloudflare Web Analytics | Free | CHF 0 |
| Supabase | Free | CHF 0 |
| `.ch`-Domain | Schweizer Registrar | ca. CHF 10–20 |
| Mailhosting | je nach Anbieter und Postfachzahl | ca. CHF 20–80 |
| **Total realistisch** | | **ca. CHF 30–100** |

Zum Vergleich: Ein Jimdo-Paket mit Domain und Mail liegt deutlich darüber. Die Umstellung
spart der Schule also auch laufend Geld.

### Wann es teurer wird

| Auslöser | Folge |
|---|---|
| > 100 000 Anfragen/Tag | Workers Paid, ca. USD 5/Monat. Für eine Schulwebseite unrealistisch. |
| Supabase-Limits (Datenbankgrösse, Storage, Bandbreite) | Pro-Tarif ca. USD 25/Monat. Bei ein paar Dutzend Events pro Jahr sehr weit entfernt. |
| Wunsch nach längeren Backups / Point-in-Time-Recovery | Supabase Pro |

**Hinweis zum Supabase-Free-Tarif:** Projekte ohne jede Aktivität werden nach einer
Woche pausiert. Eine Live-Webseite mit SSR erzeugt genug Anfragen, dass das nicht
passiert. Relevant ist es nur für ein Dev-Projekt, das lange brachliegt – das lässt sich
im Dashboard mit einem Klick reaktivieren.

## Backups

| Was | Wie | Wie oft |
|---|---|---|
| Quellcode und Inhalte der statischen Seiten | Git / GitHub | bei jedem Commit |
| Datenbank (Events, Seitentexte) | Supabase automatisch (Free: 7 Tage) | täglich |
| Datenbank – eigener Export | `npx supabase db dump -f backups/JJJJ-MM-TT.sql --linked` | monatlich, ausserhalb von Supabase ablegen |
| Event-Bilder | Bucket-Download über die Supabase-CLI oder das Dashboard | halbjährlich |
| Zugangsdaten | Passwortmanager | bei jeder Änderung |

Ein Restore einmal ausprobieren, bevor man ihn braucht: Dump in ein leeres Testprojekt
einspielen und schauen, ob die Events da sind.

## Monitoring

| Prüfung | Werkzeug |
|---|---|
| Ist die Seite erreichbar? | Uptime-Dienst (UptimeRobot Free o.ä.) auf `/` **und** `/events`, alle 5 Min |
| Laufzeitfehler im Worker | Cloudflare Observability / `wrangler tail` |
| Zugriffszahlen | Cloudflare Web Analytics |
| Indexierung, kaputte Links | Google Search Console |
| Zertifikatsablauf | Cloudflare erneuert automatisch; Uptime-Check meldet Ausfälle trotzdem |

`/events` gehört ausdrücklich in die Überwachung: Nur diese Route merkt, wenn Supabase
nicht erreichbar ist. Die statischen Seiten funktionieren dann weiter und würden ein
Problem verdecken.

## Wartung

| Intervall | Tätigkeit |
|---|---|
| Monatlich | `npm outdated` prüfen, Sicherheitsupdates einspielen, Preview testen, deployen |
| Quartalsweise | Backup-Export, kurzer Blick in Search Console und Analytics, Lighthouse |
| Jährlich | Domain- und Hostingrechnungen prüfen, Inhalte auf Aktualität durchgehen, Zugänge im Passwortmanager verifizieren, `compatibility_date` im Worker prüfen |

Astro und der Cloudflare-Adapter bekommen regelmässig grössere Versionssprünge. Diese
nicht blind einspielen: Migrationsleitfaden lesen, auf einem Branch testen, Preview
prüfen, dann mergen.

## Zugangs-Inventar

Vollständig im Passwortmanager der Kundin **und** beim Entwickler. Diese Liste gehört ins
Übergabedokument:

- [ ] Registrar-Konto (Domain)
- [ ] Mailhosting-Konto und alle Postfach-Passwörter
- [ ] Cloudflare-Konto
- [ ] Supabase-Konto + Datenbank-Passwort
- [ ] GitHub-Repository
- [ ] Admin-Login der Webseite (Konto der Kundin)
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
| Nur `/events` kaputt, Rest läuft | Supabase | Supabase-Status, Worker-Logs |
| Änderung im Admin nicht sichtbar | Cache | Bis zu 5 Min warten oder Cache purgen |
| Kundin kommt nicht rein | Passwort / Session | Passwort-Reset über Supabase auslösen |
| Mail kommt nicht an | MX-Records | `dig MX domain.ch`, MXToolbox |
| Mail landet im Spam | SPF/DKIM | mail-tester.com |
| Deploy schlägt fehl | Build oder Token | GitHub-Actions-Log |

## Verwandte Dokumente

- Kosten und Limits des Deployments → [06-deployment.md](06-deployment.md)
- Datenbank-Backups im Detail → [03-supabase.md](03-supabase.md)
