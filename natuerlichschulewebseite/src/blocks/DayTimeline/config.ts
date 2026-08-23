import type { Block, Validate } from 'payload'

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export const DayTimeline: Block = {
  slug: 'dayTimeline',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Überschrift',
      required: true,
    },
    {
      name: 'entries',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'time',
              type: 'text',
              admin: { description: 'Format HH:MM, z. B. 07:30.', width: '30%' },
              label: 'Zeit',
              required: true,
              validate: ((value) => {
                if (typeof value !== 'string' || !TIME_PATTERN.test(value)) {
                  return 'Bitte im Format HH:MM angeben, z. B. 07:30.'
                }
                return true
              }) as Validate<unknown, unknown, unknown, object>,
            },
            {
              name: 'description',
              type: 'text',
              admin: { width: '70%' },
              label: 'Was passiert',
              required: true,
            },
          ],
        },
      ],
      labels: { plural: 'Einträge', singular: 'Eintrag' },
      label: 'Tagesablauf',
      minRows: 1,
    },
  ],
  interfaceName: 'DayTimelineBlock',
  labels: { plural: 'Tagesabläufe', singular: 'Tagesablauf' },
}
