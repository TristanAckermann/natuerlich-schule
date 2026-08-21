# 07 – Domain & E-Mail: weg von Jimdo

> **Das riskanteste Dokument des Projekts.** Eine kaputte Webseite merkt man und repariert
> sie. Verlorene E-Mails merkt man oft erst Wochen später, und dann sind sie weg.
> Dieses Runbook Schritt für Schritt abarbeiten, Reihenfolge nicht ändern.

## Zwei Erkenntnisse, die den ganzen Ablauf bestimmen

### 1. Cloudflare Registrar kann keine `.ch`-Domains

Der ursprüngliche Plan „Domain von Jimdo zu Cloudflare Registrar transferieren" ist
**nicht umsetzbar**. Cloudflare Registrar unterstützt bei den Länderdomains nur
`.ca`, `.co`, `.mx`, `.nz`, `.uk` (samt Unterdomains wie `.co.uk`) – **kein `.ch`**.

Das ist kein Problem, nur eine andere Aufteilung:

```
Registrar (Verwaltung + Rechnung)   →  Schweizer Anbieter (Infomaniak / Hostpoint / …)
Nameserver / DNS / CDN / Hosting    →  Cloudflare
E-Mail-Postfächer                   →  Schweizer Anbieter
```

Man kann bei **jedem** Registrar die Nameserver frei auf Cloudflare setzen. Alle Vorteile
von Cloudflare (DNS, CDN, Workers, kostenloses Zertifikat, Analytics) bleiben erhalten.

### 2. Jimdo-Postfächer ziehen nicht mit um

Die E-Mail-Konten bei Jimdo sind an den Jimdo-Vertrag gebunden, nicht an die Domain. Beim
Transfer bleiben sie zurück. Dazu kommt eine Falle: Der Auth-Code für den Transfer wird an
die **AdminC-Adresse** der Domain geschickt – und die ist häufig genau eine dieser
Jimdo-Adressen. Wer zuerst die Postfächer abschaltet, kommt nicht mehr an den Code.

**Deshalb gilt: Mail zuerst, Domain danach, Jimdo kündigen ganz zum Schluss.**

## Phase A – Abklären (vor allem anderen)

- [ ] WHOIS-Abfrage auf [nic.ch](https://www.nic.ch) – wer ist Holder, wer ist der
      technische Registrar hinter Jimdo, ist die Domain gesperrt?
- [ ] Welche E-Mail-Adresse ist als **AdminC** hinterlegt? Ist sie erreichbar?
- [ ] Vollständige Liste aller Postfächer, Aliase und Weiterleitungen bei Jimdo.
- [ ] Ungefähre Grösse der Postfächer (bestimmt die Dauer der IMAP-Migration).
- [ ] Wer nutzt die Postfächer wie? (Outlook, Handy, Webmail – jedes Gerät muss später neu
      eingerichtet werden.)
- [ ] Jimdo-Vertragslaufzeit und Kündigungsfrist.
- [ ] Zugangsdaten zum Jimdo-Konto vorhanden und getestet.
- [ ] Gibt es weitere Dienste, die auf die Domain zeigen? (Newsletter-Tool, Google Search
      Console, Google Business Profile, Social-Media-Verifizierungen.)

Ergebnis dieser Phase: eine ausgefüllte Tabelle aller DNS-Records und aller Postfächer.
Ohne die geht es nicht weiter.

## Phase B – Neuen Anbieter wählen

Gesucht ist ein Schweizer Registrar mit ordentlichem Mailhosting. Alle folgenden können
`.ch` und lassen freie Nameserver zu:

| Anbieter | Bemerkung |
|---|---|
| **Infomaniak** | Empfehlung. Rechenzentren in der Schweiz, günstig, gutes Mailhosting mit Import-Werkzeug für bestehende Postfächer, brauchbares Webinterface für die Kundin. |
| Hostpoint | Grösster CH-Anbieter, sehr guter deutschsprachiger Support, etwas teurer. |
| Cyon | Basel, guter Support, sympathisch, Preise im Mittelfeld. |
| Metanet | Solide, eher technisch orientiert. |

Bei der Wahl mitentscheiden sollte: Wie einfach kann die Kundin selbst ein Passwort
zurücksetzen, und wie gut ist der Support **auf Deutsch am Telefon**, wenn der Entwickler
gerade nicht greifbar ist.

Aktuelle Preise beim Entscheid prüfen; Grössenordnung siehe [09-betrieb.md](09-betrieb.md).

## Phase C – Vorbereiten, ohne etwas kaputtzumachen

Alles hier ist **risikofrei** – die alte Seite und die Mails laufen unverändert weiter.

1. **Neue Webseite fertigstellen und abnehmen lassen**, erreichbar unter der
   `*.workers.dev`-URL. Die Kundin hat sie gesehen und freigegeben. Erst danach weiter.

2. **Cloudflare-Zone anlegen**: Domain im Cloudflare-Dashboard hinzufügen (Free Plan).
   Cloudflare scannt die bestehenden DNS-Records und importiert sie.
   **Die Nameserver noch NICHT umstellen.**

3. **DNS-Records vollständig prüfen.** Der automatische Scan findet nicht alles. Gegen die
   Liste aus Phase A abgleichen, besonders:

   | Typ | Wofür | Kritisch? |
   |---|---|---|
   | `MX` | E-Mail-Empfang | **Ja – ohne diese kommt keine Mail an** |
   | `TXT` (SPF) | Wer darf im Namen der Domain senden | **Ja – sonst landen Mails im Spam** |
   | `TXT` / `CNAME` (DKIM) | Signatur ausgehender Mails | **Ja** |
   | `TXT` (DMARC) | Umgangsregel für Fälschungen | Ja |
   | `CNAME autodiscover` / `autoconfig` | Automatische Einrichtung in Outlook/Thunderbird | Nützlich |
   | `TXT` (Verifizierungen) | Google Search Console u.a. | Sonst geht die Verifizierung verloren |
   | `A` / `CNAME` | Webseite | Zeigt noch auf Jimdo |

   Records mit einem externen Werkzeug gegenprüfen (`dig`, MXToolbox), nicht nur dem
   Cloudflare-Import vertrauen.

4. **TTL senken**: 24–48 Stunden vor dem Wechsel bei Jimdo die TTLs auf 300 Sekunden
   setzen, falls das dort möglich ist. Dann wirkt ein allfälliges Zurücksetzen schnell.

5. **Zeitpunkt wählen**: Schulferien oder ein Freitagmorgen. Nicht Freitagabend – wenn
   etwas klemmt, will man Support erreichen können.

## Phase D – E-Mail zuerst umziehen

Der heikelste Teil. Ziel: Wenn die MX-Records wechseln, sind die neuen Postfächer bereits
vorhanden und gefüllt.

1. **Postfächer beim neuen Anbieter anlegen** – exakt dieselben Adressen, inklusive aller
   Aliase und Weiterleitungen. Passwörter im Passwortmanager dokumentieren.

2. **Bestehende Mails kopieren.** Beide Postfächer parallel per IMAP verbinden und die
   Inhalte übertragen. Der Zugriff auf das alte Postfach erfolgt weiterhin über die
   Jimdo-Serveradressen, nicht über die Domain – das funktioniert also auch nach dem
   DNS-Wechsel noch.

   | Weg | Wann |
   |---|---|
   | Import-Werkzeug des neuen Anbieters (Infomaniak hat eines) | Erste Wahl |
   | `imapsync` | Wenn man es wiederholt laufen lassen will |
   | Thunderbird: beide Konten einbinden, Ordner kopieren | Kleine Postfächer, kein Werkzeug |

3. **Kontrollieren**: Ordnerstruktur, Anzahl Mails, Gesendet-Ordner, Kontakte und
   Kalender (die stecken je nach Anbieter nicht im IMAP!).

4. **MX-Records in Cloudflare** auf den neuen Anbieter setzen, dazu SPF, DKIM und DMARC
   des neuen Anbieters eintragen. Noch nicht aktiv – die Zone ist ja noch nicht live.

5. **Delta-Sync einplanen**: Zwischen dem ersten Kopieren und dem tatsächlichen Umschalten
   kommen weitere Mails im alten Postfach an. Direkt nach dem Umschalten die Kopie
   nochmals laufen lassen.

6. **Geräte der Kundin**: Liste erstellen, wer welches Gerät neu einrichten muss. Am
   Umschalttag begleitet einrichten, nicht per Anleitung aus der Ferne.

> Alte Postfächer erst löschen, wenn mindestens zwei Wochen lang alles läuft.

## Phase E – Umschalten

Zwei Dinge geschehen, und zwar in dieser Reihenfolge:

### E1 – Domain transferieren

1. Bei Jimdo den **Transfercode (Auth-Code)** anfordern:
   Jimdo-Konto → Website → Bearbeiten → Menü → **Domains & E-Mails → Domains** → Domain
   anklicken → **Transfercode anfordern**. Der Code wird an die **AdminC-Adresse**
   geschickt. Diese muss erreichbar sein – deshalb Phase A und D vorher.
2. Prüfen, ob Jimdo eine Transfersperre gesetzt hat. Bei `.ch` gibt es keine automatische
   Sperre wie bei `.com`, aber der aktuelle Registrar kann manuell eine setzen. Dann bei
   Jimdo entsperren lassen.
3. Beim neuen Registrar den Transfer mit dem Auth-Code auslösen. **Auth-Codes sind nur
   begrenzt gültig** – nicht tagelang liegen lassen.
4. `.ch`-Transfers werden praktisch sofort wirksam; die Nameserver-Änderung kann bis zu
   48 Stunden brauchen, bis sie überall bekannt ist.
5. Der Holder muss den Wechsel je nach Anbieter per Mail bestätigen.

### E2 – Nameserver auf Cloudflare

1. Beim neuen Registrar die beiden **Cloudflare-Nameserver** eintragen (stehen im
   Cloudflare-Dashboard der Zone).
2. Warten, bis Cloudflare die Zone als **Active** meldet.
3. Im Worker die **Custom Domain** verbinden (siehe [06-deployment.md](06-deployment.md)) –
   Cloudflare legt DNS-Record und Zertifikat automatisch an.
4. `www` ↔ Apex-Weiterleitung, SSL **Full (strict)**, **Always Use HTTPS** einschalten.
5. Redirects der alten Jimdo-URLs aktivieren → [08-content-migration.md](08-content-migration.md).

## Phase F – Nachkontrolle

Direkt nach dem Umschalten:

- [ ] `https://domain.ch` und `https://www.domain.ch` zeigen die neue Seite, gültiges Zertifikat
- [ ] HTTP leitet auf HTTPS um
- [ ] Testmail **an** jede Adresse – kommt sie an?
- [ ] Testmail **von** jeder Adresse an eine Gmail- und eine Outlook-Adresse – landet sie
      im Posteingang oder im Spam?
- [ ] SPF, DKIM und DMARC prüfen (MXToolbox oder `mail-tester.com`, Ziel ≥ 9/10)
- [ ] Stichprobe alter Jimdo-URLs → leiten sie korrekt um?
- [ ] 404-Seite erscheint bei Unsinn-URLs
- [ ] Google Search Console: Property auf die neue Seite, Sitemap einreichen
- [ ] Uptime-Monitoring aktiv (siehe [09-betrieb.md](09-betrieb.md))
- [ ] Supabase-Login der Kundin funktioniert noch (falls Login-Adresse = Schuladresse)

Nach zwei Wochen:

- [ ] Keine Mailprobleme gemeldet
- [ ] Search Console zeigt keinen Einbruch bei den Zugriffen
- [ ] **Erst jetzt Jimdo kündigen** (Kündigungsfrist beachten) und die alten Postfächer
      löschen

## Rollback

| Schritt | Umkehrbar? | Wie |
|---|---|---|
| DNS-Records in Cloudflare | Ja, in Minuten | Alten Wert wieder eintragen (deshalb die Liste aus Phase A) |
| Nameserver | Ja, in Stunden | Beim Registrar zurücksetzen |
| Custom Domain am Worker | Ja | Entfernen, alten A-Record setzen |
| **Domain-Transfer** | Kaum | Rücktransfer wäre ein neuer Transfer über Jimdo – langwierig |
| **Gelöschte Postfächer** | Nein | Deshalb erst nach zwei Wochen löschen |

Daraus folgt die ganze Reihenfolge dieses Dokuments: Alles Umkehrbare zuerst, das
Unumkehrbare zuletzt, und zwischen jedem Schritt ein Prüfpunkt.

## Häufige Fehler, die hier vermieden werden

1. Domain transferieren, bevor die Mails kopiert sind → Postfächer weg.
2. Auth-Code an eine Adresse anfordern, die man gerade abgeschaltet hat.
3. Beim DNS-Import die MX-Records übersehen → alle eingehenden Mails prallen ab.
4. SPF/DKIM vergessen → ausgehende Mails landen im Spam, und niemand merkt es sofort.
5. Jimdo zu früh kündigen → Zugriff auf alte Daten weg.
6. Umschalten am Freitagabend oder vor den Ferien des Entwicklers.

## Verwandte Dokumente

- Alte URLs korrekt weiterleiten → [08-content-migration.md](08-content-migration.md)
- Custom Domain am Worker → [06-deployment.md](06-deployment.md)
