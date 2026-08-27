/**
 * Seed der Seite „Unterstufe“.
 *
 * IDEMPOTENT. Das Skript darf beliebig oft laufen:
 * - Die Seite wird über `slug: 'unterstufe'` gesucht und je nach Fund angelegt
 *   oder aktualisiert. Es entsteht also immer genau ein Dokument, nie ein zweites.
 * - Der Navigationseintrag „Unterstufe“ in der Gruppe „Stufen“ wird über seinen
 *   Linktext gefunden und auf die ID dieser Seite gesetzt — bei jedem Lauf
 *   derselbe Eintrag, dieselbe ID.
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

import { paragraphs } from './lexical'
import { verknuepfeNavigation } from './navigation'

/** Slug der Seite. */
const UNTERSTUFE_SLUG = 'unterstufe'

/** Kontext für alle Schreibzugriffe: die Revalidierungs-Hooks bleiben stumm. */
const SEED_CONTEXT = { disableRevalidate: true }

/** Linktext des bestehenden Navigationseintrags in der Gruppe „Stufen“. */
const NAVIGATIONS_LABEL = 'Unterstufe'

/**
 * Dateiname des Signets, das als Symbol über dem Seitentitel steht.
 *
 * Das Bild wird nicht hier hochgeladen, sondern in der `media`-Collection
 * gesucht: `seedHomepage` lädt es aus `docs/assets/`, sobald die Datei dort
 * liegt. Fehlt sie noch (siehe `docs/assets/README.md`), bleibt das Feld leer
 * und der Seitenkopf beginnt mit dem Titel — ein erneuter Lauf trägt das Symbol
 * nach, sobald die Datei da ist.
 */
const SIGNET_DATEINAME = 'logo-natuerlich-schule.png'

// ---------------------------------------------------------------------------
// Seitenlayout
// ---------------------------------------------------------------------------

/*
 * Der Text stammt wörtlich von der Schule. Er wird ausschliesslich gegliedert —
 * kein Satz wird umgeschrieben, gekürzt oder ergänzt. Gestaltet wird nur über
 * Blockwahl, Schriftgrad und Fläche: jeder Zwischentitel der Vorlage wird ein
 * eigener `textIntro`-Block, dessen Überschrift links und dessen Fliesstext
 * rechts steht.
 */
const buildLayout = (signetId: number | null): Page['layout'] => [
  {
    blockType: 'pageHeader',
    heading: 'Unterstufe',
    icon: signetId,
  },
  {
    blockType: 'textIntro',
    body: paragraphs(
      'In der Unterstufe werden Kinder von der 1. bis zur 4. Klasse unterrichtet. Kinder welche mehr Zeit brauchen, können auch die 4. Klasse im geschützten Rahmen der Unterstufe absolvieren. Kinder welche schulisch gefordert werden können, dürfen die 4. Klasse mit der 5./6. Klasse absolvieren. Wir nehmen keine Kindergartenkinder an der Natürlich Schule auf.',
    ),
    heading: 'Allgemein',
  },
  {
    blockType: 'textIntro',
    body: paragraphs(
      'Um die Kinder optimal in ihrem Lernprozessen zu unterstützen sind jeweils eine Lehrperson und eine Assistenz vor Ort und gestalten geführte und freie Sequenzen.',
      'Die Kinder werden sorgfältig auf die Mittel- und Oberstufe vorbereitet. Die Kinder werden im Lernatelier an die späteren Freiarbeitslektionen gewöhnt, in welchen sie später die Wochenziele selbständig erledigen werden.',
      'Der Morgenkreis mit Singen und Geschichten schult die Aufmerksamkeit und Bewegungsfreudigkeit der Kinder.',
      'In dieser Stufe nehmen wir Kinder der Besonderen Volksschule auf. (Zuweisung über das zuständige Inspektorat / Erziehungsberatung) Wir haben keinen Einfluss auf die Zuweisungen)',
    ),
    // Der Bindestrich der Vorlage wird zum Halbgeviertstrich — dieselbe
    // Typografie wie in den übrigen Überschriften der Website.
    heading: 'Hoher Betreuungsschlüssel – kleine Gruppen',
  },
  {
    blockType: 'textIntro',
    body: paragraphs(
      'Die Lehrpersonen der Natürlich Schule bringen nebst einem vielfältigen Lebensrucksack auch eine tiefe Auseinandersetzung mit verschiedenen Pädagogischen Ansätzen mit. Im Zentrum steht immer das Kind. Die Pädagogik richtet sich nach den Bedürfnissen des Kindes.',
      'Wir nutzen gängige Lehrmittel von verschiedenen grossen und kleinen Lehrmittelverlagen. Wir suchen Lehrmittel, welche zu dem Kind passen. Wir bereichern unser Angebot mit Montessorimaterialien. Wir arbeiten viel spielerisch und kreativ, dadurch verbessern wir die Leistungsbereitschaft in den Hauptfächern.',
      'Musik, Werken und bildnerisches Gestalten nimmt einen wichtigen Platz in unserem Schulalltag ein. Noten gibt es erst ab der Mittelstufe. Die Kinder werden altersdurchmischt unterrichtet, dies fördert das gegenseitige Helfen, Unterstützen und Lernen.',
    ),
    heading: 'Pädagogik',
  },
  {
    blockType: 'textIntro',
    body: paragraphs(
      'Die Kinder können sich freiwillig für die Schulinsel Werken und Kochen anmelden. Kinder welche in der Gruppe überfordert sind, erhalten eine Auszeit von der Gruppe.',
    ),
    heading: 'Schulinsel',
  },
  {
    blockType: 'textIntro',
    body: paragraphs(
      'Die Unterstufe bewirtschaftet Hochbeete vor dem Schulhaus. Das Gemüse wird direkt in der Schulküche verarbeitet. Einmal in der Woche geht die Unterstufe in den Wald. Der NMG Unterricht findet teils im Wald statt.',
    ),
    heading: 'Wald / Garten',
  },
  {
    blockType: 'textIntro',
    body: paragraphs(
      'Die Unterstufe ist im 1. Stock des Schulhauses Unterbach. Der Raum ist liebevoll mit allem eingerichtet, was ein Kind zu seiner freien Entfaltung in dieser Altersstufe braucht. Diverse Montessorimaterialien laden zum Entdecken und Erforschen ein. Es stehen viele Möglichkeiten für selbständiges Arbeiten und gemeinsames Spielen zur Verfügung.',
      'Der grosszügige Umschwung im Freien ladet die Kinder mit zur Verfügung gestellten Fahrzeugen (Velo, Trottinett, Tret-Gokart) zum Bewegen ein.',
      'Ein kleines Häuschen, eine Rutschbahn, eine Wippe und eine Schaukel geben den Kindern weiteren Raum für Bewegung. Eine grosse Spielwiese, eine Spielkiste und ein Ping-Pong Tisch bereichern das Angebot für die Kinder.',
    ),
    heading: 'Die Räumlichkeiten und der Bewegungsraum der Kinder',
  },
]

// ---------------------------------------------------------------------------
// Medien
// ---------------------------------------------------------------------------

/** Sucht das Signet in der `media`-Collection. Fehlt es, bleibt das Feld leer. */
const findeSignet = async (payload: Payload): Promise<number | null> => {
  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    where: { filename: { equals: SIGNET_DATEINAME } },
  })

  if (!docs[0]) {
    payload.logger.warn(
      `Seed: ${SIGNET_DATEINAME} liegt nicht in der Medienbibliothek — der Seitenkopf ` +
        'der Unterstufe bleibt ohne Symbol. Datei nach docs/assets/ legen und den Seed erneut ausführen.',
    )
    return null
  }

  return docs[0].id
}

// ---------------------------------------------------------------------------
// Einstieg
// ---------------------------------------------------------------------------

/**
 * Legt die Seite „Unterstufe“ an oder aktualisiert sie und verknüpft den
 * bestehenden Navigationseintrag mit ihr. Mehrfaches Ausführen ergibt genau ein
 * Seiten-Dokument.
 */
export const seedUnterstufe = async (payload: Payload): Promise<void> => {
  const signetId = await findeSignet(payload)

  const seitenDaten = {
    _status: 'published' as const,
    layout: buildLayout(signetId),
    meta: {
      description:
        'Die Unterstufe der Natürlich Schule: 1. bis 4. Klasse in kleinen, altersdurchmischten Gruppen, mit Lernatelier, Morgenkreis, Wald und Garten.',
      noIndex: false,
    },
    slug: UNTERSTUFE_SLUG,
    title: 'Unterstufe',
  }

  const { docs } = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: true,
    limit: 1,
    where: { slug: { equals: UNTERSTUFE_SLUG } },
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
    payload.logger.info(`Seed: Seite „Unterstufe“ aktualisiert (ID ${seitenId}).`)
  } else {
    const erstellt = await payload.create({
      collection: 'pages',
      context: SEED_CONTEXT,
      data: seitenDaten,
      depth: 0,
    })
    seitenId = erstellt.id
    payload.logger.info(`Seed: Seite „Unterstufe“ angelegt (ID ${seitenId}).`)
  }

  await verknuepfeNavigation(payload, { label: NAVIGATIONS_LABEL, seite: 'Unterstufe', seitenId })
}
