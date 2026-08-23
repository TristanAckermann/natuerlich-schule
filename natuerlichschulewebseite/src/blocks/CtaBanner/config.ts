import type { Block } from 'payload'

import { linkField } from '@/fields/link'

export const CtaBanner: Block = {
  slug: 'ctaBanner',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Überschrift',
      required: true,
    },
    {
      name: 'text',
      type: 'textarea',
      admin: { description: 'Kurzer Absatz, wird auf 52 Zeichen Breite umbrochen.' },
      label: 'Text',
    },
    linkField({ label: 'Handlungsaufforderung' }),
  ],
  interfaceName: 'CtaBannerBlock',
  labels: { plural: 'Aktionsbänder', singular: 'Aktionsband' },
}
