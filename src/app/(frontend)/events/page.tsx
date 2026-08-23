import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import React from 'react'

import { EventCard } from '@/components/EventCard'
import { getEvents } from '@/utilities/getEvents'

import styles from './index.module.css'

/*
 * Kein zeitbasiertes Neuaufbauen — invalidiert wird ausschliesslich on demand
 * über die afterChange-Hooks (src/hooks/revalidate.ts).
 *
 * `draftMode()` ist eine dynamische API und macht die Route pro Request
 * dynamisch. Das ist gewollt und kostet nichts: die Datenbankabfrage selbst
 * hängt in `getEvents()` an `unstable_cache` mit dem Tag `events` und läuft nur
 * nach einer Änderung erneut.
 */
export const revalidate = false

const TITLE = 'Events'
const DESCRIPTION = 'Anlässe der Natürlich Schule — Feste, Märkte und offene Türen.'

export const metadata: Metadata = {
  alternates: { canonical: '/events' },
  description: DESCRIPTION,
  openGraph: {
    description: DESCRIPTION,
    locale: 'de_CH',
    title: TITLE,
    type: 'website',
    url: '/events',
  },
  title: TITLE,
}

export default async function EventsPage() {
  const { isEnabled } = await draftMode()
  const events = await getEvents(isEnabled)

  return (
    // Ohne Hero-Block gibt es keinen redaktionellen Akzent — Salbei ist der Standard.
    <div data-accent="sage">
      <section className={styles.header}>
        <h1 className={styles.heading}>{TITLE}</h1>
      </section>

      <section className={styles.section}>
        {events.length === 0 ? (
          <p className={styles.empty}>Momentan sind keine Events geplant.</p>
        ) : (
          <ul className={styles.grid}>
            {events.map((event) => (
              <li className={styles.item} key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
