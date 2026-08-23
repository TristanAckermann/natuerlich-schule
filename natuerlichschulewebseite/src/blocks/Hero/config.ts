import type { Block, Validate } from 'payload'

import { linkField } from '@/fields/link'

export const Hero: Block = {
  slug: 'hero',
  fields: [
    {
      name: 'kicker',
      type: 'text',
      admin: { description: 'Kleine Zeile über dem Titel, üblicherweise Schultyp, Ort und Kanton.' },
      label: 'Kicker',
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Titel',
      required: true,
    },
    {
      name: 'lead',
      type: 'textarea',
      admin: { description: 'Ein bis zwei Sätze. Wird auf 48 Zeichen Breite umbrochen.' },
      label: 'Lead',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'video',
          type: 'upload',
          admin: {
            description: 'MP4 oder WebM, höchstens 3 MB. Läuft stumm und in Schleife.',
            width: '50%',
          },
          filterOptions: () => ({ mimeType: { like: 'video' } }),
          label: 'Hintergrundvideo',
          relationTo: 'media',
        },
        {
          name: 'poster',
          type: 'upload',
          admin: {
            description: 'Standbild. Wird vor dem ersten Frame und bei reduzierter Bewegung gezeigt.',
            width: '50%',
          },
          filterOptions: () => ({ mimeType: { like: 'image' } }),
          label: 'Standbild',
          relationTo: 'media',
          validate: ((value, options) => {
            const siblingData = options.siblingData as { video?: unknown } | undefined
            if (siblingData?.video && !value) {
              return 'Sobald ein Video gesetzt ist, wird ein Standbild gebraucht.'
            }
            return true
          }) as Validate<unknown, unknown, unknown, object>,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'loopPause',
          type: 'number',
          admin: {
            description: 'Sekunden Pause zwischen zwei Durchläufen.',
            step: 0.5,
            width: '33%',
          },
          defaultValue: 4,
          label: 'Pause zwischen Durchläufen',
          max: 12,
          min: 0,
        },
        {
          name: 'accent',
          type: 'select',
          admin: { width: '33%' },
          defaultValue: 'sage',
          label: 'Akzentfarbe',
          options: [
            { label: 'Salbei', value: 'sage' },
            { label: 'Tannengrün', value: 'fir' },
            { label: 'Graphit', value: 'graphite' },
          ],
          required: true,
        },
        {
          name: 'showProgress',
          type: 'checkbox',
          admin: {
            description: 'Dünne Fortschrittslinie unter dem Teaser-Band.',
            width: '33%',
          },
          defaultValue: true,
          label: 'Fortschrittslinie zeigen',
        },
      ],
    },
    {
      name: 'softenAfter',
      type: 'checkbox',
      admin: { description: 'Nach dem ersten Durchlauf wird das Video weichgezeichnet, der Text tritt hervor.' },
      defaultValue: true,
      label: 'Video nach erstem Durchlauf weichzeichnen',
    },
    {
      name: 'teasers',
      type: 'array',
      admin: {
        description: 'Genau drei Teaser. Je Teaser höchstens rund 30 Zeichen pro Zeile.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'text',
          type: 'textarea',
          label: 'Text',
          required: true,
        },
        linkField({ labelDefault: 'Mehr erfahren', required: false }),
      ],
      labels: { plural: 'Teaser', singular: 'Teaser' },
      maxRows: 3,
      minRows: 3,
      label: 'Teaser-Band',
    },
  ],
  interfaceName: 'HeroBlock',
  labels: { plural: 'Hero-Bereiche', singular: 'Hero-Bereich' },
}
