import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { Page } from '@/payload-types'
import config from '@/payload.config'
import { pageTag } from '@/hooks/revalidate'

const findPage = async (slug: string, draft: boolean): Promise<Page | null> => {
  const payload = await getPayload({ config: await config })

  const { docs } = await payload.find({
    collection: 'pages',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return docs[0] ?? null
}

/**
 * Lädt eine Seite über die Local API.
 *
 * Im Entwurfsmodus wird bewusst nicht gecacht — dort soll jede Änderung sofort
 * sichtbar sein. Veröffentlichte Seiten hängen am Tag `pages:<slug>`, den die
 * `afterChange`-Hooks invalidieren.
 */
export const getPage = async (slug: string, draft = false): Promise<Page | null> => {
  if (draft) return findPage(slug, true)

  return unstable_cache(() => findPage(slug, false), ['page', slug], {
    tags: [pageTag(slug)],
  })()
}
