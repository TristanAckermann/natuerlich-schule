import type { Block } from 'payload'

export const PillarCards: Block = {
  slug: 'pillarCards',
  fields: [
    {
      name: 'cards',
      type: 'array',
      admin: {
        description:
          'Die Flächenfarbe ergibt sich aus der Position: 1. Karte Mint, 2. Karte Salbei, ab der 3. die Akzentfarbe.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'index',
              type: 'text',
              admin: { description: 'Zweistellig, z. B. 01.', width: '30%' },
              label: 'Nummer',
              required: true,
            },
            {
              name: 'category',
              type: 'text',
              admin: { description: 'Ein Wort, z. B. Hof.', width: '70%' },
              label: 'Kategorie',
              required: true,
            },
          ],
        },
        {
          name: 'heading',
          type: 'text',
          label: 'Überschrift',
          required: true,
        },
        {
          name: 'text',
          type: 'textarea',
          label: 'Text',
          required: true,
        },
      ],
      labels: { plural: 'Karten', singular: 'Karte' },
      label: 'Karten',
      maxRows: 4,
      minRows: 2,
    },
  ],
  interfaceName: 'PillarCardsBlock',
  labels: { plural: 'Karten-Raster', singular: 'Karten-Raster' },
}
