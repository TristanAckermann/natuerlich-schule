/**
 * Seed der Startseite — Spec 001, Abschnitt 8 (Content-Inventar) und 10.2.
 *
 * IDEMPOTENT. Das Skript darf beliebig oft laufen:
 * - Die Seite wird über `slug: 'home'` gesucht und je nach Fund angelegt oder aktualisiert.
 *   Es entsteht also immer genau ein Dokument, nie ein zweites.
 * - Medien werden über ihren `filename` abgeglichen. Liegt die Datei schon in der
 *   Collection, wird sie wiederverwendet und nicht erneut hochgeladen.
 * - Kopf- und Fusszeile sind Globals und werden überschrieben.
 *
 * Achtung: Ein erneuter Lauf setzt die Inhalte auf den Stand dieser Datei zurück.
 * Redaktionelle Änderungen an der Startseite gehen dabei verloren — der Seed ist
 * ein Werkzeug für die Erstbefüllung und für frische Test-Datenbanken, kein
 * Migrationsskript.
 *
 * FEHLENDE ASSETS. Logo, Hero-Video und Poster liegen unter `docs/assets/` und sind
 * noch nicht vollständig im Repository (Spec 001, BLOCKER-2 und offene Frage OF-3).
 * Fehlt eine Datei, wird sie übersprungen, eine Warnung geloggt und der Seed läuft
 * mit leerem Medienfeld weiter. Das Skript bricht deswegen nie ab. Sobald die Datei
 * nachgeliefert ist, füllt ein erneuter Lauf das Feld nach.
 *
 * Alle Schreibzugriffe laufen mit `context: { disableRevalidate: true }`, damit die
 * afterChange-Hooks im Seed keine Cache-Invalidierung auslösen.
 */
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload } from 'payload'

import type { TextIntroBlock } from '@/payload-types'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** Ablageort der aus dem Design-Projekt exportierten Dateien. */
const ASSETS_DIR = path.resolve(dirname, '../../docs/assets')

/** Slug der Startseite. Er ist in `Pages` gegen Änderung und Löschung geschützt. */
const HOME_SLUG = 'home'

/** Kontext für alle Schreibzugriffe: die Revalidierungs-Hooks bleiben stumm. */
const SEED_CONTEXT = { disableRevalidate: true }

/**
 * Feste Kennung des Lexical-Link-Knotens in der Footer-Spalte „Kontakt".
 * Bewusst konstant, damit zwei Seed-Läufe denselben Baum erzeugen.
 */
const KONTAKT_LINK_ID = '000000000000000000000001'

// ---------------------------------------------------------------------------
// Lexical-Hilfsfunktionen
// ---------------------------------------------------------------------------

/** Der Typ ist für alle richText-Felder im Projekt derselbe. */
type RichTextValue = TextIntroBlock['body']

/** Ein beliebiger Lexical-Knoten. Mehr Struktur braucht der Seed nicht. */
type LexicalNode = { type: string; version: number; [key: string]: unknown }

const textNode = (text: string): LexicalNode => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1,
})

const linebreakNode = (): LexicalNode => ({ type: 'linebreak', version: 1 })

/** Wandelt `\n` innerhalb eines Absatzes in Lexical-Zeilenumbrüche um. */
const inlineChildren = (text: string): LexicalNode[] =>
  text
    .split('\n')
    .flatMap((zeile, index) =>
      index === 0 ? [textNode(zeile)] : [linebreakNode(), textNode(zeile)],
    )

const paragraphNode = (children: LexicalNode[]): LexicalNode => ({
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  type: 'paragraph',
  version: 1,
})

const rootNode = (children: LexicalNode[]): RichTextValue => ({
  root: {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
})

/**
 * Baut einen Lexical-Baum aus einfachen Absätzen. Jedes Argument ist ein Absatz,
 * ein `\n` darin wird zum Zeilenumbruch.
 */
const paragraphs = (...texte: string[]): RichTextValue =>
  rootNode(texte.map((text) => paragraphNode(inlineChildren(text))))

/** Ein einzelner Absatz, der nur aus einem `mailto:`-Link besteht. */
const mailtoParagraph = (email: string): RichTextValue => {
  const link: LexicalNode = {
    children: [textNode(email)],
    direction: 'ltr',
    fields: {
      linkType: 'custom',
      newTab: false,
      url: `mailto:${email}`,
    },
    format: '',
    id: KONTAKT_LINK_ID,
    indent: 0,
    type: 'link',
    version: 3,
  }

  return rootNode([paragraphNode([link])])
}

// ---------------------------------------------------------------------------
// Medien
// ---------------------------------------------------------------------------

type AssetDefinition = {
  /** Alternativtext. Nur Bilder brauchen einen — die Media-Collection erzwingt ihn. */
  alt?: string
  filename: string
  /** Wofür die Datei gebraucht wird — erscheint in der Warnung. */
  verwendung: string
}

const LOGO: AssetDefinition = {
  alt: 'Natürlich Schule',
  filename: 'logo-natuerlich-schule.png',
  verwendung: 'das Logo in der Kopfzeile',
}

const HERO_POSTER: AssetDefinition = {
  alt: 'Standbild aus dem Hintergrundvideo der Startseite',
  filename: 'hero-poster.jpg',
  verwendung: 'das Standbild im Hero',
}

const HERO_VIDEO: AssetDefinition = {
  // Videos brauchen keinen Alternativtext, das Video ist rein dekorativ.
  filename: 'hero-loop.mp4',
  verwendung: 'das Hintergrundvideo im Hero',
}

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    const info = await stat(filePath)
    return info.isFile()
  } catch {
    return false
  }
}

/**
 * Liefert die ID des Medien-Dokuments zur Datei — vorhandene werden
 * wiederverwendet, fehlende Dateien liefern `null` statt eines Fehlers.
 */
const ensureMedia = async (payload: Payload, asset: AssetDefinition): Promise<number | null> => {
  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    where: { filename: { equals: asset.filename } },
  })

  const vorhanden = docs[0]
  if (vorhanden) return vorhanden.id

  const filePath = path.join(ASSETS_DIR, asset.filename)

  if (!(await fileExists(filePath))) {
    payload.logger.warn(
      `Seed: docs/assets/${asset.filename} fehlt — ${asset.verwendung} bleibt leer. ` +
        'Datei aus dem Design-Projekt exportieren (Spec 001, BLOCKER-2 / OF-3) und den Seed erneut ausführen.',
    )
    return null
  }

  try {
    const erstellt = await payload.create({
      collection: 'media',
      context: SEED_CONTEXT,
      data: asset.alt ? { alt: asset.alt } : {},
      depth: 0,
      filePath,
      // Der Dateiname muss exakt erhalten bleiben, sonst findet der nächste Lauf
      // das Dokument nicht wieder und lädt die Datei ein zweites Mal hoch.
      overwriteExistingFiles: true,
    })

    payload.logger.info(`Seed: ${asset.filename} hochgeladen.`)
    return erstellt.id
  } catch (error) {
    payload.logger.warn(
      `Seed: Upload von ${asset.filename} fehlgeschlagen — ${asset.verwendung} bleibt leer. ` +
        (error instanceof Error ? error.message : String(error)),
    )
    return null
  }
}

// ---------------------------------------------------------------------------
// Seitenlayout
// ---------------------------------------------------------------------------

/**
 * Die Zielseiten der Navigation und der Teaser existieren noch nicht (Spec 001,
 * Abschnitt 2 „Out of Scope"). Solche Links werden als interne Links ohne
 * gesetzte Seite erfasst: `linkField({ required: false })` lässt das zu,
 * `<CmsLink>` rendert dafür `#` mit `aria-disabled`. Die Redaktion muss später
 * nur noch die Seite auswählen — es bleiben weder Platzhalter-URLs noch
 * Platzhalter-Seiten zum Aufräumen zurück.
 */
const offenerLink = (label: string) => ({ label, type: 'internal' as const })

type BuildLayoutOptions = {
  posterId: number | null
  videoId: number | null
}

const buildLayout = ({ posterId, videoId }: BuildLayoutOptions) => {
  // Das Feld `poster` ist Pflicht, sobald `video` gesetzt ist. Ohne Standbild
  // wird das Video deshalb weggelassen, sonst scheitert die Validierung.
  const zeigeVideo = Boolean(videoId && posterId)

  return [
    {
      accent: 'sage' as const,
      blockType: 'hero' as const,
      heading: 'Natürlich Schule',
      kicker: 'Privatschule Unterbach · Kanton Bern',
      lead: 'Bauernhof, Wald, Garten. Lernen an Orten, die mitreden.',
      loopPause: 4,
      poster: posterId,
      showProgress: true,
      softenAfter: true,
      teasers: [
        {
          // Ziel laut Spec: Lernorte
          link: offenerLink('Mehr erfahren'),
          text: 'Der Hof gibt den Takt vor: gefüttert wird, bevor gerechnet wird.',
        },
        {
          // Ziel laut Spec: Grundsätzliche Pädagogik
          link: offenerLink('Mehr erfahren'),
          text: 'Im Wald gilt, was draussen wirklich passiert, nicht was im Buch steht.',
        },
        {
          // Ziel laut Spec: Team
          link: offenerLink('Mehr erfahren'),
          text: 'Im Garten wächst Geduld, meistens langsamer als geplant.',
        },
      ],
      video: zeigeVideo ? videoId : null,
    },
    {
      blockType: 'textIntro' as const,
      body: paragraphs(
        'Wir sind eine kleine Privatschule im Berner Oberland, bewilligt vom Kanton Bern. Unterricht findet im Schulhaus statt, aber ebenso im Stall, im Wald und im Garten.',
        'Die Klassen sind klein, die Wege kurz, der Tagesablauf ruhig. Wer bei uns lernt, arbeitet mit den Händen und übernimmt Verantwortung für etwas, das ohne ihn nicht funktioniert.',
      ),
      heading: 'Schule mit Wetter,\nTieren und Werkzeug',
    },
    {
      blockType: 'pillarCards' as const,
      cards: [
        {
          category: 'Hof',
          heading: 'Tiere, die warten nicht',
          index: '01',
          text: 'Jeden Morgen versorgen die Kinder die Tiere, im Sommer wie im Januar.',
        },
        {
          category: 'Wald',
          heading: 'Ein Tag pro Woche draussen',
          index: '02',
          text: 'Werkzeug, Feuer, Karte. Der Wald korrigiert schneller als jede Note.',
        },
        {
          category: 'Garten',
          heading: 'Vom Samen bis zum Mittagessen',
          index: '03',
          text: 'Angebaut, geerntet, gekocht. Rechnen inklusive, weil es sonst nicht aufgeht.',
        },
      ],
    },
    {
      blockType: 'dayTimeline' as const,
      entries: [
        { description: 'Stalldienst und Ankommen', time: '07:30' },
        { description: 'Unterricht in kleinen Gruppen', time: '08:30' },
        { description: 'Kochen und Mittagessen aus dem Garten', time: '11:45' },
        { description: 'Projektarbeit, Werkstatt oder Wald', time: '13:30' },
      ],
      heading: 'Ein Tag bei uns',
    },
    {
      attribution: 'Schulleitung',
      blockType: 'quote' as const,
      // Ohne Anführungszeichen — die setzt das CSS (Spec 5.4).
      quote: 'Kinder brauchen Aufgaben, die echt sind. Alles andere merken sie sofort.',
    },
    {
      blockType: 'ctaBanner' as const,
      heading: 'Schule anschauen',
      link: {
        email: 'info@natuerlich-schule.ch',
        label: 'Kontakt aufnehmen',
        type: 'email' as const,
      },
      text: 'Besuchstage finden während des Semesters statt. Meldet euch, dann vereinbaren wir einen Termin.',
    },
  ]
}

// ---------------------------------------------------------------------------
// Globals
// ---------------------------------------------------------------------------

const NAVIGATION = [
  {
    label: 'Administratives',
    items: ['Stundenplan', 'Formulare & Infos für Eltern', 'Ferienplan', 'Feste, Anlässe & Lager'],
  },
  {
    label: 'Stufen',
    items: [
      'Unterstufe',
      'Mittel- und Oberstufe',
      'Sprachheilschule',
      'Besondere Volksschule',
      'Privatschule',
    ],
  },
  { label: 'Pädagogik', items: ['Grundsätzliche Pädagogik', 'Lernort'] },
  { label: 'Über uns', items: ['Team', 'Leitbild', 'Wen wir ansprechen wollen', 'Fotos'] },
]

const WEITERE_LINKS = [
  { highlight: false, label: 'Aktuelles' },
  { highlight: false, label: 'Anmeldung' },
  { highlight: false, label: 'Offene Stellen' },
  { highlight: true, label: 'Insiderbereich' },
]

const seedHeader = async (payload: Payload, logoId: number | null): Promise<void> => {
  const headerData = {
    groups: NAVIGATION.map((gruppe) => ({
      items: gruppe.items.map((label) => ({ link: offenerLink(label) })),
      label: gruppe.label,
    })),
    homeLabel: 'Home',
    logo: logoId,
    searchEnabled: true,
    utilityLinks: WEITERE_LINKS.map((eintrag) => ({
      highlight: eintrag.highlight,
      link: offenerLink(eintrag.label),
    })),
    wordmark: 'Natürlich Schule',
  }

  await payload.updateGlobal({
    slug: 'header',
    context: SEED_CONTEXT,
    data: headerData,
    depth: 0,
  })
}

const seedFooter = async (payload: Payload): Promise<void> => {
  const footerData = {
    columns: [
      {
        body: paragraphs('Natürlich Schule\nUnterbach 205a\n3857 Unterbach'),
        title: 'Adresse',
      },
      {
        body: mailtoParagraph('info@natuerlich-schule.ch'),
        title: 'Kontakt',
      },
    ],
    legalLinks: [{ link: offenerLink('Impressum') }, { link: offenerLink('Datenschutz') }],
    legalNote: 'Natürlich Schule · Privatschule · Bewilligt vom Kanton Bern',
    organization: {
      addressLocality: 'Unterbach',
      addressRegion: 'BE',
      email: 'info@natuerlich-schule.ch',
      name: 'Natürlich Schule',
      postalCode: '3857',
      streetAddress: 'Unterbach 205a',
    },
  }

  await payload.updateGlobal({
    slug: 'footer',
    context: SEED_CONTEXT,
    data: footerData,
    depth: 0,
  })
}

// ---------------------------------------------------------------------------
// Einstieg
// ---------------------------------------------------------------------------

/**
 * Legt die Startseite an oder aktualisiert sie und befüllt Kopf- und Fusszeile.
 * Mehrfaches Ausführen ergibt genau ein Seiten-Dokument und keine doppelten Medien.
 */
export const seedHomepage = async (payload: Payload): Promise<void> => {
  const logoId = await ensureMedia(payload, LOGO)
  const posterId = await ensureMedia(payload, HERO_POSTER)
  const videoId = await ensureMedia(payload, HERO_VIDEO)

  if (videoId && !posterId) {
    payload.logger.warn(
      'Seed: Das Hero-Video wird nicht gesetzt, weil das Standbild fehlt — ohne Standbild ' +
        'scheitert die Validierung des Hero-Blocks.',
    )
  }

  const seitenDaten = {
    _status: 'published' as const,
    layout: buildLayout({ posterId, videoId }),
    meta: {
      description:
        'Kleine Privatschule im Berner Oberland. Unterricht im Schulhaus, im Stall, im Wald und im Garten. Bewilligt vom Kanton Bern.',
      noIndex: false,
      title: 'Natürlich Schule — Privatschule in Unterbach, Kanton Bern',
    },
    slug: HOME_SLUG,
    title: 'Startseite',
  }

  const { docs } = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: true,
    limit: 1,
    where: { slug: { equals: HOME_SLUG } },
  })

  const vorhandeneSeite = docs[0]

  if (vorhandeneSeite) {
    await payload.update({
      id: vorhandeneSeite.id,
      collection: 'pages',
      context: SEED_CONTEXT,
      data: seitenDaten,
      depth: 0,
    })
    payload.logger.info(`Seed: Startseite aktualisiert (ID ${vorhandeneSeite.id}).`)
  } else {
    const erstellt = await payload.create({
      collection: 'pages',
      context: SEED_CONTEXT,
      data: seitenDaten,
      depth: 0,
    })
    payload.logger.info(`Seed: Startseite angelegt (ID ${erstellt.id}).`)
  }

  await seedHeader(payload, logoId)
  await seedFooter(payload)
  payload.logger.info('Seed: Kopf- und Fusszeile befüllt.')
}
