import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Event, Media } from '@/payload-types'
import config from '@/payload.config'

/**
 * Integrationstests der Collection `events`.
 *
 * Sie laufen über die Local API gegen dieselbe lokale D1 wie `npm run dev`.
 * Jedes Dokument, das hier entsteht, wird in `afterAll` wieder abgeräumt.
 */

/* Der erste getPayload()-Aufruf startet den Wrangler-Proxy — das dauert. */
const HOOK_TIMEOUT = 60_000

const stamp = Date.now()

/** Ein 1×1-Pixel-PNG. Das `image`-Feld ist Pflicht, der Inhalt egal. */
const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

type EventInput = {
  _status?: 'draft' | 'published'
  date: string
  location?: string
  slug?: string
  title: string
}

let payload: Payload
let image: Media

const createdEventIds: number[] = []

const createEvent = async (data: EventInput): Promise<Event> => {
  const doc = await payload.create({
    collection: 'events',
    context: { disableRevalidate: true },
    // `slug` darf fehlen — der beforeValidate-Hook leitet ihn aus dem Titel ab.
    data: { ...data, image: image.id } as unknown as Event,
    draft: data._status === 'draft',
  })
  createdEventIds.push(doc.id)
  return doc
}

describe('Collection events', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    image = await payload.create({
      collection: 'media',
      data: { alt: `Testbild ${stamp}` },
      file: {
        data: PIXEL_PNG,
        mimetype: 'image/png',
        name: `event-test-${stamp}.png`,
        size: PIXEL_PNG.byteLength,
      },
    })
  }, HOOK_TIMEOUT)

  afterAll(async () => {
    for (const id of createdEventIds) {
      await payload
        .delete({ collection: 'events', context: { disableRevalidate: true }, id })
        .catch((): undefined => undefined)
    }

    if (image) {
      await payload.delete({ collection: 'media', id: image.id }).catch((): undefined => undefined)
    }
  }, HOOK_TIMEOUT)

  describe('Slug', () => {
    it('leitet den Slug aus dem Titel ab, wenn er leer bleibt', async () => {
      const doc = await createEvent({
        date: '2030-05-04T16:00:00.000Z',
        title: `Frühlingsfest im Grünen ${stamp}`,
      })

      expect(doc.slug).toBe(`fruehlingsfest-im-gruenen-${stamp}`)
    })

    it('lehnt einen doppelten Slug ab', async () => {
      await createEvent({
        date: '2030-06-01T16:00:00.000Z',
        slug: `doppelt-${stamp}`,
        title: `Erster Anlass ${stamp}`,
      })

      await expect(
        createEvent({
          date: '2030-06-02T16:00:00.000Z',
          slug: `doppelt-${stamp}`,
          title: `Zweiter Anlass ${stamp}`,
        }),
      ).rejects.toThrow()
    })
  })

  describe('Entwürfe', () => {
    it('liefert Entwürfe nicht an anonyme Leser aus', async () => {
      const draft = await createEvent({
        _status: 'draft',
        date: '2030-07-14T16:00:00.000Z',
        title: `Nur ein Entwurf ${stamp}`,
      })

      const { docs } = await payload.find({
        collection: 'events',
        overrideAccess: false,
        pagination: false,
        where: { id: { equals: draft.id } },
      })

      expect(docs).toHaveLength(0)
    })

    it('liefert veröffentlichte Events an anonyme Leser aus', async () => {
      const published = await createEvent({
        _status: 'published',
        date: '2030-08-20T16:00:00.000Z',
        title: `Öffentlicher Anlass ${stamp}`,
      })

      const { docs } = await payload.find({
        collection: 'events',
        overrideAccess: false,
        pagination: false,
        where: { id: { equals: published.id } },
      })

      expect(docs).toHaveLength(1)
    })
  })

  describe('Sortierung', () => {
    it('sortiert aufsteigend nach Datum', async () => {
      const spaet = await createEvent({
        _status: 'published',
        date: '2031-11-11T16:00:00.000Z',
        title: `Später Anlass ${stamp}`,
      })
      const frueh = await createEvent({
        _status: 'published',
        date: '2031-02-02T16:00:00.000Z',
        title: `Früher Anlass ${stamp}`,
      })

      const { docs } = await payload.find({
        collection: 'events',
        overrideAccess: false,
        pagination: false,
        sort: 'date',
        where: { id: { in: [spaet.id, frueh.id] } },
      })

      expect(docs.map((doc) => doc.id)).toEqual([frueh.id, spaet.id])
    })
  })
})
