import type { CollectionConfig, Validate } from 'payload'

import { authenticated } from '@/access'

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
    // Auf Workers gibt es kein sharp — deshalb kein Zuschneiden, kein Fokuspunkt
    // und keine abgeleiteten Bildgrössen.
    crop: false,
    focalPoint: false,
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
  },
}
