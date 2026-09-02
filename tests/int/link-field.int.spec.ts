import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { LinkField, Page } from '@/payload-types'
import config from '@/payload.config'

/**
 * Die Link-Gruppe aus src/fields/link.ts (Spec 5.6).
 *
 * Je nach `type` muss genau eines von `page` / `url` / `email` gesetzt sein.
 * Geprüft wird über den `ctaBanner`-Block (Link ist dort Pflicht) und über das
 * Teaser-Band des Heros (Link ist dort optional).
 */

/* Der erste getPayload()-Aufruf baut Schema und Verbindung auf — das dauert. */
const HOOK_TIMEOUT = 60_000

const stamp = Date.now()
let counter = 0
const nextSlug = (name: string) => `test-link-${name}-${stamp}-${counter++}`

type PageInput = {
  layout: Page['layout']
  slug: string
  title: string
}

let payload: Payload
let zielseiteId: number | null = null
const createdPageIds: number[] = []

const createPage = async (layout: Page['layout'], name: string): Promise<Page> => {
  const data: PageInput = {
    layout,
    slug: nextSlug(name),
    title: `Linktest ${name} ${stamp}`,
  }

  const doc = await payload.create({
    collection: 'pages',
    context: { disableRevalidate: true },
    data: data as Page,
  })
  createdPageIds.push(doc.id)
  return doc
}

/** Ein Aktionsband ist der kürzeste Weg zu einer Pflicht-Link-Gruppe. */
const ctaBlock = (link: LinkField): Page['layout'][number] => ({
  blockType: 'ctaBanner',
  heading: 'Schule anschauen',
  link,
  text: 'Meldet euch, dann vereinbaren wir einen Termin.',
})

const heroBlockMitTeaserLink = (link: LinkField): Page['layout'][number] => ({
  accent: 'sage',
  blockType: 'hero',
  heading: 'Natürlich Schule',
  teasers: [
    { link, text: 'Der Hof gibt den Takt vor.' },
    { link, text: 'Im Wald zählt, was draussen passiert.' },
    { link, text: 'Im Garten wächst Geduld.' },
  ],
})

describe('linkField', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    const ziel = await createPage(
      [{ blockType: 'quote', quote: 'Zielseite für interne Links.' }],
      'zielseite',
    )
    zielseiteId = ziel.id
  }, HOOK_TIMEOUT)

  afterAll(async () => {
    for (const id of createdPageIds) {
      await payload
        .delete({ collection: 'pages', context: { disableRevalidate: true }, id })
        .catch((): undefined => undefined)
    }
  }, HOOK_TIMEOUT)

  describe('type: internal', () => {
    it('nimmt eine verknüpfte Seite an', async () => {
      const doc = await createPage(
        [ctaBlock({ label: 'Zur Zielseite', page: zielseiteId, type: 'internal' })],
        'intern-ok',
      )

      const block = doc.layout[0]
      expect(block.blockType).toBe('ctaBanner')
    })

    it('weist einen Pflichtlink ohne Seite ab', async () => {
      await expect(
        createPage([ctaBlock({ label: 'Ohne Ziel', type: 'internal' })], 'intern-ohne-seite'),
      ).rejects.toThrow()
    })

    it('lässt eine optionale Link-Gruppe (Hero-Teaser) ohne Seite zu', async () => {
      const doc = await createPage(
        [heroBlockMitTeaserLink({ label: 'Mehr erfahren', type: 'internal' })],
        'teaser-ohne-seite',
      )

      const block = doc.layout[0]
      expect(block.blockType === 'hero' && block.teasers).toHaveLength(3)
    })
  })

  describe('type: external', () => {
    it('nimmt eine vollständige https-Adresse an', async () => {
      const doc = await createPage(
        [
          ctaBlock({
            label: 'Zur Gemeinde',
            newTab: true,
            type: 'external',
            url: 'https://www.natuerlich-schule.ch/kontakt',
          }),
        ],
        'extern-ok',
      )

      const block = doc.layout[0]
      expect(block.blockType === 'ctaBanner' && block.link.url).toBe(
        'https://www.natuerlich-schule.ch/kontakt',
      )
    })

    it.each(['natuerlich-schule.ch', 'htp:/kaputt', 'ftp://example.ch', ''])(
      'weist die Adresse %s ab',
      async (url) => {
        await expect(
          createPage(
            [ctaBlock({ label: 'Kaputte Adresse', type: 'external', url })],
            'extern-kaputt',
          ),
        ).rejects.toThrow()
      },
    )

    it('weist einen externen Link ganz ohne Adresse ab', async () => {
      await expect(
        createPage([ctaBlock({ label: 'Ohne Adresse', type: 'external' })], 'extern-leer'),
      ).rejects.toThrow()
    })
  })

  describe('type: email', () => {
    it('nimmt eine gültige Adresse an', async () => {
      const doc = await createPage(
        [
          ctaBlock({
            email: 'info@natuerlich-schule.ch',
            label: 'Kontakt aufnehmen',
            type: 'email',
          }),
        ],
        'mail-ok',
      )

      const block = doc.layout[0]
      expect(block.blockType === 'ctaBanner' && block.link.email).toBe('info@natuerlich-schule.ch')
    })

    it.each(['info@', '@natuerlich-schule.ch', 'info natuerlich-schule.ch', 'info@schule'])(
      'weist die Adresse %s ab',
      async (email) => {
        await expect(
          createPage([ctaBlock({ email, label: 'Kaputte Adresse', type: 'email' })], 'mail-kaputt'),
        ).rejects.toThrow()
      },
    )
  })

  describe('label', () => {
    it('ist immer Pflicht', async () => {
      await expect(
        createPage(
          [
            ctaBlock({
              email: 'info@natuerlich-schule.ch',
              label: undefined as unknown as string,
              type: 'email',
            }),
          ],
          'ohne-label',
        ),
      ).rejects.toThrow()
    })
  })
})
