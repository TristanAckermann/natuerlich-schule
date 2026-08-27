/**
 * Seed der Seite „Stundenpläne".
 *
 * IDEMPOTENT. Das Skript darf beliebig oft laufen:
 * - Die Seite wird über `slug: 'stundenplaene'` gesucht und je nach Fund angelegt
 *   oder aktualisiert. Es entsteht also immer genau ein Dokument, nie ein zweites.
 * - Der Navigationseintrag „Stundenplan" wird über seinen Linktext gefunden und auf
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

import { verknuepfeNavigation } from './navigation'

/** Slug der Seite. */
const STUNDENPLAENE_SLUG = 'stundenplaene'

/** Kontext für alle Schreibzugriffe: die Revalidierungs-Hooks bleiben stumm. */
const SEED_CONTEXT = { disableRevalidate: true }

/** Linktext des bestehenden Navigationseintrags in der Gruppe „Administratives". */
const NAVIGATIONS_LABEL = 'Stundenplan'

// ---------------------------------------------------------------------------
// Hilfsfunktionen für die Tabellen
// ---------------------------------------------------------------------------

/** `colSpan` und `rowSpan` werden nur gesetzt, wo sie von 1 abweichen. */
type Spannen = { colSpan?: number; rowSpan?: number }

const zelle = (text: string, spannen: Spannen = {}) => ({
  text,
  variant: 'lektion' as const,
  ...spannen,
})

const pause = (text: string, spannen: Spannen = {}) => ({
  text,
  variant: 'pause' as const,
  ...spannen,
})

const organisation = (text: string, spannen: Spannen = {}) => ({
  text,
  variant: 'organisation' as const,
  ...spannen,
})

const spalten = (...labels: string[]) => labels.map((label) => ({ label }))

const legende = (...paare: [string, string][]) =>
  paare.map(([abbreviation, meaning]) => ({ abbreviation, meaning }))

/** Kopfspalte der Mittagszeile — in beiden Plänen identisch. */
const MITTAG_ZEIT = 'Mittagslektion\n11:45 - 12:30\nMittag\n12:00 - 13:15'

const WOCHENTAGE = spalten('Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag')

// ---------------------------------------------------------------------------
// Seitenlayout
// ---------------------------------------------------------------------------

/*
 * Die Texte stammen wörtlich von der Schule. Sie werden weder korrigiert noch
 * vereinheitlicht — auch nicht die Abstände in „3. - 6.Klasse", die abweichende
 * Schreibweise „Eng Con" in der Legende gegenüber „Eng Conv" in der Tabelle und
 * auch nicht die unterschiedlichen Gartenstandorte in den beiden Legenden.
 *
 * Die Zellen werden wie in HTML von links nach rechts gefüllt: eine Position, die
 * ein `rowSpan` oder `colSpan` einer früheren Zelle bereits überdeckt, wird nicht
 * erneut erfasst. Deshalb haben manche Zeilen weniger als fünf Zellen.
 */
const LAYOUT: Page['layout'] = [
  {
    blockType: 'pageHeader',
    heading: 'Stundenpläne',
    lead: 'Jedes Kind wird an der Natürlich Schule individuell betrachtet, somit hat auch kein Kind den gleichen Stundenplan. Die Einstufung in die Niveaugruppen geschieht in der ersten Schulwoche oder in der Schnupperwoche.',
  },
  {
    blockType: 'timetable',
    columns: WOCHENTAGE,
    heading: 'Musterstundenplan 3. - 6.Klasse',
    legend: legende(
      ['Fran', 'Französisch'],
      ['Deu', 'Deutsch'],
      ['Mat', 'Mathematik'],
      ['Eng', 'Englisch'],
      ['NMG', 'Natur Mensch Gesellschaft'],
      ['Sp', 'Sport'],
      ['Prog', 'Programmieren'],
      ['Ha', 'Handarbeit'],
      ['We', 'Werken'],
      ['FA', 'Freiarbeit (Individuelle Wochenziele / Projekte)'],
      ['Projekt', 'Schulprojekte, Klassenprojekte, individuelle Projekte'],
      ['Garten', 'Gartenarbeit im Schulgarten in Brienzwiler'],
    ),
    rows: [
      {
        cells: [organisation('Frühstunde', { colSpan: 5 })],
        time: '7:15-8:00',
      },
      {
        cells: [
          zelle('Sport'),
          zelle('Deu'),
          zelle('Deu'),
          zelle('NMG', { rowSpan: 2 }),
          zelle('Prog'),
        ],
        time: '8:15-9:00',
      },
      {
        // Donnerstag ist vom NMG-Verbund der Zeile darüber überdeckt.
        cells: [zelle('Wald'), zelle('FA'), zelle('Projekt'), zelle('Eng')],
        time: '9:00-9:45',
      },
      {
        cells: [pause('Pause', { colSpan: 5 })],
        time: '9:45-10:15',
      },
      {
        cells: [
          zelle('Wald', { rowSpan: 2 }),
          zelle('Musik', { rowSpan: 2 }),
          zelle('Projekt', { rowSpan: 2 }),
          zelle('Mat'),
          zelle('FA'),
        ],
        time: '10:15-11:00',
      },
      {
        // Montag bis Mittwoch sind überdeckt: Donnerstag FA, Freitag Sp.
        cells: [zelle('FA'), zelle('Sp')],
        time: '11:00-11:45',
      },
      {
        cells: [
          organisation('Ab 12:00\nMittagessen'),
          organisation('Ab 12:00\nMittagessen'),
          organisation('Kinderforum\nSchulhausputz'),
          organisation('Ab 12:00\nMittagessen'),
          zelle('Sp'),
        ],
        time: MITTAG_ZEIT,
      },
      {
        // Mittwoch und Freitag sind den ganzen Nachmittag frei — die beiden
        // leeren Zellen mit rowSpan 5 decken die Zeilen bis 15:45-16:30 ab.
        cells: [
          zelle('NMG', { rowSpan: 2 }),
          zelle('Mat', { rowSpan: 2 }),
          organisation('', { rowSpan: 5 }),
          zelle('Ha / We oder Garten', { rowSpan: 2 }),
          organisation('', { rowSpan: 5 }),
        ],
        time: '13:15-14:00',
      },
      {
        // Keine Zelle: alle fünf Spalten sind von den Verbünden der Zeile
        // darüber überdeckt.
        cells: [],
        time: '14:00-14:45',
      },
      {
        // Montag und Dienstag zusammengefasst, danach der Donnerstag.
        cells: [pause('Pause', { colSpan: 2 }), pause('Pause')],
        time: '14:45-15:00',
      },
      {
        cells: [zelle('Fran'), zelle('Fran'), zelle('')],
        time: '15:00-15:45',
      },
      {
        cells: [zelle('Sp'), zelle(''), zelle('')],
        time: '15:45-16:30',
      },
    ],
  },
  {
    blockType: 'timetable',
    columns: WOCHENTAGE,
    heading: 'Musterstundenplan 7. - 9.Klasse',
    legend: legende(
      ['Fran', 'Französisch'],
      ['Deu', 'Deutsch'],
      ['Mat', 'Mathematik'],
      ['NT', 'Natur Technik'],
      ['RZG', 'Raum Zeit Geschichte'],
      ['ERG', 'Ethik Religion Gesellschaft'],
      ['Eng Con', 'Englisch Konversation'],
      ['Fran Con', 'Französisch Konversation'],
      ['Prog', 'Programmieren'],
      ['BG', 'Bildnerisches Gestalten'],
      ['FA', 'Freiarbeit (Individuelle Wochenziele / Projekte)'],
      ['Projekt', 'Schulprojekte, Klassenprojekte, individuelle Projekte'],
      ['Garten', 'Gartenarbeit im Schulgarten in Oberried'],
      ['Ha /We', 'Handarbeit und Werken'],
    ),
    rows: [
      {
        cells: [organisation('Frühstunde', { colSpan: 3 }), zelle('Fran Conv'), zelle('Eng Conv')],
        time: '7:15-8:00',
      },
      {
        cells: [
          zelle('Sport'),
          zelle('Fran'),
          zelle('Fran'),
          zelle('NT', { rowSpan: 2 }),
          zelle('Prog'),
        ],
        time: '8:15-9:00',
      },
      {
        // Donnerstag ist vom NT-Verbund der Zeile darüber überdeckt.
        cells: [zelle('Deu'), zelle('Deu'), zelle('Deu'), zelle('FA')],
        time: '9:00-9:45',
      },
      {
        cells: [pause('Pause', { colSpan: 5 })],
        time: '9:45-10:15',
      },
      {
        cells: [
          zelle('Deu'),
          zelle('Musik', { rowSpan: 2 }),
          zelle('Eng'),
          zelle('Mat'),
          zelle('ERG'),
        ],
        time: '10:15-11:00',
      },
      {
        // Dienstag ist vom Musik-Verbund der Zeile darüber überdeckt.
        cells: [zelle('Eng'), zelle('FA'), zelle('FA'), zelle('Sport')],
        time: '11:00-11:45',
      },
      {
        cells: [
          organisation('Ab 12:00\nMittagessen'),
          organisation('Ab 12:00\nMittagessen'),
          organisation('Kinderforum\nSchulhausputz'),
          organisation('Ab 12:00\nMittagessen'),
          zelle('Sport'),
        ],
        time: MITTAG_ZEIT,
      },
      {
        // Mittwoch und Freitag sind den ganzen Nachmittag frei — die beiden
        // leeren Zellen mit rowSpan 5 decken die Zeilen bis 15:45-16:30 ab.
        cells: [
          zelle('RZG', { rowSpan: 2 }),
          zelle('Mat', { rowSpan: 2 }),
          organisation('', { rowSpan: 5 }),
          zelle('Ha / We oder Garten', { rowSpan: 2 }),
          organisation('', { rowSpan: 5 }),
        ],
        time: '13:15-14:00',
      },
      {
        // Keine Zelle: alle fünf Spalten sind von den Verbünden der Zeile
        // darüber überdeckt.
        cells: [],
        time: '14:00-14:45',
      },
      {
        // Montag und Dienstag zusammengefasst, danach der Donnerstag.
        cells: [pause('Pause', { colSpan: 2 }), pause('Pause')],
        time: '14:45-15:00',
      },
      {
        cells: [
          zelle('Mat'),
          zelle('Projekt', { rowSpan: 2 }),
          zelle('BG oder Garten', { rowSpan: 2 }),
        ],
        time: '15:00-15:45',
      },
      {
        cells: [zelle('Medien Inform.')],
        time: '15:45-16:30',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Einstieg
// ---------------------------------------------------------------------------

/**
 * Legt die Seite „Stundenpläne" an oder aktualisiert sie und verknüpft den
 * bestehenden Navigationseintrag mit ihr. Mehrfaches Ausführen ergibt genau ein
 * Seiten-Dokument.
 */
export const seedStundenplaene = async (payload: Payload): Promise<void> => {
  const seitenDaten = {
    _status: 'published' as const,
    layout: LAYOUT,
    meta: {
      description:
        'Jedes Kind wird an der Natürlich Schule individuell betrachtet, somit hat auch kein Kind den gleichen Stundenplan.',
      noIndex: false,
    },
    slug: STUNDENPLAENE_SLUG,
    title: 'Stundenpläne',
  }

  const { docs } = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: true,
    limit: 1,
    where: { slug: { equals: STUNDENPLAENE_SLUG } },
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
    payload.logger.info(`Seed: Seite „Stundenpläne" aktualisiert (ID ${seitenId}).`)
  } else {
    const erstellt = await payload.create({
      collection: 'pages',
      context: SEED_CONTEXT,
      data: seitenDaten,
      depth: 0,
    })
    seitenId = erstellt.id
    payload.logger.info(`Seed: Seite „Stundenpläne" angelegt (ID ${seitenId}).`)
  }

  await verknuepfeNavigation(payload, { label: NAVIGATIONS_LABEL, seite: 'Stundenpläne', seitenId })
}
