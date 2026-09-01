import path from 'path'
import { fileURLToPath } from 'url'

import type { CollectionConfig, Validate } from 'payload'

import { authenticated } from '@/access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const isImage = (mimeType?: string | null) => Boolean(mimeType?.startsWith('image'))

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
    useAsTitle: 'filename',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        condition: (data) => isImage(data?.mimeType),
        description: 'Was ist zu sehen? Pflicht für Bilder, für Videos nicht nötig.',
      },
      label: 'Alternativtext',
      validate: ((value, options) => {
        const data = options.data as { mimeType?: string } | undefined
        if (!isImage(data?.mimeType)) return true
        if (typeof value !== 'string' || value.trim() === '') {
          return 'Bilder brauchen einen Alternativtext.'
        }
        return true
      }) as Validate<unknown, unknown, unknown, object>,
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Bildlegende',
    },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Urheberin oder Quelle, falls ein Nachweis nötig ist.' },
      label: 'Bildnachweis',
    },
  ],
  labels: { plural: 'Medien', singular: 'Medium' },
  upload: {
    /*
     * Zuschneiden, Fokuspunkt und abgeleitete Bildgrössen sind weiterhin aus.
     * Seit dem Wechsel auf Node ist nicht mehr das fehlende sharp der Grund,
     * sondern das Schema: `focalPoint` bräuchte die Spalten focal_x/focal_y,
     * `imageSizes` je eine Spaltengruppe pro Grösse. Einschalten heisst also
     * `payload migrate:create` — eine eigene Änderung, nicht Teil des Umzugs.
     */
    crop: false,
    focalPoint: false,
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    /*
     * Die Dateien liegen auf der Platte, nicht mehr in einem Objektspeicher.
     * MEDIA_DIR muss auf dem Hosting ausserhalb des Deployment-Ordners liegen,
     * sonst sind die Uploads nach dem nächsten Deployment weg.
     */
    staticDir: process.env.MEDIA_DIR || path.resolve(dirname, '../../media'),
  },
}
