/*
 * Liegt bewusst direkt unter src/app/ und nicht in der Gruppe (frontend):
 * das Projekt hat zwei Root-Layouts — (frontend) und (payload) —, und Next
 * registriert robots.ts innerhalb einer Gruppe dann nicht.
 */
import type { MetadataRoute } from 'next'

import { getServerSideURL } from '@/utilities/getURL'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      disallow: ['/admin', '/api', '/next/preview'],
      userAgent: '*',
    },
    sitemap: `${getServerSideURL()}/sitemap.xml`,
  }
}
