import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { HOME_SLUG } from '@/collections/Pages'
import { generateMeta } from '@/utilities/generateMeta'
import { getPage } from '@/utilities/getPage'

/*
 * Kein zeitbasiertes Neuaufbauen — invalidiert wird ausschliesslich on demand
 * über die afterChange-Hooks (src/hooks/revalidate.ts).
 *
 * `draftMode()` ist eine dynamische API und macht die Route pro Request
 * dynamisch. Das ist gewollt und kostet nichts: die Datenbankabfrage selbst
 * hängt in `getPage()` an `unstable_cache` mit dem Tag `pages:<slug>` und läuft
 * nur nach einer Änderung erneut.
 */
export const revalidate = false

type Params = { params: Promise<{ slug: string }> }

const loadPage = async (slug: string) => {
  const { isEnabled } = await draftMode()
  return getPage(slug, isEnabled)
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params

  // Gleiche Sperre wie in der Komponente: ohne sie bekäme `/home` die Metadaten
  // der Startseite samt `canonical: '/home'`, obwohl die Route 404 liefert.
  if (slug === HOME_SLUG) return {}

  const page = await loadPage(slug)
  return generateMeta(page, `/${slug}`)
}

export default async function DynamicPage({ params }: Params) {
  const { slug } = await params

  // Die Startseite hat mit `/` eine eigene Route. Ohne diese Sperre wäre ihr
  // Inhalt zusätzlich unter `/home` erreichbar — doppelter Inhalt unter zwei
  // Adressen, den auch `generateMeta()` nicht mehr sauber kanonisieren kann.
  if (slug === HOME_SLUG) notFound()

  const page = await loadPage(slug)

  if (!page) notFound()

  return <RenderBlocks blocks={page.layout} />
}
