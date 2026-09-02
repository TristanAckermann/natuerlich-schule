/**
 * Ausführbarer Einstieg für den Seed der Inhalte.
 *
 * Aufruf: `npm run seed`
 *
 * Der Seed ist idempotent — siehe `src/seed/homepage.ts`,
 * `src/seed/stundenplaene.ts`, `src/seed/ferienplan.ts` und `src/seed/unterstufe.ts`. Fehlende Assets unter
 * `docs/assets/` führen zu einer Warnung, nicht zum Abbruch. Nur ein echter
 * Fehler (Datenbank nicht erreichbar, Validierung schlägt fehl) beendet den
 * Prozess mit Code 1.
 *
 * NACH DEM LAUF DEN DEV-SERVER NEU STARTEN. Alle Schreibzugriffe laufen mit
 * `disableRevalidate`, weil `revalidateTag` ausserhalb eines Next-Request-Scopes
 * nichts ausrichtet (siehe `safeRevalidate` in `src/hooks/revalidate.ts`). Ein
 * laufender Server hält Seiten und Globals deshalb weiter im Cache und zeigt
 * frisch verknüpfte Navigationseinträge noch als Platzhalter.
 */
// Das Skript läuft ausserhalb des Next-Servers und der Payload-CLI — beide
// laden .env sonst selbst.
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '@/payload.config'

import { seedFerienplan } from './ferienplan'
import { seedHomepage } from './homepage'
import { seedStundenplaene } from './stundenplaene'
import { seedUnterstufe } from './unterstufe'

const run = async (): Promise<void> => {
  const payload = await getPayload({ config })

  await seedHomepage(payload)
  // Muss nach der Startseite laufen: der Seed verknüpft die Seite mit dem
  // Navigationseintrag, den `seedHomepage` in der Kopfzeile anlegt.
  await seedStundenplaene(payload)
  // Ebenfalls nach der Startseite: die Seite wird mit dem Navigationseintrag
  // verknüpft, den `seedHomepage` in der Kopfzeile anlegt.
  await seedFerienplan(payload)
  // Ebenfalls nach der Startseite: sie legt sowohl den Navigationseintrag
  // „Unterstufe“ als auch das Signet in der Medienbibliothek an.
  await seedUnterstufe(payload)

  payload.logger.info('Seed: fertig.')
}

run()
  .then(() => {
    process.exit(0)
  })
  .catch((error: unknown) => {
    console.error('Seed fehlgeschlagen:', error)
    process.exit(1)
  })
