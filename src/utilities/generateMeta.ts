import type { Metadata } from 'next'

import type { Media, Page } from '@/payload-types'
import { getServerSideURL } from './getURL'

const imageURL = (image: (number | null) | Media | undefined): string | undefined => {
  if (!image || typeof image === 'number') return undefined
  const { url } = image
  if (!url) return undefined
  return url.startsWith('http') ? url : `${getServerSideURL()}${url}`
}

/**
 * Baut die Next-Metadaten aus der `meta`-Gruppe der Seite, mit Rückfall auf
 * den Seitentitel. Alles redaktionell, nichts hartkodiert.
 */
export const generateMeta = (page: Page | null, path: string): Metadata => {
  if (!page) return {}

  const title = page.meta?.title || page.title
  const description = page.meta?.description || undefined
  const ogImage = imageURL(page.meta?.image)
  const canonical = path === '/' ? '/' : path.replace(/\/$/, '')

  return {
    alternates: { canonical },
    description,
    openGraph: {
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
      locale: 'de_CH',
      title,
      type: 'website',
      url: canonical,
    },
    robots: page.meta?.noIndex ? { follow: false, index: false } : undefined,
    title,
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      description,
      images: ogImage ? [ogImage] : undefined,
      title,
    },
  }
}
