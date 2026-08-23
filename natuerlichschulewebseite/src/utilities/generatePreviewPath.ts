import { getServerSideURL } from './getURL'

/**
 * Ziel-URL für Live Preview und die Vorschau-Schaltfläche im Admin.
 * Der Handshake läuft über `/next/preview`, damit der Draft-Modus gesetzt wird,
 * bevor die Seite gerendert wird.
 */
export const generatePreviewPath = (slug: string | undefined): string => {
  const path = !slug || slug === 'home' ? '/' : `/${slug}`
  const params = new URLSearchParams({
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
    slug: slug || 'home',
  })

  return `${getServerSideURL()}/next/preview?${params.toString()}`
}
