import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access'
import { linkField } from '@/fields/link'
import { revalidateGlobals } from '@/hooks/revalidate'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: { group: 'Website' },
  fields: [
    {
      name: 'wordmark',
      type: 'text',
      admin: {
        description:
          'Name der Schule. Dient als Alternativtext des Logos und wird angezeigt, solange kein Logo hochgeladen ist.',
      },
      label: 'Wortmarke',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      admin: {
        description: 'Ohne Logo zeigt die Kopfzeile die Wortmarke als Text.',
      },
      filterOptions: () => ({ mimeType: { like: 'image' } }),
      label: 'Logo',
      relationTo: 'media',
    },
    {
      name: 'homeLabel',
      type: 'text',
      admin: { description: 'Beschriftung des Haus-Symbols links in der Navigation.' },
      defaultValue: 'Home',
      label: 'Beschriftung Startseite',
      required: true,
    },
    {
      name: 'groups',
      type: 'array',
      admin: {
        description: 'Die Einträge der obersten Navigationszeile. Ein Klick klappt die Unterpunkte auf.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Beschriftung',
          required: true,
        },
        {
          name: 'items',
          type: 'array',
          fields: [linkField({ required: false })],
          labels: { plural: 'Unterpunkte', singular: 'Unterpunkt' },
          label: 'Unterpunkte',
          minRows: 1,
        },
      ],
      labels: { plural: 'Gruppen', singular: 'Gruppe' },
      label: 'Navigationsgruppen',
      maxRows: 6,
    },
    {
      name: 'utilityLinks',
      type: 'array',
      admin: { description: 'Inhalt des Menüs hinter dem Symbol mit den drei Strichen.' },
      fields: [
        linkField({ required: false }),
        {
          name: 'highlight',
          type: 'checkbox',
          admin: { description: 'Hebt den Eintrag in der Akzentfarbe hervor.' },
          defaultValue: false,
          label: 'Hervorheben',
        },
      ],
      labels: { plural: 'Weitere Links', singular: 'Weiterer Link' },
      label: 'Weitere Links',
    },
    {
      name: 'searchEnabled',
      type: 'checkbox',
      admin: { description: 'Blendet das Suchfeld rechts in der Navigation ein.' },
      defaultValue: true,
      label: 'Suchfeld anzeigen',
    },
  ],
  hooks: {
    afterChange: [revalidateGlobals],
  },
  label: 'Kopfzeile',
}
