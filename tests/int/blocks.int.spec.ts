import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Page, TextIntroBlock } from '@/payload-types'
import config from '@/payload.config'

/**
 * Validierung der sechs Blöcke (Spec 5.4 und 11).
 *
 * Geprüft wird über die Local API, nicht über die Feld-Konfiguration direkt:
 * nur so ist sichergestellt, dass die Regeln auch beim Speichern greifen.
 */

/* Der erste getPayload()-Aufruf startet den Wrangler-Proxy — das dauert. */
const HOOK_TIMEOUT = 60_000

const stamp = Date.now()
let counter = 0
const nextSlug = (name: string) => `test-block-${name}-${stamp}-${counter++}`

type PageInput = {
  layout: Page['layout']
  slug: string
  title: string
}

let payload: Payload
const createdPageIds: number[] = []
const createdMediaIds: number[] = []

/** Legt eine Seite an und merkt sie sich fürs Aufräumen. */
const createPage = async (layout: Page['layout'], name: string): Promise<Page> => {
  const data: PageInput = {
    layout,
    slug: nextSlug(name),
    title: `Blocktest ${name} ${stamp}`,
  }

  const doc = await payload.create({
    collection: 'pages',
    context: { disableRevalidate: true },
    data: data as Page,
  })
  createdPageIds.push(doc.id)
  return doc
}

const teaser = (text: string) => ({
  link: {
    label: 'Mehr erfahren',
    type: 'external' as const,
    url: 'https://natuerlich-schule.ch',
  },
  text,
})

const heroBlock = (
  teasers: ReturnType<typeof teaser>[],
  extra: { poster?: number; video?: number } = {},
): Page['layout'][number] => ({
  accent: 'sage',
  blockType: 'hero',
  heading: 'Natürlich Schule',
  kicker: 'Privatschule Unterbach · Kanton Bern',
  lead: 'Bauernhof, Wald, Garten.',
  teasers,
  ...extra,
})

const dayTimelineBlock = (time: string): Page['layout'][number] => ({
  blockType: 'dayTimeline',
  entries: [{ description: 'Stalldienst und Ankommen', time }],
  heading: 'Ein Tag bei uns',
})

/** Minimaler, gültiger Lexical-Baum mit einem Absatz. */
const richText = (text: string): TextIntroBlock['body'] => ({
  root: {
    children: [
      {
        children: [
          { detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
})

/**
 * Sucht ein Video in der Medienbibliothek und legt notfalls ein winziges an.
 * Gibt `null` zurück, wenn beides nicht klappt — der Test überspringt sich dann.
 */
const ensureVideoMediaId = async (): Promise<number | null> => {
  const { docs } = await payload.find({
    collection: 'media',
    limit: 1,
    pagination: false,
    where: { mimeType: { like: 'video' } },
  })

  if (docs[0]?.id) return docs[0].id

  try {
    const data = Buffer.from('00000018667479706d70343200000000', 'hex')
    const created = await payload.create({
      collection: 'media',
      data: {},
      file: {
        data,
        mimetype: 'video/mp4',
        name: `test-hero-${stamp}.mp4`,
        size: data.byteLength,
      },
    })
    createdMediaIds.push(created.id)
    return created.id
  } catch {
    return null
  }
}

describe('Blöcke', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  }, HOOK_TIMEOUT)

  afterAll(async () => {
    for (const id of createdPageIds) {
      await payload
        .delete({ collection: 'pages', context: { disableRevalidate: true }, id })
        .catch((): undefined => undefined)
    }
    for (const id of createdMediaIds) {
      await payload.delete({ collection: 'media', id }).catch((): undefined => undefined)
    }
  }, HOOK_TIMEOUT)

  it('legt eine Seite mit allen sechs Blöcken an', async () => {
    const doc = await createPage(
      [
        heroBlock([
          teaser('Der Hof gibt den Takt vor.'),
          teaser('Im Wald gilt, was draussen passiert.'),
          teaser('Im Garten wächst Geduld.'),
        ]),
        {
          blockType: 'textIntro',
          body: richText('Wir sind eine kleine Privatschule im Berner Oberland.'),
          heading: 'Schule mit Wetter,\nTieren und Werkzeug',
        },
        {
          blockType: 'pillarCards',
          cards: [
            {
              category: 'Hof',
              heading: 'Tiere, die warten nicht',
              index: '01',
              text: 'Jeden Morgen versorgen die Kinder die Tiere.',
            },
            {
              category: 'Wald',
              heading: 'Ein Tag pro Woche draussen',
              index: '02',
              text: 'Werkzeug, Feuer, Karte.',
            },
          ],
        },
        dayTimelineBlock('07:30'),
        {
          attribution: 'Schulleitung',
          blockType: 'quote',
          quote: 'Kinder brauchen echte Aufgaben.',
        },
        {
          blockType: 'ctaBanner',
          heading: 'Schule anschauen',
          link: {
            email: 'info@natuerlich-schule.ch',
            label: 'Kontakt aufnehmen',
            type: 'email',
          },
          text: 'Besuchstage finden während des Semesters statt.',
        },
      ],
      'alle-sechs',
    )

    expect(doc.layout.map((block) => block.blockType)).toEqual([
      'hero',
      'textIntro',
      'pillarCards',
      'dayTimeline',
      'quote',
      'ctaBanner',
    ])
  })

  describe('hero.teasers', () => {
    it('nimmt genau drei Teaser an', async () => {
      const doc = await createPage(
        [
          heroBlock([
            teaser('Der Hof gibt den Takt vor.'),
            teaser('Im Wald gilt, was draussen passiert.'),
            teaser('Im Garten wächst Geduld.'),
          ]),
        ],
        'teaser-drei',
      )

      const hero = doc.layout[0]
      expect(hero.blockType).toBe('hero')
      expect(hero.blockType === 'hero' && hero.teasers).toHaveLength(3)
    })

    it('weist zwei Teaser ab', async () => {
      await expect(
        createPage([heroBlock([teaser('Nur einer.'), teaser('Und noch einer.')])], 'teaser-zwei'),
      ).rejects.toThrow()
    })

    it('weist vier Teaser ab', async () => {
      await expect(
        createPage(
          [
            heroBlock([
              teaser('Eins.'),
              teaser('Zwei.'),
              teaser('Drei.'),
              teaser('Vier ist einer zu viel.'),
            ]),
          ],
          'teaser-vier',
        ),
      ).rejects.toThrow()
    })
  })

  describe('hero.poster', () => {
    it(
      'ist Pflicht, sobald ein Video gesetzt ist',
      async (ctx) => {
        const videoId = await ensureVideoMediaId()

        if (videoId === null) {
          return ctx.skip('Kein Video in der Medienbibliothek und kein Upload möglich (R2?).')
        }

        await expect(
          createPage(
            [heroBlock([teaser('Eins.'), teaser('Zwei.'), teaser('Drei.')], { video: videoId })],
            'poster-fehlt',
          ),
        ).rejects.toThrow()
      },
      HOOK_TIMEOUT,
    )
  })

  describe('dayTimeline.entries[].time', () => {
    const gueltig = ['00:00', '07:30', '13:05', '23:59']
    const ungueltig = ['7:30', '24:00', '07:60', '0730', '07.30', 'morgens', '']

    it.each(gueltig)('nimmt %s an', async (time) => {
      const doc = await createPage([dayTimelineBlock(time)], `zeit-ok-${time.replace(':', '')}`)
      const block = doc.layout[0]

      expect(block.blockType === 'dayTimeline' && block.entries?.[0]?.time).toBe(time)
    })

    it.each(ungueltig)('weist %s ab', async (time) => {
      await expect(createPage([dayTimelineBlock(time)], 'zeit-kaputt')).rejects.toThrow()
    })
  })
})
