/**
 * Verknüpft einen bestehenden Navigationseintrag der Kopfzeile mit einer Seite.
 *
 * `seedHomepage` legt die Navigation an, solange die Unterseiten noch nicht
 * existieren: die Einträge tragen dort nur ihren Linktext und kein Ziel. Sobald
 * eine Unterseite geseedet ist, trägt ihr Seed das Ziel hier nach — sonst bliebe
 * der Eintrag ein `aria-disabled`-Platzhalter und die Seite nur über die URL
 * erreichbar.
 *
 * Idempotent: bei jedem Lauf wird derselbe Eintrag über seinen Linktext gefunden
 * und auf dieselbe ID gesetzt. Fehlt der Eintrag, wird nur gewarnt — der Seed
 * bricht deswegen nie ab.
 */
import type { Payload } from 'payload'

/** Kontext für alle Schreibzugriffe: die Revalidierungs-Hooks bleiben stumm. */
const SEED_CONTEXT = { disableRevalidate: true }

type Verknuepfung = {
  /** Linktext des Eintrags in der Kopfzeile, über den er gefunden wird. */
  label: string
  /** Titel der Seite. Steht nur in der Warnung — Linktext und Titel weichen ab. */
  seite: string
  seitenId: number
}

export const verknuepfeNavigation = async (
  payload: Payload,
  { label, seite, seitenId }: Verknuepfung,
): Promise<void> => {
  const header = await payload.findGlobal({ slug: 'header', depth: 0 })
  const gruppen = header.groups ?? []

  const eintrag = gruppen
    .flatMap((gruppe) => gruppe.items ?? [])
    .find((item) => item.link.label === label)

  if (!eintrag) {
    payload.logger.warn(
      `Seed: Navigationseintrag „${label}“ nicht gefunden — die Seite „${seite}“ ` +
        'bleibt unverlinkt. Zuerst den Seed der Startseite ausführen.',
    )
    return
  }

  eintrag.link.page = seitenId

  await payload.updateGlobal({
    slug: 'header',
    context: SEED_CONTEXT,
    data: { groups: gruppen },
    depth: 0,
  })

  payload.logger.info(`Seed: Navigationseintrag „${label}“ verknüpft.`)
}
