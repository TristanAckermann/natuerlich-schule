import React from 'react'

import { getFooter } from '@/utilities/getGlobals'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * schema.org `EducationalOrganization`. Die Angaben stammen aus dem Footer-Global
 * (Gruppe „Angaben für Suchmaschinen"), damit nichts im Code steht.
 */
export const OrganizationJsonLd = async () => {
  const footer = await getFooter()
  const org = footer?.organization

  if (!org?.name) return null

  const address = [org.streetAddress, org.postalCode, org.addressLocality, org.addressRegion].some(
    Boolean,
  )
    ? {
        '@type': 'PostalAddress',
        addressCountry: 'CH',
        addressLocality: org.addressLocality || undefined,
        addressRegion: org.addressRegion || undefined,
        postalCode: org.postalCode || undefined,
        streetAddress: org.streetAddress || undefined,
      }
    : undefined

  const data = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    address,
    email: org.email || undefined,
    name: org.name,
    url: getServerSideURL(),
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      type="application/ld+json"
    />
  )
}
