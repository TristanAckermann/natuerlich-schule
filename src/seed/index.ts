/**
 * Ausführbarer Einstieg für den Seed der Startseite.
 *
 * Aufruf: `pnpm seed`
 *
 * Der Seed ist idempotent — siehe `src/seed/homepage.ts`. Fehlende Assets unter
 * `docs/assets/` führen zu einer Warnung, nicht zum Abbruch. Nur ein echter
 * Fehler (Datenbank nicht erreichbar, Validierung schlägt fehl) beendet den
 * Prozess mit Code 1.
 */
// Das Skript läuft ausserhalb des Next-Servers und der Payload-CLI — beide
// laden .env sonst selbst.
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '@/payload.config'

import { seedHomepage } from './homepage'

const run = async (): Promise<void> => {
  const payload = await getPayload({ config })

  await seedHomepage(payload)

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
