import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { HOME_SLUG } from '@/collections/Pages'
import { OrganizationJsonLd } from '@/components/OrganizationJsonLd'
import { generateMeta } from '@/utilities/generateMeta'
import { getPage } from '@/utilities/getPage'

/*
 * Kein zeitbasiertes Neuaufbauen — invalidiert wird ausschliesslich on demand
 * über die afterChange-Hooks (src/hooks/revalidate.ts).
 *
 * `draftMode()` ist eine dynamische API und macht die Route pro Request
 * dynamisch. Das ist gewollt und kostet nichts: die Datenbankabfrage selbst
 * hängt in `getPage()` an `unstable_cache` mit dem Tag `pages:home` und läuft
 * nur nach einer Änderung erneut.
 */
export const revalidate = false

const loadHome = async () => {
  const { isEnabled } = await draftMode()
  return getPage(HOME_SLUG, isEnabled)
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadHome()
  return generateMeta(page, '/')
}

export default async function HomePage() {
  const page = await loadHome()

  if (!page) notFound()

  return (
    <>
      <OrganizationJsonLd />
      <RenderBlocks blocks={page.layout} />
    </>
  )
}
