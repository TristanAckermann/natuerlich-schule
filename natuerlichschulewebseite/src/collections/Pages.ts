import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { authenticated, authenticatedExceptHome, publishedOrAuthenticated } from '@/access'
import { CtaBanner } from '@/blocks/CtaBanner/config'
import { DayTimeline } from '@/blocks/DayTimeline/config'
import { Hero } from '@/blocks/Hero/config'
import { PillarCards } from '@/blocks/PillarCards/config'
import { Quote } from '@/blocks/Quote/config'
import { TextIntro } from '@/blocks/TextIntro/config'
import { slugField } from '@/fields/slug'
import { revalidatePage, revalidatePageAfterDelete } from '@/hooks/revalidate'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'

/** Der Slug der Startseite. Sie ist weder löschbar noch umbenennbar. */
export const HOME_SLUG = 'home'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticatedExceptHome,
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    livePreview: {
      url: ({ data }) => generatePreviewPath(typeof data?.slug === 'string' ? data.slug : undefined),
    },
    preview: (data) => generatePreviewPath(typeof data?.slug === 'string' ? data.slug : undefined),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      required: true,
    },
    slugField('title'),
    {
      name: 'layout',
      type: 'blocks',
      blocks: [Hero, TextIntro, PillarCards, DayTimeline, Quote, CtaBanner],
      label: 'Inhalt',
      minRows: 1,
      required: true,
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: { description: 'Leer lassen, um den Seitentitel zu verwenden.' },
          label: 'Titel für Suchmaschinen',
        },
        {
          name: 'description',
          type: 'textarea',
          admin: { description: 'Höchstens 160 Zeichen.' },
          label: 'Beschreibung',
          maxLength: 160,
        },
        {
          name: 'image',
          type: 'upload',
          filterOptions: () => ({ mimeType: { like: 'image' } }),
          label: 'Vorschaubild (Open Graph)',
          relationTo: 'media',
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          label: 'Von Suchmaschinen ausschliessen',
        },
      ],
      label: 'SEO',
    },
  ],
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidatePageAfterDelete],
    beforeChange: [
      ({ data, originalDoc }) => {
        if (originalDoc?.slug === HOME_SLUG && data?.slug && data.slug !== HOME_SLUG) {
          throw new APIError('Der Slug der Startseite kann nicht geändert werden.', 400)
        }
        return data
      },
    ],
  },
  labels: { plural: 'Seiten', singular: 'Seite' },
  versions: {
    drafts: {
      autosave: { interval: 375 },
    },
    maxPerDoc: 20,
  },
}
