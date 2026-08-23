import type { Block } from 'payload'

export const Quote: Block = {
  slug: 'quote',
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      admin: {
        description: 'Ohne Anführungszeichen erfassen — die setzt das Layout.',
      },
      label: 'Zitat',
      required: true,
    },
    {
      name: 'attribution',
      type: 'text',
      admin: { description: 'Wer hat es gesagt, z. B. Schulleitung.' },
      label: 'Zuschreibung',
    },
  ],
  interfaceName: 'QuoteBlock',
  labels: { plural: 'Zitate', singular: 'Zitat' },
}
