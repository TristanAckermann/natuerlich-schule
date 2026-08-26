/**
 * Seed der Seite „Ferienplan“.
 *
 * IDEMPOTENT. Das Skript darf beliebig oft laufen:
 * - Die Seite wird über `slug: 'ferienplan'` gesucht und je nach Fund angelegt
 *   oder aktualisiert. Es entsteht also immer genau ein Dokument, nie ein zweites.
 * - Der Navigationseintrag „Ferienplan“ wird über seinen Linktext gefunden und auf
 *   die ID dieser Seite gesetzt — bei jedem Lauf derselbe Eintrag, dieselbe ID.
 *
 * Achtung: Ein erneuter Lauf setzt die Inhalte auf den Stand dieser Datei zurück.
 * Redaktionelle Änderungen an der Seite gehen dabei verloren — der Seed ist ein
 * Werkzeug für die Erstbefüllung und für frische Test-Datenbanken, kein
 * Migrationsskript.
 *
 * Alle Schreibzugriffe laufen mit `context: { disableRevalidate: true }`, damit die
 * afterChange-Hooks im Seed keine Cache-Invalidierung auslösen.
 */
import type { Payload } from 'payload'

import type { Page } from '@/payload-types'

/** Slug der Seite. */
const FERIENPLAN_SLUG = 'ferienplan'

/** Kontext für alle Schreibzugriffe: die Revalidierungs-Hooks bleiben stumm. */
const SEED_CONTEXT = { disableRevalidate: true }

/** Linktext des bestehenden Navigationseintrags in der Gruppe „Administratives“. */
const NAVIGATIONS_LABEL = 'Ferienplan'

// ---------------------------------------------------------------------------
// Hilfsfunktion für die Datumswerte
// ---------------------------------------------------------------------------

/**
 * Macht aus einem Tagesdatum den Wert, den Payload speichert.
 *
 * Die beiden Datumsfelder des Blocks laufen als `pickerAppearance: 'dayOnly'`.
 * Payload normalisiert solche Werte auf 12:00 UTC des gewählten Tages, damit kein
 * Zeitzonenversatz das Datum auf den Vor- oder Folgetag schiebt. Der Seed schreibt
 * deshalb dieselbe Form — sonst stünde in der Datenbank etwas anderes als nach
 * einer Bearbeitung im Admin.
 */
const tag = (datum: string): string => `${datum}T12:00:00.000Z`

// ---------------------------------------------------------------------------
// Seitenlayout
// ---------------------------------------------------------------------------

/*
 * Die Schule hat uns nur diese beiden Schuljahre geliefert: 2026/27 und 2028/29.
 * Das Schuljahr 2027/28 fehlt bereits in ihrer Vorlage — das ist keine Auslassung
 * beim Übertragen. Sobald die Daten nachgeliefert werden, gehört ein drittes
 * `years`-Element zwischen die beiden bestehenden.
 */
const LAYOUT: Page['layout'] = [
  {
    blockType: 'pageHeader',
    heading: 'Ferienplan',
    lead: 'Die Schulferien der Natürlich Schule im Überblick. Massgebend sind die Ferienzeiten der Schulgemeinde; Abweichungen geben wir rechtzeitig bekannt.',
  },
  {
    blockType: 'holidayPlan',
    heading: 'Schulferien',
    years: [
      {
        entries: [
          { from: tag('2026-09-19'), name: 'Herbstferien', to: tag('2026-10-11') },
          { from: tag('2026-12-24'), name: 'Weihnachtsferien', to: tag('2027-01-10') },
          { from: tag('2027-02-13'), name: 'Sportferien', to: tag('2027-02-21') },
          { from: tag('2027-04-17'), name: 'Frühlingsferien', to: tag('2027-05-02') },
          { from: tag('2027-05-06'), name: 'Auffahrtsbrücke', to: tag('2027-05-09') },
          // Ohne `to`: ein einzelner freier Tag.
          { from: tag('2027-05-17'), name: 'Pfingstmontag' },
          {
            from: tag('2027-06-26'),
            name: 'Sommerferien',
            note: '7 Wochen',
            to: tag('2027-08-15'),
          },
        ],
        label: 'Schulferien 2026 – 27',
      },
      {
        entries: [
          { from: tag('2028-09-23'), name: 'Herbstferien', to: tag('2028-10-15') },
          { from: tag('2028-12-23'), name: 'Weihnachtsferien', to: tag('2029-01-07') },
          { from: tag('2029-02-17'), name: 'Sportferien', to: tag('2029-02-25') },
          { from: tag('2029-04-07'), name: 'Frühlingsferien', to: tag('2029-04-22') },
          { from: tag('2029-05-10'), name: 'Auffahrtsbrücke', to: tag('2029-05-13') },
          // Ohne `to`: ein einzelner freier Tag.
          { from: tag('2029-05-21'), name: 'Pfingstmontag' },
          {
            from: tag('2029-06-30'),
            name: 'Sommerferien',
            note: '6 Wochen',
            to: tag('2029-08-12'),
          },
        ],
        label: 'Schulferien 2028 – 29',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

/**
 * Hängt die neue Seite an den bestehenden Navigationseintrag „Ferienplan“.
 *
 * Das passiert hier und nicht in `homepage.ts`: `seedHomepage` befüllt die
 * Kopfzeile, bevor diese Seite existiert — die Verknüpfung braucht deren ID und
 * ist deshalb ein Nachtrag. Idempotent bleibt es, weil bei jedem Lauf derselbe
 * Eintrag gefunden und auf dieselbe ID gesetzt wird.
 *
 * Fehlt der Eintrag, wird nur gewarnt — der Seed bricht deswegen nie ab.
 */
const verknuepfeNavigation = async (payload: Payload, seitenId: number): Promise<void> => {
  const header = await payload.findGlobal({ slug: 'header', depth: 0 })
  const gruppen = header.groups ?? []

  const eintrag = gruppen
    .flatMap((gruppe) => gruppe.items ?? [])
    .find((item) => item.link.label === NAVIGATIONS_LABEL)

  if (!eintrag) {
    payload.logger.warn(
      `Seed: Navigationseintrag „${NAVIGATIONS_LABEL}“ nicht gefunden — die Seite ` +
        '„Ferienplan“ bleibt unverlinkt. Zuerst den Seed der Startseite ausführen.',
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

  payload.logger.info(`Seed: Navigationseintrag „${NAVIGATIONS_LABEL}“ verknüpft.`)
}

// ---------------------------------------------------------------------------
// Einstieg
// ---------------------------------------------------------------------------

/**
 * Legt die Seite „Ferienplan“ an oder aktualisiert sie und verknüpft den
 * bestehenden Navigationseintrag mit ihr. Mehrfaches Ausführen ergibt genau ein
 * Seiten-Dokument.
 */
export const seedFerienplan = async (payload: Payload): Promise<void> => {
  const seitenDaten = {
    _status: 'published' as const,
    layout: LAYOUT,
    meta: {
      description:
        'Die Schulferien der Natürlich Schule: Herbst-, Weihnachts-, Sport-, Frühlings- und Sommerferien sowie einzelne freie Tage.',
      noIndex: false,
    },
    slug: FERIENPLAN_SLUG,
    title: 'Ferienplan',
  }

  const { docs } = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: true,
    limit: 1,
    where: { slug: { equals: FERIENPLAN_SLUG } },
  })

  const vorhandeneSeite = docs[0]

  let seitenId: number

  if (vorhandeneSeite) {
    await payload.update({
      id: vorhandeneSeite.id,
      collection: 'pages',
      context: SEED_CONTEXT,
      data: seitenDaten,
      depth: 0,
    })
    seitenId = vorhandeneSeite.id
    payload.logger.info(`Seed: Seite „Ferienplan“ aktualisiert (ID ${seitenId}).`)
  } else {
    const erstellt = await payload.create({
      collection: 'pages',
      context: SEED_CONTEXT,
      data: seitenDaten,
      depth: 0,
    })
    seitenId = erstellt.id
    payload.logger.info(`Seed: Seite „Ferienplan“ angelegt (ID ${seitenId}).`)
  }

  await verknuepfeNavigation(payload, seitenId)
}
