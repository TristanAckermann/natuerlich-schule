import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getServerSideURL } from '@/utilities/getURL'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: await config })
  const baseURL = getServerSideURL()

  const { docs } = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1000,
    pagination: false,
    select: { slug: true, updatedAt: true },
    where: {
      _status: { equals: 'published' },
      'meta.noIndex': { not_equals: true },
    },
  })

  return [
    ...docs.map((page) => ({
      lastModified: page.updatedAt ? new Date(page.updatedAt) : undefined,
      url: page.slug === 'home' ? baseURL : `${baseURL}/${page.slug}`,
    })),
    // Feste Route ohne Seitendokument (src/app/(frontend)/events/page.tsx).
    { url: `${baseURL}/events` },
  ]
}
