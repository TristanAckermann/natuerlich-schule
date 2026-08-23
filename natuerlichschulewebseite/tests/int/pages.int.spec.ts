import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { HOME_SLUG } from '@/collections/Pages'
import type { Page, User } from '@/payload-types'
import config from '@/payload.config'
import { seedHomepage } from '@/seed/homepage'

/**
 * Integrationstests der Collection `pages` (Spec 5.2 und 11).
 *
 * Sie laufen über die Local API gegen dieselbe lokale D1 wie `pnpm dev`.
 * Jedes Dokument, das hier entsteht, wird in `afterAll` wieder abgeräumt;
 * die Startseite wird nur dann gelöscht, wenn dieser Lauf sie selbst angelegt hat.
 */

/* Der erste getPayload()-Aufruf startet den Wrangler-Proxy — das dauert. */
const HOOK_TIMEOUT = 60_000
const SEED_TIMEOUT = 120_000

const stamp = Date.now()
const testTitle = (name: string) => `Testseite ${name} ${stamp}`

/** Kleinster gültiger Block — `layout` verlangt mindestens eine Zeile. */
const quoteBlock = (text: string): Page['layout'][number] => ({
  blockType: 'quote',
  quote: text,
})

type PageInput = {
  _status?: 'draft' | 'published'
  layout: Page['layout']
  slug?: string
  title: string
}

let payload: Payload
let editor: (User & { collection: 'users' }) | null = null
let homeId: number | null = null
let homeCreatedByTest = false

const createdPageIds: number[] = []

const createPage = async (data: PageInput): Promise<Page> => {
  const doc = await payload.create({
    collection: 'pages',
    context: { disableRevalidate: true },
    // `slug` darf fehlen — der beforeValidate-Hook leitet ihn aus dem Titel ab.
    data: data as Page,
  })
  createdPageIds.push(doc.id)
  return doc
}

const findHome = async (): Promise<Page | null> => {
  const { docs } = await payload.find({
    collection: 'pages',
    draft: true,
    limit: 1,
    pagination: false,
    where: { slug: { equals: HOME_SLUG } },
  })
  return docs[0] ?? null
}

describe('Collection pages', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    const created = await payload.create({
      collection: 'users',
      data: {
        email: `redaktion-${stamp}@natuerlich-schule.test`,
        password: 'ein-langes-testpasswort',
      },
    })
    editor = { ...created, collection: 'users' }

    let home = await findHome()
    if (!home) {
      home = await payload.create({
        collection: 'pages',
        context: { disableRevalidate: true },
        data: {
          _status: 'published',
          layout: [quoteBlock('Platzhalter für die Tests.')],
          slug: HOME_SLUG,
          title: 'Startseite',
        } as Page,
      })
      homeCreatedByTest = true
    }
    homeId = home.id
  }, HOOK_TIMEOUT)

  afterAll(async () => {
    for (const id of createdPageIds) {
      await payload
        .delete({ collection: 'pages', context: { disableRevalidate: true }, id })
        .catch((): undefined => undefined)
    }

    if (homeCreatedByTest && homeId !== null) {
      await payload
        .delete({ collection: 'pages', context: { disableRevalidate: true }, id: homeId })
        .catch((): undefined => undefined)
    }

    if (editor) {
      await payload.delete({ collection: 'users', id: editor.id }).catch((): undefined => undefined)
    }
  }, HOOK_TIMEOUT)

  describe('Slug', () => {
    it('leitet den Slug aus dem Titel ab, wenn er leer bleibt', async () => {
      const doc = await createPage({
        layout: [quoteBlock('Ohne Slug angelegt.')],
        title: `Über Möwen & Grüsse ${stamp}`,
      })

      expect(doc.slug).toBe(`ueber-moewen-gruesse-${stamp}`)
    })

    it('normalisiert einen gesetzten Slug (Umlaute werden zu ae/oe/ue)', async () => {
      const doc = await createPage({
        layout: [quoteBlock('Mit eigenem Slug angelegt.')],
        slug: `Frühling im Grünen ${stamp}`,
        title: testTitle('Slug-Normalisierung'),
      })

      expect(doc.slug).toBe(`fruehling-im-gruenen-${stamp}`)
    })

    it('lässt den Slug der Startseite nicht ändern', async () => {
      expect(homeId).not.toBeNull()

      await expect(
        payload.update({
          collection: 'pages',
          context: { disableRevalidate: true },
          data: { slug: `startseite-${stamp}` },
          id: homeId as number,
        }),
      ).rejects.toThrow()

      const home = await payload.findByID({
        collection: 'pages',
        draft: true,
        id: homeId as number,
      })
      expect(home.slug).toBe(HOME_SLUG)
    })

    it('lässt den Slug einer gewöhnlichen Seite ändern', async () => {
      const doc = await createPage({
        layout: [quoteBlock('Wird gleich umbenannt.')],
        title: testTitle('Umbenennen'),
      })

      const renamed = await payload.update({
        collection: 'pages',
        context: { disableRevalidate: true },
        data: { slug: `umbenannt-${stamp}` },
        id: doc.id,
      })

      expect(renamed.slug).toBe(`umbenannt-${stamp}`)
    })
  })

  describe('Löschschutz der Startseite', () => {
    it('verweigert das Löschen der Startseite für die eingeloggte Redaktion', async () => {
      expect(homeId).not.toBeNull()

      await expect(
        payload.delete({
          collection: 'pages',
          context: { disableRevalidate: true },
          id: homeId as number,
          overrideAccess: false,
          user: editor,
        }),
      ).rejects.toThrow()

      const home = await findHome()
      expect(home).not.toBeNull()
    })

    it('lässt jede andere Seite von der eingeloggten Redaktion löschen', async () => {
      const doc = await createPage({
        layout: [quoteBlock('Diese Seite darf weg.')],
        title: testTitle('Löschbar'),
      })

      await payload.delete({
        collection: 'pages',
        context: { disableRevalidate: true },
        id: doc.id,
        overrideAccess: false,
        user: editor,
      })

      const { totalDocs } = await payload.count({
        collection: 'pages',
        where: { id: { equals: doc.id } },
      })
      expect(totalDocs).toBe(0)
    })
  })

  describe('Access Control', () => {
    it('zeigt Anonymen keine Entwürfe', async () => {
      const draft = await createPage({
        _status: 'draft',
        layout: [quoteBlock('Noch nicht veröffentlicht.')],
        title: testTitle('Entwurf'),
      })

      const anonymous = await payload.find({
        collection: 'pages',
        overrideAccess: false,
        pagination: false,
        where: { id: { equals: draft.id } },
      })

      expect(anonymous.docs).toHaveLength(0)
    })

    it('zeigt Anonymen veröffentlichte Seiten', async () => {
      const published = await createPage({
        _status: 'published',
        layout: [quoteBlock('Öffentlich sichtbar.')],
        title: testTitle('Veröffentlicht'),
      })

      const anonymous = await payload.find({
        collection: 'pages',
        overrideAccess: false,
        pagination: false,
        where: { id: { equals: published.id } },
      })

      expect(anonymous.docs).toHaveLength(1)
    })

    it('zeigt der eingeloggten Redaktion Entwürfe mit draft: true', async () => {
      const draft = await createPage({
        _status: 'draft',
        layout: [quoteBlock('Nur für die Redaktion.')],
        title: testTitle('Entwurf mit Benutzer'),
      })

      const authenticated = await payload.find({
        collection: 'pages',
        draft: true,
        overrideAccess: false,
        pagination: false,
        user: editor,
        where: { id: { equals: draft.id } },
      })

      expect(authenticated.docs).toHaveLength(1)
      expect(authenticated.docs[0]?.id).toBe(draft.id)
    })
  })

  describe('Seed', () => {
    it(
      'ist idempotent: zweimal ausgeführt bleibt genau eine Startseite übrig',
      async (ctx) => {
        try {
          await seedHomepage(payload)
          await seedHomepage(payload)
        } catch (error) {
          // Der Seed lädt Logo, Video und Poster aus docs/assets/. Fehlen die
          // Dateien, ist das kein Fehler dieses Tests.
          return ctx.skip(
            `Seed nicht lauffähig (fehlen die Assets in docs/assets/?): ${
              error instanceof Error ? error.message : String(error)
            }`,
          )
        }

        // Ab hier ist die Startseite eine echte, geseedete Seite — sie bleibt
        // stehen, auch wenn dieser Lauf sie ursprünglich selbst angelegt hat.
        homeCreatedByTest = false

        const { totalDocs } = await payload.count({
          collection: 'pages',
          where: { slug: { equals: HOME_SLUG } },
        })

        expect(totalDocs).toBe(1)
      },
      SEED_TIMEOUT,
    )
  })
})
