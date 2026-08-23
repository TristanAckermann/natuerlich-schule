import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateEvents, revalidateEventsAfterDelete } from '@/hooks/revalidate'

/**
 * Anlässe der Schule. Die Redaktion pflegt sie vollständig im Admin; die
 * Seite `/events` liest die Collection und braucht dafür keine Codeänderung.
 *
 * Entwürfe wie bei `pages`, aber ohne Autosave: ein Event ist ein kurzes
 * Formular, das in einem Zug ausgefüllt und dann veröffentlicht wird. Der
 * Schalter „Entwurf / Veröffentlicht“ ist damit die einzige Sichtbarkeitslogik.
 */
export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'date', 'location', '_status'],
    description:
      'Veröffentlichte Events erscheinen automatisch auf der Seite „Events“, nach Datum sortiert.',
    useAsTitle: 'title',
  },
  /*
   * Zuletzt Angesetztes zuoberst in der Admin-Liste: neu erfasste Anlässe
   * liegen in der Zukunft und stehen so ohne Suchen an erster Stelle. Auf der
   * Website läuft die Sortierung umgekehrt, dort ist der nächste Termin der
   * wichtigste.
   */
  defaultSort: '-date',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'dd.MM.yyyy HH:mm',
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm',
          timeIntervals: 15,
        },
        description:
          'Datum und Beginn. Ohne Uhrzeit (00:00) zeigt die Karte nur das Datum an.',
      },
      label: 'Datum',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      admin: { description: 'Wird auf der Eventkarte angezeigt.' },
      filterOptions: () => ({ mimeType: { like: 'image' } }),
      label: 'Bild',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Ein bis zwei Sätze. Leer lassen, wenn der Titel genügt.' },
      label: 'Kurzbeschreibung',
    },
    {
      name: 'location',
      type: 'text',
      admin: { description: 'Zum Beispiel: Schulhaus Unterbach.' },
      label: 'Ort',
    },
    slugField('title'),
  ],
  hooks: {
    afterChange: [revalidateEvents],
    afterDelete: [revalidateEventsAfterDelete],
  },
  labels: { plural: 'Events', singular: 'Event' },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
}
