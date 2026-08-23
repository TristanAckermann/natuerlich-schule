import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { Event } from '@/payload-types'
import config from '@/payload.config'
import { eventsTag } from '@/hooks/revalidate'

/**
 * Obergrenze der Abfrage. Die Liste ist unpaginiert; eine Schule kommt auf
 * wenige Dutzend Anlässe pro Jahr, die Grenze ist reiner Selbstschutz.
 */
const MAX_EVENTS = 500

const findEvents = async (draft: boolean): Promise<Event[]> => {
  const payload = await getPayload({ config: await config })

  const { docs } = await payload.find({
    collection: 'events',
    depth: 1,
    draft,
    limit: MAX_EVENTS,
    overrideAccess: draft,
    pagination: false,
    // Chronologisch: der nächste Termin steht oben.
    sort: 'date',
    /*
     * Ohne Entwurfsmodus filtert schon `publishedOrAuthenticated` auf
     * veröffentlichte Dokumente. Die Bedingung steht trotzdem hier — die
     * Sichtbarkeit von Entwürfen soll nicht allein von der Access-Funktion
     * abhängen.
     */
    where: draft ? {} : { _status: { equals: 'published' } },
  })

  return docs
}

/**
 * Lädt die Events über die Local API, nach Datum aufsteigend.
 *
 * Im Entwurfsmodus wird bewusst nicht gecacht — dort soll jede Änderung sofort
 * sichtbar sein. Öffentlich hängt die Liste am Tag `events`, den die
 * `afterChange`- und `afterDelete`-Hooks invalidieren.
 */
export const getEvents = async (draft = false): Promise<Event[]> => {
  if (draft) return findEvents(true)

  return unstable_cache(() => findEvents(false), ['events'], { tags: [eventsTag] })()
}
